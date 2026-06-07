'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { PageHeader } from '@/components/dashboard/page-header'
import { StatCard } from '@/components/dashboard/stat-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n/context'
import { adminTableLabels } from '@/lib/marketing-pages'
import { formatCurrency, formatListingType, getListingTypeColor } from '@/lib/format'
import { Home, Eye, Trash2, ToggleLeft, ToggleRight, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface Listing {
  id: string
  title: string
  type: string
  location: string
  pricePerDay: number
  isActive: boolean
  landlord: { name: string | null }
}

export default function AdminListingsPage() {
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()
  const { t, locale } = useI18n()
  const labels = adminTableLabels[locale]
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const limit = 10
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (authStatus === 'authenticated') {
      const role = session?.user?.role
      if (role !== 'ADMIN') {
        router.push('/dashboard')
      }
    }
  }, [authStatus, session, router])

  useEffect(() => {
    if (authStatus !== 'authenticated') return
    const fetchListings = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/listings?page=${page}&limit=${limit}`)
        const data = await res.json()
        const items: Listing[] = data.listings ?? []
        setListings(items)
        setTotalCount(data.pagination?.total ?? 0)
        setTotalPages(Math.ceil((data.pagination?.total ?? 0) / limit) || 1)
        setActiveCount(items.filter((l) => l.isActive).length)
      } catch {
        setError(t.auth.errors.generic)
      } finally {
        setIsLoading(false)
      }
    }
    fetchListings()
  }, [authStatus, page, t.auth.errors.generic])

  const handleDelete = async (id: string) => {
    if (!confirm(t.admin.confirmDelete)) return
    setDeletingId(id)
    setError('')
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setListings((prev) => prev.filter((l) => l.id !== id))
      setTotalCount((c) => c - 1)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setTogglingId(id)
    setError('')
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, isActive: !currentStatus } : l))
      )
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <PageHeader
            title={t.admin.listingsTitle}
            description={t.admin.manageAllListingsDesc}
            backHref="/admin/dashboard"
            backLabel={t.admin.dashboardTitle}
            action={{ label: t.admin.createListing, href: '/admin/listings/create' }}
          />
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 gap-4 md:grid-cols-3"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <StatCard icon={Home} value={totalCount} label={t.admin.listings} />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <StatCard
              icon={CheckCircle}
              value={activeCount}
              label={labels.active}
              badge={{ text: t.admin.active, positive: true }}
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="col-span-2 md:col-span-1">
            <StatCard
              icon={Home}
              value={totalCount - activeCount}
              label={t.listing.inactive}
            />
          </motion.div>
        </motion.div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden py-0">
            {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">{labels.title}</TableHead>
                    <TableHead className="px-6">{labels.type}</TableHead>
                    <TableHead className="px-6">{t.admin.host}</TableHead>
                    <TableHead className="px-6">{labels.pricePerDay}</TableHead>
                    <TableHead className="px-6">{labels.status}</TableHead>
                    <TableHead className="px-6 text-right">{labels.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {listings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                          {labels.noResults}
                        </TableCell>
                      </TableRow>
                    ) : (
                      listings.map((listing) => (
                        <motion.tr
                          key={listing.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${!listing.isActive ? 'opacity-60' : ''}`}
                        >
                          <TableCell className="px-6">
                          <p className="max-w-[200px] truncate font-medium">{listing.title}</p>
                          <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                            {listing.location}
                          </p>
                        </TableCell>
                        <TableCell className="px-6">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs ${getListingTypeColor(listing.type)}`}
                          >
                            {formatListingType(listing.type, locale)}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 text-muted-foreground">
                          {listing.landlord.name ?? '—'}
                        </TableCell>
                        <TableCell className="px-6 font-medium tabular-nums">
                          {formatCurrency(listing.pricePerDay, locale)}
                        </TableCell>
                        <TableCell className="px-6">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs ${
                              listing.isActive
                                ? 'border-emerald-200 bg-emerald-100 text-emerald-800'
                                : 'border-red-200 bg-red-100 text-red-800'
                            }`}
                          >
                            {listing.isActive ? labels.active : t.listing.inactive}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/listings/${listing.id}`} target="_blank">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="size-8 p-0"
                                title={labels.view}
                              >
                                <Eye className="size-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleActive(listing.id, listing.isActive)}
                              disabled={togglingId === listing.id}
                              className="size-8 p-0"
                              title={listing.isActive ? t.listing.deactivate : t.listing.activate}
                            >
                              {listing.isActive ? (
                                <ToggleRight className="size-4" />
                              ) : (
                                <ToggleLeft className="size-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(listing.id)}
                              disabled={deletingId === listing.id}
                              className="size-8 p-0 text-destructive hover:text-destructive"
                              title={t.common.delete}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-6 py-4">
                  <p className="text-sm text-muted-foreground">
                    {labels.page} {page} {labels.of} {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || isLoading}
                    >
                      <ArrowLeft className="mr-1 size-4" />
                      {labels.previous}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || isLoading}
                    >
                      {labels.next}
                      <ArrowRight className="ml-1 size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
        </motion.div>
      </div>
    </PageShell>
  )
}
