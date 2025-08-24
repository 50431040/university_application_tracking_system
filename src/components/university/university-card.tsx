import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, DollarSign, Calendar, Plus } from 'lucide-react'

interface University {
  id: string
  name: string
  country: string
  state: string
  city: string
  usNewsRanking: number
  acceptanceRate: number
  applicationSystem: string
  tuitionInState: number
  tuitionOutState: number
  applicationFee: number
  deadlines: any
  availableMajors: string[]
}

interface UniversityCardProps {
  university: University
  onAddApplication?: (universityId: string) => void
}

export function UniversityCard({ university, onAddApplication }: UniversityCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getEarliestDeadline = (deadlines: any) => {
    if (!deadlines) return null
    
    const now = new Date()
    const dates = Object.values(deadlines)
      .filter(Boolean) 
      .map(date => new Date(date as string))
      .filter(date => date > now) // Only future dates
      .sort((a, b) => a.getTime() - b.getTime()) // Sort by earliest
    
    if (dates.length === 0) return null
    
    return dates[0].toLocaleDateString()
  }

  const getAcceptanceRateColor = (rate: number) => {
    if (rate < 10) return 'bg-red-100 text-red-800'
    if (rate < 30) return 'bg-orange-100 text-orange-800'
    if (rate < 50) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {university.name}
            </CardTitle>
            <div className="flex items-center gap-1 mt-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">
                {university.city}, {university.state}
              </span>
            </div>
          </div>
          
          {university.usNewsRanking && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              #{university.usNewsRanking}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Acceptance Rate</div>
              <Badge 
                variant="secondary"
                className={`${getAcceptanceRateColor(university.acceptanceRate)} font-medium`}
              >
                {university.acceptanceRate}%
              </Badge>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Application System</div>
              <div className="text-sm font-medium">
                {university.applicationSystem || 'Direct'}
              </div>
            </div>
          </div>

          {/* Tuition */}
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Tuition</div>
            <div className="space-y-1">
              {university.tuitionInState && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold text-sm">
                    {formatCurrency(university.tuitionInState)}
                  </span>
                  <span className="text-xs text-gray-500">
                    (In-State)
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="font-semibold text-sm">
                  {formatCurrency(university.tuitionOutState)}
                </span>
                <span className="text-xs text-gray-500">
                  (Out-of-State)
                </span>
              </div>
            </div>
            {university.applicationFee && (
              <div className="text-sm text-gray-500">
                Application fee: {formatCurrency(university.applicationFee)}
              </div>
            )}
          </div>

          {/* Earliest Deadline */}
          {getEarliestDeadline(university.deadlines) && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                Earliest deadline: {getEarliestDeadline(university.deadlines)}
              </span>
            </div>
          )}

          {/* Major Tags */}
          {university.availableMajors && university.availableMajors.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Popular Majors</div>
              <div className="flex flex-wrap gap-1">
                {university.availableMajors.slice(0, 3).map((major) => (
                  <Badge key={major} variant="outline" className="text-xs">
                    {major}
                  </Badge>
                ))}
                {university.availableMajors.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{university.availableMajors.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Always at bottom */}
        <div className="pt-4">
          <Button 
            onClick={() => onAddApplication?.(university.id)}
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Application
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}