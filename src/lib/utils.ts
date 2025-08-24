import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatGPA(gpa: number | null | undefined): string {
  if (gpa === null || gpa === undefined) {
    return 'N/A'
  }
  // Convert to number if it's still a Decimal type from Prisma
  const numericGPA = typeof gpa === 'number' ? gpa : Number(gpa)
  return isNaN(numericGPA) ? 'N/A' : numericGPA.toFixed(2)
}

export function getDashboardRoute(userRole: string): string {
  switch (userRole) {
    case 'student':
      return '/dashboard'
    case 'parent':
      return '/parent/dashboard'
    case 'teacher':
    case 'admin':
      return '/dashboard' // For future implementation
    default:
      return '/dashboard'
  }
}

export function getDeadlineColor(deadline: string | Date, status: string): string {
  const deadlineDate = new Date(deadline)
  const now = new Date()
  const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  // If already submitted or decided, use neutral color
  if (status === 'submitted' || status === 'under_review' || status === 'decided') {
    return 'text-gray-600'
  }
  
  // Color based on urgency
  if (daysUntilDeadline < 0) {
    return 'text-red-600' // Overdue
  } else if (daysUntilDeadline <= 7) {
    return 'text-red-500' // Very urgent
  } else if (daysUntilDeadline <= 30) {
    return 'text-orange-500' // Urgent
  } else {
    return 'text-gray-600' // Normal
  }
}