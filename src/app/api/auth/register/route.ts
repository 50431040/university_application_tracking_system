import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '../../_lib/middleware/error-handler'
import { validateRequest, registerSchema } from '../../_lib/validators'
import { createSuccessResponse } from '../../_lib/types/response'
import { ConflictError } from '../../_lib/types/errors'
import { prisma } from '../../_lib/utils/prisma'
import { hashPasswordMD5, sanitizeUser } from '../../_lib/utils/auth'

async function registerHandler(req: NextRequest) {
  const body = await req.json()
  const userData = validateRequest(registerSchema, body)

  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email }
  })

  if (existingUser) {
    throw new ConflictError('User with this email already exists')
  }

  const hashedPassword = hashPasswordMD5(userData.password)

  const user = await prisma.user.create({
    data: {
      email: userData.email,
      passwordHash: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role
    }
  })

  return NextResponse.json(
    createSuccessResponse({
      user: sanitizeUser(user),
      message: 'User registered successfully'
    }),
    { status: 201 }
  )
}

export const POST = withErrorHandler(registerHandler)