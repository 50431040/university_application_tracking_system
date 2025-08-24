'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Application, ApplicationRequirement, LoadingState } from '@/types'
import { StatusBadge } from '@/components/application/status-badge'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { DeleteConfirmDialog, SubmitConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  GraduationCap,
  DollarSign,
  Clock,
  CheckCircle,
  Circle,
  AlertCircle,
  Plus,
  Star
} from 'lucide-react'
import { formatDate, getDeadlineColor } from '@/lib/utils'
import { APPLICATION_STATUS, REQUIREMENT_STATUS, ApplicationStatus, RequirementStatus } from '@/constants/enums'

interface ApplicationDetailResponse {
  id: string
  studentId: string
  universityId: string
  applicationType: 'Early Decision' | 'Early Action' | 'Regular Decision' | 'Rolling Admission'
  deadline: string
  status: 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'decided'
  submittedDate?: string
  decisionDate?: string
  decisionType?: 'accepted' | 'rejected' | 'waitlisted'
  notes?: string
  createdAt: string
  updatedAt: string
  university: {
    id: string
    name: string
    country?: string
    state?: string
    city?: string
    usNewsRanking?: number
    acceptanceRate?: number
    applicationSystem?: string
    tuitionInState?: number
    tuitionOutState?: number
    applicationFee?: number
    deadlines?: any
    availableMajors?: string[]
  }
  requirements: ApplicationRequirement[]
  parentNotes?: any[]
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params.id as string
  
  const [applicationState, setApplicationState] = useState<LoadingState<ApplicationDetailResponse>>({
    data: null,
    isLoading: true,
    error: null
  })
  
