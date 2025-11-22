import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled'

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig: Record<Status, { label: string; icon: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
  draft: { label: 'Draft', icon: '📝', variant: 'secondary' },
  waiting: { label: 'Waiting', icon: '⏳', variant: 'warning' },
  ready: { label: 'Ready', icon: '✓', variant: 'default' },
  done: { label: 'Done', icon: '✅', variant: 'success' },
  canceled: { label: 'Canceled', icon: '❌', variant: 'destructive' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge variant={config.variant} className={cn("gap-1", className)}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </Badge>
  )
}

