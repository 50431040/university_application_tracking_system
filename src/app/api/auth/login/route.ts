import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '../../_lib/middleware/error-handler'
import { validateRequest, loginSchema } from '../../_lib/validators'
import { createSuccessResponse } from '../../_lib/types/response'
import { AuthenticationError } from '../../_lib/types/errors'
import { prisma } from '../../_lib/utils/prisma'
import { verifyPasswordMD5 } from '../../_lib/utils/auth'
import { encode } from 'next-auth/jwt'

async function loginHandler(req: NextRequest): Promise<NextResponse> {
  const body = await req.json()
  const { email, password } = validateRequest(loginSchema, body)

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || !verifyPasswordMD5(password, user.passwordHash)) {
    throw new AuthenticationError('Invalid email or password')
  }

  const token = await encode({
    token: {
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    },
    secret: process.env.NEXTAUTH_SECRET!,
    salt: process.env.NEXTAUTH_SECRET!
  })

  const response = NextResponse.json(
    createSuccessResponse({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token
    })
  )

  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  })

  return response
}

export const POST = withErrorHandler(loginHandler)