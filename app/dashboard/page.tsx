'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n/context'
import { Calendar, Search, Clock, TrendingUp, Heart } from 'lucide-react'
import { motion } from 'motion/react'

interface DashboardStats {
  user: { id: string; name: string | null; email: string | null; role: string }
  bookingStats: { total: number; pending: number; confirmed: number; completed: number }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useI18n()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (status === 'authenticated') {
      const role = session?.user?.role
      if (role === 'LANDLORD') { router.push('/landlord/dashboard'); return }
      if (role === 'ADMIN') { router.push('/admin/dashboard'); return }

      fetch('/api/users/me')
        .then((r) => r.json())
        .then((data) => {
          setStats({
            user: { id: data.id, name: data.name, email: data.email, role: data.role },
            bookingStats: data.bookingStats,
          })
        })
        .catch(() => {})
        .finally(() => setIsLoading(false))
    }
  }, [status, session, router])

  if (isLoading || !stats) {
    return (
      <PageShell>
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        </div>
      </PageShell>
    )
  }

  const statCards = [
    { label: 'Total', value: stats.bookingStats.total, icon: Calendar },
    { label: t.bookings.status, value: stats.bookingStats.confirmed, icon: TrendingUp },
    { label: 'Pending', value: stats.bookingStats.pending, icon: Clock },
    { label: 'Done', value: stats.bookingStats.completed, icon: TrendingUp },
  ]

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-8"
        >
          <h1 className="font-display text-3xl tracking-tight">
            {t.auth.signInTitle}, {stats.user.name?.split(' ')[0] ?? 'there'}
          </h1>
          <p className="mt-2 text-muted-foreground">{t.hero.subtitle.slice(0, 100)}…</p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 gap-4 md:grid-cols-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
        >
          {statCards.map((card) => (
            <motion.div key={card.label} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <Card>
                <CardContent className="pt-6">
                  <card.icon className="mb-3 size-5 text-primary" strokeWidth={1.75} />
                  <p className="text-3xl font-semibold tabular-nums">{card.value}</p>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="grid gap-6 md:grid-cols-3"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
          }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <Link href="/bookings">
              <Card className="h-full transition-colors hover:border-primary/30 hover:shadow-md">
                <CardHeader>
                  <Calendar className="size-5 text-primary mb-2" />
                  <CardTitle className="text-lg">{t.bookings.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t.bookings.detail}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <Link href="/search">
              <Card className="h-full transition-colors hover:border-primary/30 hover:shadow-md">
                <CardHeader>
                  <Search className="size-5 text-primary mb-2" />
                  <CardTitle className="text-lg">{t.nav.explore}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t.search.title}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <Link href="/favorites">
              <Card className="h-full transition-colors hover:border-primary/30 hover:shadow-md">
                <CardHeader>
                  <Heart className="size-5 text-primary mb-2" />
                  <CardTitle className="text-lg">{t.favorites.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t.favorites.emptyCta}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
          <CardHeader>
            <CardTitle>{t.nav.profile}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">{t.auth.name}</p>
              <p className="font-medium">{stats.user.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t.auth.email}</p>
              <p className="font-medium">{stats.user.email ?? '—'}</p>
            </div>
            <div className="flex items-end">
              <Link href="/profile">
                <Button variant="outline" size="sm" className="transition-transform active:scale-95">{t.common.edit}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </PageShell>
  )
}
