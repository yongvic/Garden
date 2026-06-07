'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { ListingCard, type ListingCardData } from '@/components/listing-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n/context'
import { Heart } from 'lucide-react'

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const { t } = useI18n()
  const [listings, setListings] = useState<ListingCardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== 'authenticated') {
      setLoading(false)
      return
    }
    fetch('/api/favorites')
      .then((r) => r.json())
      .then((data) => {
        setListings(data.favorites ?? [])
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false))
  }, [status])

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl tracking-tight">{t.favorites.title}</h1>

        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center">
            <Heart className="mb-4 size-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">{t.favorites.empty}</p>
            <Link href="/search" className="mt-6">
              <Button variant="outline">{t.favorites.emptyCta}</Button>
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  )
}
