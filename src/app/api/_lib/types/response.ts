export interface ApiResponse<T = any> {
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta: {
    timestamp: string
    version: string
    requestId?: string
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ApiResponse['meta'] & {
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export function createSuccessResponse<T>(
  data: T,
  meta?: Partial<ApiResponse['meta']>
): ApiResponse<T> {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0',
      ...meta
    }
  }
}

export function createErrorResponse(
  code: string,
  message: string,
  details?: any,
  meta?: Partial<ApiResponse['meta']>
): ApiResponse {
  return {
    error: {
      code,
      message,
      details
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0',
      ...meta
    }
  }
}

export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginatedResponse<T>['meta']['pagination'],
  meta?: Partial<ApiResponse['meta']>
): PaginatedResponse<T> {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0',
      pagination,
      ...meta
    }
  }
}