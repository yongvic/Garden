import { auth } from "@/auth"
import { applyReferralCode, getOrCreateReferralCode } from "@/lib/referral"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const applyCodeSchema = z.object({
  code: z.string().min(1),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const referralCode = await getOrCreateReferralCode(session.user.id)

    return NextResponse.json({
      code: referralCode.code,
      createdAt: referralCode.createdAt,
    })
  } catch (error) {
    console.error("Referral GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code } = applyCodeSchema.parse(await req.json())
    const referral = await applyReferralCode(session.user.id, code)

    if (!referral) {
      return NextResponse.json(
        { error: "Invalid or ineligible referral code" },
        { status: 400 }
      )
    }

    return NextResponse.json({ referral }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Referral POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
