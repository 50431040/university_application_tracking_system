export const APPLICATION_STATUSES = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WAITLISTED: 'waitlisted',
} as const;

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
  },
  USERS: '/api/users',
  UNIVERSITIES: '/api/universities',
  APPLICATIONS: '/api/applications',
} as const;