  const [editingRequirement, setEditingRequirement] = useState<string | null>(null)
  const [updatingRequirement, setUpdatingRequirement] = useState<string | null>(null)
  
  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    loading: boolean
  }>({
    open: false,
    loading: false
  })
  
  // Submit confirmation dialog state
  const [submitDialog, setSubmitDialog] = useState<{
    open: boolean
    loading: boolean
  }>({
    open: false,
    loading: false
  })
  
  useEffect(() => {
    fetchApplicationDetail()
  }, [applicationId])
  
  const fetchApplicationDetail = async () => {
    try {
      setApplicationState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await fetch(`/api/applications/${applicationId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch application details')
      }
      
      const result = await response.json()
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      setApplicationState({
        data: result.data,
        isLoading: false,
        error: null
      })
    } catch (error) {
      setApplicationState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch application'
      })
    }
  }
  
  const handleDeleteApplication = () => {
    setDeleteDialog({
      open: true,
      loading: false
    })
  }
  
  const confirmDeleteApplication = async () => {
    setDeleteDialog(prev => ({ ...prev, loading: true }))
    
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete application')
      }
      
      router.push('/applications')
    } catch (error) {
      setDeleteDialog(prev => ({ ...prev, loading: false }))
      alert('Failed to delete application: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }
  
  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const updateData: any = { status: newStatus }
      
      // If marking as submitted, set submitted date
      if (newStatus === APPLICATION_STATUS.SUBMITTED && applicationState.data?.status !== APPLICATION_STATUS.SUBMITTED) {
        updateData.submittedDate = new Date().toISOString()
      }
      
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update application status')
      }
      
      fetchApplicationDetail()
    } catch (error) {
      alert('Failed to update status: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }
  
    const handleUpdateRequirement = async (requirementId: string, newStatus: RequirementStatus) => {
    try {
      // Set loading state for this specific requirement
      setUpdatingRequirement(requirementId)
      
      // Optimistic update - immediately update the UI
      setApplicationState(prev => {
        if (!prev.data) return prev
        
        const updatedRequirements = prev.data.requirements.map(req => 
          req.id === requirementId ? { ...req, status: newStatus } : req
        )
        
        const updatedApplication = {
          ...prev.data,
          requirements: updatedRequirements
        }
        
        // Auto-update application status based on new requirements
        let newAppStatus = updatedApplication.status
        const completedCount = updatedRequirements.filter(req => req.status === 'completed').length
        
        if (updatedApplication.status === APPLICATION_STATUS.NOT_STARTED && completedCount > 0) {
          newAppStatus = APPLICATION_STATUS.IN_PROGRESS
        }
        
        return {
          ...prev,
          data: {
            ...updatedApplication,
            status: newAppStatus
          }
        }
      })

      // Make the actual API call
      const response = await fetch(`/api/applications/${applicationId}/requirements/${requirementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        // If API call fails, revert the optimistic update
        fetchApplicationDetail()
        throw new Error('Failed to update requirement')
      }

      // Optionally, you can sync with server data here if needed
      // For now, we trust the optimistic update worked correctly
    } catch (error) {
      alert('Failed to update requirement: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      // Clear loading state
      setUpdatingRequirement(null)
    }
  }

  const handleSubmitApplication = () => {
    console.log('handleSubmitApplication called')
    setSubmitDialog({
      open: true,
      loading: false
    })
  }
  
  const confirmSubmitApplication = async () => {
    setSubmitDialog(prev => ({ ...prev, loading: true }))
    
    try {
      // Optimistic update - immediately update application status
      setApplicationState(prev => {
        if (!prev.data) return prev
        
        return {
          ...prev,
          data: {
            ...prev.data,
            status: APPLICATION_STATUS.SUBMITTED,
            submittedDate: new Date().toISOString()
          }
        }
      })

      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        // If API fails, revert the optimistic update
        fetchApplicationDetail()
        throw new Error('Failed to submit application')
      }

      // Close dialog
      setSubmitDialog({
        open: false,
        loading: false
      })
    } catch (error) {
      setSubmitDialog(prev => ({ ...prev, loading: false }))
      alert('Failed to submit application: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }
  
  const { data: application, isLoading, error } = applicationState
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }
  
  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold mb-2">Error Loading Application</h2>
            <p className="text-red-600">{error || 'Application not found'}</p>
            <div className="mt-4 flex gap-2">
              <Button onClick={fetchApplicationDetail} variant="outline">
                Try Again
              </Button>
              <Link href="/applications">
                <Button variant="outline">
                  Back to Applications
                </Button>
              </Link>
                      </div>
        </div>
        
        {/* Delete Confirmation Dialog */}
        {application && (
          <DeleteConfirmDialog
            open={deleteDialog.open}
            onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
            itemName={application.university.name}
            itemType="application"
            onConfirm={confirmDeleteApplication}
            loading={deleteDialog.loading}
          />
        )}
        
        {/* Submit Confirmation Dialog */}
        {application && (
          <SubmitConfirmDialog
            open={submitDialog.open}
            onOpenChange={(open) => setSubmitDialog(prev => ({ ...prev, open }))}
            itemName={application.university.name}
            onConfirm={confirmSubmitApplication}
            loading={submitDialog.loading}
            completedRequirements={application.requirements.filter(req => req.status === 'completed').length}
            totalRequirements={application.requirements.length}
          />
        )}
      </div>
    </div>
  )
}
  
  const { university } = application
  const location = [university.city, university.state, university.country]
    .filter(Boolean)
    .join(', ')
  
  const getStatusKey = (status: string): keyof typeof APPLICATION_STATUS => {
    const statusMap: Record<string, keyof typeof APPLICATION_STATUS> = {
      'not_started': 'NOT_STARTED',
      'in_progress': 'IN_PROGRESS',
      'submitted': 'SUBMITTED',
      'under_review': 'UNDER_REVIEW',
      'decided': 'DECIDED'
    }
    return statusMap[status] || 'NOT_STARTED'
  }
  
  const getProgressPercentage = (requirements: ApplicationRequirement[]) => {
    const completedRequirements = requirements.filter(req => req.status === 'completed').length
    const totalRequirements = requirements.length
    
    if (totalRequirements === 0) return 0
    return Math.round((completedRequirements / totalRequirements) * 100)
  }
  
  const progressPercentage = getProgressPercentage(application.requirements)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/applications">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {university.name}
              </h1>
              <p className="text-gray-600">{application.applicationType} Application</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* <Link href={`/applications/${application.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </Link> */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDeleteApplication}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Application Information</CardTitle>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={getStatusKey(application.status)} />
                    {application.decisionType && (
                      <Badge 
                        variant={
                          application.decisionType === 'accepted' ? 'default' :
                          application.decisionType === 'rejected' ? 'destructive' : 'secondary'
                        }
                      >
                        {application.decisionType === 'accepted' ? 'Accepted' :
                         application.decisionType === 'rejected' ? 'Rejected' : 'Waitlisted'}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className={`text-sm font-medium ${getDeadlineColor(application.deadline, application.status)}`}>
                      Deadline: {formatDate(application.deadline)}
                    </span>
                  </div>
                  
                  {university.usNewsRanking && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Rank: #{university.usNewsRanking}</span>
                    </div>
                  )}
                  
                  {university.acceptanceRate && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Acceptance Rate: {university.acceptanceRate}%</span>
                    </div>
                  )}
                  
                  {university.applicationFee && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Application Fee: ${university.applicationFee}</span>
                    </div>
                  )}
                  
                  {application.submittedDate && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Submitted: {formatDate(application.submittedDate)}</span>
                    </div>
                  )}
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Requirements Progress</span>
                    <span className="font-medium">
                      {application.requirements.filter(req => req.status === 'completed').length} / {application.requirements.length} completed ({progressPercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
                
                {/* Notes */}
                {application.notes && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Notes</h4>
                    <p className="text-sm text-gray-700">{application.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Requirements */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Application Requirements</CardTitle>
                  {(application.status === APPLICATION_STATUS.SUBMITTED || application.status === APPLICATION_STATUS.UNDER_REVIEW || application.status === APPLICATION_STATUS.DECIDED) && (
                    <Badge variant="secondary" className="text-xs">
                      🔒 Locked (Submitted)
                    </Badge>
                  )}
                </div>
                {(application.status === APPLICATION_STATUS.NOT_STARTED || application.status === APPLICATION_STATUS.IN_PROGRESS) && (
                  <p className="text-sm text-gray-600 mt-2">
                    Click "Mark Complete" to update requirement status. Once submitted, requirements cannot be modified.
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {application.requirements.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Loading requirements...
                  </p>
                ) : (
                  <div className="space-y-3">
                    {application.requirements.map((requirement) => (
                      <div key={requirement.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3 flex-1">
                          {requirement.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : requirement.status === 'in_progress' ? (
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                          
                          <div className="flex-1">
                            <p className="font-medium capitalize">
                              {requirement.requirementType.replace('_', ' ')}
                            </p>
                            {requirement.notes && (
                              <p className="text-sm text-gray-600 mt-1">{requirement.notes}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Only allow requirement updates if application is not submitted yet */}
                          {application.status === APPLICATION_STATUS.NOT_STARTED || application.status === APPLICATION_STATUS.IN_PROGRESS ? (
                            <>
                              {requirement.status === REQUIREMENT_STATUS.COMPLETED ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateRequirement(requirement.id, REQUIREMENT_STATUS.NOT_STARTED)}
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  disabled={updatingRequirement === requirement.id}
                                >
                                  {updatingRequirement === requirement.id ? (
                                    <>
                                      <div className="mr-2 h-3 w-3 animate-spin rounded-full border border-green-600 border-t-transparent" />
                                      Updating...
                                    </>
                                  ) : (
                                    'Completed'
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateRequirement(requirement.id, REQUIREMENT_STATUS.COMPLETED)}
                                  disabled={updatingRequirement === requirement.id}
                                >
                                  {updatingRequirement === requirement.id ? (
                                    <>
                                      <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                                      Updating...
                                    </>
                                  ) : (
                                    'Mark Complete'
                                  )}
                                </Button>
                              )}
                            </>
                          ) : (
                            /* Show read-only status for submitted applications */
                            <div className="flex items-center gap-2">
                              {requirement.status === REQUIREMENT_STATUS.COMPLETED ? (
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-md">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-sm text-green-700 font-medium">Completed</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-md">
                                  <Circle className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">Not Completed</span>
                                </div>
                              )}
                              <span className="text-xs text-gray-500">(Locked)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Status
                  </label>
                  <div className="p-3 bg-gray-50 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={getStatusKey(application.status)} />
                      <span className="text-sm text-gray-600">
                        (Auto-managed)
                      </span>
                    </div>
                  </div>
                </div>
                
                {application.status !== APPLICATION_STATUS.SUBMITTED && application.status !== APPLICATION_STATUS.UNDER_REVIEW && application.status !== APPLICATION_STATUS.DECIDED && (
                  <Button 
                    onClick={handleSubmitApplication}
                    className="w-full"
                    disabled={
                      application.requirements.filter(req => req.status === 'completed').length === 0 ||
                      submitDialog.loading
                    }
                  >
                    {submitDialog.loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                )}
                
                {application.status === APPLICATION_STATUS.SUBMITTED && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ Application submitted successfully
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* University Details */}
            <Card>
              <CardHeader>
                <CardTitle>University Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {university.applicationSystem && (
                  <div>
                    <span className="text-sm font-medium">Application System:</span>
                    <p className="text-sm text-gray-600">{university.applicationSystem}</p>
                  </div>
                )}
                
                {(university.tuitionInState || university.tuitionOutState) && (
                  <div>
                    <span className="text-sm font-medium">Tuition:</span>
                    {university.tuitionInState && (
                      <p className="text-sm text-gray-600">In-State: ${university.tuitionInState.toLocaleString()}</p>
                    )}
                    {university.tuitionOutState && (
                      <p className="text-sm text-gray-600">Out-of-State: ${university.tuitionOutState.toLocaleString()}</p>
                    )}
                  </div>
                )}
                
                {university.availableMajors && university.availableMajors.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Available Majors:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {university.availableMajors.slice(0, 5).map((major) => (
                        <Badge key={major} variant="secondary" className="text-xs">
                          {major}
                        </Badge>
                      ))}
                      {university.availableMajors.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{university.availableMajors.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span className="text-gray-600">Created: {formatDate(application.createdAt)}</span>
                  </div>
                  
                  {application.submittedDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      <span className="text-gray-600">Submitted: {formatDate(application.submittedDate)}</span>
                    </div>
                  )}
                  
                  {application.decisionDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-purple-600 rounded-full" />
                      <span className="text-gray-600">Decision: {formatDate(application.decisionDate)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-600 rounded-full" />
                    <span className="text-gray-600">Deadline: {formatDate(application.deadline)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Delete Confirmation Dialog */}
        {application && (
          <DeleteConfirmDialog
            open={deleteDialog.open}
            onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
            itemName={application.university.name}
            itemType="application"
            onConfirm={confirmDeleteApplication}
            loading={deleteDialog.loading}
          />
        )}
        
        {/* Submit Confirmation Dialog */}
        {application && (
          <SubmitConfirmDialog
            open={submitDialog.open}
            onOpenChange={(open) => setSubmitDialog(prev => ({ ...prev, open }))}
            itemName={application.university.name}
            onConfirm={confirmSubmitApplication}
            loading={submitDialog.loading}
            completedRequirements={application.requirements.filter(req => req.status === 'completed').length}
            totalRequirements={application.requirements.length}
          />
        )}
      </div>
    </div>
  )
} 