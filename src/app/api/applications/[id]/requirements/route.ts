import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '../../../_lib/middleware/error-handler'
import { withAuth } from '../../../_lib/middleware/auth'
import { validateRequest, idSchema } from '../../../_lib/validators'
import { createSuccessResponse } from '../../../_lib/types/response'
import { prisma } from '../../../_lib/utils/prisma'
import { AuthenticationError, NotFoundError, AuthorizationError } from '../../../_lib/types/errors'
import { z } from 'zod'
import { REQUIREMENT_TYPE_VALUES, REQUIREMENT_STATUS_VALUES, REQUIREMENT_STATUS } from '@/constants/enums'

const requirementSchema = z.object({
  requirementType: z.enum(REQUIREMENT_TYPE_VALUES),
  status: z.enum(REQUIREMENT_STATUS_VALUES).default(REQUIREMENT_STATUS.NOT_STARTED),
  deadline: z.string().datetime().optional(),
  notes: z.string().optional()
})

interface RouteParams {
  params: {
    id: string
  }
}

async function requirementsHandler(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const authenticatedReq = await withAuth(req)
  const user = authenticatedReq.user!
  
  // Validate application ID
  const applicationId = validateRequest(idSchema, params.id)

  // Get student record and verify application ownership
  const student = await prisma.student.findUnique({
    where: { userId: user.id }
  })

  if (!student && user.role === 'student') {
    throw new AuthenticationError('Student profile not found')
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId }
  })

  if (!application) {
    throw new NotFoundError('Application not found')
  }

  // Authorization check
  if (user.role === 'student' && application.studentId !== student?.id) {
    throw new AuthorizationError('Cannot access this application')
  }

  // GET: List application requirements
  if (req.method === 'GET') {
    const requirements = await prisma.applicationRequirement.findMany({
      where: { applicationId: applicationId },
      orderBy: { requirementType: 'asc' }
    })

    return NextResponse.json(createSuccessResponse(requirements))
  }

  // POST: Create new requirement
  if (req.method === 'POST') {
    // Only students can create requirements
    if (user.role !== 'student') {
      throw new AuthorizationError('Only students can create requirements')
    }

    const body = await req.json()
    const requirementData = validateRequest(requirementSchema, body)

    // Check if requirement already exists
    const existingRequirement = await prisma.applicationRequirement.findFirst({
      where: {
        applicationId: applicationId,
        requirementType: requirementData.requirementType
      }
    })

    if (existingRequirement) {
      throw new AuthorizationError('Requirement already exists for this type')
    }

    const requirement = await prisma.applicationRequirement.create({
      data: {
        applicationId: applicationId,
        requirementType: requirementData.requirementType,
        status: requirementData.status,
        deadline: requirementData.deadline ? new Date(requirementData.deadline) : null,
        notes: requirementData.notes
      }
    })

    return NextResponse.json(createSuccessResponse(requirement), { status: 201 })
  }

  return NextResponse.json(
    createSuccessResponse({ message: 'Method not implemented' }),
    { status: 405 }
  )
}

export const GET = withErrorHandler(requirementsHandler)
export const POST = withErrorHandler(requirementsHandler) 