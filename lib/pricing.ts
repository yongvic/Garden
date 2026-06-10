import type { PricingRule, Listing } from '@prisma/client'

export type PriceBreakdown = {
  basePrice: number
  nights: number
  hours?: number
  subtotal: number
  adjustments: Array<{ label: string; amount: number }>
  loyaltyDiscount: number
  referralCredit: number
  serviceFee: number
  total: number
}

const SERVICE_FEE_RATE = 0.03
const LOYALTY_THIRD_BOOKING_DISCOUNT = 0.05

function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

function dateInRange(date: Date, start?: Date | null, end?: Date | null): boolean {
  if (!start || !end) return false
  return date >= start && date <= end
}

export function calculateDailyPrice(
  listing: Pick<Listing, 'pricePerDay'>,
  checkIn: Date,
  checkOut: Date,
  rules: PricingRule[] = [],
  options?: { loyaltyBookingCount?: number; referralCredit?: number }
): PriceBreakdown {
  const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
  const adjustments: Array<{ label: string; amount: number }> = []
  let subtotal = 0

  for (let i = 0; i < nights; i++) {
    const day = new Date(checkIn)
    day.setDate(day.getDate() + i)
    let dayPrice = listing.pricePerDay

    for (const rule of rules.filter((r) => r.isActive)) {
      if (rule.ruleType === 'WEEKEND' && isWeekend(day) && rule.multiplier) {
        dayPrice = listing.pricePerDay * rule.multiplier
      }
      if (rule.ruleType === 'SEASON' && dateInRange(day, rule.startDate, rule.endDate) && rule.multiplier) {
        dayPrice = listing.pricePerDay * rule.multiplier
      }
    }
    subtotal += dayPrice
  }

  const longStayRule = rules.find((r) => r.isActive && r.ruleType === 'LONG_STAY' && r.minNights && nights >= r.minNights)
  if (longStayRule?.discountPercent) {
    const discount = Math.round(subtotal * (longStayRule.discountPercent / 100))
    adjustments.push({ label: 'long_stay', amount: -discount })
    subtotal -= discount
  }

  let loyaltyDiscount = 0
  if (options?.loyaltyBookingCount && options.loyaltyBookingCount >= 2) {
    loyaltyDiscount = Math.round(subtotal * LOYALTY_THIRD_BOOKING_DISCOUNT)
    adjustments.push({ label: 'loyalty', amount: -loyaltyDiscount })
  }

  const referralCredit = Math.min(options?.referralCredit ?? 0, subtotal - loyaltyDiscount)
  if (referralCredit > 0) {
    adjustments.push({ label: 'referral', amount: -referralCredit })
  }

  const afterDiscounts = subtotal - loyaltyDiscount - referralCredit
  const serviceFee = Math.round(afterDiscounts * SERVICE_FEE_RATE)
  const total = afterDiscounts + serviceFee

  return {
    basePrice: listing.pricePerDay,
    nights,
    subtotal,
    adjustments,
    loyaltyDiscount,
    referralCredit,
    serviceFee,
    total,
  }
}

export function calculateHourlyPrice(
  listing: Pick<Listing, 'pricePerHour' | 'pricePerDay'>,
  hours: number,
  options?: { referralCredit?: number }
): PriceBreakdown {
  const rate = listing.pricePerHour ?? listing.pricePerDay / 8
  const subtotal = Math.round(rate * hours)
  const referralCredit = Math.min(options?.referralCredit ?? 0, subtotal)
  const afterDiscounts = subtotal - referralCredit
  const serviceFee = Math.round(afterDiscounts * SERVICE_FEE_RATE)

  return {
    basePrice: rate,
    nights: 0,
    hours,
    subtotal,
    adjustments: referralCredit > 0 ? [{ label: 'referral', amount: -referralCredit }] : [],
    loyaltyDiscount: 0,
    referralCredit,
    serviceFee,
    total: afterDiscounts + serviceFee,
  }
}

export function calculatePackagePrice(
  basePrice: number,
  optionPrices: number[],
  options?: { referralCredit?: number }
): PriceBreakdown {
  const optionsTotal = optionPrices.reduce((a, b) => a + b, 0)
  const subtotal = basePrice + optionsTotal
  const referralCredit = Math.min(options?.referralCredit ?? 0, subtotal)
  const afterDiscounts = subtotal - referralCredit
  const serviceFee = Math.round(afterDiscounts * SERVICE_FEE_RATE)

  return {
    basePrice,
    nights: 1,
    subtotal,
    adjustments: referralCredit > 0 ? [{ label: 'referral', amount: -referralCredit }] : [],
    loyaltyDiscount: 0,
    referralCredit,
    serviceFee,
    total: afterDiscounts + serviceFee,
  }
}
