import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ProgressOverview as ProgressOverviewType } from '@/types'

interface ProgressOverviewProps {
  progress: ProgressOverviewType
}

export function ProgressOverview({ progress }: ProgressOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{progress.progressPercentage}%</span>
          </div>
          <Progress value={progress.progressPercentage} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {progress.completedRequirements}
            </div>
            <div className="text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {progress.totalRequirements}
            </div>
            <div className="text-muted-foreground">Total Tasks</div>
          </div>
        </div>

        {progress.totalRequirements === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>Start adding applications to track your progress</p>
          </div>
        ) : (
          <div className="pt-2">
            <div className="text-xs text-muted-foreground text-center">
              {progress.totalRequirements - progress.completedRequirements} task
              {progress.totalRequirements - progress.completedRequirements !== 1 ? 's' : ''} remaining
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 