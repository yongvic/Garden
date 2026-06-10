import type { Listing } from '@prisma/client'

export type BookingRuleViolation =
  | 'min_nights'
  | 'max_nights'
  | 'advance_notice'
  | 'past_date'
  | 'invalid_range'

export function validateStayRules(
  listing: Pick<Listing, 'minNights' | 'maxNights' | 'advanceNoticeDays'>,
  checkIn: Date,
  checkOut: Date
): BookingRuleViolation | null {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  if (checkIn < now) return 'past_date'
  if (checkOut <= checkIn) return 'invalid_range'

  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

  if (nights < listing.minNights) return 'min_nights'
  if (listing.maxNights && nights > listing.maxNights) return 'max_nights'

  const minCheckIn = new Date(now)
  minCheckIn.setDate(minCheckIn.getDate() + listing.advanceNoticeDays)
  if (checkIn < minCheckIn) return 'advance_notice'

  return null
}

export function getInitialBookingStatus(bookingMode: 'INSTANT' | 'REQUEST'): 'CONFIRMED' | 'PENDING' {
  return bookingMode === 'INSTANT' ? 'CONFIRMED' : 'PENDING'
}
