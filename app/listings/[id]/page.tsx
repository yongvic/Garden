'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface ListingDetail {
  id: string
  title: string
  description: string
  type: string
  location: string
  pricePerDay: number
  images: string[]
  amenities: string[]
  rules: string
  cancellationPolicy: string
  averageRating: number
  reviewCount: number
  landlord: {
    id: string
    name: string
    image: string
    email: string
  }
  reviews: Array<{
    id: string
    rating: number
    title: string
    comment: string
    createdAt: string
    user: {
      name: string
      image: string
    }
  }>
}

// ... imports ...

// ... interface ListingDetail ...

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()

  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const [bookingData, setBookingData] = useState({
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    specialRequests: '',
  })

  const [isBooking, setIsBooking] = useState(false)

  // ... useEffect ...

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.id) {
      router.push('/auth/signin')
      return
    }

    setIsBooking(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: params.id,
          checkInDate: new Date(bookingData.checkInDate).toISOString(),
          checkOutDate: new Date(bookingData.checkOutDate).toISOString(),
          numberOfGuests: bookingData.numberOfGuests,
          specialRequests: bookingData.specialRequests,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Échec de la réservation')
      }

      const booking = await res.json()
      router.push(`/bookings/${booking.id}`)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsBooking(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
          <p className="text-white/70">Chargement de l'annonce...</p>
        </div>
      </>
    )
  }

  if (!listing) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
          <p className="text-red-400">{error || 'Annonce non trouvée'}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-500">
          {/* Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {listing.images.length > 0 ? (
                <div className="relative group">
                  <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl overflow-hidden shadow-2xl">
                    <img
                      src={listing.images[currentImageIndex]}
                      alt={listing.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {listing.images.length > 1 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                      {listing.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-cyan-400 scale-110' : 'border-white/20 opacity-70 hover:opacity-100'
                            }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                  <p className="text-white/50">Aucune image disponible</p>
                </div>
              )}

              {/* Description */}
              <Card className="mt-8 backdrop-blur-md bg-white/10 border border-white/20 p-6 animate-in slide-in-from-bottom duration-500 delay-100">
                <h2 className="text-white text-xl font-semibold mb-4">À propos de cette annonce</h2>
                <p className="text-blue-100/70 leading-relaxed">{listing.description}</p>
              </Card>

              {/* Amenities */}
              {listing.amenities.length > 0 && (
                <Card className="mt-6 backdrop-blur-md bg-white/10 border border-white/20 p-6 animate-in slide-in-from-bottom duration-500 delay-200">
                  <h2 className="text-white text-xl font-semibold mb-4">Équipements</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {listing.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-blue-100/70">
                        <span className="text-cyan-400">✓</span>
                        {amenity}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Reviews */}
              {listing.reviews.length > 0 && (
                <Card className="mt-6 backdrop-blur-md bg-white/10 border border-white/20 p-6 animate-in slide-in-from-bottom duration-500 delay-300">
                  <h2 className="text-white text-xl font-semibold mb-6">Avis</h2>
                  <div className="space-y-4">
                    {listing.reviews.map((review) => (
                      <div key={review.id} className="border-b border-white/10 pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {review.user.image && (
                              <img
                                src={review.user.image}
                                alt={review.user.name}
                                className="w-8 h-8 rounded-full"
                              />
                            )}
                            <div>
                              <p className="text-white font-medium">{review.user.name}</p>
                              <div className="flex items-center gap-1">
                                {Array(5).fill(0).map((_, i) => (
                                  <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-600'}>
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <h4 className="text-white font-semibold mb-1">{review.title}</h4>
                        <p className="text-blue-100/70 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Booking Card */}
            <div>
              <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-6 sticky top-24 space-y-6 animate-in slide-in-from-right duration-500">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white text-3xl font-bold">{listing.pricePerDay} FCFA</span>
                    <span className="text-blue-100/70">/nuit</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-yellow-400">★</span>
                    <span className="text-white">
                      {listing.averageRating} ({listing.reviewCount} avis)
                    </span>
                  </div>
                </div>

                <form onSubmit={handleBooking} className="space-y-4">
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded p-3">
                      <p className="text-red-100 text-sm">{error}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Arrivée</label>
                    <Input
                      type="date"
                      value={bookingData.checkInDate}
                      onChange={(e) => setBookingData(prev => ({ ...prev, checkInDate: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Départ</label>
                    <Input
                      type="date"
                      value={bookingData.checkOutDate}
                      onChange={(e) => setBookingData(prev => ({ ...prev, checkOutDate: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Nombre d'invités</label>
                    <Input
                      type="number"
                      min="1"
                      value={bookingData.numberOfGuests}
                      onChange={(e) => setBookingData(prev => ({ ...prev, numberOfGuests: parseInt(e.target.value) }))}
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Demandes spéciales (Optionnel)</label>
                    <textarea
                      value={bookingData.specialRequests}
                      onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-white/50"
                      rows={3}
                      placeholder="Des demandes particulières ?"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isBooking}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 transition-transform hover:scale-[1.02]"
                  >
                    {isBooking ? 'Réservation...' : 'Réserver Maintenant'}
                  </Button>
                </form>

                {/* Host Info */}
                <div className="border-t border-white/10 pt-4">
                  <h3 className="text-white font-semibold mb-3">Hébergé par</h3>
                  <div className="flex items-center gap-3">
                    {listing.landlord.image && (
                      <img
                        src={listing.landlord.image}
                        alt={listing.landlord.name}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-white">{listing.landlord.name}</p>
                      <p className="text-blue-100/70 text-sm">{listing.type}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Policies */}
          {(listing.rules || listing.cancellationPolicy) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
              {listing.rules && (
                <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-6 animate-in slide-in-from-bottom duration-500 delay-500">
                  <h3 className="text-white font-semibold mb-3">Règles de la maison</h3>
                  <p className="text-blue-100/70 text-sm whitespace-pre-wrap">{listing.rules}</p>
                </Card>
              )}
              {listing.cancellationPolicy && (
                <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-6 animate-in slide-in-from-bottom duration-500 delay-500">
                  <h3 className="text-white font-semibold mb-3">Politique d'annulation</h3>
                  <p className="text-blue-100/70 text-sm whitespace-pre-wrap">{listing.cancellationPolicy}</p>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
