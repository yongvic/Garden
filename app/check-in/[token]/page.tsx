import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { generateCheckInQrDataUrl } from '@/lib/check-in'
import { CheckInLandingClient } from './check-in-landing-client'

type Props = {
  params: Promise<{ token: string }>
}

export const metadata: Metadata = {
  title: 'Digital check-in',
  robots: { index: false, follow: false },
}

export default async function CheckInPage({ params }: Props) {
  const { token } = await params

  const booking = await prisma.booking.findUnique({
    where: { checkInQrToken: token },
    include: {
      listing: {
        select: {
          title: true,
          location: true,
          images: true,
          landlord: { select: { name: true, phone: true, email: true } },
        },
      },
      customer: { select: { name: true } },
    },
  })

  if (!booking) notFound()

  const baseUrl =
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const qrDataUrl = booking.checkInQrToken
    ? await generateCheckInQrDataUrl(booking.checkInQrToken, baseUrl)
    : null

  return (
    <CheckInLandingClient
      booking={{
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        checkInDate: booking.checkInDate.toISOString(),
        checkInInstructions: booking.checkInInstructions,
        accessCode: booking.accessCode,
        qrDataUrl,
        listing: booking.listing,
        customerName: booking.customer.name,
      }}
    />
  )
}
