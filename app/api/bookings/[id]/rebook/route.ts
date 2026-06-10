import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const rebookSchema = z.object({
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime(),
  numberOfGuests: z.number().int().positive().optional(),
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
    const { checkInDate, checkOutDate, numberOfGuests } = rebookSchema.parse(
      await req.json()
    )

    const original = await prisma.booking.findUnique({
      where: { id },
      include: { listing: true },
    })

    if (!original) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (original.customerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: "Check-out must be after check-in" },
        { status: 400 }
      )
    }

    if (checkIn < new Date()) {
      return NextResponse.json(
        { error: "Check-in date cannot be in the past" },
        { status: 400 }
      )
    }

    const booking = await prisma.$transaction(async (tx) => {
      const conflictingBooking = await tx.booking.findFirst({
        where: {
          listingId: original.listingId,
          id: { not: id },
          status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
          checkInDate: { lt: checkOut },
          checkOutDate: { gt: checkIn },
        },
      })

      if (conflictingBooking) {
        throw new Error("Dates conflict with existing booking")
      }

      const unavailable = await tx.unavailableDate.findFirst({
        where: {
          listingId: original.listingId,
          date: { gte: checkIn, lt: checkOut },
        },
      })

      if (unavailable) {
        throw new Error("Selected dates include unavailable days")
      }

      const days = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )
      const totalPrice = original.listing.pricePerDay * days

      return tx.booking.create({
        data: {
          listingId: original.listingId,
          customerId: original.customerId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfGuests: numberOfGuests ?? original.numberOfGuests,
          specialRequests: original.specialRequests,
          totalPrice,
          pricingType: original.pricingType,
          packageId: original.packageId,
          status: "PENDING",
        },
        include: { listing: true },
      })
    })

    await prisma.notification.create({
      data: {
        userId: original.listing.landlordId,
        bookingId: booking.id,
        type: "rebook_request",
        title: "Nouvelle réservation (rebook)",
        message: `Re-réservation pour ${original.listing.title}`,
      },
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    const message = error instanceof Error ? error.message : "Internal server error"
    const status =
      message.includes("conflict") || message.includes("unavailable") ? 409 : 500

    console.error("Rebook POST error:", error)
    return NextResponse.json({ error: message }, { status })
  }
}
