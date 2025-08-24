'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Application, FilterOptions, LoadingState } from '@/types'
import { ApplicationCard } from '@/components/application/application-card'
import { ApplicationFilters } from '@/components/application/application-filters'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { EmptyState } from '@/components/shared/empty-state'
import { DeleteConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Grid, List } from 'lucide-react'

interface ApplicationsResponse {
  applications: (Application & {
    university: {
      id: string
      name: string
      country?: string
      state?: string
      city?: string
      usNewsRanking?: number
      acceptanceRate?: number
      applicationFee?: number
    }
    requirements?: Array<{
      id: string
      requirementType: string
      status: string
    }>
  })[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function ApplicationsPage() {
  const [applicationsState, setApplicationsState] = useState<LoadingState<ApplicationsResponse>>({
    data: null,
    isLoading: true,
    error: null
  })
  
  const [filters, setFilters] = useState<FilterOptions>({
    deadlineRange: 'all'
  })
  
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('deadline')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  
  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    applicationId: string
    applicationName: string
    loading: boolean
  }>({
    open: false,
    applicationId: '',
    applicationName: '',
    loading: false
  })
  
  const fetchApplications = useCallback(async () => {
    try {
      setApplicationsState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sortBy,
        sortOrder,
        ...(searchQuery && { search: searchQuery }),
        ...(filters.status && filters.status !== 'all' && { status: filters.status }),
        ...(filters.applicationType && filters.applicationType !== 'all' && { applicationType: filters.applicationType }),
        ...(filters.deadlineRange && filters.deadlineRange !== 'all' && { deadlineRange: filters.deadlineRange }),
        ...(filters.decisionType && filters.decisionType !== 'all' && { decisionType: filters.decisionType })
      })
      
      const response = await fetch(`/api/student/applications?${searchParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }
      
      const result = await response.json()
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      setApplicationsState({
        data: result.data,
        isLoading: false,
        error: null
      })
    } catch (error) {
      setApplicationsState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch applications'
      })
    }
  }, [currentPage, sortBy, sortOrder, searchQuery, filters])
  
  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, searchQuery, sortBy, sortOrder])
  
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }
  
  const handleClearFilters = () => {
    setFilters({ deadlineRange: 'all' })
    setSearchQuery('')
  }
  
  const handleDeleteApplication = (applicationId: string, applicationName: string) => {
    setDeleteDialog({
      open: true,
      applicationId,
      applicationName,
      loading: false
    })
  }
  
  const confirmDeleteApplication = async () => {
    setDeleteDialog(prev => ({ ...prev, loading: true }))
    
    try {
      const response = await fetch(`/api/applications/${deleteDialog.applicationId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete application')
      }
      
      // Close dialog and refresh the list
      setDeleteDialog({
        open: false,
        applicationId: '',
        applicationName: '',
        loading: false
      })
      fetchApplications()
    } catch (error) {
      setDeleteDialog(prev => ({ ...prev, loading: false }))
      alert('Failed to delete application: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }
  
  const { data: applicationsData, isLoading, error } = applicationsState
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold mb-2">Error Loading Applications</h2>
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={fetchApplications} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Applications
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and track your university applications
            </p>
          </div>
          
          <Link href="/universities">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Application
            </Button>
          </Link>
        </div>
        
        {/* Search and View Controls */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search universities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deadline">Sort by Deadline</SelectItem>
                  <SelectItem value="universityName">Sort by University</SelectItem>
                  <SelectItem value="status">Sort by Status</SelectItem>
                  <SelectItem value="createdAt">Sort by Created</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="mb-6">
          <ApplicationFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            applicationCounts={applicationsData ? {
              total: applicationsData.pagination.total,
              filtered: applicationsData.applications.length
            } : undefined}
          />
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        )}
        
        {/* Applications List */}
        {!isLoading && applicationsData && (
          <>
            {applicationsData.applications.length === 0 ? (
                             <EmptyState
                 title="No applications found"
                 description="Start by creating your first university application."
                 action={{
                   label: "Create Application",
                   onClick: () => window.location.href = "/universities"
                 }}
               />
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {applicationsData.applications.map((application) => (
                                     <ApplicationCard
                     key={application.id}
                     application={application}
                     onDelete={(applicationId) => handleDeleteApplication(applicationId, application.university.name)}
                     showActions={true}
                   />
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {applicationsData.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {applicationsData.pagination.page} of {applicationsData.pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(applicationsData.pagination.totalPages, prev + 1))}
                  disabled={currentPage === applicationsData.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
        
        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
          itemName={deleteDialog.applicationName}
          itemType="application"
          onConfirm={confirmDeleteApplication}
          loading={deleteDialog.loading}
        />
      </div>
    </div>
  )
}