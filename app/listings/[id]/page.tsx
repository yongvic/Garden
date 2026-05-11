'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Star, CheckCircle, AlertTriangle } from 'lucide-react'

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
  landlord: { id: string; name: string | null; image: string | null; email: string | null }
  reviews: Array<{
    id: string; rating: number; title: string; comment: string; createdAt: string
    user: { name: string | null; image: string | null }
  }>
}

function ReviewForm({ listingId, onReviewAdded }: { listingId: string, onReviewAdded: () => void }) {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, rating, title, comment })
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setSuccess('Merci pour votre avis !')
      setTitle(''); setComment(''); setRating(5)
      setTimeout(onReviewAdded, 1500)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6 pt-6 border-t border-white/10">
      <h3 className="text-white font-semibold flex items-center gap-2">Laisser un avis</h3>
      {error && <div className="p-3 bg-red-500/10 text-red-300 text-sm rounded-xl">{error}</div>}
      {success && <div className="p-3 bg-emerald-500/10 text-emerald-300 text-sm rounded-xl">{success}</div>}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
            <Star className={`w-6 h-6 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
          </button>
        ))}
      </div>
      <Input
        value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Titre de l'avis" required maxLength={100}
        className="bg-white/5 border-white/10 text-white placeholder-slate-500"
      />
      <textarea
        value={comment} onChange={e => setComment(e.target.value)}
        placeholder="Partagez votre expérience avec cet espace..." required rows={3}
        className="w-full bg-white/5 border border-white/10 text-white rounded-md px-3 py-2 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
      />
      <Button type="submit" disabled={isSubmitting || !title || !comment} className="bg-cyan-500 hover:bg-cyan-600 text-white">
        {isSubmitting ? 'Envoi...' : 'Publier l\'avis'}
      </Button>
    </form>
  )
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Booking state
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [numberOfGuests, setNumberOfGuests] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')

  const fetchListing = () => {
    fetch(`/api/listings/${params.id}`)
      .then(res => { if (!res.ok) throw new Error('Annonce introuvable'); return res.json() })
      .then(data => setListing(data))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { fetchListing() }, [params.id])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) { router.push('/auth/signin'); return }
    setIsBooking(true); setBookingError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: params.id,
          checkInDate: new Date(checkInDate).toISOString(),
          checkOutDate: new Date(checkOutDate).toISOString(),
          numberOfGuests, specialRequests,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Échec de la réservation')
      const booking = await res.json()
      router.push(`/bookings/${booking.id}`)
    } catch (err) { setBookingError((err as Error).message) }
    finally { setIsBooking(false) }
  }

  if (isLoading) return <><Navbar /><div className="min-h-screen bg-slate-900 flex justify-center items-center"><div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div></>
  if (error || !listing) return <><Navbar /><div className="min-h-screen bg-slate-900 flex justify-center items-center"><p className="text-red-400">{error || 'Introuvable'}</p></div></>

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Header Info */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{listing.title}</h1>
                <p className="text-slate-400 flex items-center gap-2">📍 {listing.location}</p>
              </div>

              {/* Gallery */}
              {listing.images.length > 0 ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-slate-800 rounded-2xl overflow-hidden">
                    <img src={listing.images[currentImageIndex]} alt="" className="w-full h-full object-cover" />
                  </div>
                  {listing.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {listing.images.map((img, idx) => (
                        <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${idx === currentImageIndex ? 'border-cyan-400' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500">Aucune image</div>
              )}

              {/* Description */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-white text-xl font-semibold mb-4">À propos de cet espace</h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{listing.description}</p>
              </div>

              {/* Amenities */}
              {listing.amenities.length > 0 && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-white text-xl font-semibold mb-4">Équipements</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {listing.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-300 text-sm">
                        <CheckCircle className="w-4 h-4 text-cyan-400" /> {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-white text-xl font-semibold mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" /> 
                  {listing.averageRating} ({listing.reviewCount} avis)
                </h2>
                
                {listing.reviews.length === 0 ? (
                  <p className="text-slate-400">Aucun avis pour le moment.</p>
                ) : (
                  <div className="space-y-6">
                    {listing.reviews.map((review) => (
                      <div key={review.id} className="border-b border-white/5 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-3">
                          {review.user.image ? (
                            <img src={review.user.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white">
                              {(review.user.name || 'U')[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{review.user.name || 'Anonyme'}</p>
                            <div className="flex text-yellow-400 text-sm">
                              {Array(5).fill(0).map((_, i) => <span key={i}>{i < review.rating ? '★' : '☆'}</span>)}
                            </div>
                          </div>
                        </div>
                        <h4 className="text-white font-medium mb-1">{review.title}</h4>
                        <p className="text-slate-300 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Review Form Component */}
                {session && <ReviewForm listingId={listing.id} onReviewAdded={fetchListing} />}
              </div>

            </div>

            {/* Right Column (Booking Box) */}
            <div>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">{listing.pricePerDay} FCFA</span>
                  <span className="text-slate-400"> / jour</span>
                </div>

                <form onSubmit={handleBooking} className="space-y-5">
                  {bookingError && <div className="p-3 bg-red-500/10 text-red-300 text-sm rounded-xl">{bookingError}</div>}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-xs uppercase mb-1">Arrivée</label>
                      <Input type="date" required value={checkInDate} onChange={e => setCheckInDate(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs uppercase mb-1">Départ</label>
                      <Input type="date" required value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs uppercase mb-1">Invités</label>
                    <Input type="number" min="1" required value={numberOfGuests} onChange={e => setNumberOfGuests(parseInt(e.target.value))} className="bg-white/5 border-white/10 text-white" />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs uppercase mb-1">Demandes spéciales</label>
                    <textarea 
                      value={specialRequests} onChange={e => setSpecialRequests(e.target.value)}
                      rows={2} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:border-cyan-500 outline-none" 
                      placeholder="Optionnel..."
                    />
                  </div>

                  <Button type="submit" disabled={isBooking} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-6 text-lg rounded-xl shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all">
                    {isBooking ? 'Patientez...' : 'Demander la réservation'}
                  </Button>
                </form>

                {/* Host */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    {listing.landlord.image ? (
                      <img src={listing.landlord.image} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                        {(listing.landlord.name || 'H')[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-slate-400 text-xs uppercase">Hébergé par</p>
                      <p className="text-white font-medium">{listing.landlord.name || 'Propriétaire'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
