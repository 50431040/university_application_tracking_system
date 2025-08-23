import crypto from 'crypto'

export function hashPasswordMD5(password: string): string {
  return crypto.createHash('md5').update(password).digest('hex')
}

export function verifyPasswordMD5(password: string, hashedPassword: string): boolean {
  return password === hashedPassword
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function sanitizeUser(user: any) {
  const { passwordHash, ...sanitized } = user
  return sanitized
}