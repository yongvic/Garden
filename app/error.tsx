'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { PageShell } from '@/components/page-shell'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { AlertCircle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useI18n()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <PageShell>
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="mx-auto max-w-md space-y-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertCircle className="size-8" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="font-display text-2xl tracking-tight">{t.errors.title}</h1>
            <p className="mt-3 text-muted-foreground leading-relaxed">{t.errors.description}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => reset()}>{t.errors.retry}</Button>
            <Link href="/">
              <Button variant="outline">{t.errors.home}</Button>
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
