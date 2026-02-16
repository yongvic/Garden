'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface BookingDetail {
  id: string
  bookingNumber: string
  status: string
  checkInDate: string
  checkOutDate: string
  numberOfGuests: number
  totalPrice: number
  specialRequests: string
  paymentStatus: string
  createdAt: string
  listing: {
    id: string
    title: string
    description: string
    images: string[]
    location: string
    pricePerDay: number
  }
  customer: {
    name: string
    email: string
    phone: string
  }
  landlord: {
    name: string
    email: string
  }
}

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${params.id}`)
        if (!res.ok) throw new Error('Failed to fetch booking')
        const data = await res.json()
        setBooking(data)
      } catch (err) {
        setError('Failed to load booking details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooking()
  }, [params.id])

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/bookings/${params.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update booking')
      
      const updated = await res.json()
      setBooking(updated)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePayment = async () => {
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: params.id }),
      })

      if (!res.ok) throw new Error('Failed to create checkout')
      
      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      setError((err as Error).message)
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center pt-20">
          <p className="text-white/70">Loading booking details...</p>
        </div>
      </>
    )
  }

  if (!booking) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center pt-20">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error || 'Booking not found'}</p>
            <Link href="/bookings">
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                Back to Bookings
              </Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Booking #{booking.bookingNumber}
              </h1>
              <span className={`inline-block px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>
            <Link href="/bookings">
              <Button className="bg-white/10 border border-white/20 text-white hover:bg-white/20">
                ← Back
              </Button>
            </Link>
          </div>

          {error && (
            <Card className="bg-red-500/20 border border-red-500/50 p-4 mb-6">
              <p className="text-red-100">{error}</p>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Info */}
              <Card className="backdrop-blur-md bg-white/10 border border-white/20 overflow-hidden">
                {booking.listing.images.length > 0 && (
                  <img
                    src={booking.listing.images[0]}
                    alt={booking.listing.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6 space-y-4">
                  <div>
                    <h2 className="text-white text-2xl font-semibold mb-2">{booking.listing.title}</h2>
                    <p className="text-blue-100/70">{booking.listing.location}</p>
                  </div>
                  <p className="text-blue-100/70">{booking.listing.description}</p>
                </div>
              </Card>

              {/* Booking Details */}
              <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-6 space-y-6">
                <h3 className="text-white text-xl font-semibold">Booking Details</h3>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-white/70 text-sm mb-1">Check In</p>
                    <p className="text-white font-semibold">{formatDate(booking.checkInDate)}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm mb-1">Check Out</p>
                    <p className="text-white font-semibold">{formatDate(booking.checkOutDate)}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm mb-1">Number of Guests</p>
                    <p className="text-white font-semibold">{booking.numberOfGuests}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm mb-1">Created</p>
                    <p className="text-white font-semibold">{formatDate(booking.createdAt)}</p>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-white/70 text-sm mb-2">Special Requests</p>
                    <p className="text-white">{booking.specialRequests}</p>
                  </div>
                )}
              </Card>

              {/* Guest & Host Info */}
              <div className="grid grid-cols-2 gap-6">
                <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-6">
                  <h4 className="text-white font-semibold mb-4">Guest Information</h4>
                  <div className="space-y-2">
                    <p className="text-white/70 text-sm">Name</p>
                    <p className="text-white">{booking.customer.name}</p>
                    <p className="text-white/70 text-sm mt-4">Email</p>
                    <p className="text-white break-all">{booking.customer.email}</p>
                    {booking.customer.phone && (
                      <>
                        <p className="text-white/70 text-sm mt-4">Phone</p>
                        <p className="text-white">{booking.customer.phone}</p>
                      </>
                    )}
                  </div>
                </Card>

                <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-6">
                  <h4 className="text-white font-semibold mb-4">Host Information</h4>
                  <div className="space-y-2">
                    <p className="text-white/70 text-sm">Name</p>
                    <p className="text-white">{booking.landlord.name}</p>
                    <p className="text-white/70 text-sm mt-4">Email</p>
                    <p className="text-white break-all">{booking.landlord.email}</p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Summary */}
              <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-6 space-y-4">
                <h3 className="text-white font-semibold">Price Summary</h3>
                
                <div className="space-y-2 border-b border-white/10 pb-4">
                  <div className="flex justify-between text-white/70 text-sm">
                    <span>Price per night</span>
                    <span>${booking.listing.pricePerDay}</span>
                  </div>
                  <div className="flex justify-between text-white/70 text-sm">
                    <span>Number of nights</span>
                    <span>
                      {Math.ceil(
                        (new Date(booking.checkOutDate).getTime() -
                          new Date(booking.checkInDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-2xl font-bold text-cyan-400">${booking.totalPrice.toFixed(2)}</span>
                </div>

                {booking.paymentStatus === 'pending' && (
                  <Button
                    onClick={handlePayment}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3"
                  >
                    Pay Now
                  </Button>
                )}
                {booking.paymentStatus === 'completed' && (
                  <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-2 rounded-lg text-center text-sm">
                    Payment Completed
                  </div>
                )}
              </Card>

              {/* Actions */}
              {booking.status === 'PENDING' && (
                <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-6 space-y-3">
                  <h3 className="text-white font-semibold mb-3">Actions</h3>
                  <Button
                    onClick={() => handleStatusUpdate('CANCELLED')}
                    disabled={isUpdating}
                    className="w-full bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30"
                  >
                    Cancel Booking
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
