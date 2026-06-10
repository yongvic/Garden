import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

const DEFAULT_REFERRAL_CREDIT = 5000

function generateCode(): string {
  return randomBytes(4).toString('hex').toUpperCase()
}

export async function getOrCreateReferralCode(userId: string) {
  const existing = await prisma.referralCode.findUnique({ where: { userId } })
  if (existing) return existing

  let code = generateCode()
  while (await prisma.referralCode.findUnique({ where: { code } })) {
    code = generateCode()
  }

  return prisma.referralCode.create({ data: { userId, code } })
}

export async function applyReferralCode(newUserId: string, code: string) {
  const referralCode = await prisma.referralCode.findUnique({ where: { code: code.toUpperCase() } })
  if (!referralCode || referralCode.userId === newUserId) return null

  const existing = await prisma.referral.findUnique({ where: { referredUserId: newUserId } })
  if (existing) return existing

  return prisma.referral.create({
    data: {
      referrerId: referralCode.userId,
      referredUserId: newUserId,
      creditAmount: DEFAULT_REFERRAL_CREDIT,
    },
  })
}

export async function getReferralCreditForUser(userId: string): Promise<number> {
  const referral = await prisma.referral.findFirst({
    where: { referredUserId: userId, redeemed: false },
  })
  return referral?.creditAmount ?? 0
}

export async function redeemReferralCredit(userId: string) {
  await prisma.referral.updateMany({
    where: { referredUserId: userId, redeemed: false },
    data: { redeemed: true },
  })
}
