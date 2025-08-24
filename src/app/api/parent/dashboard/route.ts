import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withRole } from '../../_lib/middleware/auth'
import { withErrorHandler } from '../../_lib/middleware/error-handler'
import { createSuccessResponse } from '../../_lib/types/response'
import { ValidationError } from '../../_lib/types/errors'
import { prisma } from '../../_lib/utils/prisma'

async function getParentDashboardHandler(req: NextRequest): Promise<NextResponse> {
  const authenticatedReq = await withAuth(req)
  withRole('parent')(authenticatedReq)

  const { searchParams } = new URL(req.url)
  const studentId = searchParams.get('studentId')

  if (!studentId) {
    throw new ValidationError('Student ID is required')
  }

  // Verify parent has access to this student
  const relationship = await prisma.studentParentRelationship.findFirst({
    where: {
      parentId: authenticatedReq.user!.id,
      studentId: studentId
    }
  })

  if (!relationship) {
    throw new ValidationError('Access denied to this student')
  }

  // Phase 1: Get basic data first
  const [student, applications, parentNotes] = await Promise.all([
    // Get student information
    prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        graduationYear: true,
        gpa: true,
        satScore: true,
        actScore: true,
        intendedMajors: true
      }
    }),

    // Get student's applications
    prisma.application.findMany({
      where: { studentId },
      select: {
        id: true,
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
      },
      orderBy: { deadline: 'asc' }
    }),

    // Get parent notes for this student
    prisma.parentNote.findMany({
      where: {
        parentId: authenticatedReq.user!.id,
        studentId: studentId
      },
      select: {
        id: true,
        applicationId: true,
        note: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ])

  if (!student) {
    throw new ValidationError('Student not found')
  }

  // Phase 2: Get related data in parallel (only if we have applications)
  let universities: any[] = []
  let requirements: any[] = []

  if (applications.length > 0) {
    const universityIds = [...new Set(applications.map(app => app.universityId))]
    const applicationIds = applications.map(app => app.id)
    
    // Execute dependent queries in parallel
    const [universitiesResult, requirementsResult] = await Promise.all([
      // Get all universities in a single query using WHERE IN
      prisma.university.findMany({
        where: {
          id: {
            in: universityIds
          }
        },
        select: {
          id: true,
          name: true,
          applicationFee: true,
          tuitionInState: true,
          tuitionOutState: true
        }
      }),

      // Get all application requirements in a single query
      prisma.applicationRequirement.findMany({
        where: {
          applicationId: {
            in: applicationIds
          }
        },
        select: {
          applicationId: true,
          requirementType: true,
          status: true,
          deadline: true,
          notes: true,
          createdAt: true,
          updatedAt: true
        }
      })
    ])

    universities = universitiesResult
    requirements = requirementsResult
  }

  // Create lookup maps for efficient data joining
  const universityMap = new Map(universities.map(uni => [uni.id, uni]))
  const requirementsMap = new Map<string, typeof requirements>()
  
  // Group requirements by application ID
  requirements.forEach(req => {
    if (!requirementsMap.has(req.applicationId)) {
      requirementsMap.set(req.applicationId, [])
    }
    requirementsMap.get(req.applicationId)!.push(req)
  })

  // Combine applications with university and requirements data
  const applicationsWithUniversity = applications.map(app => ({
    ...app,
    university: universityMap.get(app.universityId) || null,
    requirements: requirementsMap.get(app.id) || []
  }))

  // Calculate application statistics
  const stats = {
    totalApplications: applicationsWithUniversity.length,
    submitted: applicationsWithUniversity.filter(app => ['submitted', 'under_review', 'decided'].includes(app.status)).length,
    inProgress: applicationsWithUniversity.filter(app => app.status === 'in_progress').length,
    decisions: applicationsWithUniversity.filter(app => app.status === 'decided').length,
    acceptances: applicationsWithUniversity.filter(app => app.decisionType === 'accepted').length,
    rejections: applicationsWithUniversity.filter(app => app.decisionType === 'rejected').length,
    waitlisted: applicationsWithUniversity.filter(app => app.decisionType === 'waitlisted').length
  }

  // Calculate financial estimates
  const financialEstimates = {
    totalApplicationFees: applicationsWithUniversity.reduce((sum, app) => {
      return sum + Number(app.university?.applicationFee || 0)
    }, 0),
    estimatedTuitionRange: {
      min: Math.min(...applicationsWithUniversity.map(app => Number(app.university?.tuitionInState || 0)).filter(t => t > 0)),
      max: Math.max(...applicationsWithUniversity.map(app => Number(app.university?.tuitionOutState || app.university?.tuitionInState || 0)))
    }
  }

  // Get upcoming deadlines (next 30 days)
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const upcomingDeadlines = applicationsWithUniversity
    .filter(app => {
      const deadline = new Date(app.deadline)
      return deadline >= new Date() && deadline <= thirtyDaysFromNow && app.status !== 'submitted'
    })
    .map(app => ({
      id: app.id,
      universityName: app.university?.name || 'Unknown',
      applicationType: app.applicationType,
      deadline: app.deadline,
      status: app.status,
      daysUntilDeadline: Math.ceil((new Date(app.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline)

  // Get recent activity (applications updated in last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentActivity = applicationsWithUniversity
    .filter(app => new Date(app.updatedAt) >= sevenDaysAgo)
    .map(app => ({
      id: app.id,
      universityName: app.university?.name || 'Unknown',
      applicationType: app.applicationType,
      status: app.status,
      updatedAt: app.updatedAt,
      action: getRecentAction(app)
    }))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const dashboardData = {
    student: {
      id: student.id,
      name: student.name,
      graduationYear: student.graduationYear,
      gpa: student.gpa ? Number(student.gpa) : null,
      satScore: student.satScore,
      actScore: student.actScore,
      intendedMajors: student.intendedMajors
    },
    stats,
    financialEstimates,
    upcomingDeadlines,
    recentActivity,
    parentNotes: parentNotes.map(note => ({
      id: note.id,
      applicationId: note.applicationId,
      note: note.note,
      createdAt: note.createdAt
    })),
    applicationsOverview: applicationsWithUniversity.map(app => ({
      id: app.id,
      universityName: app.university?.name || 'Unknown',
      applicationType: app.applicationType,
      status: app.status,
      deadline: app.deadline,
      decisionType: app.decisionType,
      submittedDate: app.submittedDate
    }))
  }

  return NextResponse.json(createSuccessResponse(dashboardData))
}

function getRecentAction(application: any): string {
  if (application.submittedDate && new Date(application.submittedDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
    return 'submitted'
  }
  if (application.status === 'decided' && application.decisionDate && new Date(application.decisionDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
    return 'decision_received'
  }
  return 'updated'
}

export const GET = withErrorHandler(getParentDashboardHandler) 