'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import {
  formatCurrency, formatDateShort, formatBookingStatus,
  getBookingStatusColor, daysBetween
} from '@/lib/format'
import {
  ArrowLeft, MapPin, Calendar, Users, CheckCircle,
  Clock, XCircle, AlertTriangle, Home, Tag
} from 'lucide-react'

interface BookingDetail {
  id: string
  bookingNumber: string
  status: string
  checkInDate: string
  checkOutDate: string
  numberOfGuests: number
  specialRequests: string | null
  totalPrice: number
  paymentStatus: string
  createdAt: string
  listing: {
    id: string; title: string; location: string; images: string[]
    type: string; pricePerDay: number; landlordId: string
    landlord: { id: string; name: string | null; image: string | null; email: string | null }
  }
  customer: { id: string; name: string | null; email: string | null; image: string | null }
}

const StatusTimeline = ({ status }: { status: string }) => {
  const steps = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED']
  const idx = steps.indexOf(status)
  const icons: Record<string, React.ReactNode> = {
    PENDING: <Clock className="w-4 h-4" />,
    CONFIRMED: <CheckCircle className="w-4 h-4" />,
    IN_PROGRESS: <Tag className="w-4 h-4" />,
    COMPLETED: <CheckCircle className="w-4 h-4" />,
  }
  const labels: Record<string, string> = {
    PENDING: 'En attente', CONFIRMED: 'Confirmée',
    IN_PROGRESS: 'En cours', COMPLETED: 'Terminée',
  }

  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 py-4 px-5 bg-red-500/10 border border-red-500/30 rounded-xl">
        <XCircle className="w-5 h-5 text-red-400 shrink-0" />
        <p className="text-red-300 font-medium">Cette réservation a été annulée.</p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const done = i <= idx
        const active = i === idx
        return (
          <div key={step} className="flex items-center flex-1">
            {i > 0 && (
              <div className={`flex-1 h-0.5 ${done ? 'bg-emerald-500' : 'bg-white/10'} transition-all`} />
            )}
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                done ? active
                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                  : 'bg-emerald-500/30 text-emerald-400'
                : 'bg-white/5 text-slate-600'
              }`}>
                {icons[step]}
              </div>
              <span className={`text-xs whitespace-nowrap ${done ? active ? 'text-emerald-300' : 'text-slate-400' : 'text-slate-600'}`}>
                {labels[step]}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelSuccess, setCancelSuccess] = useState(false)

  useEffect(() => {
    if (authStatus === 'unauthenticated') { router.push('/auth/signin'); return }
    if (authStatus === 'authenticated' && params.id) {
      fetch(`/api/bookings/${params.id}`)
        .then(async (r) => {
          if (!r.ok) throw new Error((await r.json()).error || 'Erreur')
          return r.json()
        })
        .then(setBooking)
        .catch((e) => setError(e.message))
        .finally(() => setIsLoading(false))
    }
  }, [authStatus, params.id, router])

  const handleCancel = async () => {
    if (!booking || isCancelling) return
    setIsCancelling(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setBooking((prev) => prev ? { ...prev, status: 'CANCELLED' } : prev)
      setCancelSuccess(true)
    } catch (e) { setError((e as Error).message) }
    finally { setIsCancelling(false) }
  }

  if (isLoading) return (
    <><Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
      </main></>
  )

  if (error || !booking) return (
    <><Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-red-300">{error || 'Réservation introuvable'}</p>
          <Link href="/bookings"><Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Retour</Button></Link>
        </div>
      </main></>
  )

  const nights = daysBetween(booking.checkInDate, booking.checkOutDate)
  const canCancel = ['PENDING', 'CONFIRMED'].includes(booking.status) && booking.customer.id === session?.user?.id

  return (
    <><Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 pt-24 pb-12">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 space-y-6 animate-in fade-in duration-500">

          <Link href="/bookings" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Retour aux réservations
          </Link>

          {/* Header card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-slate-500 text-sm mb-1">Réservation #{booking.bookingNumber}</p>
                <h1 className="text-2xl font-bold text-white">{booking.listing.title}</h1>
                <div className="flex items-center gap-2 mt-2 text-slate-400 text-sm">
                  <MapPin className="w-4 h-4" />{booking.listing.location}
                </div>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getBookingStatusColor(booking.status)}`}>
                {formatBookingStatus(booking.status)}
              </span>
            </div>
            <StatusTimeline status={booking.status} />
          </div>

          {cancelSuccess && (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-emerald-300">Réservation annulée avec succès.</p>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Dates */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> Dates de séjour
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Arrivée</p>
                    <p className="text-white font-semibold">{formatDateShort(booking.checkInDate)}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Départ</p>
                    <p className="text-white font-semibold">{formatDateShort(booking.checkOutDate)}</p>
                  </div>
                </div>
                <div className="flex gap-6 text-sm text-slate-400">
                  <span>Durée : <span className="text-white font-medium">{nights} nuit{nights > 1 ? 's' : ''}</span></span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {booking.numberOfGuests} invité{booking.numberOfGuests > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-white font-semibold mb-3">Demandes spéciales</h2>
                  <p className="text-slate-300 text-sm leading-relaxed">{booking.specialRequests}</p>
                </div>
              )}

              {booking.listing.images.length > 0 && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <img src={booking.listing.images[0]} alt={booking.listing.title} className="w-full h-48 object-cover" />
                  <div className="p-4 flex items-center gap-3">
                    <Home className="w-4 h-4 text-slate-400" />
                    <Link href={`/listings/${booking.listing.id}`} className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                      Voir l'annonce complète
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Price */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-5">Récapitulatif</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>{formatCurrency(booking.listing.pricePerDay)} × {nights}j</span>
                    <span className="text-white">{formatCurrency(booking.listing.pricePerDay * nights)}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">Total</span>
                    <span className="text-white text-lg">{formatCurrency(booking.totalPrice)}</span>
                  </div>
                  <p className="text-slate-500 text-xs pt-1">
                    Paiement : {booking.paymentStatus === 'pending' ? 'En attente' : 'Effectué'}
                  </p>
                </div>
              </div>

              {/* Host */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4">Hébergé par</h2>
                <div className="flex items-center gap-3">
                  {booking.listing.landlord.image ? (
                    <img src={booking.listing.landlord.image} alt={booking.listing.landlord.name ?? ''} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                      {(booking.listing.landlord.name ?? 'H')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{booking.listing.landlord.name ?? '—'}</p>
                    <p className="text-slate-500 text-xs">{booking.listing.landlord.email}</p>
                  </div>
                </div>
              </div>

              {/* Cancel action */}
              {canCancel && !cancelSuccess && (
                <div className="backdrop-blur-xl bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                  <p className="text-slate-400 text-sm mb-3">
                    Vous pouvez annuler cette réservation tant qu'elle est en attente ou confirmée.
                  </p>
                  <Button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    variant="outline"
                    className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-400/60"
                  >
                    {isCancelling ? 'Annulation...' : 'Annuler la réservation'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
