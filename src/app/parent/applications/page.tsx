'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { StatusBadge } from '@/components/application/status-badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ParentStudent, 
  ParentApplicationOverview, 
  LoadingState,
  ApiResponse 
} from '@/types'
import { formatDate, getDeadlineColor } from '@/lib/utils'
import { APPLICATION_STATUS } from '@/constants'
import { useRouter } from 'next/navigation'

export default function ParentApplicationsPage() {
  const router = useRouter()
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [students, setStudents] = useState<ParentStudent[]>([])
  const [applications, setApplications] = useState<LoadingState<ParentApplicationOverview[]>>({
    data: null,
    isLoading: false,
    error: null
  })

  // Load students on component mount
  useEffect(() => {
    fetchStudents()
  }, [])

  // Load applications when student is selected
  useEffect(() => {
    if (selectedStudent) {
      fetchApplications(selectedStudent)
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

  const fetchApplications = async (studentId: string) => {
    setApplications(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await fetch(`/api/parent/dashboard?studentId=${studentId}`, {
        credentials: 'include'
      })
      const result: ApiResponse<any> = await response.json()
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      setApplications({
        data: result.data?.applicationsOverview || [],
        isLoading: false,
        error: null
      })
    } catch (error) {
      setApplications({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load applications'
      })
    }
  }

  const getApplicationTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'early decision': return 'bg-red-100 text-red-800'
      case 'early action': return 'bg-orange-100 text-orange-800'
      case 'regular decision': return 'bg-blue-100 text-blue-800'
      case 'rolling admission': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDecisionBadgeColor = (decisionType?: string) => {
    switch (decisionType) {
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'waitlisted': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusKey = (status: string): keyof typeof APPLICATION_STATUS => {
    switch (status) {
      case 'not_started': return 'NOT_STARTED'
      case 'in_progress': return 'IN_PROGRESS'
      case 'submitted': return 'SUBMITTED'
      case 'under_review': return 'UNDER_REVIEW'
      case 'decided': return 'DECIDED'
      default: return 'NOT_STARTED'
    }
  }

  if (students.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Student Applications</h1>
          <p className="text-gray-600">No students found. Please contact support to link your account to your child's profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Student Applications</h1>
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

      {applications.isLoading && <LoadingSpinner />}
      
      {applications.error && (
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Error: {applications.error}</p>
            <Button 
              onClick={() => selectedStudent && fetchApplications(selectedStudent)}
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {applications.data && (
        <>
          <div className="grid gap-4">
            {applications.data.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600">No applications found for this student.</p>
                </CardContent>
              </Card>
            ) : (
              applications.data.map(app => (
                <Card key={app.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{app.universityName}</CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getApplicationTypeColor(app.applicationType)}>
                            {app.applicationType}
                          </Badge>
                                                                                <StatusBadge status={getStatusKey(app.status)} />
                          {app.decisionType && (
                            <Badge className={getDecisionBadgeColor(app.decisionType)}>
                              {app.decisionType.charAt(0).toUpperCase() + app.decisionType.slice(1)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Application Deadline</div>
                        <div className={`font-semibold ${getDeadlineColor(app.deadline, app.status)}`}>
                          {formatDate(app.deadline)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-1">Current Status</h4>
                        <p className="text-sm">{app.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      </div>
                      {app.submittedDate && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-600 mb-1">Submitted</h4>
                          <p className="text-sm">{formatDate(app.submittedDate)}</p>
                        </div>
                      )}
                      {app.decisionType && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-600 mb-1">Decision</h4>
                          <p className="text-sm capitalize">{app.decisionType}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        {app.status === 'not_started' && 'Application not yet started'}
                        {app.status === 'in_progress' && 'Application in progress'}
                        {app.status === 'submitted' && 'Application submitted - awaiting review'}
                        {app.status === 'under_review' && 'Application under review'}
                        {app.status === 'decided' && 'Decision received'}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          router.push(`/parent/applications/${app.id}`)
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Summary Statistics */}
          {applications.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Application Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{applications.data.length}</div>
                    <div className="text-sm text-gray-600">Total Applications</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {applications.data.filter(app => app.decisionType === 'accepted').length}
                    </div>
                    <div className="text-sm text-gray-600">Accepted</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {applications.data.filter(app => app.decisionType === 'rejected').length}
                    </div>
                    <div className="text-sm text-gray-600">Rejected</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {applications.data.filter(app => app.decisionType === 'waitlisted').length}
                    </div>
                    <div className="text-sm text-gray-600">Waitlisted</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
} 