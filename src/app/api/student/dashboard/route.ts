import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '../../_lib/middleware/error-handler'
import { withAuth, withRole } from '../../_lib/middleware/auth'
import { createSuccessResponse } from '../../_lib/types/response'

async function dashboardHandler(req: NextRequest) {
  const authenticatedReq = await withAuth(req)
  withRole('student')(authenticatedReq)

  return NextResponse.json(
    createSuccessResponse({ message: 'Student dashboard endpoint ready' })
  )
}

export const GET = withErrorHandler(dashboardHandler)