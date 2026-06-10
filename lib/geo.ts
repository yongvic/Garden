import { SEO_CITIES, citySlugFromLocation } from '@/lib/slug'

/** Villes secondaires (surtout Togo) pour géocodage et carte */
const EXTRA_CITIES = [
  { slug: 'kpalime', name: 'Kpalimé', country: 'Togo', lat: 6.9, lng: 0.6333 },
  { slug: 'kara', name: 'Kara', country: 'Togo', lat: 9.5511, lng: 1.1861 },
  { slug: 'sokode', name: 'Sokodé', country: 'Togo', lat: 8.9833, lng: 1.1333 },
  { slug: 'atakpame', name: 'Atakpamé', country: 'Togo', lat: 7.5333, lng: 1.1333 },
  { slug: 'tsevie', name: 'Tsévié', country: 'Togo', lat: 6.4261, lng: 1.2133 },
] as const

const ALL_CITIES = [...SEO_CITIES, ...EXTRA_CITIES]

export type GeoResult = {
  latitude: number
  longitude: number
  citySlug: string
  neighborhood: string | null
}

/** Stable pseudo-random offset from a string (±~0.02° ≈ 2 km) */
function jitterFromString(seed: string, axis: number): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i) * axis) % 10000
  }
  return ((hash % 200) - 100) / 5000
}

export function resolveGeoFromLocation(location: string): GeoResult | null {
  const lower = location.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  const city = ALL_CITIES.find((c) => {
    const name = c.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return lower.includes(name) || lower.includes(c.slug)
  })

  if (!city) return null

  const parts = location.split(',').map((s) => s.trim())
  const neighborhood = parts.length > 1 ? parts.slice(1).join(', ') : null

  return {
    latitude: city.lat + jitterFromString(location, 1),
    longitude: city.lng + jitterFromString(location, 2),
    citySlug: city.slug,
    neighborhood,
  }
}

export function enrichListingGeo<T extends { location: string; latitude?: number | null; longitude?: number | null }>(
  listing: T
): T & { latitude: number | null; longitude: number | null } {
  if (listing.latitude != null && listing.longitude != null) {
    return { ...listing, latitude: listing.latitude, longitude: listing.longitude }
  }
  const geo = resolveGeoFromLocation(listing.location)
  if (!geo) {
    return { ...listing, latitude: listing.latitude ?? null, longitude: listing.longitude ?? null }
  }
  return { ...listing, latitude: geo.latitude, longitude: geo.longitude }
}

export { citySlugFromLocation }
