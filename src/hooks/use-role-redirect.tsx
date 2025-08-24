'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './auth'
import { getDashboardRoute } from '@/lib/utils'

// Hook for redirecting logged-in users to correct dashboard from login/root pages
export function useLoginRedirect() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    if (user && (pathname === '/login' || pathname === '/')) {
      const dashboardRoute = getDashboardRoute(user.role)
      router.push(dashboardRoute)
    }
  }, [user, isLoading, pathname, router])
} 