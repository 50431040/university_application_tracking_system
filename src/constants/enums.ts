// Application Status Enum
export const APPLICATION_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress', 
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  DECIDED: 'decided'
} as const

export type ApplicationStatus = typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS]

// Application Type Enum
export const APPLICATION_TYPE = {
  EARLY_DECISION: 'Early Decision',
  EARLY_ACTION: 'Early Action', 
  REGULAR_DECISION: 'Regular Decision',
  ROLLING: 'Rolling Admission'
} as const

export type ApplicationType = typeof APPLICATION_TYPE[keyof typeof APPLICATION_TYPE]

// Decision Type Enum
export const DECISION_TYPE = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WAITLISTED: 'waitlisted',
  DEFERRED: 'deferred'
} as const

export type DecisionType = typeof DECISION_TYPE[keyof typeof DECISION_TYPE]

// Requirement Status Enum
export const REQUIREMENT_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
} as const

export type RequirementStatus = typeof REQUIREMENT_STATUS[keyof typeof REQUIREMENT_STATUS]

// Requirement Type Enum
export const REQUIREMENT_TYPE = {
  ESSAY: 'essay',
  TRANSCRIPT: 'transcript',
  RECOMMENDATION_LETTER: 'recommendation_letter',
  TEST_SCORES: 'test_scores',
  PORTFOLIO: 'portfolio',
  INTERVIEW: 'interview',
  APPLICATION_FEE: 'application_fee',
  OTHER: 'other'
} as const

export type RequirementType = typeof REQUIREMENT_TYPE[keyof typeof REQUIREMENT_TYPE]

// User Role Enum
export const USER_ROLE = {
  STUDENT: 'student',
  PARENT: 'parent',
  TEACHER: 'teacher'
} as const

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE]

// Application System Enum
export const APPLICATION_SYSTEM = {
  COMMON_APP: 'Common App',
  COALITION: 'Coalition',
  DIRECT: 'Direct'
} as const

export type ApplicationSystem = typeof APPLICATION_SYSTEM[keyof typeof APPLICATION_SYSTEM]

// Deadline Range Enum
export const DEADLINE_RANGE = {
  ALL: 'all',
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
  OVERDUE: 'overdue'
} as const

export type DeadlineRange = typeof DEADLINE_RANGE[keyof typeof DEADLINE_RANGE]

// Sort Options Enum
export const SORT_BY = {
  DEADLINE: 'deadline',
  UNIVERSITY_NAME: 'universityName',
  STATUS: 'status',
  CREATED_AT: 'createdAt'
} as const

export type SortBy = typeof SORT_BY[keyof typeof SORT_BY]

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc'
} as const

export type SortOrder = typeof SORT_ORDER[keyof typeof SORT_ORDER]

// Utility functions for enum values
export const getApplicationStatusOptions = () => [
  { value: 'all', label: 'All Statuses' },
  { value: APPLICATION_STATUS.NOT_STARTED, label: 'Not Started' },
  { value: APPLICATION_STATUS.IN_PROGRESS, label: 'In Progress' },
  { value: APPLICATION_STATUS.SUBMITTED, label: 'Submitted' },
  { value: APPLICATION_STATUS.UNDER_REVIEW, label: 'Under Review' },
  { value: APPLICATION_STATUS.DECIDED, label: 'Decided' }
]

export const getApplicationTypeOptions = () => [
  { value: 'all', label: 'All Types' },
  { value: APPLICATION_TYPE.EARLY_DECISION, label: 'Early Decision (ED)' },
  { value: APPLICATION_TYPE.EARLY_ACTION, label: 'Early Action (EA)' },
  { value: APPLICATION_TYPE.REGULAR_DECISION, label: 'Regular Decision (RD)' },
  { value: APPLICATION_TYPE.ROLLING, label: 'Rolling Admission' }
]

export const getDecisionTypeOptions = () => [
  { value: 'all', label: 'All Decisions' },
  { value: DECISION_TYPE.PENDING, label: 'Pending' },
  { value: DECISION_TYPE.ACCEPTED, label: 'Accepted' },
  { value: DECISION_TYPE.REJECTED, label: 'Rejected' },
  { value: DECISION_TYPE.WAITLISTED, label: 'Waitlisted' },
  { value: DECISION_TYPE.DEFERRED, label: 'Deferred' }
]

