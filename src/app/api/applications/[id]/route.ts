import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '../../_lib/middleware/error-handler'
import { withAuth } from '../../_lib/middleware/auth'
import { validateRequest, updateApplicationSchema, idSchema } from '../../_lib/validators'
import { createSuccessResponse } from '../../_lib/types/response'
import { prisma } from '../../_lib/utils/prisma'
import { AuthenticationError, NotFoundError, AuthorizationError } from '../../_lib/types/errors'
import { APPLICATION_STATUS } from '@/constants/enums'

interface RouteParams {
  params: {
    id: string
  }
}

async function applicationHandler(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const authenticatedReq = await withAuth(req)
  const user = authenticatedReq.user!
  
  // Validate application ID
  const applicationId = validateRequest(idSchema, params.id)

  // Get student record for authorization
  const student = await prisma.student.findUnique({
    where: { userId: user.id }
  })

  if (!student && user.role === 'student') {
    throw new AuthenticationError('Student profile not found')
  }

  // GET: Get application details
  if (req.method === 'GET') {
    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    })

    if (!application) {
      throw new NotFoundError('Application not found')
    }

    // Authorization check - students can only access their own applications
    if (user.role === 'student' && application.studentId !== student?.id) {
      throw new AuthorizationError('Cannot access this application')
    }

    // Separately query university data
    const university = await prisma.university.findUnique({
      where: { id: application.universityId },
      select: {
        id: true,
        name: true,
        country: true,
        state: true,
        city: true,
        usNewsRanking: true,
        acceptanceRate: true,
        applicationSystem: true,
        tuitionInState: true,
        tuitionOutState: true,
        applicationFee: true,
        deadlines: true,
        availableMajors: true
      }
    })

    // Get application requirements
    let requirements = await prisma.applicationRequirement.findMany({
      where: { applicationId: application.id },
      orderBy: { requirementType: 'asc' }
    })

    // Check for and remove duplicates if they exist
    const requirementTypeMap = new Map()
    const duplicatesToDelete: string[] = []
    
    for (const req of requirements) {
      if (requirementTypeMap.has(req.requirementType)) {
        // This is a duplicate, mark for deletion
        duplicatesToDelete.push(req.id)
      } else {
        requirementTypeMap.set(req.requirementType, req)
      }
    }

    // Delete duplicates if found
    if (duplicatesToDelete.length > 0) {
      await prisma.applicationRequirement.deleteMany({
        where: {
          id: { in: duplicatesToDelete }
        }
      })
      
      // Refetch clean requirements
      requirements = await prisma.applicationRequirement.findMany({
        where: { applicationId: application.id },
        orderBy: { requirementType: 'asc' }
      })
    }

    // Note: Requirements are now managed separately via the requirements API
    // No automatic creation of requirements based on university requirements

    // Get parent notes if user is a parent
    let parentNotes: any[] = []
    if (user.role === 'parent') {
      parentNotes = await prisma.parentNote.findMany({
        where: { 
          applicationId: application.id,
          parentId: user.id // Assuming parent ID is same as user ID
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    const result = {
      ...application,
      university,
      requirements,
      parentNotes
    }

    return NextResponse.json(createSuccessResponse(result))
  }

  // PUT: Update application
  if (req.method === 'PUT') {
    // Only students can update their applications
    if (user.role !== 'student') {
      throw new AuthorizationError('Only students can update applications')
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    })

    if (!application) {
      throw new NotFoundError('Application not found')
    }

    if (application.studentId !== student?.id) {
      throw new AuthorizationError('Cannot update this application')
    }

    const body = await req.json()
    const updateData = validateRequest(updateApplicationSchema, body)

    // Convert date strings to Date objects
    const updatePayload: any = { ...updateData }
    if (updateData.submittedDate) {
      updatePayload.submittedDate = new Date(updateData.submittedDate)
    }
    if (updateData.decisionDate) {
      updatePayload.decisionDate = new Date(updateData.decisionDate)
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: updatePayload
    })

    // Separately query university data
    const university = await prisma.university.findUnique({
      where: { id: updatedApplication.universityId },
      select: {
        id: true,
        name: true,
        country: true,
        state: true,
        city: true,
        usNewsRanking: true,
        acceptanceRate: true,
        applicationFee: true
      }
    })

    const result = {
      ...updatedApplication,
      university
    }

    return NextResponse.json(createSuccessResponse(result))
  }

  // DELETE: Delete application
  if (req.method === 'DELETE') {
    // Only students can delete their applications
    if (user.role !== 'student') {
      throw new AuthorizationError('Only students can delete applications')
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    })

    if (!application) {
      throw new NotFoundError('Application not found')
    }

    if (application.studentId !== student?.id) {
      throw new AuthorizationError('Cannot delete this application')
    }

    // Delete application requirements first (cascade)
    await prisma.applicationRequirement.deleteMany({
      where: { applicationId: applicationId }
    })

    // Delete parent notes
    await prisma.parentNote.deleteMany({
      where: { applicationId: applicationId }
    })

    // Delete the application
    await prisma.application.delete({
      where: { id: applicationId }
    })

    return NextResponse.json(createSuccessResponse({ message: 'Application deleted successfully' }))
  }

  return NextResponse.json(
    createSuccessResponse({ message: 'Method not implemented' }),
    { status: 405 }
  )
}

// POST: Submit application
async function submitApplicationHandler(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const authenticatedReq = await withAuth(req)
  const user = authenticatedReq.user!
  
  // Validate application ID
  const applicationId = validateRequest(idSchema, params.id)

  // Get student record for authorization
  const student = await prisma.student.findUnique({
    where: { userId: user.id }
  })

  if (!student && user.role === 'student') {
    throw new AuthenticationError('Student profile not found')
  }

  // Only students can submit their applications
  if (user.role !== 'student') {
    throw new AuthorizationError('Only students can submit applications')
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId }
  })

  if (!application) {
    throw new NotFoundError('Application not found')
  }

  if (application.studentId !== student?.id) {
    throw new AuthorizationError('Cannot submit this application')
  }

    // Update application status to submitted
  const updatedApplication = await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: APPLICATION_STATUS.SUBMITTED,
      submittedDate: new Date()
    }
  })

  // Separately query university data
  const university = await prisma.university.findUnique({
    where: { id: updatedApplication.universityId },
    select: {
      id: true,
      name: true,
      country: true,
      state: true,
      city: true,
      usNewsRanking: true,
      acceptanceRate: true,
      applicationFee: true
    }
  })

  const result = {
    ...updatedApplication,
    university
  }

  return NextResponse.json(createSuccessResponse(result))
}

export const GET = withErrorHandler(applicationHandler)
export const PUT = withErrorHandler(applicationHandler)
export const DELETE = withErrorHandler(applicationHandler)
export const POST = withErrorHandler(submitApplicationHandler) 