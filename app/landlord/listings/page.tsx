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
import { formatCurrency, formatListingType, getListingTypeColor } from '@/lib/format'
import { toast } from 'sonner'
import { Plus, Eye, ToggleLeft, ToggleRight, Trash2, Home, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface Listing {
  id: string
  title: string
  type: string
  location: string
  pricePerDay: number
  isActive: boolean
  images: string[]
  _count?: { bookings: number; reviews: number }
}

export default function LandlordListingsPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const { t, locale } = useI18n()
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
      fetch('/api/listings?limit=100&mine=true')
        .then((r) => r.json())
        .then((data) => setListings(data.listings ?? []))
        .catch(() => toast.error(t.common.error))
        .finally(() => setIsLoading(false))
    }
  }, [authStatus, session, router, t.common.error])

  const toggleActive = async (id: string, current: boolean) => {
    setTogglingId(id)
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, isActive: !current } : l)))
      toast.success(current ? t.listing.listingDeactivated : t.listing.listingActivated)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setTogglingId(null)
    }
  }

  const deleteListing = async (id: string) => {
    if (!confirm(t.listing.confirmDelete)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setListings((prev) => prev.filter((l) => l.id !== id))
      toast.success(t.common.success)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setDeletingId(null)
    }
  }

  const listingsLabel =
    listings.length === 1 ? t.landlord.listingsCount : t.landlord.listingsCountPlural

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <PageHeader
            title={t.landlord.listingsTitle}
            description={`${listings.length} ${listingsLabel}`}
            backHref="/landlord/dashboard"
            backLabel={t.nav.dashboard}
            action={{ label: t.landlord.newListing, href: '/landlord/listings/create' }}
          />
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <EmptyState
              icon={Home}
              title={t.landlord.noListings}
              action={{ label: t.landlord.createListing, href: '/landlord/listings/create' }}
            />
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
          >
            <AnimatePresence mode="popLayout">
              {listings.map((listing) => (
                <motion.div
                  key={listing.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={`overflow-hidden transition-colors hover:border-primary/20 hover:shadow-md ${!listing.isActive ? 'opacity-75' : ''}`}
                  >
                <div className="relative h-40 bg-muted">
                  {listing.images?.[0] ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <Home className="size-10 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3">
                    <Badge variant="outline" className={getListingTypeColor(listing.type)}>
                      {formatListingType(listing.type, locale)}
                    </Badge>
                  </div>
                  <div className="absolute right-3 top-3">
                    <Badge
                      variant={listing.isActive ? 'default' : 'secondary'}
                      className={
                        listing.isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                          : ''
                      }
                    >
                      {listing.isActive ? 'Active' : t.listing.inactive}
                    </Badge>
                  </div>
                </div>

                <CardContent className="space-y-3 p-5">
                  <div>
                    <h3 className="truncate font-semibold">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground">{listing.location}</p>
                  </div>
                  <p className="font-semibold text-primary">
                    {formatCurrency(listing.pricePerDay, locale)}
                    <span className="text-xs font-normal text-muted-foreground">
                      {t.search.perDay}
                    </span>
                  </p>

                  <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                    <Link href={`/listings/${listing.id}`} target="_blank" className="flex-1 min-w-[7rem]">
                      <Button size="sm" variant="outline" className="w-full gap-1 text-xs transition-transform active:scale-95">
                        <Eye className="size-3.5" />
                        {t.bookings.viewListing}
                      </Button>
                    </Link>
                    <Link href={`/landlord/listings/${listing.id}/calendar`} className="flex-1 min-w-[7rem]">
                      <Button size="sm" variant="outline" className="w-full gap-1 text-xs transition-transform active:scale-95">
                        <Calendar className="size-3.5" />
                        {t.calendar.title}
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(listing.id, listing.isActive)}
                      disabled={togglingId === listing.id}
                      className="gap-1 text-xs transition-transform active:scale-95"
                    >
                      {listing.isActive ? (
                        <>
                          <ToggleRight className="size-3.5" />
                          {t.listing.deactivate}
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="size-3.5" />
                          {t.listing.activate}
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteListing(listing.id)}
                      disabled={deletingId === listing.id}
                      className="gap-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive transition-transform active:scale-95"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
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
