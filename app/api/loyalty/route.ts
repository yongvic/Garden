import { auth } from "@/auth"
import { getOrCreateLoyaltyAccount } from "@/lib/loyalty"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const account = await getOrCreateLoyaltyAccount(session.user.id)

    return NextResponse.json({ account })
  } catch (error) {
    console.error("Loyalty GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
