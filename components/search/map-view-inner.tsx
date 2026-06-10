'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useI18n } from '@/lib/i18n/context'
import { formatCurrency } from '@/lib/format'
import type { MapListing } from './map-view'

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

type MapViewInnerProps = {
  listings: MapListing[]
}

export function MapViewInner({ listings }: MapViewInnerProps) {
  const { locale } = useI18n()

  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
    L.Marker.prototype.options.icon = defaultIcon
  }, [])

  const center: [number, number] = [
    listings.reduce((s, l) => s + (l.latitude ?? 0), 0) / listings.length,
    listings.reduce((s, l) => s + (l.longitude ?? 0), 0) / listings.length,
  ]

  return (
    <div className="h-[480px] overflow-hidden rounded-2xl border border-border [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:rounded-2xl [&_.leaflet-container]:z-0">
      <MapContainer center={center} zoom={11} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude!, listing.longitude!]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="min-w-[160px] space-y-1">
                <p className="font-semibold text-sm">{listing.title}</p>
                <p className="text-xs text-muted-foreground">{listing.location}</p>
                <p className="text-sm font-medium">
                  {formatCurrency(listing.pricePerDay, locale)}
                </p>
                <Link
                  href={`/listings/${listing.id}`}
                  className="text-xs text-primary hover:underline"
                >
                  View →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
