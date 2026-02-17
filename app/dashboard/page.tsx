'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DashboardData {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  bookingStats: {
    total: number
    confirmed: number
    pending: number
    completed: number
  }
}

// ... imports ...

// ... interfaces ...

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session?.user) {
      // For now, we'll show user info. In production, fetch real dashboard data
      setData({
        user: {
          id: session.user.id as string,
          name: session.user.name || '',
          email: session.user.email || '',
          role: (session.user as any).role || 'CUSTOMER',
        },
        bookingStats: {
          total: 0,
          confirmed: 0,
          pending: 0,
          completed: 0,
        },
      })
      setIsLoading(false)
    }
  }, [status, session, router])

  if (isLoading || !data) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
          <p className="text-white/70">Chargement du tableau de bord...</p>
        </div>
      </>
    )
  }

  const isDashboardLandlord = data.user.role === 'LANDLORD'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse duration-[4000ms]"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse duration-[5000ms]"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-12">
          {/* Welcome Section */}
          <Card className="mb-8 backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-white/20 p-8 animate-in fade-in slide-in-from-top duration-500">
            <h1 className="text-4xl font-bold text-white mb-2">
              Bon retour, {data.user.name} !
            </h1>
            <p className="text-blue-100/70">
              {isDashboardLandlord
                ? 'Gérez vos annonces et réservations'
                : 'Gérez vos réservations'}
            </p>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Réservations', value: data.bookingStats.total, color: 'from-blue-500' },
              { label: 'Confirmées', value: data.bookingStats.confirmed, color: 'from-green-500' },
              { label: 'En Attente', value: data.bookingStats.pending, color: 'from-yellow-500' },
              { label: 'Terminées', value: data.bookingStats.completed, color: 'from-cyan-500' },
            ].map((stat, idx) => (
              <Card
                key={idx}
                className="backdrop-blur-md bg-white/10 border border-white/20 p-6 animate-in fade-in slide-in-from-bottom duration-500"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <p className="text-white/70 text-sm mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} to-transparent bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </Card>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {!isDashboardLandlord && (
              <>
                <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-8 hover:border-white/40 transition-all cursor-pointer group hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white text-xl font-semibold mb-2">Mes Réservations</h3>
                      <p className="text-blue-100/70">Voir et gérer toutes vos réservations</p>
                    </div>
                    <span className="text-3xl">🎫</span>
                  </div>
                  <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                    Voir les Réservations
                  </Button>
                </Card>

                <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-8 hover:border-white/40 transition-all cursor-pointer group hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white text-xl font-semibold mb-2">Explorer les Annonces</h3>
                      <p className="text-blue-100/70">Trouver de nouveaux espaces à réserver</p>
                    </div>
                    <span className="text-3xl">🔍</span>
                  </div>
                  <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                    Rechercher Maintenant
                  </Button>
                </Card>
              </>
            )}

            {isDashboardLandlord && (
              <>
                <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-8 hover:border-white/40 transition-all cursor-pointer group hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white text-xl font-semibold mb-2">Mes Annonces</h3>
                      <p className="text-blue-100/70">Gérez vos propriétés</p>
                    </div>
                    <span className="text-3xl">🏠</span>
                  </div>
                  <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                    Voir les Annonces
                  </Button>
                </Card>

                <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-8 hover:border-white/40 transition-all cursor-pointer group hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white text-xl font-semibold mb-2">Nouvelles Réservations</h3>
                      <p className="text-blue-100/70">Gérer les demandes entrantes</p>
                    </div>
                    <span className="text-3xl">📋</span>
                  </div>
                  <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                    Voir les Demandes
                  </Button>
                </Card>
              </>
            )}
          </div>

          {/* Account Settings */}
          <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-8">
            <h2 className="text-white text-xl font-semibold mb-6">Informations du Compte</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-white/70 text-sm mb-2">Nom Complet</p>
                <p className="text-white font-medium">{data.user.name}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-2">Email</p>
                <p className="text-white font-medium">{data.user.email}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-2">Type de Compte</p>
                <p className="text-white font-medium capitalize">
                  {data.user.role === 'LANDLORD' ? 'Propriétaire' : 'Client'}
                </p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-2">Membre Depuis</p>
                <p className="text-white font-medium">Janvier 2024</p>
              </div>
            </div>

            <Button className="mt-6 bg-white/10 border border-white/20 text-white hover:bg-white/20">
              Modifier le Profil
            </Button>
          </Card>
        </div>
      </main>
    </>
  )
}