export const getRequirementStatusOptions = () => [
  { value: REQUIREMENT_STATUS.NOT_STARTED, label: 'Not Started' },
  { value: REQUIREMENT_STATUS.IN_PROGRESS, label: 'In Progress' },
  { value: REQUIREMENT_STATUS.COMPLETED, label: 'Completed' }
]

export const getRequirementTypeOptions = () => [
  { value: REQUIREMENT_TYPE.ESSAY, label: 'Essay' },
  { value: REQUIREMENT_TYPE.TRANSCRIPT, label: 'Transcript' },
  { value: REQUIREMENT_TYPE.RECOMMENDATION_LETTER, label: 'Recommendation Letter' },
  { value: REQUIREMENT_TYPE.TEST_SCORES, label: 'Test Scores' },
  { value: REQUIREMENT_TYPE.PORTFOLIO, label: 'Portfolio' },
  { value: REQUIREMENT_TYPE.INTERVIEW, label: 'Interview' },
  { value: REQUIREMENT_TYPE.APPLICATION_FEE, label: 'Application Fee' },
  { value: REQUIREMENT_TYPE.OTHER, label: 'Other' }
]

// Status badge styling helpers
export const getStatusBadgeVariant = (status: ApplicationStatus) => {
  switch (status) {
    case APPLICATION_STATUS.NOT_STARTED:
      return 'secondary'
    case APPLICATION_STATUS.IN_PROGRESS:
      return 'default'
    case APPLICATION_STATUS.SUBMITTED:
      return 'outline'
    case APPLICATION_STATUS.UNDER_REVIEW:
      return 'default'
    case APPLICATION_STATUS.DECIDED:
      return 'default'
    default:
      return 'secondary'
  }
}

export const getDecisionBadgeVariant = (decision: DecisionType) => {
  switch (decision) {
    case DECISION_TYPE.ACCEPTED:
      return 'default' // Green styling handled by CSS
    case DECISION_TYPE.REJECTED:
      return 'destructive'
    case DECISION_TYPE.WAITLISTED:
      return 'secondary'
    case DECISION_TYPE.DEFERRED:
      return 'outline'
    case DECISION_TYPE.PENDING:
    default:
      return 'secondary'
  }
}

// Validation helpers
export const isValidApplicationStatus = (status: string): status is ApplicationStatus => {
  return Object.values(APPLICATION_STATUS).includes(status as ApplicationStatus)
}

export const isValidApplicationType = (type: string): type is ApplicationType => {
  return Object.values(APPLICATION_TYPE).includes(type as ApplicationType)
}

export const isValidDecisionType = (decision: string): decision is DecisionType => {
  return Object.values(DECISION_TYPE).includes(decision as DecisionType)
}

export const isValidRequirementStatus = (status: string): status is RequirementStatus => {
  return Object.values(REQUIREMENT_STATUS).includes(status as RequirementStatus)
}

export const isValidRequirementType = (type: string): type is RequirementType => {
  return Object.values(REQUIREMENT_TYPE).includes(type as RequirementType)
}

// Arrays for Zod schema validation
export const APPLICATION_STATUS_VALUES = Object.values(APPLICATION_STATUS) as [ApplicationStatus, ...ApplicationStatus[]]
export const APPLICATION_TYPE_VALUES = Object.values(APPLICATION_TYPE) as [ApplicationType, ...ApplicationType[]]
export const DECISION_TYPE_VALUES = Object.values(DECISION_TYPE) as [DecisionType, ...DecisionType[]]
export const REQUIREMENT_STATUS_VALUES = Object.values(REQUIREMENT_STATUS) as [RequirementStatus, ...RequirementStatus[]]
export const REQUIREMENT_TYPE_VALUES = Object.values(REQUIREMENT_TYPE) as [RequirementType, ...RequirementType[]]
export const USER_ROLE_VALUES = Object.values(USER_ROLE) as [UserRole, ...UserRole[]]
export const APPLICATION_SYSTEM_VALUES = Object.values(APPLICATION_SYSTEM) as [ApplicationSystem, ...ApplicationSystem[]]
export const DEADLINE_RANGE_VALUES = Object.values(DEADLINE_RANGE) as [DeadlineRange, ...DeadlineRange[]]
export const SORT_BY_VALUES = Object.values(SORT_BY) as [SortBy, ...SortBy[]]
export const SORT_ORDER_VALUES = Object.values(SORT_ORDER) as [SortOrder, ...SortOrder[]] 