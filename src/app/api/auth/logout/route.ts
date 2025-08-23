import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '../../_lib/middleware/error-handler'
import { createSuccessResponse } from '../../_lib/types/response'

async function logoutHandler(req: NextRequest) {
  const response = NextResponse.json(
    createSuccessResponse({ message: 'Logged out successfully' })
  )

  response.cookies.delete('auth-token')
  
  return response
}

export const POST = withErrorHandler(logoutHandler)