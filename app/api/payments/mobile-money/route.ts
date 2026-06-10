import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import {
  completeBookingPayment,
  isPaymentMockMode,
  validateTogoPhone,
  normalizeTogoPhone,
} from '@/lib/payment'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const mobileMoneySchema = z.object({
  bookingId: z.string().cuid(),
  provider: z.enum(['TMONEY', 'FLOOZ']),
  phone: z.string().min(8).max(20),
})

export async function POST(req: NextRequest) {
  try {
    if (!isPaymentMockMode()) {
      return NextResponse.json(
        { error: 'Live mobile money payments are not enabled yet' },
        { status: 501 }
      )
    }

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId, provider, phone } = mobileMoneySchema.parse(await req.json())

    if (!validateTogoPhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Use a Togo number (+228 XX XX XX XX)' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { customerId: true, paymentStatus: true },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.customerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Simulated USSD delay
    await new Promise((r) => setTimeout(r, 1800))

    const result = await completeBookingPayment(bookingId, provider, phone)

    return NextResponse.json({
      success: true,
      simulated: true,
      message: `Paiement ${provider === 'TMONEY' ? 'TMoney' : 'Flooz'} simulé avec succès`,
      ...result,
      phone: normalizeTogoPhone(phone),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status =
      message.includes('not found') ? 404
      : message.includes('already paid') ? 409
      : 500
    console.error('Mobile money payment error:', error)
    return NextResponse.json({ error: message }, { status })
  }
}
