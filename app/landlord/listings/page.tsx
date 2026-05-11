'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatListingType, getListingTypeColor } from '@/lib/format'
import { Plus, ArrowLeft, Eye, ToggleLeft, ToggleRight, Trash2, Edit } from 'lucide-react'

interface Listing {
  id: string; title: string; type: string; location: string
  pricePerDay: number; isActive: boolean; images: string[]
  _count?: { bookings: number; reviews: number }
}

export default function LandlordListingsPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authStatus === 'unauthenticated') { router.push('/auth/signin'); return }
    if (authStatus === 'authenticated') {
      const role = (session?.user as any)?.role
      if (role !== 'LANDLORD' && role !== 'ADMIN') { router.push('/dashboard'); return }
      fetch('/api/listings?limit=100&mine=true')
        .then(r => r.json())
        .then(data => setListings(data.listings ?? []))
        .catch(console.error)
        .finally(() => setIsLoading(false))
    }
  }, [authStatus, session, router])

  const toggleActive = async (id: string, current: boolean) => {
    setTogglingId(id)
    setError('')
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setListings(prev => prev.map(l => l.id === id ? { ...l, isActive: !current } : l))
    } catch (e) { setError((e as Error).message) }
    finally { setTogglingId(null) }
  }

  const deleteListing = async (id: string) => {
    if (!confirm('Supprimer cette annonce définitivement ?')) return
    setDeletingId(id)
    setError('')
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setListings(prev => prev.filter(l => l.id !== id))
    } catch (e) { setError((e as Error).message) }
    finally { setDeletingId(null) }
  }

  return (
    <><Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          <Link href="/landlord/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Tableau de bord
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Mes Annonces</h1>
              <p className="text-slate-400 mt-1">{listings.length} annonce{listings.length !== 1 ? 's' : ''}</p>
            </div>
            <Link href="/landlord/listings/create">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-2">
                <Plus className="w-4 h-4" /> Nouvelle annonce
              </Button>
            </Link>
          </div>

          {error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">{error}</div>}

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
            </div>
          ) : listings.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
              <p className="text-slate-400 mb-6">Vous n'avez pas encore d'annonce.</p>
              <Link href="/landlord/listings/create">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white gap-2">
                  <Plus className="w-4 h-4" /> Créer ma première annonce
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {listings.map(listing => (
                <div key={listing.id} className={`backdrop-blur-xl bg-white/5 border rounded-2xl overflow-hidden transition-all hover:border-white/20 ${listing.isActive ? 'border-white/10' : 'border-red-500/20 opacity-70'}`}>
                  {/* Image */}
                  <div className="relative h-40 bg-gradient-to-br from-slate-700 to-slate-800">
                    {listing.images?.[0] && (
                      <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getListingTypeColor(listing.type)}`}>
                        {formatListingType(listing.type)}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs px-2 py-1 rounded-full border ${listing.isActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-red-500/20 text-red-300 border-red-500/40'}`}>
                        {listing.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-white font-semibold truncate">{listing.title}</h3>
                      <p className="text-slate-400 text-sm">{listing.location}</p>
                    </div>
                    <p className="text-emerald-400 font-bold">{formatCurrency(listing.pricePerDay)}<span className="text-slate-500 font-normal text-xs">/jour</span></p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <Link href={`/listings/${listing.id}`} target="_blank" className="flex-1">
                        <Button size="sm" variant="outline" className="w-full gap-1 border-white/15 text-slate-300 hover:bg-white/10 hover:text-white text-xs">
                          <Eye className="w-3.5 h-3.5" /> Voir
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActive(listing.id, listing.isActive)}
                        disabled={togglingId === listing.id}
                        className={`gap-1 text-xs border-white/15 hover:bg-white/10 hover:text-white ${listing.isActive ? 'text-amber-400 hover:border-amber-500/40' : 'text-emerald-400 hover:border-emerald-500/40'}`}
                      >
                        {listing.isActive
                          ? <><ToggleRight className="w-3.5 h-3.5" /> Désactiver</>
                          : <><ToggleLeft className="w-3.5 h-3.5" /> Activer</>}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteListing(listing.id)}
                        disabled={deletingId === listing.id}
                        className="gap-1 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
