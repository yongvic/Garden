'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Booking {
  id: string
  bookingNumber: string
  status: string
  checkInDate: string
  checkOutDate: string
  totalPrice: number
  numberOfGuests: number
  listing: {
    id: string
    title: string
    images: string[]
    location: string
  }
}

export default function BookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchBookings()
    }
  }, [status, statusFilter])

  const fetchBookings = async () => {
    try {
      const url = statusFilter === 'ALL' 
        ? '/api/bookings'
        : `/api/bookings?status=${statusFilter}`
      
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch')
      
      const data = await res.json()
      setBookings(data.bookings || data)
    } catch (err) {
      console.error('Error fetching bookings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'CONFIRMED':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'IN_PROGRESS':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'COMPLETED':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">My Bookings</h1>
            <p className="text-blue-100/70">Manage and track all your reservations</p>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
              <Button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                }`}
              >
                {status}
              </Button>
            ))}
          </div>

          {/* Bookings List */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-white/70">Loading bookings...</p>
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Link key={booking.id} href={`/bookings/${booking.id}`}>
                  <Card className="backdrop-blur-md bg-white/10 border border-white/20 hover:border-white/40 transition-all p-6 cursor-pointer group">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      {/* Image and Title */}
                      <div className="md:col-span-2 flex gap-4">
                        {booking.listing.images.length > 0 && (
                          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                            <img
                              src={booking.listing.images[0]}
                              alt={booking.listing.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{booking.listing.title}</h3>
                          <p className="text-blue-100/70 text-sm mb-2">{booking.listing.location}</p>
                          <p className="text-white/50 text-sm">
                            Booking #{booking.bookingNumber}
                          </p>
                        </div>
                      </div>

                      {/* Dates */}
                      <div>
                        <p className="text-white/70 text-sm mb-1">Dates</p>
                        <p className="text-white text-sm font-medium">
                          {formatDate(booking.checkInDate)} to {formatDate(booking.checkOutDate)}
                        </p>
                      </div>

                      {/* Status and Price */}
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                        <p className="text-white font-semibold">
                          ${booking.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-12 text-center">
              <p className="text-white/70 text-lg mb-4">No bookings found</p>
              <Link href="/search">
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                  Browse Listings
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
