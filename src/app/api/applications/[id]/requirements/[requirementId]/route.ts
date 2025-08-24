import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '../../../../_lib/middleware/error-handler'
import { withAuth } from '../../../../_lib/middleware/auth'
import { validateRequest, idSchema } from '../../../../_lib/validators'
import { createSuccessResponse } from '../../../../_lib/types/response'
import { prisma } from '../../../../_lib/utils/prisma'
import { AuthenticationError, NotFoundError, AuthorizationError } from '../../../../_lib/types/errors'
import { z } from 'zod'
import { APPLICATION_STATUS, REQUIREMENT_STATUS_VALUES } from '@/constants/enums'

// Helper function to auto-update application status
async function updateApplicationStatus(applicationId: string) {
  const requirements = await prisma.applicationRequirement.findMany({
    where: { applicationId: applicationId }
  })

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { status: true }
  })

  if (!application) return

  const completedCount = requirements.filter(req => req.status === 'completed').length
  const totalCount = requirements.length

  let newStatus = application.status

  // Auto-update status logic:
  // 1. If any requirement is completed and status is "not_started", change to "in_progress"
  // 2. Keep current status if it's already "submitted" or beyond
  if (application.status === APPLICATION_STATUS.NOT_STARTED && completedCount > 0) {
    newStatus = APPLICATION_STATUS.IN_PROGRESS
  }

  if (newStatus !== application.status) {
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: newStatus }
    })
  }
}

const updateRequirementSchema = z.object({
  status: z.enum(REQUIREMENT_STATUS_VALUES).optional(),
  deadline: z.string().datetime().optional(),
  notes: z.string().optional()
})

interface RouteParams {
  params: {
    id: string
    requirementId: string
  }
}

async function requirementHandler(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const authenticatedReq = await withAuth(req)
  const user = authenticatedReq.user!
  
  // Validate IDs
  const applicationId = validateRequest(idSchema, params.id)
  const requirementId = validateRequest(idSchema, params.requirementId)

  // Get student record
  const student = await prisma.student.findUnique({
    where: { userId: user.id }
  })

  if (!student && user.role === 'student') {
    throw new AuthenticationError('Student profile not found')
  }

  // Verify application and requirement exist and belong to student
  const application = await prisma.application.findUnique({
    where: { id: applicationId }
  })

  if (!application) {
    throw new NotFoundError('Application not found')
  }

  if (user.role === 'student' && application.studentId !== student?.id) {
    throw new AuthorizationError('Cannot access this application')
  }

  const requirement = await prisma.applicationRequirement.findFirst({
    where: {
      id: requirementId,
      applicationId: applicationId
    }
  })

  if (!requirement) {
    throw new NotFoundError('Requirement not found')
  }

  // PUT: Update requirement
  if (req.method === 'PUT') {
    // Only students can update requirements
    if (user.role !== 'student') {
      throw new AuthorizationError('Only students can update requirements')
    }

    // Check if application is already submitted - if so, prevent updates
    if (application.status === APPLICATION_STATUS.SUBMITTED || application.status === APPLICATION_STATUS.UNDER_REVIEW || application.status === APPLICATION_STATUS.DECIDED) {
      throw new AuthorizationError('Cannot update requirements for submitted applications')
    }

    const body = await req.json()
    const updateData = validateRequest(updateRequirementSchema, body)

    const updatePayload: any = { ...updateData }
    if (updateData.deadline) {
      updatePayload.deadline = new Date(updateData.deadline)
    }

    const updatedRequirement = await prisma.applicationRequirement.update({
      where: { id: requirementId },
      data: updatePayload
    })

    // Auto-update application status based on requirements
    await updateApplicationStatus(applicationId)

    return NextResponse.json(createSuccessResponse(updatedRequirement))
  }

  // DELETE: Delete requirement
  if (req.method === 'DELETE') {
    // Only students can delete requirements
    if (user.role !== 'student') {
      throw new AuthorizationError('Only students can delete requirements')
    }

    await prisma.applicationRequirement.delete({
      where: { id: requirementId }
    })

    return NextResponse.json(createSuccessResponse({ message: 'Requirement deleted successfully' }))
  }

  return NextResponse.json(
    createSuccessResponse({ message: 'Method not implemented' }),
    { status: 405 }
  )
}

export const PUT = withErrorHandler(requirementHandler)
export const DELETE = withErrorHandler(requirementHandler) 