'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatListingType, getListingTypeColor } from '@/lib/format'
import { Plus, Trash2, Eye, ToggleLeft, ToggleRight, ArrowLeft, ArrowRight } from 'lucide-react'

interface Listing {
  id: string
  title: string
  type: string
  location: string
  pricePerDay: number
  isActive: boolean
  landlord: { name: string | null }
}

export default function AdminListingsPage() {
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  // Interaction states
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    if (authStatus === 'unauthenticated') { router.push('/auth/signin'); return }
    if (authStatus === 'authenticated') {
      const role = (session?.user as any)?.role
      if (role !== 'ADMIN') { router.push('/dashboard'); return }
    }
  }, [authStatus, session, router])

  useEffect(() => {
    if (authStatus !== 'authenticated') return
    const fetchListings = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/listings?page=${page}&limit=${limit}`)
        const data = await res.json()
        setListings(data.listings ?? [])
        setTotalPages(Math.ceil((data.pagination?.total ?? 0) / limit) || 1)
      } catch (err) {
        console.error('Failed to fetch listings:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchListings()
  }, [authStatus, page])

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette annonce définitivement ? Cette action est irréversible.')) return
    setDeletingId(id)
    setError('')
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setListings(prev => prev.filter(l => l.id !== id))
    } catch (e) { setError((e as Error).message) }
    finally { setDeletingId(null) }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setTogglingId(id)
    setError('')
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setListings(prev => prev.map(l => l.id === id ? { ...l, isActive: !currentStatus } : l))
    } catch (e) { setError((e as Error).message) }
    finally { setTogglingId(null) }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Tableau de bord Admin
          </Link>

          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Gestion des Annonces</h1>
              <p className="text-slate-400">Modérez et gérez toutes les annonces de la plateforme</p>
            </div>
            {/* Create feature for admin exists in landlord flow mostly, but keeping the button */}
          </div>

          {error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">{error}</div>}

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Titre</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Créateur</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Prix/Jour</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Statut</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex justify-center"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>
                      </td>
                    </tr>
                  ) : listings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        Aucune annonce trouvée.
                      </td>
                    </tr>
                  ) : (
                    listings.map((listing) => (
                      <tr key={listing.id} className={`hover:bg-white/5 transition-colors ${!listing.isActive ? 'opacity-70' : ''}`}>
                        <td className="px-6 py-4">
                          <p className="text-white font-medium truncate max-w-[200px]">{listing.title}</p>
                          <p className="text-slate-500 text-xs truncate max-w-[200px]">{listing.location}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getListingTypeColor(listing.type)}`}>
                            {formatListingType(listing.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300 text-sm">{listing.landlord.name ?? '—'}</td>
                        <td className="px-6 py-4 text-emerald-400 font-mono">{formatCurrency(listing.pricePerDay)}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full border ${listing.isActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-red-500/20 text-red-300 border-red-500/40'}`}>
                            {listing.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/listings/${listing.id}`} target="_blank">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20" title="Voir">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleActive(listing.id, listing.isActive)}
                              disabled={togglingId === listing.id}
                              className={`h-8 w-8 p-0 ${listing.isActive ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/20' : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20'}`}
                              title={listing.isActive ? 'Désactiver' : 'Activer'}
                            >
                              {listing.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(listing.id)}
                              disabled={deletingId === listing.id}
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                <p className="text-sm text-slate-400">Page {page} sur {totalPages}</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoading}
                    className="border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || isLoading}
                    className="border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                  >
                    Suivant <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
