import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '../../_lib/middleware/error-handler'
import { withAuth, withRole } from '../../_lib/middleware/auth'
import { validateRequest, paginationSchema } from '../../_lib/validators'
import { createSuccessResponse } from '../../_lib/types/response'
import { prisma } from '../../_lib/utils/prisma'
import { AuthenticationError } from '../../_lib/types/errors'
import { z } from 'zod'
import { 
  APPLICATION_STATUS_VALUES, 
  APPLICATION_TYPE_VALUES, 
  DECISION_TYPE_VALUES,
  DEADLINE_RANGE_VALUES,
  SORT_BY_VALUES,
  SORT_ORDER_VALUES,
  APPLICATION_STATUS
} from '@/constants/enums'

// Query schema for filtering applications
const applicationFilterSchema = z.object({
  status: z.enum(APPLICATION_STATUS_VALUES).optional(),
  applicationType: z.enum(APPLICATION_TYPE_VALUES).optional(),
  deadlineRange: z.enum(DEADLINE_RANGE_VALUES).optional(),
  decisionType: z.enum(DECISION_TYPE_VALUES).optional(),
  search: z.string().optional(),
  sortBy: z.enum(SORT_BY_VALUES).default('deadline'),
  sortOrder: z.enum(SORT_ORDER_VALUES).default('asc'),
  ...paginationSchema.shape
})

async function applicationsHandler(req: NextRequest): Promise<NextResponse> {
  const authenticatedReq = await withAuth(req)
  withRole('student')(authenticatedReq)

  const user = authenticatedReq.user!
  
  // Get student record
  const student = await prisma.student.findUnique({
    where: { userId: user.id }
  })

  if (!student) {
    throw new AuthenticationError('Student profile not found')
  }

  // GET: List student applications with filtering and pagination
  if (req.method === 'GET') {
    const { searchParams } = new URL(req.url)
    const query = Object.fromEntries(searchParams.entries())
    
    const {
      status,
      applicationType,
      deadlineRange,
      decisionType,
      search,
      sortBy,
      sortOrder,
      page,
      limit
    } = validateRequest(applicationFilterSchema, query)

    // Build where clause
    const where: any = {
      studentId: student.id
    }

    if (status) {
      where.status = status
    }

    if (applicationType) {
      where.applicationType = applicationType
    }

    if (decisionType) {
      where.decisionType = decisionType
    }

    // Handle deadline range filtering
    if (deadlineRange && deadlineRange !== 'all') {
      const now = new Date()
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      switch (deadlineRange) {
        case 'this_week':
          where.deadline = {
            gte: startOfWeek,
            lte: endOfWeek
          }
          break
        case 'this_month':
          where.deadline = {
            gte: startOfMonth,
            lte: endOfMonth
          }
          break
        case 'overdue':
          where.deadline = {
            lt: new Date()
          }
          where.status = {
            notIn: [APPLICATION_STATUS.SUBMITTED, APPLICATION_STATUS.UNDER_REVIEW, APPLICATION_STATUS.DECIDED]
          }
          break
      }
    }

    // Build orderBy clause
    let orderBy: any = {}
    switch (sortBy) {
      case 'universityName':
        orderBy = {
          university: {
            name: sortOrder
          }
        }
        break
      case 'deadline':
        orderBy = { deadline: sortOrder }
        break
      case 'status':
        orderBy = { status: sortOrder }
        break
      case 'createdAt':
        orderBy = { createdAt: sortOrder }
        break
      default:
        orderBy = { deadline: 'asc' }
    }

    // Execute query with pagination
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.application.count({ where })
    ])

    // Batch query university and requirements data to avoid N+1 problem
    const universityIds = [...new Set(applications.map(app => app.universityId))]
    const applicationIds = applications.map(app => app.id)

    const [universities, allRequirements] = await Promise.all([
      // Batch query universities
      prisma.university.findMany({
        where: { id: { in: universityIds } },
        select: {
          id: true,
          name: true,
          country: true,
          state: true,
          city: true,
          usNewsRanking: true,
          acceptanceRate: true,
          applicationFee: true
        }
      }),
      // Batch query requirements
      prisma.applicationRequirement.findMany({
        where: { applicationId: { in: applicationIds } },
        select: {
          id: true,
          applicationId: true,
          requirementType: true,
          status: true
        },
        orderBy: { requirementType: 'asc' }
      })
    ])

    // Create lookup maps for efficient data joining
    const universityMap = new Map(universities.map(uni => [uni.id, uni]))
    const requirementsMap = new Map<string, any[]>()
    
    // Group requirements by applicationId
    allRequirements.forEach(req => {
      if (!requirementsMap.has(req.applicationId)) {
        requirementsMap.set(req.applicationId, [])
      }
      requirementsMap.get(req.applicationId)!.push(req)
    })

    // Combine data efficiently
    const applicationsWithRelatedData = applications.map(app => ({
      ...app,
      university: universityMap.get(app.universityId) || null,
      requirements: requirementsMap.get(app.id) || []
    }))

    // Applications now have university and requirements data
    const applicationsWithRequirements = applicationsWithRelatedData

    // Apply search filter in memory (since we need to search university names)
    let filteredApplications = applicationsWithRequirements
    if (search) {
      const searchLower = search.toLowerCase()
      filteredApplications = applicationsWithRequirements.filter(app => 
        app.university?.name.toLowerCase().includes(searchLower) ||
        app.notes?.toLowerCase().includes(searchLower)
      )
    }

    const result = {
      applications: filteredApplications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }

    return NextResponse.json(createSuccessResponse(result))
  }

  return NextResponse.json(
    createSuccessResponse({ message: 'Method not implemented' }),
    { status: 405 }
  )
}

export const GET = withErrorHandler(applicationsHandler)