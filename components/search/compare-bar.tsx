'use client'

import Link from 'next/link'
import { X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { motion, AnimatePresence } from 'motion/react'
import type { ListingCardData } from '@/components/listing-card'

type CompareBarProps = {
  selected: ListingCardData[]
  onRemove: (id: string) => void
  onClear: () => void
}

export function CompareBar({ selected, onRemove, onClear }: CompareBarProps) {
  const { t } = useI18n()

  if (selected.length === 0) return null

  const canCompare = selected.length >= 2
  const ids = selected.map((l) => l.id).join(',')

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur-md shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.15)]"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center gap-3 overflow-x-auto">
            {selected.map((listing) => (
              <div
                key={listing.id}
                className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2"
              >
                {listing.images[0] && (
                  <img
                    src={listing.images[0]}
                    alt=""
                    className="size-8 rounded-lg object-cover"
                  />
                )}
                <span className="max-w-[120px] truncate text-sm font-medium">
                  {listing.title}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(listing.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>

          <p className="hidden text-sm text-muted-foreground sm:block">
            {selected.length} {t.search.compareSelected}
          </p>

          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClear}>
              {t.search.clearCompare}
            </Button>
            {canCompare ? (
              <Link href={`/search/compare?ids=${ids}`}>
                <Button size="sm">
                  {t.search.viewCompare}
                  <ArrowRight className="ml-1 size-4" />
                </Button>
              </Link>
            ) : (
              <Button size="sm" disabled>
                {t.search.compareMax}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
