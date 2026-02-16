'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
  }, [status, session])

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
          <p className="text-white/70">Loading admin dashboard...</p>
        </div>
      </>
    )
  }

  const adminActions = [
    {
      title: 'Manage Users',
      description: 'View, suspend, or delete user accounts',
      icon: '👥',
      href: '/admin/users',
      color: 'from-blue-500',
    },
    {
      title: 'Damage Claims',
      description: 'Review and manage damage reports',
      icon: '⚠️',
      href: '/admin/claims',
      color: 'from-red-500',
    },
    {
      title: 'Listings',
      description: 'Monitor and manage all listings',
      icon: '🏠',
      href: '/admin/listings',
      color: 'from-green-500',
    },
    {
      title: 'Reports',
      description: 'View platform analytics and reports',
      icon: '📊',
      href: '/admin/reports',
      color: 'from-purple-500',
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-12">
          {/* Header */}
          <Card className="mb-8 backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-white/20 p-8">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-blue-100/70">Platform management and analytics</p>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, color: 'text-blue-400' },
              { label: 'Total Listings', value: stats.totalListings, color: 'text-green-400' },
              { label: 'Total Bookings', value: stats.totalBookings, color: 'text-cyan-400' },
            ].map((metric, idx) => (
              <Card
                key={idx}
                className="backdrop-blur-md bg-white/10 border border-white/20 p-6"
              >
                <p className="text-white/70 text-sm mb-2">{metric.label}</p>
                <p className={`text-4xl font-bold ${metric.color}`}>{metric.value}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Revenue', value: `$${stats.totalRevenue}`, color: 'text-purple-400' },
              { label: 'Active Users', value: stats.activeUsers, color: 'text-orange-400' },
              { label: 'Pending Claims', value: stats.pendingDamageClaims, color: 'text-red-400' },
            ].map((metric, idx) => (
              <Card
                key={idx}
                className="backdrop-blur-md bg-white/10 border border-white/20 p-6"
              >
                <p className="text-white/70 text-sm mb-2">{metric.label}</p>
                <p className={`text-4xl font-bold ${metric.color}`}>{metric.value}</p>
              </Card>
            ))}
          </div>

          {/* Admin Actions */}
          <div className="mb-8">
            <h2 className="text-white text-2xl font-bold mb-4">Admin Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminActions.map((action, idx) => (
                <Link key={idx} href={action.href}>
                  <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-6 hover:border-white/40 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold mb-1">{action.title}</h3>
                        <p className="text-blue-100/70 text-sm">{action.description}</p>
                      </div>
                      <span className="text-3xl">{action.icon}</span>
                    </div>
                    <Button
                      className={`bg-gradient-to-r ${action.color} to-transparent text-white text-sm w-full`}
                      onClick={() => {}}
                    >
                      Manage →
                    </Button>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-8">
            <h2 className="text-white text-xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-3">
              {[
                { action: 'New listing created', time: '2 hours ago' },
                { action: 'Damage claim submitted', time: '4 hours ago' },
                { action: 'User registered', time: '6 hours ago' },
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
