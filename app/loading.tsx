'use client'

import { PageShell } from '@/components/page-shell'
import { useI18n } from '@/lib/i18n/context'

export default function Loading() {
  const { t } = useI18n()

  return (
    <PageShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="size-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      </div>
    </PageShell>
  )
}
