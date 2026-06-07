'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { PageHeader } from '@/components/dashboard/page-header'
import { EmptyState } from '@/components/dashboard/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n/context'
import {
  formatCurrency,
  formatBookingStatus,
  getBookingStatusColor,
  formatDateShort,
} from '@/lib/format'
import { toast } from 'sonner'
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Home,
  CalendarDays,
  Users,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface Booking {
  id: string
  bookingNumber: string
  status: string
  totalPrice: number
  checkInDate: string
  checkOutDate: string
  numberOfGuests: number
  listing: { id: string; title: string; images: string[]; location: string }
  customer: { id: string; name: string | null; email: string | null; image: string | null }
}

const STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export default function LandlordBookingsPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const { t, locale } = useI18n()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (authStatus === 'authenticated') {
      const role = (session?.user as { role?: string })?.role
      if (role !== 'LANDLORD' && role !== 'ADMIN') {
        router.push('/dashboard')
        return
      }
    }
  }, [authStatus, session, router])

  useEffect(() => {
    if (authStatus !== 'authenticated') return
    setIsLoading(true)
    const url =
      statusFilter === 'ALL'
        ? '/api/landlord/bookings?limit=50'
        : `/api/landlord/bookings?status=${statusFilter}&limit=50`
    fetch(url)
      .then((r) => r.json())
      .then((data) => setBookings(data.bookings ?? []))
      .catch(() => toast.error(t.common.error))
      .finally(() => setIsLoading(false))
  }, [authStatus, statusFilter, t.common.error])

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      )
      toast.success(t.common.success)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <PageHeader
            title={t.landlord.bookingsTitle}
            description={t.landlord.bookingsSubtitle}
            backHref="/landlord/dashboard"
            backLabel={t.nav.dashboard}
          />
        </motion.div>

        <motion.div 
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {STATUSES.map((s) => (
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
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <EmptyState icon={Clock} title={t.landlord.noBookings} />
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-4"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
          >
            <AnimatePresence mode="popLayout">
              {bookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="transition-colors hover:border-primary/20 hover:shadow-sm">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    {booking.listing.images?.[0] ? (
                      <img
                        src={booking.listing.images[0]}
                        alt=""
                        className="size-16 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Home className="size-6 text-primary" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="truncate font-semibold">{booking.listing.title}</h3>
                        <Badge
                          variant="outline"
                          className={getBookingStatusColor(booking.status)}
                        >
                          {formatBookingStatus(booking.status, locale)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.customer.name ?? '—'}
                        {booking.customer.email && (
                          <span className="text-muted-foreground/70">
                            {' '}
                            · {booking.customer.email}
                          </span>
                        )}
                      </p>
                      <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3.5" />
                          {formatDateShort(booking.checkInDate, locale)} →{' '}
                          {formatDateShort(booking.checkOutDate, locale)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="size-3.5" />
                          {booking.numberOfGuests}{' '}
                          {booking.numberOfGuests > 1
                            ? t.bookings.guestsPlural
                            : t.bookings.guests}
                        </span>
                      </p>
                      <p className="font-semibold text-primary">
                        {formatCurrency(booking.totalPrice, locale)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Link href={`/bookings/${booking.id}`}>
                        <Button size="sm" variant="outline" className="gap-1 transition-transform active:scale-95">
                          <Eye className="size-4" />
                          {t.bookings.detail}
                        </Button>
                      </Link>
                      {booking.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                            disabled={updatingId === booking.id}
                            className="gap-1 transition-transform active:scale-95"
                          >
                            <CheckCircle className="size-4" />
                            {updatingId === booking.id ? '…' : t.landlord.confirm}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                            disabled={updatingId === booking.id}
                            className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive transition-transform active:scale-95"
                          >
                            <XCircle className="size-4" />
                            {updatingId === booking.id ? '…' : t.landlord.reject}
                          </Button>
                        </>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                          disabled={updatingId === booking.id}
                          className="gap-1 transition-transform active:scale-95"
                        >
                          <CheckCircle className="size-4" />
                          {updatingId === booking.id ? '…' : t.landlord.markComplete}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </PageShell>
  )
}
