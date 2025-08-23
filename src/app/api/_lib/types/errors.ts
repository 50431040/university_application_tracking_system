export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 422, details)
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super('AUTHENTICATION_ERROR', message, 401)
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super('AUTHORIZATION_ERROR', message, 403)
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super('RESOURCE_NOT_FOUND', `${resource} not found`, 404)
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super('RESOURCE_CONFLICT', message, 409)
  }
}

export class InternalError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super('INTERNAL_ERROR', message, 500)
  }
}