'use client'

import { useEffect, useState, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Star, CheckCircle, AlertTriangle, Heart, Eye, MessageCircle, Phone, BadgeCheck, Share2 } from 'lucide-react'

interface ListingDetail {
  id: string
  title: string
  description: string
  type: string
  location: string
  pricePerDay: number
  isActive: boolean
  images: string[]
  amenities: string[]
  rules: string
  cancellationPolicy: string
  averageRating: number
  reviewCount: number
  favoriteCount: number
  isFavorited: boolean
  viewCount: number
  landlord: {
    id: string
    name: string | null
    image: string | null
    email: string | null
    phone: string | null
    isVerified: boolean
  }
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

const TYPE_LABELS: Record<string, string> = {
  SPACE: '🏢 Espace', ROOM: '🛏 Chambre', EQUIPMENT: '🎛 Équipement'
}

export default function ListingDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const { data: session } = useSession()
  const router = useRouter()
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFav, setIsFav] = useState(false)
  const [favCount, setFavCount] = useState(0)
  const [toastMsg, setToastMsg] = useState('')
  const [isToggling, setIsToggling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Booking state
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [numberOfGuests, setNumberOfGuests] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const fetchListing = () => {
    fetch(`/api/listings/${params.id}`)
      .then(res => { if (!res.ok) throw new Error('Annonce introuvable'); return res.json() })
      .then(data => {
        setListing(data)
        setIsFav(data.isFavorited)
        setFavCount(data.favoriteCount ?? 0)
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { fetchListing() }, [params.id])

  const handleToggleFav = async () => {
    if (!session) { router.push('/auth/signin'); return }
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: params.id }),
    })
    const data = await res.json()
    setIsFav(data.favorited)
    setFavCount(prev => data.favorited ? prev + 1 : Math.max(0, prev - 1))
    showToast(data.favorited ? '❤️ Ajouté aux favoris' : '🤍 Retiré des favoris')
  }

  const toggleActive = async () => {
    if (!listing) return
    setIsToggling(true)
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !listing.isActive }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setListing(prev => prev ? { ...prev, isActive: !prev.isActive } : prev)
      showToast(listing.isActive ? 'Annonce désactivée' : 'Annonce activée')
    } catch (e) { setError((e as Error).message) }
    finally { setIsToggling(false) }
  }

  const deleteListing = async () => {
    if (!listing) return
    if (!confirm('Supprimer cette annonce définitivement ?')) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/listings/${listing.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      router.push('/landlord/listings')
    } catch (e) { setError((e as Error).message) }
    finally { setIsDeleting(false) }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: listing?.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      showToast('🔗 Lien copié !')
    }
  }

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
      const bookingData = await res.json()
      router.push(`/bookings/${bookingData.booking.id}`)
    } catch (err) { setBookingError((err as Error).message) }
    finally { setIsBooking(false) }
  }

  if (isLoading) return <><Navbar /><div className="min-h-screen bg-slate-900 flex justify-center items-center"><div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div></>
  if (error || !listing) return <><Navbar /><div className="min-h-screen bg-slate-900 flex justify-center items-center"><p className="text-red-400">{error || 'Introuvable'}</p></div></>

  const whatsappUrl = listing.landlord.phone
    ? `https://wa.me/${listing.landlord.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour, je suis intéressé par votre annonce "${listing.title}" sur Garden.`)}`
    : null

  const nights = checkInDate && checkOutDate
    ? Math.max(0, Math.round((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <>
      <Navbar />

      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 border border-white/20 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-medium animate-in slide-in-from-bottom-4 duration-300">
          {toastMsg}
        </div>
      )}

      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                  <div>
                    <span className="text-xs text-cyan-400 font-medium bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 rounded-full mb-2 inline-block">
                      {TYPE_LABELS[listing.type] ?? listing.type}
                    </span>
                    <h1 className="text-3xl font-bold text-white">{listing.title}</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    {session?.user?.id === listing.landlord.id && (
                      <div className="flex items-center gap-2 mr-2 border-r border-white/10 pr-4">
                        <button onClick={toggleActive} disabled={isToggling} className={`text-xs px-3 py-2 rounded-xl border transition-all font-medium ${listing.isActive ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'}`}>
                          {listing.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                        <button onClick={deleteListing} disabled={isDeleting} className="text-xs px-3 py-2 rounded-xl border border-red-500/20 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all font-medium">
                          Supprimer
                        </button>
                      </div>
                    )}
                    <button onClick={handleToggleFav} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border transition-all text-sm font-medium ${isFav ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/5 border-white/15 text-slate-400 hover:text-red-400 hover:border-red-500/30'}`}>
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      {favCount}
                    </button>
                    <button onClick={handleShare} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-slate-400 hover:text-white transition-all text-sm">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center flex-wrap gap-4 text-sm text-slate-400">
                  <span>📍 {listing.location}</span>
                  {listing.averageRating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-medium">{listing.averageRating}</span>
                      <span>({listing.reviewCount} avis)</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" /> {listing.viewCount} vues
                  </span>
                </div>
              </div>

              {/* Gallery */}
              {listing.images.length > 0 ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-slate-800 rounded-2xl overflow-hidden relative group">
                    <img src={listing.images[currentImageIndex]} alt="" className="w-full h-full object-cover" />
                    {listing.images.length > 1 && (
                      <>
                        <button onClick={() => setCurrentImageIndex(p => (p - 1 + listing.images.length) % listing.images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">‹</button>
                        <button onClick={() => setCurrentImageIndex(p => (p + 1) % listing.images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">›</button>
                      </>
                    )}
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
                        <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" /> {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules */}
              {listing.rules && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-white text-xl font-semibold mb-4">🏠 Règlement</h2>
                  <p className="text-slate-300 text-sm whitespace-pre-line">{listing.rules}</p>
                </div>
              )}

              {/* Reviews */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-white text-xl font-semibold mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  {listing.averageRating > 0 ? `${listing.averageRating} · ` : ''}{listing.reviewCount} avis
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
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
                {session && <ReviewForm listingId={listing.id} onReviewAdded={fetchListing} />}
              </div>
            </div>

            {/* Right Column (Booking Box) */}
            <div>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24 space-y-6">
                <div>
                  <span className="text-3xl font-bold text-white">{listing.pricePerDay.toLocaleString('fr-FR')} FCFA</span>
                  <span className="text-slate-400"> / jour</span>
                </div>

                <form onSubmit={handleBooking} className="space-y-4">
                  {bookingError && <div className="p-3 bg-red-500/10 text-red-300 text-sm rounded-xl">{bookingError}</div>}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 text-xs uppercase mb-1">Arrivée</label>
                      <Input type="date" required value={checkInDate} onChange={e => setCheckInDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs uppercase mb-1">Départ</label>
                      <Input type="date" required value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} min={checkInDate || new Date().toISOString().split('T')[0]} className="bg-white/5 border-white/10 text-white" />
                    </div>
                  </div>

                  {nights > 0 && (
                    <div className="bg-white/5 rounded-xl p-3 text-sm">
                      <div className="flex justify-between text-slate-400">
                        <span>{listing.pricePerDay.toLocaleString('fr-FR')} FCFA × {nights} jour{nights > 1 ? 's' : ''}</span>
                        <span className="text-white font-semibold">{(listing.pricePerDay * nights).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-400 text-xs uppercase mb-1">Invités</label>
                    <Input type="number" min="1" required value={numberOfGuests} onChange={e => setNumberOfGuests(parseInt(e.target.value))} className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs uppercase mb-1">Demandes spéciales</label>
                    <textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:border-cyan-500 outline-none text-sm" placeholder="Optionnel..." />
                  </div>

                  <Button type="submit" disabled={isBooking} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-6 text-lg rounded-xl shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all">
                    {isBooking ? 'Patientez...' : 'Demander la réservation'}
                  </Button>
                </form>

                {/* Host Info */}
                <div className="pt-2 border-t border-white/10">
                  <p className="text-slate-400 text-xs uppercase mb-3">Hébergé par</p>
                  <div className="flex items-center gap-3 mb-4">
                    {listing.landlord.image ? (
                      <img src={listing.landlord.image} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {(listing.landlord.name || 'H')[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-white font-medium">{listing.landlord.name || 'Propriétaire'}</p>
                        {listing.landlord.isVerified && (
                          <span title="Compte vérifié">
                            <BadgeCheck className="w-4 h-4 text-blue-400" />
                          </span>
                        )}
                      </div>
                      {listing.landlord.email && <p className="text-slate-500 text-xs">{listing.landlord.email}</p>}
                    </div>
                  </div>

                  {/* WhatsApp Button */}
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] rounded-xl transition-all font-medium text-sm"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Contacter sur WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}

