import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const createRuleSchema = z.object({
  ruleType: z.enum(["WEEKEND", "SEASON", "LONG_STAY"]),
  multiplier: z.number().positive().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  minNights: z.number().int().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

async function verifyLandlord(listingId: string, userId: string, role?: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { landlordId: true },
  })
  if (!listing) return { error: "Listing not found", status: 404 as const }
  if (listing.landlordId !== userId && role !== "ADMIN") {
    return { error: "Forbidden", status: 403 as const }
  }
  return { listing }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    const rules = await prisma.pricingRule.findMany({
      where: { listingId: id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ rules })
  } catch (error) {
    console.error("Pricing rules GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const check = await verifyLandlord(id, session.user.id, session.user.role)
    if ("error" in check) {
      return NextResponse.json({ error: check.error }, { status: check.status })
    }

    const body = await req.json()
    const data = createRuleSchema.parse(body)

    const rule = await prisma.pricingRule.create({
      data: {
        listingId: id,
        ruleType: data.ruleType,
        multiplier: data.multiplier,
        discountPercent: data.discountPercent,
        minNights: data.minNights,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    })

    return NextResponse.json({ rule }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Pricing rules POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const ruleId = req.nextUrl.searchParams.get("id")
    if (!ruleId) {
      return NextResponse.json({ error: "Rule id required" }, { status: 400 })
    }

    const check = await verifyLandlord(id, session.user.id, session.user.role)
    if ("error" in check) {
      return NextResponse.json({ error: check.error }, { status: check.status })
    }

    const rule = await prisma.pricingRule.findFirst({
      where: { id: ruleId, listingId: id },
    })
    if (!rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 })
    }

    await prisma.pricingRule.delete({ where: { id: ruleId } })
    return NextResponse.json({ message: "Rule deleted" })
  } catch (error) {
    console.error("Pricing rules DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
