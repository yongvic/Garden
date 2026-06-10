'use client'

import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { ListingCard, type ListingCardData } from '@/components/listing-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { Share2 } from 'lucide-react'
import { motion } from 'motion/react'

type ShareListClientProps = {
  title: string | null
  ownerName: string | null
  ownerImage: string | null
  listings: ListingCardData[]
}

export function ShareListClient({
  title,
  ownerName,
  ownerImage,
  listings,
}: ShareListClientProps) {
  const { t } = useI18n()

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 text-primary mb-2">
            <Share2 className="size-4" />
            <span className="text-sm font-medium">{t.share.title}</span>
          </div>
          <h1 className="font-display text-3xl tracking-tight">
            {title ?? t.share.title}
          </h1>
          {ownerName && (
            <div className="mt-4 flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage src={ownerImage ?? undefined} />
                <AvatarFallback>{ownerName[0]}</AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">
                {t.share.sharedBy} <span className="font-medium text-foreground">{ownerName}</span>
              </p>
            </div>
          )}
        </motion.div>

        {listings.length > 0 ? (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              {listings.length} {t.share.listings}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-20 text-center">
            <p className="text-muted-foreground">{t.share.empty}</p>
            <Link href="/search" className="mt-6 inline-block">
              <Button variant="outline">{t.search.search}</Button>
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  )
}
