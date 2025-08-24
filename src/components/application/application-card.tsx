'use client'

import React from 'react'
import Link from 'next/link'
import { Application } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './status-badge'
import { 
  CalendarIcon, 
  MapPinIcon, 
  EditIcon, 
  TrashIcon,
  ExternalLinkIcon 
} from 'lucide-react'
import { formatDate, getDeadlineColor } from '@/lib/utils'
import { APPLICATION_STATUS } from '@/constants/enums'

interface ApplicationCardProps {
  application: Application & {
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
  }
  onEdit?: (application: Application) => void
  onDelete?: (applicationId: string) => void
  showActions?: boolean
}

export function ApplicationCard({ 
  application, 
  onEdit, 
  onDelete, 
  showActions = true 
}: ApplicationCardProps) {
  const { university } = application
  
  const deadlineColor = getDeadlineColor(application.deadline, application.status)
  const location = [university.city, university.state, university.country]
    .filter(Boolean)
    .join(', ')

  const progressPercentage = getProgressPercentage(application.requirements || [])

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link 
              href={`/applications/${application.id}`}
              className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              {university.name}
            </Link>
            
            {location && (
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {location}
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {application.applicationType}
              </Badge>
              <StatusBadge status={getStatusKey(application.status)} />
              {application.decisionType && (
                <Badge 
                  variant={
                    application.decisionType === 'accepted' ? 'default' :
                    application.decisionType === 'rejected' ? 'destructive' : 'secondary'
                  }
                  className="text-xs"
                >
                  {application.decisionType === 'accepted' ? 'Accepted' :
                   application.decisionType === 'rejected' ? 'Rejected' : 'Waitlisted'}
                </Badge>
              )}
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-2">
              <Link href={`/applications/${application.id}`}>
                <Button variant="ghost" size="sm">
                  <ExternalLinkIcon className="h-4 w-4" />
                </Button>
              </Link>
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEdit(application)}
                >
                  <EditIcon className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onDelete(application.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* University Info */}
          <div className="flex items-center justify-between text-sm">
            {university.usNewsRanking && (
              <span className="text-gray-600">
                Rank: #{university.usNewsRanking}
              </span>
            )}
            {university.acceptanceRate && (
              <span className="text-gray-600">
                Acceptance: {university.acceptanceRate}%
              </span>
            )}
            {university.applicationFee && (
              <span className="text-gray-600">
                Fee: ${university.applicationFee}
              </span>
            )}
          </div>
          
          {/* Deadline */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span className={`font-medium ${deadlineColor}`}>
                Deadline: {formatDate(application.deadline)}
              </span>
            </div>
            
            {/* Progress */}
            <div className="text-xs text-gray-600">
              {application.requirements ? 
                `${application.requirements.filter(req => req.status === 'completed').length}/${application.requirements.length} completed (${progressPercentage}%)` :
                `${progressPercentage}% Complete`
              }
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Important Dates */}
          {(application.submittedDate || application.decisionDate) && (
            <div className="text-xs text-gray-600 space-y-1">
              {application.submittedDate && (
                <div>Submitted: {formatDate(application.submittedDate)}</div>
              )}
              {application.decisionDate && (
                <div>Decision: {formatDate(application.decisionDate)}</div>
              )}
            </div>
          )}
          
          {/* Notes Preview */}
          {application.notes && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded text-ellipsis line-clamp-2">
              {application.notes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function getProgressPercentage(requirements: any[]): number {
  if (!requirements || requirements.length === 0) return 0
  
  const completedRequirements = requirements.filter(req => req.status === 'completed').length
  const totalRequirements = requirements.length
  
  return Math.round((completedRequirements / totalRequirements) * 100)
}

function getStatusKey(status: string): keyof typeof APPLICATION_STATUS {
  const statusMap: Record<string, keyof typeof APPLICATION_STATUS> = {
    [APPLICATION_STATUS.NOT_STARTED]: 'NOT_STARTED',
    [APPLICATION_STATUS.IN_PROGRESS]: 'IN_PROGRESS',
    [APPLICATION_STATUS.SUBMITTED]: 'SUBMITTED',
    [APPLICATION_STATUS.UNDER_REVIEW]: 'UNDER_REVIEW',
    [APPLICATION_STATUS.DECIDED]: 'DECIDED'
  }
  
  return statusMap[status] || 'NOT_STARTED'
} 