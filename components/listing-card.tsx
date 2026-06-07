'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/lib/i18n/context'
import { formatCurrency } from '@/lib/format'

export type ListingCardData = {
  id: string
  title: string
  description?: string
  type: string
  location: string
  pricePerDay: number
  images: string[]
  averageRating?: number
  reviewCount?: number
  landlord?: { name: string | null; image: string | null }
}

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const { locale, t } = useI18n()
  const typeLabel = t.listing.types[listing.type as keyof typeof t.listing.types] ?? listing.type
  const priceSuffix = listing.type === 'ROOM' ? t.search.perNight : t.search.perDay

  return (
    <Link href={`/listings/${listing.id}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_40px_-12px_var(--garden-glow)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {listing.images[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              Garden
            </div>
          )}
          <Badge
            variant="secondary"
            className="absolute left-3 top-3 bg-card/90 backdrop-blur-sm"
          >
            {typeLabel}
          </Badge>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{listing.location}</p>
          </div>

          {listing.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {listing.description}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between pt-2">
            <p className="font-semibold tabular-nums text-foreground">
              {formatCurrency(listing.pricePerDay, locale)}
              <span className="font-normal text-muted-foreground text-sm">{priceSuffix}</span>
            </p>
            {(listing.reviewCount ?? 0) > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="size-3.5 fill-accent text-accent" />
                <span className="tabular-nums">{listing.averageRating}</span>
                <span className="text-xs">({listing.reviewCount})</span>
              </div>
            )}
          </div>

          {listing.landlord?.name && (
            <div className="flex items-center gap-2 border-t border-border pt-3">
              {listing.landlord.image && (
                <img
                  src={listing.landlord.image}
                  alt=""
                  className="size-6 rounded-full object-cover"
                />
              )}
              <span className="text-xs text-muted-foreground truncate">{listing.landlord.name}</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
