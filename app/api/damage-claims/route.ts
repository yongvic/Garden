import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createClaimSchema = z.object({
  bookingId: z.string().cuid(),
  description: z.string().min(20, "Description must be at least 20 characters"),
  estimatedCost: z.number().positive().optional(),
  images: z.array(z.string()).default([]),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { bookingId, description, estimatedCost, images } = createClaimSchema.parse(body)

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Only landlord can report damage on their property, customer can dispute
    const isLandlord = booking.listing.landlordId === session.user.id

    if (!isLandlord && session.user.id !== booking.customerId) {
      return NextResponse.json(
        { error: "Unauthorized to report damage for this booking" },
        { status: 403 }
      )
    }

    const claim = await prisma.damageClaim.create({
      data: {
        claimNumber: `DC-${Date.now()}`,
        bookingId,
        reportedBy: session.user.id,
        description,
        estimatedCost,
        images,
      },
      include: {
        booking: true,
      },
    })

    // Notify the other party
    const notificationUserId = isLandlord ? booking.customerId : booking.listing.landlordId

    await prisma.notification.create({
      data: {
        userId: notificationUserId,
        bookingId,
        type: "damage_reported",
        title: "Damage Claim Reported",
        message: `A damage claim has been reported for booking #${booking.bookingNumber}`,
      },
    })

    return NextResponse.json(claim, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    console.error("Create damage claim error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const bookingId = searchParams.get("bookingId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const where: any = {
      OR: [
        { reportedBy: session.user.id },
        {
          booking: {
            OR: [
              { listing: { landlordId: session.user.id } },
              { customerId: session.user.id },
            ],
          },
        },
      ],
    }

    if (status) {
      where.status = status
    }

    if (bookingId) {
      where.bookingId = bookingId
    }

    const [claims, total] = await Promise.all([
      prisma.damageClaim.findMany({
        where,
        include: {
          booking: true,
          reportedByUser: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.damageClaim.count({ where }),
    ])

    return NextResponse.json({
      claims,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Fetch damage claims error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
