import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '../../../_lib/middleware/error-handler'
import { validateRequest, idSchema } from '../../../_lib/validators'
import { createSuccessResponse } from '../../../_lib/types/response'
import { prisma } from '../../../_lib/utils/prisma'
import { NotFoundError } from '../../../_lib/types/errors'

interface RouteParams {
  params: {
    id: string
  }
}

async function universityRequirementsHandler(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  // Validate university ID
  const universityId = validateRequest(idSchema, params.id)

  // GET: List university requirements
  if (req.method === 'GET') {
    const university = await prisma.university.findUnique({
      where: { id: universityId }
    })

    if (!university) {
      throw new NotFoundError('University not found')
    }

    const requirements = await prisma.universityRequirement.findMany({
      where: { universityId: universityId },
      orderBy: { requirementType: 'asc' }
    })

    return NextResponse.json(createSuccessResponse(requirements))
  }

  return NextResponse.json(
    createSuccessResponse({ message: 'Method not implemented' }),
    { status: 405 }
  )
}

export const GET = withErrorHandler(universityRequirementsHandler) 