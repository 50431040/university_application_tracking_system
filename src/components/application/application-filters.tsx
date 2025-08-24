'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Filter, RotateCcw } from 'lucide-react'
import { FilterOptions } from '@/types'
import { 
  getApplicationStatusOptions, 
  getApplicationTypeOptions, 
  getDecisionTypeOptions,
  ApplicationStatus,
  ApplicationType,
  DecisionType
} from '@/constants/enums'

interface ApplicationFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onClearFilters: () => void
  applicationCounts?: {
    total: number
    filtered: number
  }
}

export function ApplicationFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  applicationCounts
}: ApplicationFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(value => 
    value && value !== 'all'
  )

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status as ApplicationStatus
    })
  }

  const handleApplicationTypeChange = (type: string) => {
    onFiltersChange({
      ...filters,
      applicationType: type as ApplicationType
    })
  }

  const handleDecisionTypeChange = (decision: string) => {
    onFiltersChange({
      ...filters,
      decisionType: decision as DecisionType
    })
  }

  const removeStatusFilter = () => {
    onFiltersChange({
      ...filters,
      status: undefined
    })
  }

  const removeApplicationTypeFilter = () => {
    onFiltersChange({
      ...filters,
      applicationType: undefined
    })
  }

  const removeDecisionTypeFilter = () => {
    onFiltersChange({
      ...filters,
      decisionType: undefined
    })
  }

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <h3 className="font-medium text-gray-900">Filters</h3>
          {applicationCounts && (
            <span className="text-sm text-gray-500">
              ({applicationCounts.filtered} of {applicationCounts.total})
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-600"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
                      <Select 
              value={filters.status || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  onFiltersChange({
                    ...filters,
                    status: undefined
                  })
                } else {
                  handleStatusChange(value)
                }
              }}
            >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {getApplicationStatusOptions().map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Application Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Application Type
          </label>
          <Select 
            value={filters.applicationType || "all"}
            onValueChange={(value) => {
              if (value === "all") {
                onFiltersChange({
                  ...filters,
                  applicationType: undefined
                })
              } else {
                handleApplicationTypeChange(value)
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              {getApplicationTypeOptions().map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Deadline Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deadline
          </label>
          <Select
            value={filters.deadlineRange || 'all'}
            onValueChange={(value) => onFiltersChange({
              ...filters,
              deadlineRange: value as any
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All deadlines</SelectItem>
              <SelectItem value="this_week">This week</SelectItem>
              <SelectItem value="this_month">This month</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Decision Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Decision
          </label>
          <Select 
            value={filters.decisionType || "all"}
            onValueChange={(value) => {
              if (value === "all") {
                onFiltersChange({
                  ...filters,
                  decisionType: undefined
                })
              } else {
                handleDecisionTypeChange(value)
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All decisions" />
            </SelectTrigger>
            <SelectContent>
              {getDecisionTypeOptions().map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {/* Status badges */}
          {filters.status && filters.status !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filters.status.replace('_', ' ')}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={removeStatusFilter}
              />
            </Badge>
          )}
          
          {/* Application Type badges */}
          {filters.applicationType && filters.applicationType !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {filters.applicationType}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={removeApplicationTypeFilter}
              />
            </Badge>
          )}
          
          {/* Decision Type badges */}
          {filters.decisionType && filters.decisionType !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Decision: {filters.decisionType}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={removeDecisionTypeFilter}
              />
            </Badge>
          )}
          
          {/* Deadline Range badge */}
          {filters.deadlineRange && filters.deadlineRange !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Deadline: {filters.deadlineRange.replace('_', ' ')}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFiltersChange({
                  ...filters,
                  deadlineRange: 'all'
                })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
} 