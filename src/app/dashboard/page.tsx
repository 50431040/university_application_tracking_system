'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/dashboard/stats-card'
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines'
import { ProgressOverview } from '@/components/dashboard/progress-overview'
import { RecentApplications } from '@/components/dashboard/recent-applications'
import { DashboardData } from '@/types'
import Link from 'next/link'

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/student/dashboard', {
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        
        const result = await response.json()
        if (result.data) {
          setDashboardData(result.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Data Available</h1>
          <p className="text-muted-foreground">Unable to load dashboard data</p>
        </div>
      </div>
    )
  }

  const { stats, upcomingDeadlines, recentApplications, progressOverview } = dashboardData

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your university applications and deadlines
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/universities">Add Application</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/applications">Manage Applications</Link>
          </Button>
        </div>
      </div>

      {/* Quick Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Applications"
          value={stats.totalApplications}
          description="Applications in your portfolio"
          icon={<div className="w-4 h-4 bg-blue-500 rounded"></div>}
        />
        <StatsCard
          title="Submitted"
          value={stats.submitted}
          description="Applications submitted"
          icon={<div className="w-4 h-4 bg-green-500 rounded"></div>}
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgress}
          description="Currently working on"
          icon={<div className="w-4 h-4 bg-orange-500 rounded"></div>}
        />
        <StatsCard
          title="Decisions Received"
          value={stats.decisions}
          description="Admission decisions"
          icon={<div className="w-4 h-4 bg-purple-500 rounded"></div>}
        />
      </div>

      {/* Detailed Statistics */}
      {stats.decisions > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Acceptances"
            value={stats.acceptances}
            description="Congratulations! 🎉"
            icon={<div className="w-4 h-4 bg-green-600 rounded"></div>}
          />
          <StatsCard
            title="Waitlisted"
            value={stats.waitlisted}
            description="Keep waiting"
            icon={<div className="w-4 h-4 bg-yellow-600 rounded"></div>}
          />
          <StatsCard
            title="Rejections"
            value={stats.rejections}
            description="Keep trying"
            icon={<div className="w-4 h-4 bg-red-600 rounded"></div>}
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Progress Overview */}
        <div className="lg:col-span-1">
          <ProgressOverview progress={progressOverview} />
        </div>

        {/* Right Column - Deadlines */}
        <div className="lg:col-span-2">
          <UpcomingDeadlines deadlines={upcomingDeadlines} />
        </div>
      </div>

      {/* Recent Applications */}
      <RecentApplications applications={recentApplications} />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/universities">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  🔍
                </div>
                Search Universities
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/applications">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  📋
                </div>
                Manage Applications
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/profile">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  👤
                </div>
                Update Profile
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}