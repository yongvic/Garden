'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageShell } from '@/components/page-shell'
import { ListingCard, type ListingCardData } from '@/components/listing-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n/context'
import { motion, AnimatePresence } from 'motion/react'

interface PaginationData {
  total: number
  page: number
  limit: number
  pages: number
}

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18n()

  const [listings, setListings] = useState<ListingCardData[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
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
        params.append('page', filters.page.toString())

        const res = await fetch(`/api/listings?${params}`)
        const data = await res.json()
        setListings(data.listings ?? [])
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

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (filters.location) params.append('location', filters.location)
    if (filters.type) params.append('type', filters.type)
    if (filters.minPrice) params.append('minPrice', filters.minPrice)
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
    router.push(`/search?${params}`)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{t.search.title}</h1>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <p className="mb-5 text-sm font-medium">{t.search.filters}</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
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
          <div className="flex items-end">
            <Button onClick={handleSearch} className="w-full">{t.search.search}</Button>
          </div>
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
            <span className="font-semibold text-foreground tabular-nums">{pagination?.total}</span>{' '}
            {t.search.results}
          </p>
          <motion.div 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
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
                  <ListingCard listing={listing} />
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
