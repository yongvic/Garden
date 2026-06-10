'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { PageHeader } from '@/components/dashboard/page-header'
import { AvailabilityCalendar } from '@/components/landlord/availability-calendar'
import { PricingRulesForm } from '@/components/landlord/pricing-rules-form'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { ArrowLeft } from 'lucide-react'

export default function ListingCalendarPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { t } = useI18n()
  const listingId = params.id as string

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (status === 'authenticated') {
      const role = (session?.user as { role?: string })?.role
      if (role !== 'LANDLORD' && role !== 'ADMIN') {
        router.push('/dashboard')
      }
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <PageShell>
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/landlord/listings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 size-4" />
              {t.common.back}
            </Button>
          </Link>
        </div>

        <PageHeader
          title={t.calendar.title}
          description={t.calendar.subtitle}
        />

        <AvailabilityCalendar listingId={listingId} />

        <PricingRulesForm listingId={listingId} />
      </div>
    </PageShell>
  )
}
