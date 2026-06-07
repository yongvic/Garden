'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { PageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n/context'
import {
  formatCurrency, formatDateShort, formatBookingStatus,
  getBookingStatusColor, daysBetween, calculateGuestTotal,
} from '@/lib/format'
import { toast } from 'sonner'
import {
  MapPin, Calendar, Users, CheckCircle, Clock, XCircle,
  AlertTriangle, Home, CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

interface BookingDetail {
  id: string; bookingNumber: string; status: string
  checkInDate: string; checkOutDate: string; numberOfGuests: number
  specialRequests: string | null; totalPrice: number; paymentStatus: string
  listing: {
    id: string; title: string; location: string; images: string[]
    pricePerDay: number; landlordId: string
    landlord: { id: string; name: string | null; image: string | null; email: string | null }
  }
  customer: { id: string; name: string | null; email: string | null }
}

function StatusTimeline({ status, t }: { status: string; t: ReturnType<typeof useI18n>['t'] }) {
  const steps = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] as const
  const idx = steps.indexOf(status as typeof steps[number])
  const icons = { PENDING: Clock, CONFIRMED: CheckCircle, IN_PROGRESS: Calendar, COMPLETED: CheckCircle }

  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <XCircle className="size-5 text-destructive shrink-0" />
        <p className="text-sm font-medium text-destructive">{t.bookings.cancelled}</p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const done = i <= idx
        const active = i === idx
        const Icon = icons[step]
        return (
          <div key={step} className="flex flex-1 items-center">
            {i > 0 && <div className={cn('h-0.5 flex-1', done ? 'bg-primary' : 'bg-border')} />}
            <div className="flex flex-col items-center gap-1 px-1">
              <div className={cn(
                'flex size-8 items-center justify-center rounded-full',
                done ? active ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                <Icon className="size-4" />
              </div>
              <span className={cn('text-[10px] whitespace-nowrap', done ? 'text-foreground' : 'text-muted-foreground')}>
                {t.bookings.timeline[step]}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()
  const { t, locale } = useI18n()
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isPaying, setIsPaying] = useState(false)

  useEffect(() => {
    if (authStatus === 'unauthenticated') { router.push('/auth/signin'); return }
    if (authStatus === 'authenticated' && params.id) {
      fetch(`/api/bookings/${params.id}`)
        .then(async (r) => { if (!r.ok) throw new Error((await r.json()).error); return r.json() })
        .then(setBooking)
        .catch((e) => toast.error(e.message))
        .finally(() => setIsLoading(false))
    }
  }, [authStatus, params.id, router])

  const handleCancel = async () => {
    if (!booking) return
    setIsCancelling(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setBooking((prev) => prev ? { ...prev, status: 'CANCELLED' } : prev)
      toast.success(t.bookings.cancelSuccess)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setIsCancelling(false)
    }
  }

  const handlePay = async () => {
    if (!booking) return
    setIsPaying(true)
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.url) window.location.href = data.url
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setIsPaying(false)
    }
  }

  if (isLoading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </PageShell>
    )
  }

  if (!booking) {
    return (
      <PageShell>
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <AlertTriangle className="mx-auto mb-4 size-10 text-muted-foreground" />
          <p className="text-muted-foreground">{t.bookings.notFound}</p>
          <Link href="/bookings" className="mt-6 inline-block">
            <Button variant="outline">{t.bookings.back}</Button>
          </Link>
        </div>
      </PageShell>
    )
  }

  const nights = daysBetween(booking.checkInDate, booking.checkOutDate)
  const canCancel = ['PENDING', 'CONFIRMED'].includes(booking.status) && booking.customer.id === session?.user?.id
  const canPay = booking.status === 'PENDING' && booking.paymentStatus === 'pending' && booking.customer.id === session?.user?.id
  const guestTotal = calculateGuestTotal(booking.totalPrice)

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-6">
        <PageHeader title={booking.listing.title} backHref="/bookings" backLabel={t.bookings.back} />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="pt-6 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t.bookings.reference} #{booking.bookingNumber}</p>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4" />{booking.listing.location}
                </div>
              </div>
              <Badge variant="outline" className={getBookingStatusColor(booking.status)}>
                {formatBookingStatus(booking.status, locale)}
              </Badge>
            </div>
            <StatusTimeline status={booking.status} t={t} />
          </CardContent>
        </Card>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          <motion.div 
            className="md:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="size-4" /> {t.bookings.dates}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground">{t.bookings.checkIn}</p>
                    <p className="mt-1 font-semibold">{formatDateShort(booking.checkInDate, locale)}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground">{t.bookings.checkOut}</p>
                    <p className="mt-1 font-semibold">{formatDateShort(booking.checkOutDate, locale)}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-6 text-sm text-muted-foreground">
                  <span>{t.bookings.duration}: <strong className="text-foreground">{nights} {nights > 1 ? t.bookings.nightsPlural : t.bookings.nights}</strong></span>
                  <span className="flex items-center gap-1">
                    <Users className="size-4" />
                    {booking.numberOfGuests} {booking.numberOfGuests > 1 ? t.bookings.guestsPlural : t.bookings.guests}
                  </span>
                </div>
              </CardContent>
            </Card>

            {booking.specialRequests && (
              <Card>
                <CardHeader><CardTitle className="text-base">{t.listing.specialRequests}</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{booking.specialRequests}</p></CardContent>
              </Card>
            )}

            {booking.listing.images[0] && (
              <Card className="overflow-hidden">
                <img src={booking.listing.images[0]} alt="" className="h-48 w-full object-cover" />
                <CardContent className="pt-4">
                  <Link href={`/listings/${booking.listing.id}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Home className="size-4" /> {t.bookings.viewListing}
                  </Link>
                </CardContent>
              </Card>
            )}
          </motion.div>

          <motion.div 
            className="space-y-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader><CardTitle className="text-base">{t.bookings.summary}</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>{formatCurrency(booking.listing.pricePerDay, locale)} × {nights}j</span>
                  <span>{formatCurrency(booking.totalPrice, locale)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t.listing.serviceFee}</span>
                  <span>{formatCurrency(guestTotal - booking.totalPrice, locale)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-semibold">
                  <span>{t.listing.total}</span>
                  <span className="text-lg tabular-nums">{formatCurrency(guestTotal, locale)}</span>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  {t.bookings.payment}: {booking.paymentStatus === 'pending' ? t.bookings.paymentPending : t.bookings.paymentDone}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">{t.listing.hostedBy}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {booking.listing.landlord.image ? (
                    <img src={booking.listing.landlord.image} alt="" className="size-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {(booking.listing.landlord.name ?? 'H')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{booking.listing.landlord.name ?? t.listing.hostDefault}</p>
                    <p className="text-xs text-muted-foreground">{booking.listing.landlord.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {canPay && (
              <Button className="w-full gap-2" onClick={handlePay} disabled={isPaying}>
                <CreditCard className="size-4" />
                {isPaying ? t.common.loading : t.bookings.pay}
              </Button>
            )}

            {canCancel && booking.status !== 'CANCELLED' && (
              <Card className="border-destructive/20">
                <CardContent className="pt-6">
                  <p className="mb-3 text-sm text-muted-foreground">{t.bookings.cancelHint}</p>
                  <Button variant="outline" className="w-full border-destructive/40 text-destructive hover:bg-destructive/5" onClick={handleCancel} disabled={isCancelling}>
                    {isCancelling ? t.bookings.cancelling : t.bookings.cancel}
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </PageShell>
  )
}
