import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '../../_lib/middleware/error-handler'
import { createSuccessResponse } from '../../_lib/types/response'
import { prisma } from '../../_lib/utils/prisma'
import { ValidationError } from '../../_lib/types/errors'

async function getUniversityHandler(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params

  if (!id) {
    throw new ValidationError('University ID is required')
  }

  const university = await prisma.university.findUnique({
    where: { id },
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

  if (!university) {
    throw new ValidationError('University not found')
  }

  return NextResponse.json(createSuccessResponse(university))
}

export const GET = withErrorHandler(getUniversityHandler)