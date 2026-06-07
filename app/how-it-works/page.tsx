'use client'

import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { Search, CreditCard, KeyRound } from 'lucide-react'

export default function HowItWorksPage() {
  const { t } = useI18n()

  const steps = [
    { icon: Search, title: t.howItWorks.step1Title, desc: t.howItWorks.step1Desc },
    { icon: CreditCard, title: t.howItWorks.step2Title, desc: t.howItWorks.step2Desc },
    { icon: KeyRound, title: t.howItWorks.step3Title, desc: t.howItWorks.step3Desc },
  ]

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-4xl tracking-tight">{t.howItWorks.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{t.howItWorks.subtitle}</p>
        </div>

        <div className="mx-auto mt-20 max-w-3xl space-y-16">
          {steps.map((step, i) => (
            <div key={step.title} className="flex gap-8">
              <div className="flex shrink-0 flex-col items-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <step.icon className="size-6" strokeWidth={1.75} />
                </div>
                {i < steps.length - 1 && (
                  <div className="mt-4 h-full w-px bg-border" />
                )}
              </div>
              <div className="pb-8">
                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2 className="mt-1 text-2xl font-semibold">{step.title}</h2>
                <p className="mt-3 max-w-lg text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/search">
            <Button size="lg">{t.hero.ctaExplore}</Button>
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
