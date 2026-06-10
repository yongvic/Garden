'use client'

import { useEffect, useState } from 'react'
import { Copy, KeyRound, QrCode, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/lib/i18n/context'
import { formatDateShort } from '@/lib/format'
import { toast } from 'sonner'
import { motion } from 'motion/react'

type CheckInCardProps = {
  bookingId: string
  instructions?: string | null
  accessCode?: string | null
  checkInQrToken?: string | null
  checkInDate?: string
  bookingNumber?: string
}

export function CheckInCard({
  bookingId,
  instructions,
  accessCode,
  checkInQrToken,
  checkInDate,
  bookingNumber,
}: CheckInCardProps) {
  const { t, locale } = useI18n()
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [showQr, setShowQr] = useState(false)

  useEffect(() => {
    if (!checkInQrToken || !showQr) return
    fetch(`/api/bookings/${bookingId}/check-in`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.qrDataUrl) setQrDataUrl(data.qrDataUrl)
      })
      .catch(() => {})
  }, [bookingId, checkInQrToken, showQr])

  const copyCode = () => {
    if (!accessCode) return
    navigator.clipboard.writeText(accessCode)
    toast.success(t.checkIn.copied)
  }

  if (!instructions && !accessCode && !checkInQrToken) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="size-5 text-primary" />
            {t.checkIn.cardTitle}
          </CardTitle>
          {bookingNumber && (
            <Badge variant="outline" className="w-fit font-mono text-xs">
              {t.checkIn.bookingRef} #{bookingNumber}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
          {checkInDate && (
            <p className="text-sm text-muted-foreground">
              {t.checkIn.arrival}:{' '}
              <span className="font-medium text-foreground">
                {formatDateShort(checkInDate, locale)}
              </span>
            </p>
          )}

          {instructions && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="size-4 text-muted-foreground" />
                {t.checkIn.instructions}
              </div>
              <p className="rounded-xl bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {instructions}
              </p>
            </div>
          )}

          {accessCode && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <KeyRound className="size-4 text-muted-foreground" />
                {t.checkIn.accessCode}
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-xl bg-muted px-4 py-3 font-mono text-lg tracking-widest">
                  {accessCode}
                </code>
                <Button variant="outline" size="icon" onClick={copyCode}>
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {checkInQrToken && (
            <div className="space-y-3">
              {!showQr ? (
                <Button variant="outline" className="w-full" onClick={() => setShowQr(true)}>
                  <QrCode className="mr-2 size-4" />
                  {t.checkIn.showQr}
                </Button>
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-6">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR" className="size-[200px]" />
                  ) : (
                    <div className="size-[200px] animate-pulse rounded-lg bg-muted" />
                  )}
                  <p className="text-xs text-muted-foreground text-center">{t.checkIn.scanQr}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
