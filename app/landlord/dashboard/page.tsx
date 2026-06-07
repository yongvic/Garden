'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { PageHeader } from '@/components/dashboard/page-header'
import { StatCard } from '@/components/dashboard/stat-card'
import { EmptyState } from '@/components/dashboard/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n/context'
import { motion } from 'motion/react'
import {
  formatCurrency,
  formatBookingStatus,
  getBookingStatusColor,
  formatDateShort,
} from '@/lib/format'
import {
  Home,
  Calendar,
  TrendingUp,
  Clock,
  Plus,
  CheckCircle,
  Eye,
  ClipboardList,
  User,
  AlertTriangle,
} from 'lucide-react'

interface LandlordStats {
  listings: { total: number; active: number }
  bookings: { total: number; pending: number; confirmed: number; completed: number }
  revenue: { total: number; thisMonth: number; lastMonth: number }
  occupancyRate: number
}

interface RecentBooking {
  id: string
  bookingNumber: string
  status: string
  totalPrice: number
  checkInDate: string
  checkOutDate: string
  listing: { title: string; images: string[] }
  customer: { name: string | null; image: string | null }
}

export default function LandlordDashboardPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const { t, locale } = useI18n()
  const [stats, setStats] = useState<LandlordStats | null>(null)
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
      Promise.all([
        fetch('/api/landlord/stats').then((r) => r.json()),
        fetch('/api/landlord/bookings?limit=5').then((r) => r.json()),
      ])
        .then(([statsData, bookingsData]) => {
          setStats(statsData)
          setRecentBookings(bookingsData.bookings ?? [])
        })
        .catch(console.error)
        .finally(() => setIsLoading(false))
    }
  }, [authStatus, session, router])

  if (isLoading || !stats) {
    return (
      <PageShell>
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </PageShell>
    )
  }

  const revenueGrowth =
    stats.revenue.lastMonth > 0
      ? Math.round(
          ((stats.revenue.thisMonth - stats.revenue.lastMonth) / stats.revenue.lastMonth) * 100
        )
      : 0

  const quickActions = [
    {
      label: t.landlord.myListings,
      desc: t.landlord.manageSpaces,
      href: '/landlord/listings',
      icon: Home,
    },
    {
      label: t.landlord.bookingsReceived,
      desc: t.landlord.confirmBookings,
      href: '/landlord/bookings',
      icon: ClipboardList,
    },
    {
      label: t.landlord.createListing,
      desc: t.landlord.addSpace,
      href: '/landlord/listings/create',
      icon: Plus,
    },
    {
      label: t.nav.profile,
      desc: t.landlord.accountSettings,
      href: '/profile',
      icon: User,
    },
  ]

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          title={t.landlord.dashboardTitle}
          description={t.landlord.dashboardSubtitle}
          action={{ label: t.landlord.newListing, href: '/landlord/listings/create' }}
        />

        <motion.div 
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <StatCard
              label={t.landlord.totalRevenue}
              value={formatCurrency(stats.revenue.total, locale)}
              sub={`${t.landlord.thisMonth} : ${formatCurrency(stats.revenue.thisMonth, locale)}`}
              icon={TrendingUp}
              badge={
                revenueGrowth !== 0
                  ? {
                      text: `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth}%`,
                      positive: revenueGrowth >= 0,
                    }
                  : undefined
              }
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <StatCard
              label={t.landlord.activeListings}
              value={stats.listings.active}
              sub={`${stats.listings.total} ${t.landlord.totalListings}`}
              icon={Home}
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <StatCard
              label={t.landlord.bookingsReceived}
              value={stats.bookings.total}
              sub={`${stats.bookings.pending} ${t.landlord.pendingToProcess}`}
              icon={Calendar}
              badge={
                stats.bookings.pending > 0
                  ? { text: `${stats.bookings.pending} ${t.landlord.pendingToProcess}`, positive: false }
                  : undefined
              }
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <StatCard
              label={t.landlord.occupancyRate}
              value={`${stats.occupancyRate}%`}
              sub={`${stats.bookings.completed} ${t.landlord.completed}`}
              icon={CheckCircle}
            />
          </motion.div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="size-4 text-muted-foreground" />
                {t.landlord.recentBookings}
              </CardTitle>
              <Link
                href="/landlord/bookings"
                className="text-sm text-primary transition-colors hover:text-primary/80"
              >
                {t.landlord.viewAll} →
              </Link>
            </CardHeader>
            <CardContent>
              {recentBookings.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title={t.landlord.noBookings}
                  action={{ label: t.landlord.createFirst, href: '/landlord/listings/create' }}
                />
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <Link key={booking.id} href={`/bookings/${booking.id}`}>
                      <div className="group flex cursor-pointer items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:border-primary/20 hover:bg-muted/40">
                        {booking.listing.images?.[0] ? (
                          <img
                            src={booking.listing.images[0]}
                            alt=""
                            className="size-12 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Home className="size-5 text-primary" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{booking.listing.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {booking.customer.name ?? '—'} · {formatDateShort(booking.checkInDate, locale)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="hidden font-mono text-sm sm:block">
                            {formatCurrency(booking.totalPrice, locale)}
                          </span>
                          <Badge
                            variant="outline"
                            className={getBookingStatusColor(booking.status)}
                          >
                            {formatBookingStatus(booking.status, locale)}
                          </Badge>
                          <Eye className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="px-1 font-semibold">{t.landlord.quickActions}</h2>
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="transition-colors hover:border-primary/20">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <action.icon className="size-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {stats.bookings.pending > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="flex items-start gap-3 p-5">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      {stats.bookings.pending}{' '}
                      {stats.bookings.pending > 1
                        ? t.landlord.pendingAlertPlural
                        : t.landlord.pendingAlert}
                    </p>
                    <p className="mt-1 text-xs text-amber-700">{t.landlord.pendingAlertHint}</p>
                    <Link href="/landlord/bookings?status=PENDING">
                      <Button variant="link" className="mt-2 h-auto p-0 text-amber-800">
                        {t.landlord.processNow} →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
