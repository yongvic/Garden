'use client'

import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { Check } from 'lucide-react'

export default function PricingPage() {
  const { t } = useI18n()

  const guestFeatures = [
    '3% service fee on confirmed bookings',
    'Secure card payment (XOF)',
    '24h dispute mediation',
    'Verified reviews only',
  ]

  const hostFeatures = [
    'Free listing publication',
    '8% commission on confirmed bookings only',
    'Dashboard with analytics',
    'Direct guest messaging',
  ]

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-4xl tracking-tight">{t.pricing.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{t.pricing.subtitle}</p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-2">
          <PricingCard
            title={t.pricing.guestTitle}
            description={t.pricing.guestDesc}
            price="3%"
            priceLabel="service fee"
            features={guestFeatures}
            cta={t.pricing.cta}
            href="/auth/register"
            highlighted={false}
          />
          <PricingCard
            title={t.pricing.hostTitle}
            description={t.pricing.hostDesc}
            price="8%"
            priceLabel="commission"
            features={hostFeatures}
            cta={t.nav.hostCta}
            href="/auth/register?role=LANDLORD"
            highlighted
          />
        </div>
      </div>
    </PageShell>
  )
}

function PricingCard({
  title, description, price, priceLabel, features, cta, href, highlighted,
}: {
  title: string; description: string; price: string; priceLabel: string
  features: string[]; cta: string; href: string; highlighted: boolean
}) {
  return (
    <div
      className={`flex flex-col rounded-3xl border p-8 ${
        highlighted ? 'border-primary bg-primary/5 shadow-lg' : 'border-border bg-card'
      }`}
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
      <div className="mt-8">
        <span className="text-5xl font-semibold tabular-nums tracking-tight">{price}</span>
        <span className="ml-2 text-sm text-muted-foreground">{priceLabel}</span>
      </div>
      <ul className="mt-8 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>
      <Link href={href} className="mt-8">
        <Button className="w-full" variant={highlighted ? 'default' : 'outline'}>
          {cta}
        </Button>
      </Link>
    </div>
  )
}
