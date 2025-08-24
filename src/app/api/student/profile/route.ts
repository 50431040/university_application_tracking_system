import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '../../_lib/middleware/error-handler'
import { withAuth, withRole } from '../../_lib/middleware/auth'
import { createSuccessResponse, createErrorResponse } from '../../_lib/types/response'
import { prisma } from '../../_lib/utils/prisma'
import { z } from 'zod'

// Validation schema for profile updates
const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email format'),
  graduationYear: z.number().int().min(2020).max(2030).optional(),
  gpa: z.number().min(0).max(4.0).optional(),
  satScore: z.number().int().min(400).max(1600).optional(),
  actScore: z.number().int().min(1).max(36).optional(),
  targetCountries: z.array(z.string()).optional(),
  intendedMajors: z.array(z.string()).optional(),
})

async function studentProfileHandler(req: NextRequest): Promise<NextResponse> {
  const authenticatedReq = await withAuth(req)
  withRole('student')(authenticatedReq)

  const userId = authenticatedReq.user?.id
  if (!userId) {
    return NextResponse.json(
      createErrorResponse('UNAUTHORIZED', 'User ID not found'),
      { status: 401 }
    )
  }

  // GET: Retrieve student profile
  if (req.method === 'GET') {
    try {
      // Get user information
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        }
      })

      if (!user) {
        return NextResponse.json(
          createErrorResponse('NOT_FOUND', 'User not found'),
          { status: 404 }
        )
      }

      // Get student profile information
      const student = await prisma.student.findUnique({
        where: { userId: userId },
        select: {
          id: true,
          graduationYear: true,
          gpa: true,
          satScore: true,
          actScore: true,
          targetCountries: true,
          intendedMajors: true,
        }
      })

      const profileData = {
        user: user,
        student: student ? {
          ...student,
          gpa: student.gpa ? Number(student.gpa) : null
        } : {
          id: null,
          graduationYear: null,
          gpa: null,
          satScore: null,
          actScore: null,
          targetCountries: [],
          intendedMajors: [],
        }
      }

      return NextResponse.json(createSuccessResponse(profileData))
    } catch (error) {
      console.error('Error fetching student profile:', error)
      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Failed to fetch profile'),
        { status: 500 }
      )
    }
  }

  // PUT: Update student profile  
  if (req.method === 'PUT') {
    try {
      const body = await req.json()
      const validatedData = updateProfileSchema.parse(body)

      // Start a transaction to update both user and student tables
      const result = await prisma.$transaction(async (tx) => {
        // Update user table
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            email: validatedData.email,
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          }
        })

        // Check if student profile exists
        const existingStudent = await tx.student.findUnique({
          where: { userId: userId }
        })

        let updatedStudent
        if (existingStudent) {
          // Update existing student profile
          updatedStudent = await tx.student.update({
            where: { userId: userId },
            data: {
              name: `${validatedData.firstName} ${validatedData.lastName}`,
              email: validatedData.email,
              graduationYear: validatedData.graduationYear,
              gpa: validatedData.gpa,
              satScore: validatedData.satScore,
              actScore: validatedData.actScore,
              targetCountries: validatedData.targetCountries || [],
              intendedMajors: validatedData.intendedMajors || [],
            },
            select: {
              id: true,
              graduationYear: true,
              gpa: true,
              satScore: true,
              actScore: true,
              targetCountries: true,
              intendedMajors: true,
            }
          })
        } else {
          // Create new student profile
          updatedStudent = await tx.student.create({
            data: {
              userId: userId,
              name: `${validatedData.firstName} ${validatedData.lastName}`,
              email: validatedData.email,
              passwordHash: '', // This will be handled by the auth system
              graduationYear: validatedData.graduationYear,
              gpa: validatedData.gpa,
              satScore: validatedData.satScore,
              actScore: validatedData.actScore,
              targetCountries: validatedData.targetCountries || [],
              intendedMajors: validatedData.intendedMajors || [],
            },
            select: {
              id: true,
              graduationYear: true,
              gpa: true,
              satScore: true,
              actScore: true,
              targetCountries: true,
              intendedMajors: true,
            }
          })
        }

        return {
          user: updatedUser,
          student: {
            ...updatedStudent,
            gpa: updatedStudent.gpa ? Number(updatedStudent.gpa) : null
          },
        }
      })

      return NextResponse.json(createSuccessResponse(result))
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', 'Invalid input data', {
            details: error.issues.reduce((acc: Record<string, string>, err: any) => {
              acc[err.path.join('.')] = err.message
              return acc
            }, {} as Record<string, string>)
          }),
          { status: 400 }
        )
      }

      console.error('Error updating student profile:', error)
      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Failed to update profile'),
        { status: 500 }
      )
    }
  }

  return NextResponse.json(
    createErrorResponse('METHOD_NOT_ALLOWED', 'Method not implemented'),
    { status: 405 }
  )
}

export const GET = withErrorHandler(studentProfileHandler)
export const PUT = withErrorHandler(studentProfileHandler)