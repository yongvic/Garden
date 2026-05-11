'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatBookingStatus, getBookingStatusColor } from '@/lib/format'
import { Calendar, Home, Search, Star, TrendingUp, Clock } from 'lucide-react'

interface DashboardStats {
  user: {
    id: string; name: string | null; email: string | null; role: string; createdAt: string
  }
  bookingStats: {
    total: number; pending: number; confirmed: number; completed: number; cancelled: number
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role
      if (role === 'LANDLORD') {
        router.push('/landlord/dashboard')
        return
      }
      if (role === 'ADMIN') {
        router.push('/admin/dashboard')
        return
      }
      // Customer: load real stats
      fetch('/api/users/me')
        .then((r) => r.json())
        .then((data) => {
          setStats({
            user: {
              id: data.id,
              name: data.name,
              email: data.email,
              role: data.role,
              createdAt: data.createdAt,
            },
            bookingStats: data.bookingStats,
          })
        })
        .catch(console.error)
        .finally(() => setIsLoading(false))
    }
  }, [status, session, router])

  if (isLoading || !stats) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Chargement...</p>
          </div>
        </main>
      </>
    )
  }

  const statCards = [
    { label: 'Total', value: stats.bookingStats.total, icon: <Calendar className="w-5 h-5 text-blue-400" />, color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20' },
    { label: 'Confirmées', value: stats.bookingStats.confirmed, icon: <Star className="w-5 h-5 text-emerald-400" />, color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/20' },
    { label: 'En attente', value: stats.bookingStats.pending, icon: <Clock className="w-5 h-5 text-amber-400" />, color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/20' },
    { label: 'Terminées', value: stats.bookingStats.completed, icon: <TrendingUp className="w-5 h-5 text-cyan-400" />, color: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/20' },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 pt-24 pb-12">
        {/* Ambient */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 space-y-8">

          {/* Welcome banner */}
          <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/15 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-8 animate-in fade-in slide-in-from-top duration-500">
            <h1 className="text-3xl font-bold text-white mb-2">
              👋 Bon retour, {stats.user.name ?? 'Utilisateur'} !
            </h1>
            <p className="text-slate-400">
              Découvrez de nouveaux espaces à réserver ou consultez vos réservations.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((card, i) => (
              <div
                key={card.label}
                className={`backdrop-blur-xl bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl p-5 animate-in fade-in slide-in-from-bottom duration-500`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/5 rounded-xl">{card.icon}</div>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{card.value}</p>
                <p className="text-slate-400 text-sm">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Action cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/bookings">
              <div className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-7 hover:border-blue-500/30 hover:-translate-y-1 transition-all cursor-pointer h-full">
                <div className="flex items-start justify-between mb-5">
                  <div className="p-3 bg-blue-500/20 rounded-2xl">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-slate-500 text-xs">→</span>
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Mes Réservations</h3>
                <p className="text-slate-400 text-sm">Voir et gérer toutes vos réservations en cours et passées.</p>
                <div className="mt-5 pt-4 border-t border-white/5 flex gap-3">
                  {stats.bookingStats.pending > 0 && (
                    <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded-full">
                      {stats.bookingStats.pending} en attente
                    </span>
                  )}
                  {stats.bookingStats.confirmed > 0 && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-full">
                      {stats.bookingStats.confirmed} confirmée{stats.bookingStats.confirmed > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            <Link href="/search">
              <div className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-7 hover:border-cyan-500/30 hover:-translate-y-1 transition-all cursor-pointer h-full">
                <div className="flex items-start justify-between mb-5">
                  <div className="p-3 bg-cyan-500/20 rounded-2xl">
                    <Search className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className="text-slate-500 text-xs">→</span>
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Explorer les Annonces</h3>
                <p className="text-slate-400 text-sm">Trouvez de nouvelles chambres, espaces et équipements près de chez vous.</p>
                <div className="mt-5 pt-4 border-t border-white/5">
                  <span className="text-xs text-slate-500">Chambres · Espaces · Équipements</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Profile summary */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-7">
            <h2 className="text-white text-lg font-semibold mb-6">Informations du compte</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Nom</p>
                <p className="text-white font-medium">{stats.user.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Email</p>
                <p className="text-white font-medium">{stats.user.email ?? '—'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Type de compte</p>
                <p className="text-white font-medium capitalize">Client</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5">
              <Link href="/profile">
                <Button variant="outline" className="bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white">
                  Modifier le profil
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
