import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  APPLICATION_STATUS, 
  DECISION_TYPES, 
  STATUS_LABELS, 
  DECISION_LABELS,
  STATUS_COLORS,
  DECISION_COLORS 
} from '@/constants'

interface StatusBadgeProps {
  status: keyof typeof APPLICATION_STATUS
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusKey = APPLICATION_STATUS[status]
  
  return (
    <Badge 
      className={cn(
        STATUS_COLORS[statusKey],
        'font-medium',
        className
      )}
      variant="secondary"
    >
      {STATUS_LABELS[statusKey]}
    </Badge>
  )
}

interface DecisionBadgeProps {
  decision: keyof typeof DECISION_TYPES
  className?: string
}

export function DecisionBadge({ decision, className }: DecisionBadgeProps) {
  const decisionKey = DECISION_TYPES[decision]
  
  return (
    <Badge 
      className={cn(
        DECISION_COLORS[decisionKey],
        'font-medium',
        className
      )}
      variant="secondary"
    >
      {DECISION_LABELS[decisionKey]}
    </Badge>
  )
}