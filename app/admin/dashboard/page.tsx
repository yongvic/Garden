'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, AlertTriangle, Home, BarChart } from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalListings: number
  totalBookings: number
  totalRevenue: number
  pendingDamageClaims: number
  activeUsers: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalListings: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingDamageClaims: 0,
    activeUsers: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && (session?.user as any)?.role === 'ADMIN') {
      setStats({
        totalUsers: 0,
        totalListings: 0,
        totalBookings: 0,
        totalRevenue: 0,
        pendingDamageClaims: 0,
        activeUsers: 0,
      })
      setIsLoading(false)
    } else if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
          <p className="text-white/70">Chargement du tableau de bord admin...</p>
        </div>
      </>
    )
  }

  const adminActions = [
    {
      title: 'Gérer les Utilisateurs',
      description: 'Voir, suspendre ou supprimer des comptes',
      icon: <Users className="w-8 h-8 text-blue-400" />,
      href: '/admin/users',
      color: 'from-blue-500',
    },
    {
      title: 'Réclamations Dommages',
      description: 'Examiner et gérer les rapports de dommages',
      icon: <AlertTriangle className="w-8 h-8 text-red-400" />,
      href: '/admin/claims',
      color: 'from-red-500',
    },
    {
      title: 'Annonces',
      description: 'Surveiller et gérer toutes les annonces',
      icon: <Home className="w-8 h-8 text-green-400" />,
      href: '/admin/listings',
      color: 'from-green-500',
    },
    {
      title: 'Rapports',
      description: 'Voir les analyses et rapports de la plateforme',
      icon: <BarChart className="w-8 h-8 text-purple-400" />,
      href: '/admin/reports',
      color: 'from-purple-500',
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse duration-[4000ms]"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse duration-[5000ms]"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-12">
          {/* Header */}
          <Card className="mb-8 backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-white/20 p-8 animate-in fade-in slide-in-from-top duration-500">
            <h1 className="text-4xl font-bold text-white mb-2">Tableau de Bord Admin</h1>
            <p className="text-blue-100/70">Gestion de la plateforme et analyses</p>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Utilisateurs Total', value: stats.totalUsers, color: 'text-blue-400' },
              { label: 'Annonces Total', value: stats.totalListings, color: 'text-green-400' },
              { label: 'Réservations Total', value: stats.totalBookings, color: 'text-cyan-400' },
            ].map((metric, idx) => (
              <Card
                key={idx}
                className="backdrop-blur-md bg-white/10 border border-white/20 p-6 animate-in fade-in slide-in-from-bottom duration-500"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <p className="text-white/70 text-sm mb-2">{metric.label}</p>
                <p className={`text-4xl font-bold ${metric.color}`}>{metric.value}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Revenu Total', value: `${stats.totalRevenue.toLocaleString()} FCFA`, color: 'text-purple-400' },
              { label: 'Utilisateurs Actifs', value: stats.activeUsers, color: 'text-orange-400' },
              { label: 'Réclamations en Attente', value: stats.pendingDamageClaims, color: 'text-red-400' },
            ].map((metric, idx) => (
              <Card
                key={idx}
                className="backdrop-blur-md bg-white/10 border border-white/20 p-6 animate-in fade-in slide-in-from-bottom duration-500"
                style={{ animationDelay: `${(idx + 3) * 100}ms` }}
              >
                <p className="text-white/70 text-sm mb-2">{metric.label}</p>
                <p className={`text-4xl font-bold ${metric.color}`}>{metric.value}</p>
              </Card>
            ))}
          </div>

          {/* Admin Actions */}
          <div className="mb-8">
            <h2 className="text-white text-2xl font-bold mb-4">Actions Admin</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminActions.map((action, idx) => (
                <Link key={idx} href={action.href}>
                  <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-6 hover:border-white/40 transition-all cursor-pointer group hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold mb-1">{action.title}</h3>
                        <p className="text-blue-100/70 text-sm">{action.description}</p>
                      </div>
                      {action.icon}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className={`bg-gradient-to-r ${action.color} to-transparent text-white text-sm flex-1`}
                        onClick={() => { }}
                      >
                        Gérer →
                      </Button>
                      {action.href === '/admin/listings' && (
                        <Link href="/admin/listings/create" onClick={(e) => e.stopPropagation()}>
                          <Button
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm"
                          >
                            + Ajouter
                          </Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-8">
            <h2 className="text-white text-xl font-bold mb-6">Activité Récente</h2>
            <div className="space-y-3">
              {[
                { action: 'Nouvelle annonce créée', time: 'Il y a 2 heures' },
                { action: 'Réclamation dommage soumise', time: 'Il y a 4 heures' },
                { action: 'Utilisateur inscrit', time: 'Il y a 6 heures' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between pb-3 border-b border-white/10 last:border-0">
                  <p className="text-white/70">{activity.action}</p>
                  <span className="text-white/50 text-sm">{activity.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </>
  )
}
