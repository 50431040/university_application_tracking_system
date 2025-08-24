'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ParentDashboardData, 
  ParentStudent, 
  LoadingState,
  ApiResponse 
} from '@/types'
import { formatDate, formatCurrency, formatGPA } from '@/lib/utils'

export default function ParentDashboard() {
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [students, setStudents] = useState<ParentStudent[]>([])
  const [dashboardData, setDashboardData] = useState<LoadingState<ParentDashboardData>>({
    data: null,
    isLoading: false,
    error: null
  })

  // Load students on component mount
  useEffect(() => {
    fetchStudents()
  }, [])

  // Load dashboard data when student is selected
  useEffect(() => {
    if (selectedStudent) {
      fetchDashboardData(selectedStudent)
    }
  }, [selectedStudent])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/parent/students', {
        credentials: 'include'
      })
      const result: ApiResponse<{ students: ParentStudent[] }> = await response.json()
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      if (result.data) {
        setStudents(result.data.students)
        // Auto-select first student if available
        if (result.data.students.length > 0) {
          setSelectedStudent(result.data.students[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)
    }
  }

  const fetchDashboardData = async (studentId: string) => {
    setDashboardData(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await fetch(`/api/parent/dashboard?studentId=${studentId}`, {
        credentials: 'include'
      })
      const result: ApiResponse<ParentDashboardData> = await response.json()
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      setDashboardData({
        data: result.data || null,
        isLoading: false,
        error: null
      })
    } catch (error) {
      setDashboardData({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data'
      })
    }
  }

  if (students.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Parent Dashboard</h1>
          <p className="text-gray-600">No students found. Please contact support to link your account to your child's profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Parent Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select your child" />
            </SelectTrigger>
            <SelectContent>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name} ({student.graduationYear})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {dashboardData.isLoading && <LoadingSpinner />}
      
      {dashboardData.error && (
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Error: {dashboardData.error}</p>
            <Button 
              onClick={() => selectedStudent && fetchDashboardData(selectedStudent)}
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {dashboardData.data && (
        <>
          {/* Student Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Student Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold">Academic Profile</h3>
                  <p>GPA: {formatGPA(dashboardData.data.student.gpa)}</p>
                  <p>SAT: {dashboardData.data.student.satScore || 'N/A'}</p>
                  <p>ACT: {dashboardData.data.student.actScore || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Graduation</h3>
                  <p>Class of {dashboardData.data.student.graduationYear}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Intended Majors</h3>
                  <p>{dashboardData.data.student.intendedMajors.join(', ') || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              title="Total Applications"
              value={dashboardData.data.stats.totalApplications}
              description="Universities applied to"
            />
            <StatsCard
              title="Submitted"
              value={dashboardData.data.stats.submitted}
              description="Applications submitted"
            />
            <StatsCard
              title="In Progress"
              value={dashboardData.data.stats.inProgress}
              description="Being worked on"
            />
            <StatsCard
              title="Decisions"
              value={dashboardData.data.stats.decisions}
              description="Responses received"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Application Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Application Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Accepted</span>
                    <span className="text-green-600 font-semibold">{dashboardData.data.stats.acceptances}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Rejected</span>
                    <span className="text-red-600 font-semibold">{dashboardData.data.stats.rejections}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Waitlisted</span>
                    <span className="text-orange-600 font-semibold">{dashboardData.data.stats.waitlisted}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Planning */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Application Fees</span>
                    <span className="font-semibold">{formatCurrency(dashboardData.data.financialEstimates.totalApplicationFees)}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-gray-600">Estimated Annual Tuition Range</span>
                    <div className="flex justify-between">
                      <span>Min: {formatCurrency(dashboardData.data.financialEstimates.estimatedTuitionRange.min)}</span>
                      <span>Max: {formatCurrency(dashboardData.data.financialEstimates.estimatedTuitionRange.max)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Deadlines */}
          {dashboardData.data.upcomingDeadlines.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.data.upcomingDeadlines.map(deadline => (
                    <div key={deadline.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{deadline.universityName}</h4>
                        <p className="text-sm text-gray-600">{deadline.applicationType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatDate(deadline.deadline)}</p>
                        <p className={`text-sm ${deadline.daysUntilDeadline <= 7 ? 'text-red-600' : 'text-gray-600'}`}>
                          {deadline.daysUntilDeadline} days left
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          {dashboardData.data.recentActivity.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.data.recentActivity.map(activity => (
                    <div key={activity.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{activity.universityName}</h4>
                        <p className="text-sm text-gray-600">
                          {activity.action === 'submitted' ? 'Application submitted' :
                           activity.action === 'decision_received' ? 'Decision received' :
                           'Application updated'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{formatDate(activity.updatedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Communication Records and Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Communication Records and Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.data.parentNotes.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.data.parentNotes.map(note => (
                    <div key={note.id} className="p-3 border rounded-lg">
                      <p className="text-sm">{note.note}</p>
                      <p className="text-xs text-gray-500 mt-2">{formatDate(note.createdAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No notes yet. You can add notes when viewing specific applications.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 