import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '../_lib/middleware/error-handler'
import { withAuth } from '../_lib/middleware/auth'
import { validateRequest, createApplicationSchema } from '../_lib/validators'
import { createSuccessResponse } from '../_lib/types/response'
import { prisma } from '../_lib/utils/prisma'
import { AuthenticationError, ValidationError } from '../_lib/types/errors'
import { APPLICATION_STATUS, REQUIREMENT_STATUS } from '@/constants/enums'

async function createApplicationHandler(req: NextRequest): Promise<NextResponse> {
  // Get authenticated user
  const authenticatedReq = await withAuth(req)
  const user = authenticatedReq.user
  
  if (!user || user.role !== 'student') {
    throw new AuthenticationError('Only students can create applications')
  }

  const body = await req.json()
  const applicationData = validateRequest(createApplicationSchema, body)

  // Get student record
  const student = await prisma.student.findUnique({
    where: { userId: user.id }
  })

  if (!student) {
    throw new ValidationError('Student profile not found')
  }

  // Get university to fetch deadline
  const university = await prisma.university.findUnique({
    where: { id: applicationData.universityId },
    select: { deadlines: true, name: true }
  })

  if (!university) {
    throw new ValidationError('University not found')
  }

  // Extract deadline from university deadlines JSON
  let deadline: Date
  const deadlines = university.deadlines as any
  
  if (deadlines && typeof deadlines === 'object') {
    const deadlineKey = getDeadlineKey(applicationData.applicationType)
    const deadlineStr = deadlines[deadlineKey]
    
    if (!deadlineStr) {
      throw new ValidationError(`No ${applicationData.applicationType} deadline found for this university`)
    }
    
    deadline = new Date(deadlineStr)
  } else {
    throw new ValidationError('University deadline information not available')
  }

  // Check if application already exists
  const existingApplication = await prisma.application.findFirst({
    where: {
      studentId: student.id,
      universityId: applicationData.universityId,
      applicationType: applicationData.applicationType
    }
  })

  if (existingApplication) {
    throw new ValidationError('Application for this university and type already exists')
  }

  // Get university requirements to create application requirements
  const universityRequirements = await prisma.universityRequirement.findMany({
    where: { universityId: applicationData.universityId },
    orderBy: { requirementType: 'asc' }
  })

  // Create application and requirements in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create application
    const application = await tx.application.create({
      data: {
        studentId: student.id,
        universityId: applicationData.universityId,
        applicationType: applicationData.applicationType,
        deadline: deadline,
        status: APPLICATION_STATUS.NOT_STARTED,
        notes: applicationData.notes || null
      }
    })

    // Create application requirements based on university requirements
    if (universityRequirements.length > 0) {
      const applicationRequirements = universityRequirements.map(ur => ({
        applicationId: application.id,
        requirementType: ur.requirementType,
        status: REQUIREMENT_STATUS.NOT_STARTED,
        notes: ur.description || null
      }))

      await tx.applicationRequirement.createMany({
        data: applicationRequirements
      })
    }

    return application
  })

  // Fetch the created application with university data
  const applicationWithUniversity = await prisma.application.findUnique({
    where: { id: result.id }
  })

  return NextResponse.json(createSuccessResponse(applicationWithUniversity))
}

// Helper function to map application types to deadline keys
function getDeadlineKey(applicationType: string): string {
  const mapping: Record<string, string> = {
    'Early Decision': 'early_decision',
    'Early Action': 'early_action', 
    'Regular Decision': 'regular_decision',
    'Rolling Admission': 'rolling_admission'
  }
  return mapping[applicationType] || 'regular_decision'
}

export const POST = withErrorHandler(createApplicationHandler)