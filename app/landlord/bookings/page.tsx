'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatBookingStatus, getBookingStatusColor, formatDateShort } from '@/lib/format'
import { ArrowLeft, CheckCircle, XCircle, Eye, Clock, Filter } from 'lucide-react'

interface Booking {
  id: string; bookingNumber: string; status: string; totalPrice: number
  checkInDate: string; checkOutDate: string; numberOfGuests: number
  listing: { id: string; title: string; images: string[]; location: string }
  customer: { id: string; name: string | null; email: string | null; image: string | null }
}

const STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export default function LandlordBookingsPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authStatus === 'unauthenticated') { router.push('/auth/signin'); return }
    if (authStatus === 'authenticated') {
      const role = (session?.user as any)?.role
      if (role !== 'LANDLORD' && role !== 'ADMIN') { router.push('/dashboard'); return }
    }
  }, [authStatus, session, router])

  useEffect(() => {
    if (authStatus !== 'authenticated') return
    setIsLoading(true)
    const url = statusFilter === 'ALL'
      ? '/api/landlord/bookings?limit=50'
      : `/api/landlord/bookings?status=${statusFilter}&limit=50`
    fetch(url)
      .then(r => r.json())
      .then(data => setBookings(data.bookings ?? []))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [authStatus, statusFilter])

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId)
    setError('')
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
    } catch (e) { setError((e as Error).message) }
    finally { setUpdatingId(null) }
  }

  return (
    <><Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          <Link href="/landlord/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Réservations reçues</h1>
              <p className="text-slate-400 mt-1">Gérez les demandes de vos clients</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-slate-500 shrink-0 mt-2" />
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  statusFilter === s
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {s === 'ALL' ? 'Toutes' : formatBookingStatus(s)}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">{error}</div>
          )}

          {/* Bookings list */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Aucune réservation trouvée.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                  <div className="flex items-start gap-4 flex-wrap">
                    {/* Listing image */}
                    {booking.listing.images?.[0] ? (
                      <img src={booking.listing.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl shrink-0" />
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-white font-semibold truncate">{booking.listing.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getBookingStatusColor(booking.status)}`}>
                          {formatBookingStatus(booking.status)}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">
                        Client : <span className="text-slate-300">{booking.customer.name ?? '—'}</span>
                        <span className="text-slate-600"> · {booking.customer.email}</span>
                      </p>
                      <p className="text-slate-400 text-sm">
                        📅 {formatDateShort(booking.checkInDate)} → {formatDateShort(booking.checkOutDate)}
                        <span className="text-slate-600 ml-2">· {booking.numberOfGuests} personne{booking.numberOfGuests > 1 ? 's' : ''}</span>
                      </p>
                      <p className="text-emerald-400 font-semibold">{formatCurrency(booking.totalPrice)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <Link href={`/bookings/${booking.id}`}>
                        <Button size="sm" variant="outline" className="gap-1 border-white/20 text-slate-300 hover:bg-white/10 hover:text-white">
                          <Eye className="w-4 h-4" /> Détail
                        </Button>
                      </Link>
                      {booking.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                            disabled={updatingId === booking.id}
                            className="gap-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {updatingId === booking.id ? '...' : 'Confirmer'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                            disabled={updatingId === booking.id}
                            variant="outline"
                            className="gap-1 border-red-500/40 text-red-400 hover:bg-red-500/10"
                          >
                            <XCircle className="w-4 h-4" />
                            {updatingId === booking.id ? '...' : 'Refuser'}
                          </Button>
                        </>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                          disabled={updatingId === booking.id}
                          className="gap-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {updatingId === booking.id ? '...' : 'Terminer'}
                        </Button>
                      )}
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
