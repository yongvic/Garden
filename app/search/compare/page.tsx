'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n/context'
import { formatCurrency } from '@/lib/format'
import { Star, ArrowLeft, X } from 'lucide-react'
import { motion } from 'motion/react'

type CompareListing = {
  id: string
  title: string
  type: string
  location: string
  pricePerDay: number
  images: string[]
  amenities: string[]
  maxOccupants?: number | null
  averageRating?: number
  reviewCount?: number
}

const ROWS = [
  { key: 'price', labelKey: 'price' as const },
  { key: 'location', labelKey: 'location' as const },
  { key: 'type', labelKey: 'type' as const },
  { key: 'rating', labelKey: 'rating' as const },
  { key: 'capacity', labelKey: 'capacity' as const },
  { key: 'amenities', labelKey: 'amenities' as const },
]

function CompareContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t, locale } = useI18n()
  const [listings, setListings] = useState<CompareListing[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const ids = (searchParams.get('ids') ?? '').split(',').filter(Boolean).slice(0, 3)

  useEffect(() => {
    if (ids.length < 2) {
      setIsLoading(false)
      return
    }
    Promise.all(
      ids.map((id) =>
        fetch(`/api/listings/${id}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    )
      .then((results) => setListings(results.filter(Boolean)))
      .finally(() => setIsLoading(false))
  }, [searchParams])

  const removeListing = (id: string) => {
    const next = ids.filter((i) => i !== id)
    if (next.length < 2) {
      router.push('/search')
    } else {
      router.push(`/search/compare?ids=${next.join(',')}`)
    }
  }

  const getCellValue = (listing: CompareListing, rowKey: string) => {
    switch (rowKey) {
      case 'price':
        return formatCurrency(listing.pricePerDay, locale)
      case 'location':
        return listing.location
      case 'type':
        return t.listing.types[listing.type as keyof typeof t.listing.types] ?? listing.type
      case 'rating':
        return listing.reviewCount
          ? `${listing.averageRating} (${listing.reviewCount})`
          : t.compare.notAvailable
      case 'capacity':
        return listing.maxOccupants?.toString() ?? t.compare.notAvailable
      case 'amenities':
        return listing.amenities?.length
          ? listing.amenities.slice(0, 5).join(', ')
          : t.compare.notAvailable
      default:
        return t.compare.notAvailable
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/search">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 size-4" />
            {t.compare.back}
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-3xl tracking-tight">{t.compare.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.compare.subtitle}</p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : listings.length < 2 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="text-muted-foreground">{t.compare.empty}</p>
          <Link href="/search" className="mt-4 inline-block">
            <Button variant="outline">{t.compare.back}</Button>
          </Link>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-x-auto rounded-2xl border border-border"
        >
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 text-left font-medium text-muted-foreground w-36" />
                {listings.map((listing) => (
                  <th key={listing.id} className="p-4 text-left align-top">
                    <div className="relative space-y-3">
                      <button
                        type="button"
                        onClick={() => removeListing(listing.id)}
                        className="absolute -right-1 -top-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-4" />
                      </button>
                      {listing.images[0] && (
                        <img
                          src={listing.images[0]}
                          alt=""
                          className="aspect-[4/3] w-full max-w-[200px] rounded-xl object-cover"
                        />
                      )}
                      <Link
                        href={`/listings/${listing.id}`}
                        className="block font-semibold hover:text-primary transition-colors line-clamp-2"
                      >
                        {listing.title}
                      </Link>
                      {(listing.reviewCount ?? 0) > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="size-3 fill-accent text-accent" />
                          {listing.averageRating}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium text-muted-foreground">
                    {t.compare[row.labelKey]}
                  </td>
                  {listings.map((listing) => (
                    <td key={listing.id} className="p-4">
                      {row.key === 'type' ? (
                        <Badge variant="secondary">{getCellValue(listing, row.key)}</Badge>
                      ) : (
                        getCellValue(listing, row.key)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  )
}

export default function ComparePage() {
  const { t } = useI18n()
  return (
    <PageShell>
      <Suspense fallback={<div className="p-10 text-muted-foreground">{t.common.loading}</div>}>
        <CompareContent />
      </Suspense>
    </PageShell>
  )
}
