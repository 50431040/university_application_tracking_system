'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { ArrowLeft, Calendar, Building, MapPin } from 'lucide-react'

interface University {
  id: string
  name: string
  city: string
  state: string
  country: string
  deadlines: any
}

interface FormData {
  universityId: string
  applicationType: string
  notes: string
}

const APPLICATION_TYPES = [
  { value: 'Early Decision', label: 'Early Decision (ED)' },
  { value: 'Early Action', label: 'Early Action (EA)' }, 
  { value: 'Regular Decision', label: 'Regular Decision (RD)' },
  { value: 'Rolling Admission', label: 'Rolling Admission' }
]

function NewApplicationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedUniversityId = searchParams.get('universityId')
  
  console.log('NewApplicationPage loaded with universityId:', preSelectedUniversityId)
  
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
  const [formData, setFormData] = useState<FormData>({
    universityId: '',
    applicationType: '',
    notes: ''
  })
  const [deadline, setDeadline] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const handleUniversitySelect = useCallback((university: University) => {
    console.log('University selected:', university)
    setSelectedUniversity(university)
    setFormData(prev => ({ ...prev, universityId: university.id }))
    
    // Update deadline if application type is already selected
    if (formData.applicationType) {
      updateDeadlineWithData(university, formData.applicationType)
    }
  }, [formData.applicationType])

  // Handle pre-selection when universityId is provided in URL
  useEffect(() => {
    if (preSelectedUniversityId && !selectedUniversity) {
      console.log('Attempting to pre-select university:', preSelectedUniversityId)
      fetchSpecificUniversity(preSelectedUniversityId)
    }
  }, [preSelectedUniversityId, selectedUniversity])

  // Update deadline when university and application type change
  useEffect(() => {
    if (selectedUniversity && formData.applicationType) {
      updateDeadlineWithData(selectedUniversity, formData.applicationType)
    }
  }, [selectedUniversity, formData.applicationType])

  const fetchSpecificUniversity = async (universityId: string) => {
    try {
      console.log('Fetching university with ID:', universityId)
      const response = await fetch(`/api/universities/${universityId}`)
      const data = await response.json()
      if (response.ok) {
        console.log('Specific university loaded:', data.data.name)
        handleUniversitySelect(data.data)
      } else {
        console.error('Failed to fetch specific university:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch specific university:', error)
    }
  }

  const updateDeadlineWithData = (university: University, applicationType: string) => {
    console.log('updateDeadlineWithData called with:', { 
      university: university?.name, 
      applicationType: applicationType,
      deadlines: university?.deadlines 
    })
    
    if (!university?.deadlines || !applicationType) {
      setDeadline('')
      return
    }

    const deadlines = university.deadlines as any
    const deadlineKey = getDeadlineKey(applicationType)
    const deadlineStr = deadlines[deadlineKey]
    
    console.log('Deadline lookup (with data):', { deadlines, deadlineKey, deadlineStr })
    
    if (deadlineStr) {
      const date = new Date(deadlineStr)
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      })
      console.log('Setting deadline to:', formattedDate)
      setDeadline(formattedDate)
    } else {
      console.log('No deadline found, setting to confirm message')
      setDeadline('To be confirmed - Please contact school to confirm deadline')
    }
  }

  const getDeadlineKey = (applicationType: string): string => {
    const mapping: Record<string, string> = {
      'Early Decision': 'early_decision',
      'Early Action': 'early_action',
      'Regular Decision': 'regular_decision', 
      'Rolling Admission': 'rolling_admission'
    }
    return mapping[applicationType] || 'regular_decision'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    // Validate form
    const newErrors: {[key: string]: string} = {}
    if (!formData.universityId) {
      newErrors.university = 'Please select a university'
    }
    if (!formData.applicationType) {
      newErrors.applicationType = 'Please select application type'
    }
    if (!deadline || deadline.includes('To be confirmed')) {
      newErrors.deadline = 'Deadline not available for this application type'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      if (response.ok) {
        // Success - redirect to applications page
        router.push('/applications')
      } else {
        setErrors({ submit: data.error?.message || 'Failed to create application' })
      }
    } catch (error) {
      setErrors({ submit: 'Network error, please try again later' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            New Application
          </h1>
          <p className="text-gray-600">
            Select university and application type to create a new application
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* University Display */}
              <div className="space-y-2">
                <Label htmlFor="university">University *</Label>
                {selectedUniversity ? (
                  <div className={`flex items-center justify-between p-3 border rounded-md bg-white ${errors.university ? 'border-red-500' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">{selectedUniversity.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {selectedUniversity.city}, {selectedUniversity.state}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`p-3 border rounded-md bg-gray-50 ${errors.university ? 'border-red-500' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3 text-gray-500">
                      <Building className="h-4 w-4" />
                      <div>
                        <div className="text-sm">Please select a university</div>
                        <div className="text-xs"></div>
                      </div>
                    </div>
                  </div>
                )}
                {errors.university && (
                  <p className="text-sm text-red-600">{errors.university}</p>
                )}
              </div>

              {/* Application Type */}
              <div className="space-y-2">
                <Label htmlFor="applicationType">Application Type *</Label>
                <Select
                  value={formData.applicationType}
                  onValueChange={(value) => {
                    console.log('Application type changed to:', value)
                    setFormData(prev => ({ ...prev, applicationType: value }))
                    // Trigger deadline update if university is already selected  
                    if (selectedUniversity) {
                      updateDeadlineWithData(selectedUniversity, value)
                    }
                  }}
                >
                  <SelectTrigger className={errors.applicationType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select application type" />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.applicationType && (
                  <p className="text-sm text-red-600">{errors.applicationType}</p>
                )}
              </div>

              {/* Deadline Display */}
              {deadline && (
                <div className="space-y-2">
                  <Label>Application Deadline</Label>
                  <div className={`p-3 rounded-md border flex items-center gap-2 ${
                    deadline.includes('To be confirmed') 
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}>
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">{deadline}</span>
                  </div>
                  {errors.deadline && (
                    <p className="text-sm text-red-600">{errors.deadline}</p>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Personal Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about this application..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Application'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function NewApplicationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div>Loading...</div></div>}>
      <NewApplicationForm />
    </Suspense>
  )
}