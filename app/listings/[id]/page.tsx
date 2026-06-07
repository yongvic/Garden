'use client'

import { useEffect, useState, useCallback, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PageShell } from '@/components/page-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n/context'
import { motion, AnimatePresence } from 'motion/react'
import {
  formatCurrency,
  formatDateRange,
  daysBetween,
  calculateGuestTotal,
  formatListingType,
  getListingTypeColor,
  getBookingStatusColor,
  formatRelativeTime,
} from '@/lib/format'
import { toast } from 'sonner'
import {
  Star,
  CheckCircle,
  AlertTriangle,
  Heart,
  Eye,
  BadgeCheck,
  Share2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Loader2,
} from 'lucide-react'

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
    id: string
    rating: number
    title: string
    comment: string
    createdAt: string
    user: { name: string | null; image: string | null }
  }>
}

type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'unavailable'

function ReviewForm({
  listingId,
  onReviewAdded,
}: {
  listingId: string
  onReviewAdded: () => void
}) {
  const { t } = useI18n()
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, rating, title, comment }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success(t.listing.reviewThanks)
      setTitle('')
      setComment('')
      setRating(5)
      setTimeout(onReviewAdded, 1500)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t border-border pt-6">
      <h3 className="font-semibold text-foreground">{t.listing.leaveReview}</h3>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="rounded p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${star}`}
          >
            <Star
              className={`size-6 ${star <= rating ? 'fill-accent text-accent' : 'text-muted-foreground/40'}`}
            />
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-title">{t.listing.reviewTitle}</Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={100}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-comment">{t.listing.reviewComment}</Label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <Button type="submit" disabled={isSubmitting || !title || !comment}>
        {isSubmitting ? t.common.loading : t.listing.publishReview}
      </Button>
    </form>
  )
}

function ListingSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-[480px] w-full rounded-2xl" />
      </div>
    </div>
  )
}

