'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/lib/i18n/context'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Loader2, Smartphone, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

type Provider = 'TMONEY' | 'FLOOZ'

type MobileMoneyDialogProps = {
  bookingId: string | null
  amount: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function MobileMoneyDialog({
  bookingId,
  amount,
  open,
  onOpenChange,
  onSuccess,
}: MobileMoneyDialogProps) {
  const { t, locale } = useI18n()
  const [provider, setProvider] = useState<Provider>('TMONEY')
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'form' | 'processing' | 'done'>('form')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reset = () => {
    setStep('form')
    setIsSubmitting(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handlePay = async () => {
    if (!bookingId || !phone.trim()) return
    setIsSubmitting(true)
    setStep('processing')
    try {
      const res = await fetch('/api/payments/mobile-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, provider, phone: phone.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? t.common.error)

      setStep('done')
      toast.success(t.payment.success)
      onSuccess?.()
      setTimeout(() => handleOpenChange(false), 1500)
    } catch (e) {
      setStep('form')
      toast.error((e as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const providers: Array<{
    id: Provider
    label: string
    sub: string
    accent: string
    ring: string
  }> = [
    {
      id: 'TMONEY',
      label: 'TMoney',
      sub: 'Togocel',
      accent: 'bg-[#FFD100]/15 text-[#1a5c2e] border-[#FFD100]/40',
      ring: 'ring-[#FFD100]',
    },
    {
      id: 'FLOOZ',
      label: 'Flooz',
      sub: 'Moov Africa',
      accent: 'bg-[#0066CC]/10 text-[#0066CC] border-[#0066CC]/30',
      ring: 'ring-[#0066CC]',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="size-5" />
            {t.payment.title}
          </DialogTitle>
          <DialogDescription>{t.payment.subtitle}</DialogDescription>
        </DialogHeader>

        {step === 'done' ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="size-12 text-emerald-500" />
            <p className="font-medium">{t.payment.success}</p>
            <p className="text-sm text-muted-foreground">{t.payment.simulatedNote}</p>
          </div>
        ) : step === 'processing' ? (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <Loader2 className="size-10 animate-spin text-primary" />
            <div>
              <p className="font-medium">{t.payment.processing}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t.payment.ussdHint}</p>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {provider === 'TMONEY' ? '*155#' : '*155*1#'}
            </Badge>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-xl bg-muted/50 px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">{t.payment.amount}</p>
              <p className="text-2xl font-semibold tabular-nums">
                {formatCurrency(amount, locale)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t.payment.chooseProvider}</Label>
              <div className="grid grid-cols-2 gap-3">
                {providers.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id)}
                    className={cn(
                      'rounded-xl border-2 p-4 text-left transition-all',
                      p.accent,
                      provider === p.id
                        ? `ring-2 ring-offset-2 ${p.ring}`
                        : 'opacity-70 hover:opacity-100'
                    )}
                  >
                    <p className="font-semibold">{p.label}</p>
                    <p className="text-xs opacity-80">{p.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mm-phone">{t.payment.phone}</Label>
              <Input
                id="mm-phone"
                type="tel"
                placeholder="+228 90 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{t.payment.phoneHint}</p>
            </div>

            <Badge variant="secondary" className="w-full justify-center py-1.5 text-xs font-normal">
              {t.payment.simulatedNote}
            </Badge>

            <Button
              className="w-full"
              onClick={handlePay}
              disabled={isSubmitting || !phone.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t.payment.processing}
                </>
              ) : (
                t.payment.confirm
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
