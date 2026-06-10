import { NextResponse } from 'next/server'

/** @deprecated Stripe removed — use POST /api/payments/mobile-money */
export async function POST() {
  return NextResponse.json(
    {
      error: 'Card payments are disabled. Use TMoney or Flooz via /api/payments/mobile-money',
    },
    { status: 410 }
  )
}
