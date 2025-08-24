import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UpcomingDeadline } from '@/types'

interface UpcomingDeadlinesProps {
  deadlines: UpcomingDeadline[]
}

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  const getDeadlineBadgeColor = (days: number) => {
    if (days <= 3) return 'destructive'
    if (days <= 7) return 'secondary'
    return 'default'
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'secondary'
      case 'in_progress':
        return 'default'
      case 'submitted':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (deadlines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>No upcoming deadlines</p>
            <p className="text-sm mt-1">All caught up! 🎉</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {deadlines.map((deadline) => (
          <div 
            key={deadline.id} 
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{deadline.universityName}</h4>
                <Badge variant={getStatusBadgeColor(deadline.status)}>
                  {deadline.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                {deadline.applicationType}
              </p>
              <p className="text-xs text-muted-foreground">
                Due: {formatDate(deadline.deadline)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getDeadlineBadgeColor(deadline.daysUntilDeadline)}>
                {deadline.daysUntilDeadline} day{deadline.daysUntilDeadline !== 1 ? 's' : ''}
              </Badge>
              <Button size="sm" variant="outline">
                View
              </Button>
            </div>
          </div>
        ))}
        {deadlines.length > 0 && (
          <div className="pt-2">
            <Button variant="ghost" size="sm" className="w-full">
              View All Deadlines
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 