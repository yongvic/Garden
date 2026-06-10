'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { motion } from 'motion/react'

type BlockedDate = { id: string; date: string; reason?: string | null }
type BookedRange = { checkInDate: string; checkOutDate: string }

type AvailabilityCalendarProps = {
  listingId: string
}

function isDateInRange(date: Date, start: Date, end: Date) {
  return date >= start && date < end
}

export function AvailabilityCalendar({ listingId }: AvailabilityCalendarProps) {
  const { t, locale } = useI18n()
  const dateLocale = locale === 'fr' ? fr : enUS

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const fetchCalendar = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/listings/${listingId}/calendar`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setBlockedDates(data.blockedDates ?? data.unavailableDates ?? [])
      setBookedRanges(data.bookedDates ?? data.bookings ?? [])
    } catch {
      toast.error(t.calendar.error)
    } finally {
      setIsLoading(false)
    }
  }, [listingId, t.calendar.error])

  useEffect(() => {
    fetchCalendar()
  }, [fetchCalendar])

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const getDayStatus = (day: Date): 'blocked' | 'booked' | 'available' => {
    if (blockedDates.some((b) => isSameDay(new Date(b.date), day))) return 'blocked'
    if (
      bookedRanges.some((r) =>
        isDateInRange(day, new Date(r.checkInDate), new Date(r.checkOutDate))
      )
    ) {
      return 'booked'
    }
    return 'available'
  }

  const selectedBlocked = selectedDate
    ? blockedDates.find((b) => isSameDay(new Date(b.date), selectedDate))
    : null

  const handleToggle = async () => {
    if (!selectedDate) return
    setIsSaving(true)
    try {
      const action = selectedBlocked ? 'unblock' : 'block'
      const res = await fetch(`/api/listings/${listingId}/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: format(selectedDate, 'yyyy-MM-dd'),
          action,
          reason: action === 'block' ? reason || undefined : undefined,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success(t.calendar.saved)
      setReason('')
      await fetchCalendar()
    } catch {
      toast.error(t.calendar.error)
    } finally {
      setIsSaving(false)
    }
  }

  const weekDays =
    locale === 'fr'
      ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const startPadding = (startOfMonth(currentMonth).getDay() + 6) % 7

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">{t.calendar.loading}</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">{t.calendar.title}</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[140px] text-center text-sm font-medium capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-2 grid grid-cols-7 gap-1">
            {weekDays.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startPadding }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map((day) => {
              const status = getDayStatus(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))

              return (
                <motion.button
                  key={day.toISOString()}
                  type="button"
                  disabled={status === 'booked' || isPast}
                  onClick={() => setSelectedDate(day)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'relative flex aspect-square items-center justify-center rounded-lg text-sm transition-colors',
                    status === 'blocked' && 'bg-destructive/15 text-destructive',
                    status === 'booked' && 'bg-muted text-muted-foreground cursor-not-allowed',
                    status === 'available' && 'hover:bg-primary/10',
                    isSelected && 'ring-2 ring-primary ring-offset-2',
                    isPast && status === 'available' && 'opacity-40'
                  )}
                >
                  {format(day, 'd')}
                </motion.button>
              )
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Badge variant="outline" className="gap-1.5">
              <span className="size-2.5 rounded-full bg-primary/30" />
              {t.calendar.available}
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <span className="size-2.5 rounded-full bg-destructive/60" />
              {t.calendar.blocked}
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <span className="size-2.5 rounded-full bg-muted-foreground/40" />
              {t.calendar.booked}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {selectedDate
              ? format(selectedDate, 'PPP', { locale: dateLocale })
              : t.calendar.selectDate}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedDate && getDayStatus(selectedDate) !== 'booked' && (
            <>
              {!selectedBlocked && (
                <div className="space-y-2">
                  <Label htmlFor="reason">{t.calendar.reason}</Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={t.calendar.reasonPlaceholder}
                  />
                </div>
              )}
              <Button
                className="w-full"
                variant={selectedBlocked ? 'outline' : 'default'}
                onClick={handleToggle}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                {selectedBlocked ? t.calendar.unblockDate : t.calendar.blockDate}
              </Button>
            </>
          )}
          {selectedDate && getDayStatus(selectedDate) === 'booked' && (
            <p className="text-sm text-muted-foreground">{t.calendar.booked}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
