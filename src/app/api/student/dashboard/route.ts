import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '../../_lib/middleware/error-handler'
import { withAuth, withRole } from '../../_lib/middleware/auth'
import { createSuccessResponse } from '../../_lib/types/response'
import { prisma } from '../../_lib/utils/prisma'

interface DashboardData {
  stats: {
    totalApplications: number
    submitted: number
    inProgress: number
    decisions: number
    acceptances: number
    rejections: number
    waitlisted: number
  }
  upcomingDeadlines: Array<{
    id: string
    universityName: string
    applicationType: string
    deadline: string
    daysUntilDeadline: number
    status: string
  }>
  recentApplications: Array<{
    id: string
    universityName: string
    applicationType: string
    status: string
    deadline: string
    submittedDate?: string
  }>
  progressOverview: {
    totalRequirements: number
    completedRequirements: number
    progressPercentage: number
  }
}

async function dashboardHandler(req: NextRequest): Promise<NextResponse> {
  const authenticatedReq = await withAuth(req)
  withRole('student')(authenticatedReq)

  const userId = authenticatedReq.user!.id

  // Get student profile
  const student = await prisma.student.findFirst({
    where: { userId }
  })

  if (!student) {
    return NextResponse.json(
      createSuccessResponse({
        stats: {
          totalApplications: 0,
          submitted: 0,
          inProgress: 0,
          decisions: 0,
          acceptances: 0,
          rejections: 0,
          waitlisted: 0
        },
        upcomingDeadlines: [],
        recentApplications: [],
        progressOverview: {
          totalRequirements: 0,
          completedRequirements: 0,
          progressPercentage: 0
        }
      })
    )
  }

  // Get applications with university data
  const applications = await prisma.application.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' }
  })

  // Get university data for applications
  const universityIds = applications.map(app => app.universityId)
  const universities = await prisma.university.findMany({
    where: { id: { in: universityIds } },
    select: {
      id: true,
      name: true,
      usNewsRanking: true
    }
  })

  const universityMap = new Map(universities.map(u => [u.id, u]))

  // Calculate statistics
  const stats = {
    totalApplications: applications.length,
    submitted: applications.filter(app => app.status === 'submitted' || app.status === 'under_review' || app.status === 'decided').length,
    inProgress: applications.filter(app => app.status === 'in_progress').length,
    decisions: applications.filter(app => app.status === 'decided').length,
    acceptances: applications.filter(app => app.decisionType === 'accepted').length,
    rejections: applications.filter(app => app.decisionType === 'rejected').length,
    waitlisted: applications.filter(app => app.decisionType === 'waitlisted').length
  }

  // Get upcoming deadlines (next 30 days)
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const upcomingDeadlines = applications
    .filter(app => {
      const deadline = new Date(app.deadline)
      return deadline >= now && deadline <= thirtyDaysFromNow && app.status !== 'submitted'
    })
    .map(app => {
      const deadline = new Date(app.deadline)
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return {
        id: app.id,
        universityName: universityMap.get(app.universityId)?.name || 'Unknown University',
        applicationType: app.applicationType,
        deadline: app.deadline.toISOString(),
        daysUntilDeadline,
        status: app.status
      }
    })
    .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline)
    .slice(0, 5) // Limit to 5 most urgent

  // Get recent applications (last 5)
  const recentApplications = applications
    .slice(0, 5)
    .map(app => ({
      id: app.id,
      universityName: universityMap.get(app.universityId)?.name || 'Unknown University',
      applicationType: app.applicationType,
      status: app.status,
      deadline: app.deadline.toISOString(),
      submittedDate: app.submittedDate?.toISOString()
    }))

  // Calculate progress overview
  const allRequirements = await prisma.applicationRequirement.findMany({
    where: {
      applicationId: {
        in: applications.map(app => app.id)
      }
    }
  })

  const progressOverview = {
    totalRequirements: allRequirements.length,
    completedRequirements: allRequirements.filter(req => req.status === 'completed').length,
    progressPercentage: allRequirements.length > 0 
      ? Math.round((allRequirements.filter(req => req.status === 'completed').length / allRequirements.length) * 100)
      : 0
  }

  const dashboardData: DashboardData = {
    stats,
    upcomingDeadlines,
    recentApplications,
    progressOverview
  }

  return NextResponse.json(createSuccessResponse(dashboardData))
}

export const GET = withErrorHandler(dashboardHandler)