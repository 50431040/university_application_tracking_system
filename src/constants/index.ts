export const APPLICATION_TYPES = {
  EARLY_DECISION: 'Early Decision',
  EARLY_ACTION: 'Early Action', 
  REGULAR_DECISION: 'Regular Decision',
  ROLLING_ADMISSION: 'Rolling Admission'
} as const

export const APPLICATION_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  DECIDED: 'decided'
} as const

export const DECISION_TYPES = {
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WAITLISTED: 'waitlisted'
} as const

export const USER_ROLES = {
  STUDENT: 'student',
  PARENT: 'parent',
  TEACHER: 'teacher',
  ADMIN: 'admin'
} as const

export const REQUIREMENT_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
} as const

export const APPLICATION_TYPE_LABELS = {
  [APPLICATION_TYPES.EARLY_DECISION]: 'Early Decision',
  [APPLICATION_TYPES.EARLY_ACTION]: 'Early Action',
  [APPLICATION_TYPES.REGULAR_DECISION]: 'Regular Decision',
  [APPLICATION_TYPES.ROLLING_ADMISSION]: 'Rolling Admission'
}

export const STATUS_LABELS = {
  [APPLICATION_STATUS.NOT_STARTED]: 'not started',
  [APPLICATION_STATUS.IN_PROGRESS]: 'in progress',
  [APPLICATION_STATUS.SUBMITTED]: 'submitted',
  [APPLICATION_STATUS.UNDER_REVIEW]: 'under review',
  [APPLICATION_STATUS.DECIDED]: 'decided'
}

export const DECISION_LABELS = {
  [DECISION_TYPES.ACCEPTED]: 'accepted',
  [DECISION_TYPES.REJECTED]: 'rejected',
  [DECISION_TYPES.WAITLISTED]: 'waitlisted'
}

export const STATUS_COLORS = {
  [APPLICATION_STATUS.NOT_STARTED]: 'bg-gray-100 text-gray-800',
  [APPLICATION_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [APPLICATION_STATUS.SUBMITTED]: 'bg-yellow-100 text-yellow-800',
  [APPLICATION_STATUS.UNDER_REVIEW]: 'bg-purple-100 text-purple-800',
  [APPLICATION_STATUS.DECIDED]: 'bg-green-100 text-green-800'
}

export const DECISION_COLORS = {
  [DECISION_TYPES.ACCEPTED]: 'bg-green-100 text-green-800',
  [DECISION_TYPES.REJECTED]: 'bg-red-100 text-red-800',
  [DECISION_TYPES.WAITLISTED]: 'bg-orange-100 text-orange-800'
}