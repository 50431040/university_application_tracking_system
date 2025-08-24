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