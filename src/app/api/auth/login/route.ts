import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '../../_lib/middleware/error-handler'
import { validateRequest, loginSchema } from '../../_lib/validators'
import { createSuccessResponse } from '../../_lib/types/response'
import { AuthenticationError } from '../../_lib/types/errors'
import { prisma } from '../../_lib/utils/prisma'
import { encode } from 'next-auth/jwt'
import crypto from 'crypto'

async function loginHandler(req: NextRequest): Promise<NextResponse> {
  const body = await req.json()
  const { email, password } = validateRequest(loginSchema, body)

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new AuthenticationError('Invalid email or password')
  }

  // Compare hashed password (client sends SHA256(password + email))
  const expectedHash = crypto.createHash('sha256').update(user.passwordHash + user.email).digest('hex')
  const receivedHash = password

  if (expectedHash !== receivedHash) {
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