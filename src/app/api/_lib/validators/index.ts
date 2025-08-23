import { z } from 'zod'
import { ValidationError } from '../types/errors'

// Common validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
})

export const idSchema = z.string().uuid()

// User schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['student', 'parent'])
})

// Student profile schemas
export const studentProfileSchema = z.object({
  graduationYear: z.number().int().min(2020).max(2030).optional(),
  gpa: z.number().min(0).max(4).optional(),
  satScore: z.number().int().min(400).max(1600).optional(),
  actScore: z.number().int().min(1).max(36).optional(),
  targetCountries: z.array(z.string()).default([]),
  intendedMajors: z.array(z.string()).default([])
})

// Application schemas
export const createApplicationSchema = z.object({
  universityId: z.string().uuid(),
  applicationType: z.enum(['Early Decision', 'Early Action', 'Regular Decision', 'Rolling Admission']),
  deadline: z.string().datetime()
})

export const updateApplicationSchema = z.object({
  status: z.enum(['not_started', 'in_progress', 'submitted', 'under_review', 'decided']).optional(),
  submittedDate: z.string().datetime().optional(),
  decisionDate: z.string().datetime().optional(),
  decisionType: z.enum(['accepted', 'rejected', 'waitlisted']).optional(),
  notes: z.string().optional()
})

// University search schema
export const universitySearchSchema = z.object({
  query: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  applicationSystem: z.enum(['Common App', 'Coalition', 'Direct']).optional(),
  minRanking: z.coerce.number().int().min(1).optional(),
  maxRanking: z.coerce.number().int().min(1).optional(),
  maxTuition: z.coerce.number().min(0).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20)
})

// Validation helper function
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message
      }))
      throw new ValidationError('Invalid input data', details)
    }
    throw new ValidationError('Validation failed')
  }
}