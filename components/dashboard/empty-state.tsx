import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'

type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  action?: { label: string; href: string }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center">
      {Icon && <Icon className="mb-4 size-10 text-muted-foreground/40" strokeWidth={1.5} />}
      <p className="font-medium">{title}</p>
      {description && <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && (
        <Link href={action.href} className="mt-6">
          <Button variant="outline">{action.label}</Button>
        </Link>
      )}
    </div>
  )
}
