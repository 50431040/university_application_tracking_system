import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '../../_lib/middleware/error-handler'
import { validateRequest, universitySearchSchema } from '../../_lib/validators'
import { createPaginatedResponse } from '../../_lib/types/response'

async function universitiesSearchHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const queryParams = Object.fromEntries(searchParams.entries())
  
  const searchCriteria = validateRequest(universitySearchSchema, queryParams)

  return NextResponse.json(
    createPaginatedResponse(
      [], // Empty data for now
      {
        page: searchCriteria.page,
        limit: searchCriteria.limit,
        total: 0,
        totalPages: 0
      }
    )
  )
}

export const GET = withErrorHandler(universitiesSearchHandler)