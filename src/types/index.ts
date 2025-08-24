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
  gpa?: number
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