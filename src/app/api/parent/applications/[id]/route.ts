import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withRole } from '../../../_lib/middleware/auth'
import { withErrorHandler } from '../../../_lib/middleware/error-handler'
import { createSuccessResponse } from '../../../_lib/types/response'
import { ValidationError } from '../../../_lib/types/errors'
import { prisma } from '../../../_lib/utils/prisma'

async function getApplicationDetailHandler(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const authenticatedReq = await withAuth(req)
  withRole('parent')(authenticatedReq)

  const applicationId = params.id

  if (!applicationId) {
    throw new ValidationError('Application ID is required')
  }

  // Get application details
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      studentId: true,
      universityId: true,
      applicationType: true,
      deadline: true,
      status: true,
      submittedDate: true,
      decisionDate: true,
      decisionType: true,
      notes: true,
      createdAt: true,
      updatedAt: true
    }
  })

  if (!application) {
    throw new ValidationError('Application not found')
  }

  // Verify parent has access to this student
  const relationship = await prisma.studentParentRelationship.findFirst({
    where: {
      parentId: authenticatedReq.user!.id,
      studentId: application.studentId
    }
  })

  if (!relationship) {
    throw new ValidationError('Access denied to this application')
  }

  // Get university details
  const university = await prisma.university.findUnique({
    where: { id: application.universityId },
    select: {
      id: true,
      name: true,
      country: true,
      state: true,
      city: true,
      usNewsRanking: true,
      acceptanceRate: true,
      applicationSystem: true,
      tuitionInState: true,
      tuitionOutState: true,
      applicationFee: true,
      availableMajors: true
    }
  })

  // Get application requirements
  const requirements = await prisma.applicationRequirement.findMany({
    where: { applicationId },
    select: {
      id: true,
      requirementType: true,
      status: true,
      deadline: true,
      notes: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { requirementType: 'asc' }
  })

  // Get parent notes for this application
  const parentNotes = await prisma.parentNote.findMany({
    where: {
      parentId: authenticatedReq.user!.id,
      applicationId: applicationId
    },
    select: {
      id: true,
      note: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { createdAt: 'desc' }
  })

  // Get student information
  const student = await prisma.student.findUnique({
    where: { id: application.studentId },
    select: {
      id: true,
      name: true,
      email: true
    }
  })

  const applicationDetail = {
    application: {
      ...application,
      university,
      requirements,
      student
    },
    parentNotes
  }

  return NextResponse.json(createSuccessResponse(applicationDetail))
}

async function addParentNoteHandler(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const authenticatedReq = await withAuth(req)
  withRole('parent')(authenticatedReq)

  const applicationId = params.id
  const body = await req.json()
  const { note } = body

  if (!applicationId) {
    throw new ValidationError('Application ID is required')
  }

  if (!note || typeof note !== 'string' || note.trim().length === 0) {
    throw new ValidationError('Note content is required')
  }

  if (note.length > 1000) {
    throw new ValidationError('Note is too long (maximum 1000 characters)')
  }

  // Get application to verify access
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { studentId: true }
  })

  if (!application) {
    throw new ValidationError('Application not found')
  }

  // Verify parent has access to this student
  const relationship = await prisma.studentParentRelationship.findFirst({
    where: {
      parentId: authenticatedReq.user!.id,
      studentId: application.studentId
    }
  })

  if (!relationship) {
    throw new ValidationError('Access denied to this application')
  }

  // Create parent note
  const parentNote = await prisma.parentNote.create({
    data: {
      parentId: authenticatedReq.user!.id,
      studentId: application.studentId,
      applicationId: applicationId,
      note: note.trim()
    },
    select: {
      id: true,
      note: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return NextResponse.json(createSuccessResponse(parentNote))
}

async function applicationDetailHandler(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  if (req.method === 'GET') {
    return getApplicationDetailHandler(req, { params })
  } else if (req.method === 'POST') {
    return addParentNoteHandler(req, { params })
  }

  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export const GET = withErrorHandler(applicationDetailHandler)
export const POST = withErrorHandler(applicationDetailHandler) 