'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface LandlordBooking {
  id: string
  bookingNumber: string
  status: string
  checkInDate: string
  checkOutDate: string
  totalPrice: number
  customer: {
    name: string
    email: string
  }
  listing: {
    title: string
  }
}

export default function LandlordBookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<LandlordBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('PENDING')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && (session?.user as any)?.role === 'LANDLORD') {
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
          <p className="text-white/70">Loading...</p>
        </div>
      </>
    )
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Booking Requests</h1>
            <p className="text-blue-100/70">Manage booking requests for your properties</p>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
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

          {/* Bookings Table */}
          <Card className="backdrop-blur-md bg-white/10 border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-white/70 font-semibold text-sm">Booking #</th>
                    <th className="px-6 py-4 text-left text-white/70 font-semibold text-sm">Property</th>
                    <th className="px-6 py-4 text-left text-white/70 font-semibold text-sm">Guest</th>
                    <th className="px-6 py-4 text-left text-white/70 font-semibold text-sm">Dates</th>
                    <th className="px-6 py-4 text-left text-white/70 font-semibold text-sm">Price</th>
                    <th className="px-6 py-4 text-left text-white/70 font-semibold text-sm">Status</th>
                    <th className="px-6 py-4 text-right text-white/70 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="text-blue-100/70">No {statusFilter.toLowerCase()} bookings</p>
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-white font-medium text-sm">#{booking.bookingNumber}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white/70 text-sm">{booking.listing.title}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white text-sm">{booking.customer.name}</p>
                            <p className="text-white/50 text-xs">{booking.customer.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white/70 text-sm">
                            {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white font-medium text-sm">${booking.totalPrice}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {booking.status === 'PENDING' && (
                            <div className="flex justify-end gap-2">
                              <Button className="bg-green-500/20 border border-green-500/30 text-green-300 text-xs hover:bg-green-500/30 h-8">
                                Confirm
                              </Button>
                              <Button className="bg-red-500/20 border border-red-500/30 text-red-300 text-xs hover:bg-red-500/30 h-8">
                                Decline
                              </Button>
                            </div>
                          )}
                          {booking.status !== 'PENDING' && (
                            <Button className="bg-white/10 border border-white/20 text-white text-xs hover:bg-white/20 h-8">
                              View Details
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </>
  )
}
