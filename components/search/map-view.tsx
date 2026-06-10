'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n/context'
import { enrichListingGeo } from '@/lib/geo'
import type { ListingCardData } from '@/components/listing-card'

export type MapListing = ListingCardData & {
  latitude?: number | null
  longitude?: number | null
}

type MapViewProps = {
  listings: MapListing[]
  className?: string
}

function MapSkeleton() {
  return <Skeleton className="h-[480px] w-full rounded-2xl" />
}

const MapViewInner = dynamic(
  () => import('./map-view-inner').then((m) => m.MapViewInner),
  { ssr: false, loading: () => <MapSkeleton /> }
)

export function MapView({ listings, className }: MapViewProps) {
  const { t } = useI18n()

  const withCoords = listings
    .map((l) => enrichListingGeo(l as MapListing))
    .filter((l) => l.latitude != null && l.longitude != null)

  if (withCoords.length === 0) {
    return (
      <div className="flex h-[480px] items-center justify-center rounded-2xl border border-dashed border-border px-6 text-center text-sm text-muted-foreground">
        {t.search.noMapCoordinates}
      </div>
    )
  }

  return (
    <div className={className}>
      <MapViewInner listings={withCoords} />
    </div>
  )
}
