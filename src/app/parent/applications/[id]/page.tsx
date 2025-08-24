'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { StatusBadge } from '@/components/application/status-badge'
import { ArrowLeft, Plus, MessageSquare, Calendar, School, MapPin } from 'lucide-react'
import { 
  ParentApplicationDetail, 
  LoadingState,
  ApiResponse 
} from '@/types'
import { formatDate, formatCurrency, getDeadlineColor } from '@/lib/utils'
import { APPLICATION_STATUS } from '@/constants'

export default function ParentApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params.id as string

  const [applicationDetail, setApplicationDetail] = useState<LoadingState<ParentApplicationDetail>>({
    data: null,
    isLoading: true,
    error: null
  })

  const [newNote, setNewNote] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)
  const [justAddedNoteId, setJustAddedNoteId] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetail()
    }
  }, [applicationId])

  const fetchApplicationDetail = async () => {
    setApplicationDetail(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await fetch(`/api/parent/applications/${applicationId}`, {
        credentials: 'include'
      })
      const result: ApiResponse<ParentApplicationDetail> = await response.json()
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      setApplicationDetail({
        data: result.data || null,
        isLoading: false,
        error: null
      })
    } catch (error) {
      setApplicationDetail({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load application details'
      })
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setIsAddingNote(true)
    try {
      const response = await fetch(`/api/parent/applications/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ note: newNote.trim() }),
      })

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error.message)
      }

      // Optimistically update the notes list without refreshing the entire page
      const newNoteData = result.data
      setApplicationDetail(prev => {
        if (!prev.data) return prev
        return {
          ...prev,
          data: {
            ...prev.data,
            parentNotes: [newNoteData, ...prev.data.parentNotes]
          }
        }
      })

      // Highlight the newly added note and show success message
      setJustAddedNoteId(newNoteData.id)
      setShowSuccessMessage(true)
      
      // Remove highlight and success message after 3 seconds
      setTimeout(() => {
        setJustAddedNoteId(null)
        setShowSuccessMessage(false)
      }, 3000)

      setNewNote('')
      setShowAddNote(false)
    } catch (error) {
      console.error('Failed to add note:', error)
      alert('Failed to add note. Please try again.')
    } finally {
      setIsAddingNote(false)
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

  const getRequirementStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'not_started': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (applicationDetail.isLoading) {
    return (
      <div className="container mx-auto p-6">
        <LoadingSpinner />
      </div>
    )
  }

  if (applicationDetail.error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Error: {applicationDetail.error}</p>
            <Button onClick={fetchApplicationDetail} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!applicationDetail.data) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">Application not found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { application, parentNotes } = applicationDetail.data

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{application.university?.name || 'Unknown University'}</h1>
            <p className="text-gray-600">Application Details for {application.student?.name}</p>
          </div>
        </div>
      </div>

      {/* Application Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Application Overview</span>
            <div className="flex items-center space-x-2">
              <Badge className={getApplicationTypeColor(application.applicationType)}>
                {application.applicationType}
              </Badge>
              <StatusBadge status={getStatusKey(application.status)} />
              {application.decisionType && (
                <Badge className={getDecisionBadgeColor(application.decisionType)}>
                  {application.decisionType.charAt(0).toUpperCase() + application.decisionType.slice(1)}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Important Dates
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Application Deadline:</span>
                    <span className={`font-medium ${getDeadlineColor(application.deadline, application.status)}`}>
                      {formatDate(application.deadline)}
                    </span>
                  </div>
                  {application.submittedDate && (
                    <div className="flex justify-between">
                      <span>Submitted:</span>
                      <span className="font-medium">{formatDate(application.submittedDate)}</span>
                    </div>
                  )}
                  {application.decisionDate && (
                    <div className="flex justify-between">
                      <span>Decision Date:</span>
                      <span className="font-medium">{formatDate(application.decisionDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                  <School className="h-4 w-4 mr-2" />
                  University Information
                </h3>
                <div className="space-y-2 text-sm">
                  {application.university?.usNewsRanking && (
                    <div className="flex justify-between">
                      <span>US News Ranking:</span>
                      <span className="font-medium">#{application.university.usNewsRanking}</span>
                    </div>
                  )}
                  {application.university?.acceptanceRate && (
                    <div className="flex justify-between">
                      <span>Acceptance Rate:</span>
                      <span className="font-medium">{Number(application.university.acceptanceRate).toFixed(1)}%</span>
                    </div>
                  )}
                  {application.university?.applicationSystem && (
                    <div className="flex justify-between">
                      <span>Application System:</span>
                      <span className="font-medium">{application.university.applicationSystem}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location & Costs
                </h3>
                <div className="space-y-2 text-sm">
                  {application.university && (
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-medium">
                        {[application.university.city, application.university.state, application.university.country]
                          .filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  {application.university?.applicationFee && (
                    <div className="flex justify-between">
                      <span>Application Fee:</span>
                      <span className="font-medium">{formatCurrency(Number(application.university.applicationFee))}</span>
                    </div>
                  )}
                  {application.university?.tuitionInState && (
                    <div className="flex justify-between">
                      <span>Tuition (In-State):</span>
                      <span className="font-medium">{formatCurrency(Number(application.university.tuitionInState))}</span>
                    </div>
                  )}
                  {application.university?.tuitionOutState && (
                    <div className="flex justify-between">
                      <span>Tuition (Out-State):</span>
                      <span className="font-medium">{formatCurrency(Number(application.university.tuitionOutState))}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {application.notes && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-700 mb-2">Student Notes</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{application.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Requirements */}
      {application.requirements && application.requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Application Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {application.requirements.map(requirement => (
                <div key={requirement.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium capitalize">
                      {requirement.requirementType.replace('_', ' ')}
                    </h4>
                    {requirement.deadline && (
                      <p className="text-sm text-gray-600">
                        Due: {formatDate(requirement.deadline)}
                      </p>
                    )}
                    {requirement.notes && (
                      <p className="text-sm text-gray-600 mt-1">{requirement.notes}</p>
                    )}
                  </div>
                  <Badge className={getRequirementStatusColor(requirement.status)}>
                    {requirement.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parent Notes Section */}
      <Card>
                 <CardHeader>
           <CardTitle className="flex items-center justify-between">
             <span className="flex items-center">
               <MessageSquare className="h-5 w-5 mr-2" />
               Parent Notes & Observations
               {showSuccessMessage && (
                 <span className="ml-3 text-sm font-normal text-green-600 bg-green-100 px-2 py-1 rounded-full animate-pulse">
                   ✓ Note added successfully
                 </span>
               )}
             </span>
             <Button 
               variant="outline" 
               size="sm"
               onClick={() => setShowAddNote(!showAddNote)}
             >
               <Plus className="h-4 w-4 mr-2" />
               Add Note
             </Button>
           </CardTitle>
         </CardHeader>
        <CardContent>
          {/* Add Note Form */}
          {showAddNote && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <Label htmlFor="newNote" className="text-sm font-medium">
                Add a new note or observation
              </Label>
              <Textarea
                id="newNote"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Share your thoughts, concerns, or observations about this application..."
                className="mt-2 min-h-[100px]"
                maxLength={1000}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  {newNote.length}/1000 characters
                </span>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowAddNote(false)
                      setNewNote('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || isAddingNote}
                  >
                    {isAddingNote ? 'Adding...' : 'Add Note'}
                  </Button>
                </div>
              </div>
            </div>
          )}

                     {/* Notes List */}
           {parentNotes.length > 0 ? (
             <div className="space-y-4">
               {parentNotes.map(note => (
                 <div 
                   key={note.id} 
                   className={`p-4 border rounded-lg transition-all duration-500 ${
                     justAddedNoteId === note.id 
                       ? 'border-green-300 bg-green-50 shadow-lg scale-[1.02]' 
                       : 'border-gray-200'
                   }`}
                 >
                   <p className="text-sm mb-2">{note.note}</p>
                   <p className="text-xs text-gray-500">
                     Added on {formatDate(note.createdAt)}
                     {justAddedNoteId === note.id && (
                       <span className="ml-2 text-green-600 font-medium">✓ Just added</span>
                     )}
                   </p>
                 </div>
               ))}
             </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No notes yet</p>
              <p className="text-sm">Add your first note or observation about this application</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 