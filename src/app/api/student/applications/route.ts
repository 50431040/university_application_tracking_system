import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '../../_lib/middleware/error-handler'
import { withAuth, withRole } from '../../_lib/middleware/auth'
import { createSuccessResponse } from '../../_lib/types/response'

async function applicationsHandler(req: NextRequest): Promise<NextResponse> {
  const authenticatedReq = await withAuth(req)
  withRole('student')(authenticatedReq)

  // GET: List student applications
  if (req.method === 'GET') {
    return NextResponse.json(
      createSuccessResponse({ message: 'Student applications endpoint ready' })
    )
  }

  // POST: Create new application
  if (req.method === 'POST') {
    return NextResponse.json(
      createSuccessResponse({ message: 'Create application endpoint ready' }),
      { status: 201 }
    )
  }

  return NextResponse.json(
    createSuccessResponse({ message: 'Method not implemented' }),
    { status: 405 }
  )
}

export const GET = withErrorHandler(applicationsHandler)
export const POST = withErrorHandler(applicationsHandler)