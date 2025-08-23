"use client"

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'aria-label'?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  'aria-label': ariaLabel = '加载中'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div 
      className="flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <Loader2 className={cn(
        'animate-spin text-primary',
        sizeClasses[size],
        className
      )} />
      <span className="sr-only">{ariaLabel}</span>
    </div>
  )
}

interface LoadingPageProps {
  message?: string
}

export function LoadingPage({ message = '页面加载中...' }: LoadingPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" aria-label={message} />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  children: React.ReactNode
}

export function LoadingOverlay({ 
  isLoading, 
  message = '处理中...', 
  children 
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          aria-live="polite"
          aria-label={message}
        >
          <div className="bg-card rounded-lg p-6 shadow-lg border">
            <div className="flex items-center space-x-3">
              <LoadingSpinner aria-label={message} />
              <span className="text-sm font-medium">{message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}