import { prisma } from '@/lib/prisma'
import { createInvoicesForBooking } from '@/lib/invoices'

export type MobileMoneyProvider = 'TMONEY' | 'FLOOZ'

export function isPaymentMockMode(): boolean {
  const mode = process.env.PAYMENT_MODE ?? 'mock'
  return mode === 'mock' || process.env.NODE_ENV === 'development'
}

export function normalizeTogoPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('228') && digits.length === 11) return `+${digits}`
  if (digits.length === 8) return `+228${digits}`
  return phone
}

export function validateTogoPhone(phone: string): boolean {
  const normalized = normalizeTogoPhone(phone)
  return /^\+228\d{8}$/.test(normalized)
}

export async function completeBookingPayment(
  bookingId: string,
  provider: MobileMoneyProvider,
  phone: string
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: true },
  })

  if (!booking) throw new Error('Booking not found')
  if (booking.paymentStatus === 'completed') {
    throw new Error('Booking already paid')
  }
  if (booking.status === 'CANCELLED') {
    throw new Error('Cannot pay a cancelled booking')
  }

  const paymentRef = `sim-${provider.toLowerCase()}-${Date.now()}`

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentId: paymentRef,
      paymentStatus: 'completed',
      status: booking.status === 'PENDING' ? 'CONFIRMED' : booking.status,
    },
  })

  await prisma.notification.create({
    data: {
      userId: booking.customerId,
      bookingId,
      type: 'payment_confirmed',
      title: 'Paiement confirmé',
      message: `Votre paiement ${provider === 'TMONEY' ? 'TMoney' : 'Flooz'} pour la réservation #${booking.bookingNumber} est confirmé.`,
    },
  })

  await prisma.notification.create({
    data: {
      userId: booking.listing.landlordId,
      bookingId,
      type: 'booking_confirmed',
      title: 'Réservation confirmée',
      message: `Paiement reçu (${provider}) pour "${booking.listing.title}" — ${normalizeTogoPhone(phone)}`,
    },
  })

  const existingInvoice = await prisma.invoice.findFirst({ where: { bookingId } })
  if (!existingInvoice) {
    try {
      await createInvoicesForBooking(bookingId)
    } catch (err) {
      console.error('Invoice generation failed:', err)
    }
  }

  return {
    paymentRef,
    provider,
    phone: normalizeTogoPhone(phone),
    bookingId,
  }
}
