import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type StatCardProps = {
  label: string
  value: string | number
  sub?: string
  icon?: LucideIcon
  badge?: { text: string; positive?: boolean }
  className?: string
}

export function StatCard({ label, value, sub, icon: Icon, badge, className }: StatCardProps) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/20', className)}>
      <div className="mb-4 flex items-start justify-between">
        {Icon && (
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" strokeWidth={1.75} />
          </div>
        )}
        {badge && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              badge.positive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
            )}
          >
            {badge.text}
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold tabular-nums tracking-tight truncate">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground/70">{sub}</p>}
    </div>
  )
}
