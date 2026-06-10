import { randomBytes } from 'crypto'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'

export async function setupDigitalCheckIn(
  bookingId: string,
  instructions: string,
  accessCode?: string
) {
  const token = randomBytes(16).toString('hex')
  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      checkInInstructions: instructions,
      accessCode: accessCode ?? null,
      checkInQrToken: token,
    },
  })
}

export async function generateCheckInQrDataUrl(token: string, baseUrl: string): Promise<string> {
  const url = `${baseUrl}/check-in/${token}`
  return QRCode.toDataURL(url, { width: 280, margin: 2 })
}
