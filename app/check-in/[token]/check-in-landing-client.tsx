'use client'

import { Copy, KeyRound, MapPin, QrCode, FileText } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/lib/i18n/context'
import { formatDateShort } from '@/lib/format'
import { toast } from 'sonner'
import { motion } from 'motion/react'

type CheckInLandingClientProps = {
  booking: {
    id: string
    bookingNumber: string
    checkInDate: string
    checkInInstructions: string | null
    accessCode: string | null
    qrDataUrl: string | null
    customerName: string | null
    listing: {
      title: string
      location: string
      images: string[]
      landlord: { name: string | null; phone: string | null; email: string | null }
    }
  }
}

export function CheckInLandingClient({ booking }: CheckInLandingClientProps) {
  const { t, locale } = useI18n()

  const copyCode = () => {
    if (!booking.accessCode) return
    navigator.clipboard.writeText(booking.accessCode)
    toast.success(t.checkIn.copied)
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <Badge variant="outline" className="mb-4 font-mono">
              {t.checkIn.bookingRef} #{booking.bookingNumber}
            </Badge>
            <h1 className="font-display text-3xl tracking-tight">{t.checkIn.title}</h1>
            <p className="mt-2 text-muted-foreground">{t.checkIn.subtitle}</p>
          </div>

          {booking.listing.images[0] && (
            <img
              src={booking.listing.images[0]}
              alt={booking.listing.title}
              className="aspect-[16/9] w-full rounded-2xl object-cover"
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{booking.listing.title}</CardTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                {booking.listing.location}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm">
                {t.checkIn.arrival}:{' '}
                <span className="font-medium">
                  {formatDateShort(booking.checkInDate, locale)}
                </span>
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="size-4 text-muted-foreground" />
                  {t.checkIn.instructions}
                </div>
                <p className="rounded-xl bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                  {booking.checkInInstructions ?? t.checkIn.noInstructions}
                </p>
              </div>

              {booking.accessCode && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <KeyRound className="size-4 text-muted-foreground" />
                    {t.checkIn.accessCode}
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-xl bg-muted px-4 py-3 font-mono text-xl tracking-widest text-center">
                      {booking.accessCode}
                    </code>
                    <Button variant="outline" size="icon" onClick={copyCode}>
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>
              )}

              {booking.qrDataUrl && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-6">
                  <QrCode className="size-5 text-muted-foreground" />
                  <img src={booking.qrDataUrl} alt="QR" className="size-[220px]" />
                  <p className="text-xs text-muted-foreground text-center">{t.checkIn.scanQr}</p>
                </div>
              )}

              {booking.listing.landlord.phone && (
                <Button variant="outline" className="w-full" asChild>
                  <a
                    href={`https://wa.me/${booking.listing.landlord.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.checkIn.hostContact}
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageShell>
  )
}
