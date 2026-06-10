import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const setUnavailableSchema = z.object({
  dates: z.array(z.string().datetime()),
  reason: z.string().optional(),
})

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

    const [confirmedBookings, unavailableDates, pricingRules] = await Promise.all([
      prisma.booking.findMany({
        where: {
          listingId: id,
          status: { in: ["CONFIRMED", "IN_PROGRESS", "PENDING"] },
        },
        select: { checkInDate: true, checkOutDate: true },
      }),
      prisma.unavailableDate.findMany({
        where: { listingId: id },
        select: { id: true, date: true, reason: true },
        orderBy: { date: "asc" },
      }),
      prisma.pricingRule.findMany({
        where: { listingId: id, isActive: true },
        orderBy: { createdAt: "desc" },
      }),
    ])

    return NextResponse.json({
      bookedDates: confirmedBookings,
      unavailableDates,
      pricingRules,
    })
  } catch (error) {
    console.error("Calendar GET error:", error)
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
    const body = await req.json()
    const { dates, reason } = setUnavailableSchema.parse(body)

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { landlordId: true },
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    const isOwner = listing.landlordId === session.user.id
    const isAdmin = session.user.role === "ADMIN"
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const parsedDates = dates.map((d) => {
      const date = new Date(d)
      date.setUTCHours(0, 0, 0, 0)
      return date
    })

    const created = await prisma.$transaction(
      parsedDates.map((date) =>
        prisma.unavailableDate.upsert({
          where: { listingId_date: { listingId: id, date } },
          create: { listingId: id, date, reason: reason ?? null },
          update: { reason: reason ?? null },
        })
      )
    )

    return NextResponse.json({ unavailableDates: created }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Calendar POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
