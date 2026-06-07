'use client'

import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { PageHeader } from '@/components/dashboard/page-header'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n/context'
import { formatCurrency, formatBookingStatus, getBookingStatusColor } from '@/lib/format'
import {
  Users, Home, Calendar, TrendingUp,
  Activity, Clock, LayoutGrid,
} from 'lucide-react'
import { motion } from 'motion/react'

type AdminStats = Awaited<ReturnType<typeof import('@/lib/admin-stats').getAdminStats>>

type AdminDashboardClientProps = {
  stats: AdminStats
}

export function AdminDashboardClient({ stats }: AdminDashboardClientProps) {
  const { t, locale } = useI18n()

  const revenueGrowth =
    stats.revenue.lastMonth > 0
      ? Math.round(
          ((stats.revenue.thisMonth - stats.revenue.lastMonth) / stats.revenue.lastMonth) * 100
        )
      : 0

  const statusItems = [
    { key: 'PENDING' as const, count: stats.bookings.pending, color: 'bg-amber-500' },
    { key: 'CONFIRMED' as const, count: stats.bookings.confirmed, color: 'bg-emerald-500' },
    { key: 'IN_PROGRESS' as const, count: stats.bookings.inProgress, color: 'bg-blue-500' },
    { key: 'COMPLETED' as const, count: stats.bookings.completed, color: 'bg-primary' },
    { key: 'CANCELLED' as const, count: stats.bookings.cancelled, color: 'bg-red-500' },
  ]

  const quickActions = [
    {
      label: t.admin.manageAllListings,
      desc: t.admin.manageAllListingsDesc,
      href: '/admin/listings',
      icon: Home,
    },
    {
      label: t.admin.viewBookings,
      desc: t.admin.viewBookingsDesc,
      href: '/bookings',
      icon: Calendar,
    },
    {
      label: t.nav.profile,
      desc: t.landlord.accountSettings,
      href: '/profile',
      icon: Users,
    },
  ]

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          title={t.admin.dashboardTitle}
          description={t.admin.dashboardSubtitle}
          action={{ label: t.admin.manageListings, href: '/admin/listings' }}
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
              icon={Users}
              value={stats.users.total}
              label={t.admin.users}
              sub={`${stats.users.landlords} ${t.admin.hosts} · ${stats.users.customers} clients · ${stats.users.admins} admins`}
              badge={{ text: `${stats.users.landlords} ${t.admin.hosts}` }}
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <StatCard
              icon={Home}
              value={stats.listings.total}
              label={t.admin.listings}
              sub={`${stats.listings.rooms} · ${stats.listings.equipment} · ${stats.listings.spaces}`}
              badge={{ text: `${stats.listings.active} ${t.admin.active}`, positive: true }}
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <StatCard
              icon={Calendar}
              value={stats.bookings.total}
              label={t.admin.bookings}
              sub={`${stats.bookings.completed} ${t.landlord.completed} · ${stats.bookings.cancelled} ${t.admin.statusLabels.CANCELLED.toLowerCase()}`}
              badge={
                stats.bookings.pending > 0
                  ? { text: `${stats.bookings.pending} ${t.admin.statusLabels.PENDING.toLowerCase()}`, positive: false }
                  : undefined
              }
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <StatCard
              icon={TrendingUp}
              value={formatCurrency(stats.revenue.total, locale)}
              label={t.admin.revenue}
              sub={`${t.landlord.thisMonth}: ${formatCurrency(stats.revenue.thisMonth, locale)}`}
              badge={
                revenueGrowth !== 0
                  ? { text: `${Math.abs(revenueGrowth)}%`, positive: revenueGrowth >= 0 }
                  : undefined
              }
            />
          </motion.div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
          }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Activity className="size-4 text-muted-foreground" />
                {t.admin.bookingStatuses}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusItems.map((item) => {
                const pct =
                  stats.bookings.total > 0
                    ? Math.round((item.count / stats.bookings.total) * 100)
                    : 0
                return (
                  <div key={item.key}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.admin.statusLabels[item.key]}</span>
                      <span className="font-medium tabular-nums">
                        {item.count}{' '}
                        <span className="text-xs text-muted-foreground">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Clock className="size-4 text-muted-foreground" />
                {t.admin.recentBookings}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentBookings.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">{t.admin.noBookings}</p>
              ) : (
                <div className="divide-y divide-border">
                  {stats.recentBookings.slice(0, 6).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{booking.listing?.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {booking.customer?.name ?? '—'}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-sm font-medium tabular-nums">
                          {formatCurrency(booking.totalPrice, locale)}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs ${getBookingStatusColor(booking.status)}`}
                        >
                          {formatBookingStatus(booking.status, locale)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl tracking-tight">
            <LayoutGrid className="size-5 text-primary" />
            {t.admin.quickActions}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="h-full transition-colors hover:border-primary/30 hover:shadow-md">
                  <CardContent className="pt-6">
                    <action.icon className="mb-3 size-5 text-primary" strokeWidth={1.75} />
                    <p className="font-medium">{action.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{action.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </PageShell>
  )
}
