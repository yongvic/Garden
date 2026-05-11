'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatBookingStatus, getBookingStatusColor, formatDateShort } from '@/lib/format'
import {
  Home, Calendar, TrendingUp, Clock, Plus,
  ArrowUpRight, ArrowDownRight, CheckCircle, Eye
} from 'lucide-react'

interface LandlordStats {
  listings: { total: number; active: number }
  bookings: { total: number; pending: number; confirmed: number; completed: number }
  revenue: { total: number; thisMonth: number; lastMonth: number }
  occupancyRate: number
}

interface RecentBooking {
  id: string; bookingNumber: string; status: string; totalPrice: number
  checkInDate: string; checkOutDate: string
  listing: { title: string; images: string[] }
  customer: { name: string | null; image: string | null }
}

export default function LandlordDashboardPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<LandlordStats | null>(null)
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authStatus === 'unauthenticated') { router.push('/auth/signin'); return }
    if (authStatus === 'authenticated') {
      const role = (session?.user as any)?.role
      if (role !== 'LANDLORD' && role !== 'ADMIN') { router.push('/dashboard'); return }
      Promise.all([
        fetch('/api/landlord/stats').then(r => r.json()),
        fetch('/api/landlord/bookings?limit=5').then(r => r.json()),
      ]).then(([statsData, bookingsData]) => {
        setStats(statsData)
        setRecentBookings(bookingsData.bookings ?? [])
      }).catch(console.error).finally(() => setIsLoading(false))
    }
  }, [authStatus, session, router])

  if (isLoading || !stats) {
    return (
      <><Navbar />
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
        </main></>
    )
  }

  const revenueGrowth = stats.revenue.lastMonth > 0
    ? Math.round(((stats.revenue.thisMonth - stats.revenue.lastMonth) / stats.revenue.lastMonth) * 100)
    : 0

  return (
    <><Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
          <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '9s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Mon Espace Propriétaire</h1>
              <p className="text-slate-400 mt-1">Gérez vos annonces et réservations</p>
            </div>
            <Link href="/landlord/listings/create">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-2">
                <Plus className="w-4 h-4" /> Nouvelle annonce
              </Button>
            </Link>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Revenus totaux', value: formatCurrency(stats.revenue.total), sub: `Ce mois : ${formatCurrency(stats.revenue.thisMonth)}`, icon: <TrendingUp className="w-5 h-5 text-emerald-400" />, badge: revenueGrowth !== 0 ? { text: `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth}%`, positive: revenueGrowth >= 0 } : null, border: 'hover:border-emerald-500/30' },
              { label: 'Annonces actives', value: stats.listings.active, sub: `${stats.listings.total} au total`, icon: <Home className="w-5 h-5 text-blue-400" />, badge: null, border: 'hover:border-blue-500/30' },
              { label: 'Réservations', value: stats.bookings.total, sub: `${stats.bookings.pending} en attente`, icon: <Calendar className="w-5 h-5 text-amber-400" />, badge: stats.bookings.pending > 0 ? { text: `${stats.bookings.pending} à traiter`, positive: false } : null, border: 'hover:border-amber-500/30' },
              { label: "Taux d'occupation", value: `${stats.occupancyRate}%`, sub: `${stats.bookings.completed} terminées`, icon: <CheckCircle className="w-5 h-5 text-cyan-400" />, badge: null, border: 'hover:border-cyan-500/30' },
            ].map((card, i) => (
              <div key={card.label} className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 transition-all ${card.border} animate-in fade-in slide-in-from-bottom duration-500`} style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-white/5 rounded-xl">{card.icon}</div>
                  {card.badge && (
                    <span className={`flex items-center gap-0.5 text-xs px-2 py-1 rounded-full ${card.badge.positive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
                      {card.badge.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {card.badge.text}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-white mb-1 truncate">{card.value}</p>
                <p className="text-slate-400 text-sm mb-1">{card.label}</p>
                <p className="text-slate-600 text-xs">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent bookings */}
            <div className="lg:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" /> Dernières réservations reçues
                </h2>
                <Link href="/landlord/bookings" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">Voir tout →</Link>
              </div>
              {recentBookings.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-slate-500">Aucune réservation pour le moment.</p>
                  <Link href="/landlord/listings/create" className="mt-4 inline-block text-emerald-400 text-sm hover:text-emerald-300">Créer votre première annonce →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <Link key={booking.id} href={`/bookings/${booking.id}`}>
                      <div className="flex items-center gap-4 p-4 bg-white/3 rounded-xl border border-white/5 hover:border-white/15 hover:bg-white/5 transition-all cursor-pointer group">
                        {booking.listing.images?.[0] ? (
                          <img src={booking.listing.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg shrink-0 flex items-center justify-center">
                            <Home className="w-5 h-5 text-emerald-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{booking.listing.title}</p>
                          <p className="text-slate-500 text-xs">{booking.customer.name ?? '—'} · {formatDateShort(booking.checkInDate)}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-white text-sm font-mono hidden sm:block">{formatCurrency(booking.totalPrice)}</span>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getBookingStatusColor(booking.status)}`}>{formatBookingStatus(booking.status)}</span>
                          <Eye className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions + alert */}
            <div className="space-y-4">
              <h2 className="text-white font-semibold px-1">Actions rapides</h2>
              {[
                { label: 'Mes annonces', desc: 'Gérer vos espaces', href: '/landlord/listings', icon: '🏠', color: 'hover:border-blue-500/30' },
                { label: 'Réservations reçues', desc: 'Confirmer ou refuser', href: '/landlord/bookings', icon: '📋', color: 'hover:border-amber-500/30' },
                { label: 'Créer une annonce', desc: 'Ajouter un nouvel espace', href: '/landlord/listings/create', icon: '✨', color: 'hover:border-emerald-500/30' },
                { label: 'Mon profil', desc: 'Paramètres du compte', href: '/profile', icon: '👤', color: 'hover:border-slate-500/30' },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-5 hover:-translate-y-0.5 transition-all ${action.color} cursor-pointer`}>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{action.icon}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{action.label}</p>
                        <p className="text-slate-500 text-xs">{action.desc}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {stats.bookings.pending > 0 && (
                <div className="backdrop-blur-xl bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">⚠️</span>
                    <div>
                      <p className="text-amber-300 text-sm font-medium">{stats.bookings.pending} réservation{stats.bookings.pending > 1 ? 's' : ''} en attente</p>
                      <p className="text-amber-400/70 text-xs mt-1">Répondez rapidement pour améliorer votre taux.</p>
                      <Link href="/landlord/bookings?status=PENDING">
                        <span className="text-amber-400 text-xs hover:text-amber-300 transition-colors mt-2 inline-block">Traiter maintenant →</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
