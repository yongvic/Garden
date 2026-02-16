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
          <p className="text-white/70">Loading dashboard...</p>
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
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-12">
          {/* Welcome Section */}
          <Card className="mb-8 backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-white/20 p-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {data.user.name}!
            </h1>
            <p className="text-blue-100/70">
              {isDashboardLandlord 
                ? 'Manage your listings and bookings' 
                : 'Manage your bookings and reservations'}
            </p>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Bookings', value: data.bookingStats.total, color: 'from-blue-500' },
              { label: 'Confirmed', value: data.bookingStats.confirmed, color: 'from-green-500' },
              { label: 'Pending', value: data.bookingStats.pending, color: 'from-yellow-500' },
              { label: 'Completed', value: data.bookingStats.completed, color: 'from-cyan-500' },
            ].map((stat, idx) => (
              <Card
                key={idx}
                className="backdrop-blur-md bg-white/10 border border-white/20 p-6"
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
                <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-8 hover:border-white/40 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white text-xl font-semibold mb-2">My Bookings</h3>
                      <p className="text-blue-100/70">View and manage all your reservations</p>
                    </div>
                    <span className="text-3xl">🎫</span>
                  </div>
                  <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                    View Bookings
                  </Button>
                </Card>

                <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-8 hover:border-white/40 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white text-xl font-semibold mb-2">Browse Listings</h3>
                      <p className="text-blue-100/70">Find new spaces to book</p>
                    </div>
                    <span className="text-3xl">🔍</span>
                  </div>
                  <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                    Search Now
                  </Button>
                </Card>
              </>
            )}

            {isDashboardLandlord && (
              <>
                <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-8 hover:border-white/40 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white text-xl font-semibold mb-2">My Listings</h3>
                      <p className="text-blue-100/70">Manage your properties</p>
                    </div>
                    <span className="text-3xl">🏠</span>
                  </div>
                  <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                    View Listings
                  </Button>
                </Card>

                <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-8 hover:border-white/40 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white text-xl font-semibold mb-2">New Bookings</h3>
                      <p className="text-blue-100/70">Manage incoming booking requests</p>
                    </div>
                    <span className="text-3xl">📋</span>
                  </div>
                  <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                    View Requests
                  </Button>
                </Card>
              </>
            )}
          </div>

          {/* Account Settings */}
          <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-8">
            <h2 className="text-white text-xl font-semibold mb-6">Account Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-white/70 text-sm mb-2">Full Name</p>
                <p className="text-white font-medium">{data.user.name}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-2">Email</p>
                <p className="text-white font-medium">{data.user.email}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-2">Account Type</p>
                <p className="text-white font-medium capitalize">{data.user.role.toLowerCase()}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-2">Member Since</p>
                <p className="text-white font-medium">January 2024</p>
              </div>
            </div>

            <Button className="mt-6 bg-white/10 border border-white/20 text-white hover:bg-white/20">
              Edit Profile
            </Button>
          </Card>
        </div>
      </main>
    </>
  )
}
