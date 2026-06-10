'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  Circle,
  User,
  Home,
  Camera,
  Calendar,
  DollarSign,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

type OnboardingData = {
  profileComplete: boolean
  firstListingCreated: boolean
  calendarConfigured: boolean
  pricingConfigured: boolean
  photosUploaded: boolean
}

const STEPS = [
  { key: 'profileComplete' as const, icon: User, href: '/profile' },
  { key: 'firstListingCreated' as const, icon: Home, href: '/landlord/listings/create' },
  { key: 'photosUploaded' as const, icon: Camera, href: '/landlord/listings' },
  { key: 'calendarConfigured' as const, icon: Calendar, href: '/landlord/listings' },
  { key: 'pricingConfigured' as const, icon: DollarSign, href: '/landlord/listings' },
] as const

const STEP_LABEL_KEYS = {
  profileComplete: 'profile',
  firstListingCreated: 'listing',
  photosUploaded: 'photos',
  calendarConfigured: 'calendar',
  pricingConfigured: 'pricing',
} as const

export function OnboardingChecklist() {
  const { t } = useI18n()
  const [data, setData] = useState<OnboardingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/landlord/onboarding')
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => setData(res?.onboarding ?? null))
      .catch(() => setData(null))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const completedCount = STEPS.filter((s) => data[s.key]).length
  const progress = (completedCount / STEPS.length) * 100
  const allDone = completedCount === STEPS.length

  if (allDone) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-3 p-5">
          <CheckCircle2 className="size-5 text-primary shrink-0" />
          <p className="text-sm font-medium">{t.onboarding.allDone}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t.onboarding.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{t.onboarding.subtitle}</p>
        <div className="pt-2 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t.onboarding.progress}</span>
            <span className="tabular-nums">{completedCount}/{STEPS.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {STEPS.map((step, i) => {
          const done = data[step.key]
          const labelKey = STEP_LABEL_KEYS[step.key]
          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={step.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50',
                    done ? 'border-primary/20 bg-primary/5' : 'border-border'
                  )}
                >
                  <div
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-lg',
                      done ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <step.icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{t.onboarding.steps[labelKey]}</p>
                    <p className="text-xs text-muted-foreground">
                      {done ? t.onboarding.complete : t.onboarding.pending}
                    </p>
                  </div>
                  {done ? (
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground/40 shrink-0" />
                  )}
                </div>
              </Link>
            </motion.div>
          )
        })}
      </CardContent>
    </Card>
  )
}
