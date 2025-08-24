import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '../../_lib/middleware/error-handler'
import { validateRequest, universitySearchSchema } from '../../_lib/validators'
import { createPaginatedResponse } from '../../_lib/types/response'
import { prisma } from '../../_lib/utils/prisma'
import { Prisma } from '@prisma/client'

async function universitiesSearchHandler(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)
  const queryParams = Object.fromEntries(searchParams.entries())
  
  const searchCriteria = validateRequest(universitySearchSchema, queryParams)

  // Build search conditions
  const where: Prisma.UniversityWhereInput = {}

  // Text search in name
  if (searchCriteria.query) {
    where.name = {
      contains: searchCriteria.query,
      mode: 'insensitive'
    }
  }

  // Geographic filters
  if (searchCriteria.country) {
    where.country = searchCriteria.country
  }
  if (searchCriteria.state) {
    where.state = searchCriteria.state
  }

  // Application system filter
  if (searchCriteria.applicationSystem) {
    where.applicationSystem = searchCriteria.applicationSystem
  }

  // Ranking filters
  if (searchCriteria.minRanking || searchCriteria.maxRanking) {
    where.usNewsRanking = {}
    if (searchCriteria.minRanking) {
      where.usNewsRanking.gte = searchCriteria.minRanking
    }
    if (searchCriteria.maxRanking) {
      where.usNewsRanking.lte = searchCriteria.maxRanking
    }
  }

  // Acceptance rate filters
  if (searchCriteria.minAcceptanceRate || searchCriteria.maxAcceptanceRate) {
    where.acceptanceRate = {}
    if (searchCriteria.minAcceptanceRate) {
      where.acceptanceRate.gte = searchCriteria.minAcceptanceRate
    }
    if (searchCriteria.maxAcceptanceRate) {
      where.acceptanceRate.lte = searchCriteria.maxAcceptanceRate
    }
  }

  // Tuition filter (out-of-state tuition)
  if (searchCriteria.maxTuition) {
    where.tuitionOutState = {
      lte: searchCriteria.maxTuition
    }
  }

  // Get total count for pagination
  const total = await prisma.university.count({ where })
  
  // Get universities with pagination
  const universities = await prisma.university.findMany({
    where,
    orderBy: [
      { usNewsRanking: 'asc' },
      { name: 'asc' }
    ],
    skip: (searchCriteria.page - 1) * searchCriteria.limit,
    take: searchCriteria.limit,
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

  const totalPages = Math.ceil(total / searchCriteria.limit)

  return NextResponse.json(
    createPaginatedResponse(
      universities,
      {
        page: searchCriteria.page,
        limit: searchCriteria.limit,
        total,
        totalPages
      }
    )
  )
}

export const GET = withErrorHandler(universitiesSearchHandler)