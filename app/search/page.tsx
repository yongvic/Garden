'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface Listing {
  id: string
  title: string
  description: string
  type: string
  location: string
  pricePerDay: number
  images: string[]
  averageRating: number
  reviewCount: number
  landlord: {
    name: string
    image: string
  }
}

interface PaginationData {
  total: number
  page: number
  limit: number
  pages: number
}

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [listings, setListings] = useState<Listing[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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

        setListings(data.listings)
        setPagination(data.pagination)
      } catch (err) {
        console.error('Failed to fetch listings:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchListings()
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
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
    <div className="relative max-w-7xl mx-auto px-4 py-12">
      {/* Filter Section */}
      <Card className="mb-8 backdrop-blur-md bg-white/10 border border-white/20 p-6 animate-in fade-in slide-in-from-top duration-500">
        <h2 className="text-white text-xl font-semibold mb-6">Filtrer les Annonces</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-white/70 text-sm mb-2">Localisation</label>
            <Input
              type="text"
              placeholder="Ville ou quartier"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-white/50"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous Types</option>
              <option value="ROOM">Chambre</option>
              <option value="EQUIPMENT">Équipement</option>
              <option value="SPACE">Espace</option>
            </select>
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">Prix Min (FCFA)</label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-white/50"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">Prix Max (FCFA)</label>
            <Input
              type="number"
              placeholder="100000"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-white/50"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              Rechercher
            </Button>
          </div>
        </div>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-white/70">Chargement des annonces...</p>
        </div>
      ) : listings.length > 0 ? (
        <>
          <div className="mb-6 animate-in fade-in duration-500">
            <p className="text-white/70">
              <span className="text-white font-semibold">{pagination?.total}</span> annonces trouvées
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {listings.map((listing, idx) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <Card
                  className="h-full backdrop-blur-md bg-white/10 border border-white/20 overflow-hidden hover:border-white/40 transition-all cursor-pointer group hover:-translate-y-1 animate-in fade-in slide-in-from-bottom duration-500"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {listing.images.length > 0 && (
                    <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 overflow-hidden">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold truncate">{listing.title}</h3>
                        <p className="text-blue-100/70 text-sm">{listing.location}</p>
                      </div>
                      <span className="bg-white/10 text-white/70 text-xs px-2 py-1 rounded">
                        {listing.type === 'ROOM' ? 'Chambre' : listing.type === 'EQUIPMENT' ? 'Équipement' : 'Espace'}
                      </span>
                    </div>

                    <p className="text-blue-100/60 text-sm line-clamp-2">{listing.description}</p>

                    <div className="flex items-center justify-between">
                      <p className="text-white font-semibold">{listing.pricePerDay} FCFA/jour</p>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-white/70 text-sm">
                          {listing.averageRating} ({listing.reviewCount})
                        </span>
                      </div>
                    </div>

                    {listing.landlord && (
                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        {listing.landlord.image && (
                          <img
                            src={listing.landlord.image}
                            alt={listing.landlord.name}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="text-white/70 text-sm">{listing.landlord.name}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => setFilters(prev => ({ ...prev, page }))}
                  variant={page === filters.page ? 'default' : 'outline'}
                  className={page === filters.page ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'border-white/20 text-white hover:bg-white/10'}
                >
                  {page}
                </Button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-white/70">Aucune annonce trouvée. Essayez d'ajuster vos filtres.</p>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse duration-[4000ms]"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse duration-[5000ms]"></div>
        </div>

        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-white/70">Chargement...</p>
          </div>
        }>
          <SearchContent />
        </Suspense>
      </main>
    </>
  )
}
