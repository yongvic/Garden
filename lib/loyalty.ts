import { prisma } from '@/lib/prisma'

const POINTS_PER_BOOKING = 100

export async function getOrCreateLoyaltyAccount(userId: string) {
  return prisma.loyaltyAccount.upsert({
    where: { userId },
    create: { userId, points: 0, totalBookings: 0 },
    update: {},
  })
}

export async function recordCompletedBooking(userId: string) {
  const account = await getOrCreateLoyaltyAccount(userId)
  return prisma.loyaltyAccount.update({
    where: { userId },
    data: {
      points: { increment: POINTS_PER_BOOKING },
      totalBookings: { increment: 1 },
    },
  })
}

export function isEligibleForThirdBookingDiscount(totalBookings: number): boolean {
  return totalBookings >= 2
}
