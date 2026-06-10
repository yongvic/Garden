'use client'

import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { ListingCard, type ListingCardData } from '@/components/listing-card'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { motion } from 'motion/react'
type City = {
  slug: string
  name: string
  country: string
  lat: number
  lng: number
}

type CitySearchClientProps = {
  city: City
  initialListings: ListingCardData[]
}

export function CitySearchClient({ city, initialListings }: CitySearchClientProps) {
  const { t } = useI18n()

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-sm text-muted-foreground">{city.country}</p>
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
            {t.search.cityTitle} {city.name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t.search.citySubtitle} {city.name}.
          </p>
        </motion.div>

        {initialListings.length > 0 ? (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">
                {initialListings.length}
              </span>{' '}
              {t.search.results}
            </p>
            <motion.div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.08 } },
              }}
            >
              {initialListings.map((listing) => (
                <motion.div
                  key={listing.id}
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                >
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </motion.div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-20 text-center">
            <p className="text-muted-foreground">{t.search.cityEmpty}</p>
            <Link href="/search" className="mt-6 inline-block">
              <Button variant="outline">{t.search.search}</Button>
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  )
}
