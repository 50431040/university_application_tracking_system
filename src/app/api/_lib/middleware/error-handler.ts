import { NextRequest, NextResponse } from 'next/server'
import { ApiError } from '../types/errors'
import { createErrorResponse } from '../types/response'

export function withErrorHandler(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(req, ...args)
    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof ApiError) {
        return NextResponse.json(
          createErrorResponse(error.code, error.message, error.details),
          { status: error.statusCode }
        )
      }

      if (error instanceof Error) {
        return NextResponse.json(
          createErrorResponse('INTERNAL_ERROR', 'An unexpected error occurred'),
          { status: 500 }
        )
      }

      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Unknown error occurred'),
        { status: 500 }
      )
    }
  }
}