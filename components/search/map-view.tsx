'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
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
  const withCoords = listings.filter(
    (l) => l.latitude != null && l.longitude != null
  )

  if (withCoords.length === 0) {
    return (
      <div className="flex h-[480px] items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
        No map coordinates available
      </div>
    )
  }

  return (
    <div className={className}>
      <MapViewInner listings={withCoords} />
    </div>
  )
}
