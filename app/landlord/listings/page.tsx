'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Listing {
  id: string
  title: string
  type: string
  location: string
  pricePerDay: number
  isActive: boolean
  images: string[]
  createdAt: string
  _count?: {
    bookings: number
    reviews: number
  }
}

export default function LandlordListingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Listings</h1>
              <p className="text-blue-100/70">Manage and monitor your properties</p>
            </div>
            <Link href="/landlord/listings/new">
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                Create Listing
              </Button>
            </Link>
          </div>

          {/* Listings Table */}
          <Card className="backdrop-blur-md bg-white/10 border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-white/70 font-semibold text-sm">Property</th>
                    <th className="px-6 py-4 text-left text-white/70 font-semibold text-sm">Type</th>
                    <th className="px-6 py-4 text-left text-white/70 font-semibold text-sm">Location</th>
                    <th className="px-6 py-4 text-left text-white/70 font-semibold text-sm">Price/Night</th>
                    <th className="px-6 py-4 text-left text-white/70 font-semibold text-sm">Status</th>
                    <th className="px-6 py-4 text-left text-white/70 font-semibold text-sm">Bookings</th>
                    <th className="px-6 py-4 text-right text-white/70 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="text-blue-100/70 mb-4">No listings yet</p>
                        <Link href="/landlord/listings/new">
                          <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                            Create Your First Listing
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    listings.map((listing) => (
                      <tr key={listing.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {listing.images.length > 0 && (
                              <img
                                src={listing.images[0]}
                                alt={listing.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="text-white font-medium text-sm">{listing.title}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white/70 text-sm">{listing.type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white/70 text-sm">{listing.location}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white font-medium text-sm">${listing.pricePerDay}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                              listing.isActive
                                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                            }`}
                          >
                            {listing.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white text-sm">{listing._count?.bookings || 0}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/landlord/listings/${listing.id}`}>
                              <Button className="bg-white/10 border border-white/20 text-white text-xs hover:bg-white/20 h-8">
                                Edit
                              </Button>
                            </Link>
                            <Button className="bg-white/10 border border-white/20 text-white text-xs hover:bg-white/20 h-8">
                              View
                            </Button>
                          </div>
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
