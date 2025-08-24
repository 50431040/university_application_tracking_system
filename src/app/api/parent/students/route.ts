import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withRole } from '../../_lib/middleware/auth'
import { withErrorHandler } from '../../_lib/middleware/error-handler'
import { createSuccessResponse } from '../../_lib/types/response'
import { prisma } from '../../_lib/utils/prisma'

async function getParentStudentsHandler(req: NextRequest): Promise<NextResponse> {
  const authenticatedReq = await withAuth(req)
  withRole('parent')(authenticatedReq)

  // Get all students this parent has access to using a single optimized query
  const relationships = await prisma.studentParentRelationship.findMany({
    where: {
      parentId: authenticatedReq.user!.id
    },
    select: {
      studentId: true
    }
  })

  // Extract student IDs
  const studentIds = relationships.map(rel => rel.studentId)

  // Get all students in a single query using WHERE IN
  const students = await prisma.student.findMany({
    where: {
      id: {
        in: studentIds
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      graduationYear: true,
      gpa: true,
      satScore: true,
      actScore: true,
      intendedMajors: true
    }
  })

  // Transform the data to match the expected format
  const studentsData = students.map(student => ({
    id: student.id,
    name: student.name,
    email: student.email,
    graduationYear: student.graduationYear,
    gpa: student.gpa ? Number(student.gpa) : null,
    satScore: student.satScore,
    actScore: student.actScore,
    intendedMajors: student.intendedMajors
  }))

  return NextResponse.json(createSuccessResponse({ students: studentsData }))
}

export const GET = withErrorHandler(getParentStudentsHandler) 