export default function ListingDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const { data: session } = useSession()
  const router = useRouter()
  const { t, locale } = useI18n()

  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFav, setIsFav] = useState(false)
  const [favCount, setFavCount] = useState(0)
  const [isToggling, setIsToggling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [numberOfGuests, setNumberOfGuests] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')

  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('idle')
  const [availabilityMessage, setAvailabilityMessage] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const fetchListing = useCallback(() => {
    fetch(`/api/listings/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error(t.listing.notFound)
        return res.json()
      })
      .then((data) => {
        setListing(data)
        setIsFav(data.isFavorited)
        setFavCount(data.favoriteCount ?? 0)
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [params.id, t.listing.notFound])

  useEffect(() => {
    fetchListing()
  }, [fetchListing])

  const checkAvailability = useCallback(
    async (checkIn: string, checkOut: string) => {
      if (!checkIn || !checkOut) {
        setAvailabilityStatus('idle')
        setAvailabilityMessage('')
        return true
      }

      if (new Date(checkOut) <= new Date(checkIn)) {
        setAvailabilityStatus('unavailable')
        setAvailabilityMessage(t.listing.unavailable)
        return false
      }

      setAvailabilityStatus('checking')
      setAvailabilityMessage(t.listing.checkingAvailability)

      try {
        const qs = new URLSearchParams({
          checkInDate: checkIn,
          checkOutDate: checkOut,
        })
        const res = await fetch(`/api/listings/${params.id}/availability?${qs}`)
        if (!res.ok) throw new Error('Availability check failed')
        const data = await res.json()

        if (data.isAvailable) {
          setAvailabilityStatus('available')
          setAvailabilityMessage(t.listing.available)
          return true
        }

        setAvailabilityStatus('unavailable')
        setAvailabilityMessage(
          data.conflictingBooking ? t.listing.conflict : t.listing.unavailable
        )
        return false
      } catch {
        setAvailabilityStatus('idle')
        setAvailabilityMessage('')
        return true
      }
    },
    [params.id, t.listing]
  )

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      checkAvailability(checkInDate, checkOutDate)
    } else {
      setAvailabilityStatus('idle')
      setAvailabilityMessage('')
    }
  }, [checkInDate, checkOutDate, checkAvailability])

  const handleToggleFav = async () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: params.id }),
    })
    const data = await res.json()
    setIsFav(data.favorited)
    setFavCount((prev) => (data.favorited ? prev + 1 : Math.max(0, prev - 1)))
    toast.success(data.favorited ? t.listing.addedToFavorites : t.listing.removedFromFavorites)
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
      setListing((prev) => (prev ? { ...prev, isActive: !prev.isActive } : prev))
      toast.success(
        listing.isActive ? t.listing.listingDeactivated : t.listing.listingActivated
      )
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setIsToggling(false)
    }
  }

  const deleteListing = async () => {
    if (!listing) return
    if (!confirm(t.listing.confirmDelete)) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/listings/${listing.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      router.push('/landlord/listings')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: listing?.title, url: window.location.href })
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success(t.listing.linkCopied)
    }
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) {
      router.push('/auth/signin')
      return
    }

    setIsBooking(true)
    setBookingError('')

    try {
      const isAvailable = await checkAvailability(checkInDate, checkOutDate)
      if (!isAvailable) {
        setBookingError(availabilityMessage || t.listing.unavailable)
        return
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: params.id,
          checkInDate: new Date(checkInDate).toISOString(),
          checkOutDate: new Date(checkOutDate).toISOString(),
          numberOfGuests,
          specialRequests,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || t.common.error)
      const bookingData = await res.json()

      toast.success(t.listing.bookingCreated, {
        action: {
          label: t.listing.payNow,
          onClick: () => router.push(`/bookings/${bookingData.booking.id}`),
        },
      })
      router.push(`/bookings/${bookingData.booking.id}`)
    } catch (err) {
      setBookingError((err as Error).message)
    } finally {
      setIsBooking(false)
    }
  }

  if (isLoading) {
    return (
      <PageShell>
        <ListingSkeleton />
      </PageShell>
    )
  }

  if (error || !listing) {
    return (
      <PageShell>
        <div className="flex min-h-[50vh] items-center justify-center px-4">
          <p className="text-destructive">{error || t.listing.notFound}</p>
        </div>
      </PageShell>
    )
  }

  const isOwner = session?.user?.id === listing.landlord.id
  const nights =
    checkInDate && checkOutDate ? Math.max(0, daysBetween(checkInDate, checkOutDate)) : 0
  const subtotal = nights > 0 ? listing.pricePerDay * nights : 0
  const guestTotal = nights > 0 ? calculateGuestTotal(subtotal) : 0
  const serviceFee = guestTotal - subtotal
  const priceSuffix = listing.type === 'ROOM' ? t.search.perNight : t.search.perDay

  const whatsappUrl = listing.landlord.phone
    ? `https://wa.me/${listing.landlord.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        locale === 'fr'
          ? `Bonjour, je suis intéressé par votre annonce "${listing.title}" sur Garden.`
          : `Hello, I'm interested in your listing "${listing.title}" on Garden.`
      )}`
    : null

  const availabilityBadgeClass =
    availabilityStatus === 'available'
      ? getBookingStatusColor('CONFIRMED')
      : availabilityStatus === 'unavailable'
        ? getBookingStatusColor('CANCELLED')
        : availabilityStatus === 'checking'
          ? getBookingStatusColor('PENDING')
          : ''

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left column */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 lg:col-span-2"
          >
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={getListingTypeColor(listing.type)}>
                      {formatListingType(listing.type, locale)}
                    </Badge>
                    {!listing.isActive && isOwner && (
                      <Badge variant="outline" className={getBookingStatusColor('CANCELLED')}>
                        {t.listing.inactive}
                      </Badge>
                    )}
                  </div>
                  <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
                    {listing.title}
                  </h1>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {isOwner && (
                    <div className="flex items-center gap-2 border-r border-border pr-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleActive}
                        disabled={isToggling}
                      >
                        {isToggling ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : listing.isActive ? (
                          t.listing.deactivate
                        ) : (
                          t.listing.activate
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={deleteListing}
                        disabled={isDeleting}
                        className="text-destructive hover:text-destructive"
                      >
                        {isDeleting ? t.common.loading : t.common.delete}
                      </Button>
                    </div>
                  )}
                  <Button
                    variant={isFav ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleToggleFav}
                    className="gap-1.5"
                  >
                    <Heart className={`size-4 ${isFav ? 'fill-current' : ''}`} />
                    {favCount}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare} aria-label={t.listing.share}>
                    <Share2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4 shrink-0" />
                  {listing.location}
                </span>
                {listing.averageRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="size-4 fill-accent text-accent" />
                    <span className="font-medium text-foreground tabular-nums">
                      {listing.averageRating}
                    </span>
                    <span>
                      ({listing.reviewCount} {t.listing.reviews.toLowerCase()})
                    </span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="size-4" />
                  {listing.viewCount} {t.listing.views}
                </span>
              </div>
            </div>

            {/* Gallery */}
            {listing.images.length > 0 ? (
              <div className="space-y-3">
                <div className="group relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      src={listing.images[currentImageIndex]}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  </AnimatePresence>
                  {listing.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentImageIndex(
                            (p) => (p - 1 + listing.images.length) % listing.images.length
                          )
                        }
                        className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-foreground opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                        aria-label="Previous"
                      >
                        <ChevronLeft className="size-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentImageIndex((p) => (p + 1) % listing.images.length)
                        }
                        className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-foreground opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                        aria-label="Next"
                      >
                        <ChevronRight className="size-5" />
                      </button>
                      <div className="absolute bottom-3 right-3 rounded-full bg-card/90 px-2.5 py-1 text-xs tabular-nums text-muted-foreground backdrop-blur-sm">
                        {currentImageIndex + 1} / {listing.images.length}
                      </div>
                    </>
                  )}
                </div>
                {listing.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {listing.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                          idx === currentImageIndex
                            ? 'border-primary opacity-100'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-border bg-muted text-muted-foreground">
                {t.listing.noImage}
              </div>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{t.listing.aboutSpace}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                  {listing.description}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            {listing.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{t.listing.amenities}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {listing.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="size-4 shrink-0 text-primary" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rules & cancellation */}
            {(listing.rules || listing.cancellationPolicy) && (
              <div className="grid gap-6 sm:grid-cols-2">
                {listing.rules && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t.listing.rules}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                        {listing.rules}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {listing.cancellationPolicy && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t.listing.cancellation}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                        {listing.cancellationPolicy}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Star className="size-5 fill-accent text-accent" />
                  {listing.averageRating > 0 ? `${listing.averageRating} · ` : ''}
                  {listing.reviewCount} {t.listing.reviews}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {listing.reviews.length === 0 ? (
                  <p className="text-muted-foreground">{t.listing.noReviews}</p>
                ) : (
                  <div className="space-y-6">
                    {listing.reviews.map((review) => (
                      <article
                        key={review.id}
                        className="border-b border-border pb-6 last:border-0 last:pb-0"
                      >
                        <div className="mb-3 flex items-center gap-3">
                          {review.user.image ? (
                            <img
                              src={review.user.image}
                              alt=""
                              className="size-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                              {(review.user.name || 'U')[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground">
                              {review.user.name || t.listing.anonymous}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`size-3.5 ${
                                      i < review.rating
                                        ? 'fill-accent text-accent'
                                        : 'text-muted-foreground/30'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(review.createdAt, locale)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <h4 className="mb-1 font-medium text-foreground">{review.title}</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {review.comment}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
                {session && <ReviewForm listingId={listing.id} onReviewAdded={fetchListing} />}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right column — booking */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="sticky top-24 shadow-lg border-primary/10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
              <CardHeader className="pb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tabular-nums text-foreground">
                    {formatCurrency(listing.pricePerDay, locale)}
                  </span>
                  <span className="text-muted-foreground">{priceSuffix}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <p className="text-sm font-medium text-foreground">{t.listing.booking}</p>

                <form onSubmit={handleBooking} className="space-y-4">
                  {bookingError && (
                    <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                      {bookingError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="check-in">{t.listing.checkIn}</Label>
                      <Input
                        id="check-in"
                        type="date"
                        required
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        min={today}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="check-out">{t.listing.checkOut}</Label>
                      <Input
                        id="check-out"
                        type="date"
                        required
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        min={checkInDate || today}
                      />
                    </div>
                  </div>

                  {availabilityStatus !== 'idle' && availabilityMessage && (
                    <Badge variant="outline" className={`w-full justify-center py-1.5 ${availabilityBadgeClass}`}>
                      {availabilityStatus === 'checking' && (
                        <Loader2 className="mr-1.5 size-3 animate-spin" />
                      )}
                      {availabilityMessage}
                    </Badge>
                  )}

                  {nights > 0 && (
                    <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-4 text-sm">
                      <p className="text-xs text-muted-foreground">
                        {formatDateRange(checkInDate, checkOutDate, locale)} · {nights}{' '}
                        {t.listing.days}
                      </p>
                      <div className="flex justify-between text-muted-foreground">
                        <span>
                          {formatCurrency(listing.pricePerDay, locale)} × {nights}
                        </span>
                        <span className="tabular-nums text-foreground">
                          {formatCurrency(subtotal, locale)}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>{t.listing.serviceFee}</span>
                        <span className="tabular-nums text-foreground">
                          {formatCurrency(serviceFee, locale)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-2 font-semibold text-foreground">
                        <span>{t.listing.total}</span>
                        <span className="tabular-nums">{formatCurrency(guestTotal, locale)}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="guests">{t.listing.guests}</Label>
                    <Input
                      id="guests"
                      type="number"
                      min={1}
                      required
                      value={numberOfGuests}
                      onChange={(e) => setNumberOfGuests(parseInt(e.target.value, 10) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="special-requests">{t.listing.specialRequests}</Label>
                    <textarea
                      id="special-requests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={2}
                      placeholder={t.listing.optional}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={
                      isBooking ||
                      availabilityStatus === 'checking' ||
                      availabilityStatus === 'unavailable' ||
                      !listing.isActive
                    }
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        {t.common.loading}
                      </>
                    ) : (
                      t.listing.requestBooking
                    )}
                  </Button>
                </form>

                {/* Host */}
                <div className="border-t border-border pt-5">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t.listing.hostedBy}
                  </p>
                  <div className="mb-4 flex items-center gap-3">
                    {listing.landlord.image ? (
                      <img
                        src={listing.landlord.image}
                        alt=""
                        className="size-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-lg font-semibold text-foreground">
                        {(listing.landlord.name || 'H')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate font-medium text-foreground">
                          {listing.landlord.name || t.listing.hostDefault}
                        </p>
                        {listing.landlord.isVerified && (
                          <BadgeCheck
                            className="size-4 shrink-0 text-primary"
                            aria-label={t.listing.verified}
                          />
                        )}
                      </div>
                      {listing.landlord.isVerified && (
                        <p className="text-xs text-muted-foreground">{t.listing.verified}</p>
                      )}
                      {listing.landlord.email && (
                        <p className="truncate text-xs text-muted-foreground">
                          {listing.landlord.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {whatsappUrl && (
                    <Button variant="outline" className="w-full gap-2" asChild>
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <svg viewBox="0 0 24 24" className="size-5 fill-[#25D366]" aria-hidden>
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        {t.listing.whatsapp}
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageShell>
  )
}
