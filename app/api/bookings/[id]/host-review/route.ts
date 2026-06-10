import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const hostReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
})

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
    const { rating, comment } = hostReviewSchema.parse(await req.json())

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { listing: { select: { landlordId: true, title: true } } },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const isLandlord = booking.listing.landlordId === session.user.id
    const isAdmin = session.user.role === "ADMIN"
    if (!isLandlord && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!["COMPLETED", "IN_PROGRESS"].includes(booking.status)) {
      return NextResponse.json(
        { error: "Can only review active or completed bookings" },
        { status: 400 }
      )
    }

    const existing = await prisma.hostReview.findUnique({ where: { bookingId: id } })
    if (existing) {
      return NextResponse.json(
        { error: "Review already submitted for this booking" },
        { status: 409 }
      )
    }

    const review = await prisma.hostReview.create({
      data: {
        bookingId: id,
        hostId: booking.listing.landlordId,
        customerId: booking.customerId,
        rating,
        comment: comment ?? null,
      },
    })

    await prisma.notification.create({
      data: {
        userId: booking.customerId,
        bookingId: id,
        type: "host_review",
        title: "Avis de l'hôte",
        message: `L'hôte a laissé un avis pour votre séjour à "${booking.listing.title}"`,
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Host review POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
