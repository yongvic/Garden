'use client'

import { useEffect, useState, Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageShell } from '@/components/page-shell'
import { ListingCard, type ListingCardData } from '@/components/listing-card'
import { MapView } from '@/components/search/map-view'
import { CompareBar } from '@/components/search/compare-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/lib/i18n/context'
import { motion, AnimatePresence } from 'motion/react'
import { Map, List, GitCompareArrows } from 'lucide-react'
import { toast } from 'sonner'

interface PaginationData {
  total: number
  page: number
  limit: number
  pages: number
}

const AMENITY_OPTIONS = [
  'wifi', 'parking', 'ac', 'projector', 'catering', 'security', 'elevator', 'kitchen',
]

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18n()

  const [listings, setListings] = useState<ListingCardData[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showMap, setShowMap] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [compareSelected, setCompareSelected] = useState<ListingCardData[]>([])

  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    checkInDate: searchParams.get('checkInDate') || '',
    checkOutDate: searchParams.get('checkOutDate') || '',
    guests: searchParams.get('guests') || '',
    minRating: searchParams.get('minRating') || '',
    amenities: searchParams.get('amenities')?.split(',').filter(Boolean) ?? [] as string[],
    page: parseInt(searchParams.get('page') || '1'),
  })

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (filters.location) params.append('location', filters.location)
        if (filters.type) params.append('type', filters.type)
        if (filters.minPrice) params.append('minPrice', filters.minPrice)
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
        if (filters.checkInDate) params.append('checkInDate', filters.checkInDate)
        if (filters.checkOutDate) params.append('checkOutDate', filters.checkOutDate)
        if (filters.guests) params.append('guests', filters.guests)
        if (filters.minRating) params.append('minRating', filters.minRating)
        if (filters.amenities.length) params.append('amenities', filters.amenities.join(','))
        params.append('page', filters.page.toString())

        const res = await fetch(`/api/listings?${params}`)
        const data = await res.json()
        let results: ListingCardData[] = data.listings ?? []

        if (filters.minRating) {
          const min = parseFloat(filters.minRating)
          results = results.filter((l) => (l.averageRating ?? 0) >= min)
        }
        if (filters.amenities.length) {
          results = results.filter((l) => {
            const listingAmenities = (l as ListingCardData & { amenities?: string[] }).amenities ?? []
            return filters.amenities.every((a) =>
              listingAmenities.some((la) => la.toLowerCase().includes(a.toLowerCase()))
            )
          })
        }

        setListings(results)
        setPagination(data.pagination ?? null)
      } catch {
        setListings([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchListings()
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const toggleAmenity = (amenity: string) => {
    setFilters((prev) => {
      const next = prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity]
      return { ...prev, amenities: next, page: 1 }
    })
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (filters.location) params.append('location', filters.location)
    if (filters.type) params.append('type', filters.type)
    if (filters.minPrice) params.append('minPrice', filters.minPrice)
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
    if (filters.checkInDate) params.append('checkInDate', filters.checkInDate)
    if (filters.checkOutDate) params.append('checkOutDate', filters.checkOutDate)
    if (filters.guests) params.append('guests', filters.guests)
    if (filters.minRating) params.append('minRating', filters.minRating)
    if (filters.amenities.length) params.append('amenities', filters.amenities.join(','))
    router.push(`/search?${params}`)
  }

  const handleCompareToggle = (id: string) => {
    setCompareSelected((prev) => {
      const exists = prev.find((l) => l.id === id)
      if (exists) return prev.filter((l) => l.id !== id)
      const listing = listings.find((l) => l.id === id)
      if (!listing) return prev
      if (prev.length >= 3) {
        toast.error(t.search.compareMax)
        return prev
      }
      return [...prev, listing]
    })
  }

  const compareIds = useMemo(() => new Set(compareSelected.map((l) => l.id)), [compareSelected])

  return (
    <div className={compareSelected.length > 0 ? 'pb-24' : ''}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-wrap items-center justify-between gap-4"
        >
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{t.search.title}</h1>
          <div className="flex items-center gap-2">
            <Button
              variant={compareMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCompareMode((v) => !v)}
            >
              <GitCompareArrows className="mr-1 size-4" />
              {t.search.compareMode}
            </Button>
            <Button
              variant={showMap ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowMap((v) => !v)}
            >
              {showMap ? <List className="mr-1 size-4" /> : <Map className="mr-1 size-4" />}
              {showMap ? t.search.showList : t.search.showMap}
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <p className="mb-5 text-sm font-medium">{t.search.filters}</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="location">{t.search.location}</Label>
              <Input
                id="location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="Lomé, Accra…"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.search.type}</Label>
              <Select value={filters.type || 'all'} onValueChange={(v) => handleFilterChange('type', v === 'all' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder={t.search.allTypes} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.search.allTypes}</SelectItem>
                  <SelectItem value="SPACE">{t.listing.types.SPACE}</SelectItem>
                  <SelectItem value="ROOM">{t.listing.types.ROOM}</SelectItem>
                  <SelectItem value="EQUIPMENT">{t.listing.types.EQUIPMENT}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkInDate">{t.search.checkInDate}</Label>
              <Input
                id="checkInDate"
                type="date"
                value={filters.checkInDate}
                onChange={(e) => handleFilterChange('checkInDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOutDate">{t.search.checkOutDate}</Label>
              <Input
                id="checkOutDate"
                type="date"
                value={filters.checkOutDate}
                onChange={(e) => handleFilterChange('checkOutDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guests">{t.search.guests}</Label>
              <Input
                id="guests"
                type="number"
                min="1"
                value={filters.guests}
                onChange={(e) => handleFilterChange('guests', e.target.value)}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minPrice">{t.search.minPrice}</Label>
              <Input
                id="minPrice"
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPrice">{t.search.maxPrice}</Label>
              <Input
                id="maxPrice"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="500000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minRating">{t.search.minRating}</Label>
              <Select
                value={filters.minRating || 'all'}
                onValueChange={(v) => handleFilterChange('minRating', v === 'all' ? '' : v)}
              >
                <SelectTrigger id="minRating"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">—</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="4.5">4.5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label>{t.search.amenities}</Label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((amenity) => (
                <Badge
                  key={amenity}
                  variant={filters.amenities.includes(amenity) ? 'default' : 'outline'}
                  className="cursor-pointer capitalize"
                  onClick={() => toggleAmenity(amenity)}
                >
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <Button onClick={handleSearch} className="w-full sm:w-auto">{t.search.search}</Button>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">{pagination?.total ?? listings.length}</span>{' '}
              {t.search.results}
            </p>

            {showMap ? (
              <MapView listings={listings} className="mb-6" />
            ) : null}

            <motion.div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 },
                },
              }}
            >
              <AnimatePresence mode="popLayout">
                {listings.map((listing) => (
                  <motion.div
                    key={listing.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ListingCard
                      listing={listing}
                      compareMode={compareMode}
                      isCompareSelected={compareIds.has(listing.id)}
                      onCompareToggle={handleCompareToggle}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {pagination && pagination.pages > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === filters.page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters((prev) => ({ ...prev, page }))}
                  >
                    {page}
                  </Button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-20 text-center">
            <p className="text-muted-foreground">{t.search.empty}</p>
          </div>
        )}
      </div>

      <CompareBar
        selected={compareSelected}
        onRemove={(id) => setCompareSelected((prev) => prev.filter((l) => l.id !== id))}
        onClear={() => setCompareSelected([])}
      />
    </div>
  )
}

export default function SearchPage() {
  const { t } = useI18n()
  return (
    <PageShell>
      <Suspense fallback={<div className="p-10 text-muted-foreground">{t.common.loading}</div>}>
        <SearchContent />
      </Suspense>
    </PageShell>
  )
}
