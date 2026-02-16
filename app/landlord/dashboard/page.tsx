'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface LandlordStats {
  totalListings: number
  activeListings: number
  totalBookings: number
  pendingBookings: number
  totalEarnings: number
  averageRating: number
}

export default function LandlordDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<LandlordStats>({
    totalListings: 0,
    activeListings: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalEarnings: 0,
    averageRating: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && (session?.user as any)?.role === 'LANDLORD') {
      // Initialize with sample data
      setStats({
        totalListings: 0,
        activeListings: 0,
        totalBookings: 0,
        pendingBookings: 0,
        totalEarnings: 0,
        averageRating: 0,
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
          <p className="text-white/70">Loading dashboard...</p>
        </div>
      </>
    )
  }

  const quickActions = [
    {
      title: 'Create New Listing',
      description: 'List a new property or space',
      icon: '➕',
      href: '/landlord/listings/new',
      color: 'from-green-500',
    },
    {
      title: 'Manage Listings',
      description: 'Edit and manage your properties',
      icon: '🏠',
      href: '/landlord/listings',
      color: 'from-blue-500',
    },
    {
      title: 'Booking Requests',
      description: 'Review and approve requests',
      icon: '📋',
      href: '/landlord/bookings',
      color: 'from-orange-500',
    },
    {
      title: 'Damage Claims',
      description: 'Manage damage reports',
      icon: '⚠️',
      href: '/landlord/claims',
      color: 'from-red-500',
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
            <h1 className="text-4xl font-bold text-white mb-2">Landlord Dashboard</h1>
            <p className="text-blue-100/70">Manage your listings, bookings, and earnings</p>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Listings', value: stats.totalListings, icon: '📊' },
              { label: 'Active Listings', value: stats.activeListings, icon: '✓' },
              { label: 'Total Earnings', value: `$${stats.totalEarnings.toFixed(2)}`, icon: '💰' },
            ].map((stat, idx) => (
              <Card
                key={idx}
                className="backdrop-blur-md bg-white/10 border border-white/20 p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/70 text-sm mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <span className="text-3xl">{stat.icon}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-white text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickActions.map((action, idx) => (
                <Link key={idx} href={action.href}>
                  <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-6 hover:border-white/40 transition-all h-full cursor-pointer group">
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{action.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{action.title}</h3>
                        <p className="text-blue-100/70 text-sm mb-4">{action.description}</p>
                        <Button
                          className={`bg-gradient-to-r ${action.color} to-transparent text-white text-sm`}
                          onClick={() => {}}
                        >
                          Go →
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">Recent Booking Requests</h2>
              <Link href="/landlord/bookings">
                <Button className="bg-white/10 border border-white/20 text-white hover:bg-white/20">
                  View All
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {stats.pendingBookings === 0 ? (
                <p className="text-blue-100/70 text-center py-6">No pending booking requests</p>
              ) : (
                <p className="text-blue-100/70">You have {stats.pendingBookings} pending requests</p>
              )}
            </div>
          </Card>
        </div>
      </main>
    </>
  )
}
