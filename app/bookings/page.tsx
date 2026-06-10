'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n/context'
import { formatCurrency, formatDateRange, getBookingStatusColor, formatBookingStatus } from '@/lib/format'
import { motion, AnimatePresence } from 'motion/react'
import { MobileMoneyDialog } from '@/components/payment/mobile-money-dialog'

interface Booking {
  id: string
  bookingNumber: string
  status: string
  checkInDate: string
  checkOutDate: string
  totalPrice: number
  numberOfGuests: number
  paymentStatus: string
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
  const { t, locale } = useI18n()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [paymentTarget, setPaymentTarget] = useState<{ id: string; amount: number } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (status === 'authenticated') fetchBookings()
  }, [status, statusFilter])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const url = statusFilter === 'ALL' ? '/api/bookings' : `/api/bookings?status=${statusFilter}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setBookings(data.bookings || data)
    } catch {
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl tracking-tight">{t.bookings.title}</h1>
        </motion.div>

        <motion.div 
          className="mt-6 flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {statuses.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? 'default' : 'outline'}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'ALL' ? t.bookings.all : formatBookingStatus(s, locale)}
            </Button>
          ))}
        </motion.div>

        {isLoading ? (
          <div className="mt-10 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-16 rounded-2xl border border-dashed border-border py-20 text-center"
          >
            <p className="text-muted-foreground">{t.bookings.empty}</p>
            <Link href="/search" className="mt-6 inline-block">
              <Button variant="outline" className="transition-transform active:scale-95">{t.bookings.emptyCta}</Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            className="mt-10 space-y-4"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
          >
            <AnimatePresence mode="popLayout">
              {bookings.map((booking) => (
                <motion.article
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center transition-colors hover:border-primary/30 hover:shadow-sm"
                >
                  {booking.listing.images[0] && (
                    <img
                      src={booking.listing.images[0]}
                      alt=""
                      className="h-24 w-full rounded-xl object-cover sm:w-32 transition-transform group-hover:scale-[1.02]"
                    />
                  )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold truncate">{booking.listing.title}</h2>
                    <Badge variant="outline" className={getBookingStatusColor(booking.status)}>
                      {formatBookingStatus(booking.status, locale)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{booking.listing.location}</p>
                  <p className="mt-2 text-sm">
                    {formatDateRange(booking.checkInDate, booking.checkOutDate, locale)}
                    {' · '}
                    <span className="font-medium tabular-nums">{formatCurrency(booking.totalPrice, locale)}</span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                  <Link href={`/bookings/${booking.id}`}>
                    <Button variant="outline" size="sm" className="transition-transform active:scale-95">{t.bookings.detail}</Button>
                  </Link>
                  {booking.status === 'PENDING' && booking.paymentStatus === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => setPaymentTarget({ id: booking.id, amount: booking.totalPrice })}
                      className="transition-transform active:scale-95"
                    >
                      {t.bookings.pay}
                    </Button>
                  )}
                </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <MobileMoneyDialog
        bookingId={paymentTarget?.id ?? null}
        amount={paymentTarget?.amount ?? 0}
        open={!!paymentTarget}
        onOpenChange={(open) => { if (!open) setPaymentTarget(null) }}
        onSuccess={fetchBookings}
      />
    </PageShell>
  )
}
