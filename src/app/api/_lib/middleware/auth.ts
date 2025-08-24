import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { AuthenticationError, AuthorizationError } from '../types/errors'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: string
    firstName: string
    lastName: string
  }
}

export async function withAuth(req: NextRequest): Promise<AuthenticatedRequest> {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
    cookieName: 'auth-token',  // Specify the custom cookie name
    salt: 'auth-token'  // Use the same salt as during encoding
  })

  if (!token) {
    throw new AuthenticationError('No valid authentication token')
  }

  const authenticatedReq = req as AuthenticatedRequest
  authenticatedReq.user = {
    id: token.sub as string,
    email: token.email as string,
    role: token.role as string,
    firstName: token.firstName as string,
    lastName: token.lastName as string
  }

  return authenticatedReq
}

export function withRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest) => {
    if (!req.user) {
      throw new AuthenticationError()
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AuthorizationError(`Role '${req.user.role}' not authorized`)
    }

    return req
  }
}

export function withStudentAccess(req: AuthenticatedRequest, resourceStudentId: string) {
  if (!req.user) {
    throw new AuthenticationError()
  }

  if (req.user.role === 'student' && req.user.id !== resourceStudentId) {
    throw new AuthorizationError('Can only access your own data')
  }

  if (req.user.role === 'parent') {
    // Parent access validation would need to check student-parent relationship
    // This will be implemented when needed
  }

  return req
}