import {
  ApplicationStatus,
  ApplicationType,
  DecisionType,
  RequirementStatus,
  RequirementType,
  UserRole
} from '@/constants/enums'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
}

export interface Student {
  id: string
  userId: string
  graduationYear?: number
  gpa?: number | null
  satScore?: number
  actScore?: number
  targetCountries: string[]
  intendedMajors: string[]
}

export interface University {
  id: string
  name: string
  location: string
  ranking?: number
  acceptanceRate?: number
  tuition?: number
  applicationFee?: number
  deadlines: {
    earlyDecision?: string
    earlyAction?: string
    regularDecision?: string
    rolling?: string
  }
}

export interface Application {
  id: string
  studentId: string
  universityId: string
  university?: University
  applicationType: ApplicationType
  deadline: string
  status: ApplicationStatus
  submittedDate?: string
  decisionDate?: string
  decisionType?: DecisionType
  notes?: string
  requirements?: ApplicationRequirement[]
}

export interface ApplicationRequirement {
  id: string
  applicationId: string
  requirementType: RequirementType
  status: RequirementStatus
  deadline?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalApplications: number
  submitted: number
  inProgress: number
  decisions: number
  acceptances: number
  rejections: number
  waitlisted: number
}

export interface UpcomingDeadline {
  id: string
  universityName: string
  applicationType: string
  deadline: string
  daysUntilDeadline: number
  status: string
}

export interface RecentApplication {
  id: string
  universityName: string
  applicationType: string
  status: string
  deadline: string
  submittedDate?: string
}

export interface ProgressOverview {
  totalRequirements: number
  completedRequirements: number
  progressPercentage: number
}

export interface DashboardData {
  stats: DashboardStats
  upcomingDeadlines: UpcomingDeadline[]
  recentApplications: RecentApplication[]
  progressOverview: ProgressOverview
}

export interface LoadingState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

export interface ApiResponse<T> {
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, string>
  }
}

export interface FilterOptions {
  status?: ApplicationStatus | 'all'
  applicationType?: ApplicationType | 'all'
  deadlineRange?: 'all' | 'this_week' | 'this_month' | 'overdue'
  decisionType?: DecisionType | 'all'
}

// Parent Dashboard Types
export interface ParentStudent {
  id: string
  name: string
  email: string
  graduationYear?: number
  gpa?: number | null
  satScore?: number
  actScore?: number
  intendedMajors: string[]
}

export interface ParentFinancialEstimates {
  totalApplicationFees: number
  estimatedTuitionRange: {
    min: number
    max: number
  }
}

export interface ParentRecentActivity {
  id: string
  universityName: string
  applicationType: string
  status: string
  updatedAt: string
  action: string
}

export interface ParentNote {
  id: string
  applicationId: string
  note: string
  createdAt: string
}

export interface ParentApplicationOverview {
  id: string
  universityName: string
  applicationType: string
  status: string
  deadline: string
  decisionType?: string
  submittedDate?: string
}

export interface ParentDashboardData {
  student: ParentStudent
  stats: DashboardStats
  financialEstimates: ParentFinancialEstimates
  upcomingDeadlines: UpcomingDeadline[]
  recentActivity: ParentRecentActivity[]
  parentNotes: ParentNote[]
  applicationsOverview: ParentApplicationOverview[]
}

// Parent Application Detail Types
export interface ParentApplicationDetail {
  application: {
    id: string
    studentId: string
    universityId: string
    applicationType: string
    deadline: string
    status: string
    submittedDate?: string
    decisionDate?: string
    decisionType?: string
    notes?: string
    createdAt: string
    updatedAt: string
    university?: {
      id: string
      name: string
      country?: string
      state?: string
      city?: string
      usNewsRanking?: number
      acceptanceRate?: number
      applicationSystem?: string
      tuitionInState?: number
      tuitionOutState?: number
      applicationFee?: number
      availableMajors: string[]
    }
    requirements: ApplicationRequirement[]
    student?: {
      id: string
      name: string
      email: string
    }
  }
  parentNotes: ParentNote[]
}