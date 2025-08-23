export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'student' | 'parent' | 'teacher' | 'admin'
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
  applicationType: 'Early Decision' | 'Early Action' | 'Regular Decision' | 'Rolling Admission'
  deadline: string
  status: 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'decided'
  submittedDate?: string
  decisionDate?: string
  decisionType?: 'accepted' | 'rejected' | 'waitlisted'
  notes?: string
}

export interface ApplicationRequirement {
  id: string
  applicationId: string
  type: string
  description: string
  status: 'not_started' | 'in_progress' | 'completed'
  dueDate?: string
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
  status?: string[]
  applicationType?: string[]
  deadlineRange?: 'all' | 'this_week' | 'this_month' | 'overdue'
  decisionType?: string[]
}