'use client'

import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'

export default function NotFound() {
  const { t } = useI18n()

  return (
    <PageShell>
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="mx-auto max-w-md space-y-6 text-center">
          <p className="font-display text-8xl font-semibold tabular-nums tracking-tight text-primary/20">
            404
          </p>
          <div>
            <h1 className="font-display text-2xl tracking-tight">{t.errors.notFoundTitle}</h1>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {t.errors.notFoundDescription}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/">
              <Button>{t.errors.home}</Button>
            </Link>
            <Link href="/search">
              <Button variant="outline">{t.errors.explore}</Button>
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
