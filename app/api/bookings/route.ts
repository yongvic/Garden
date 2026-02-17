import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const createBookingSchema = z.object({
  listingId: z.string().cuid(),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime(),
  numberOfGuests: z.number().int().positive(),
  specialRequests: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      listingId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      specialRequests,
    } = createBookingSchema.parse(body)

    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)

    // Validate dates
    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: "Check-out date must be after check-in date" },
        { status: 400 }
      )
    }

    if (checkIn < new Date()) {
      return NextResponse.json(
        { error: "Check-in date cannot be in the past" },
        { status: 400 }
      )
    }

    // Check listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      )
    }

    if (!listing.isActive) {
      return NextResponse.json(
        { error: "Listing is not available" },
        { status: 400 }
      )
    }

    // Check for conflicts using transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Find conflicting bookings
      const conflictingBooking = await tx.booking.findFirst({
        where: {
          listingId,
          status: {
            in: ["CONFIRMED", "IN_PROGRESS"],
          },
          OR: [
            {
              // New booking starts before existing ends
              checkInDate: { lt: checkOut },
              checkOutDate: { gt: checkIn },
            },
          ],
        },
      })

      if (conflictingBooking) {
        throw new Error("Dates conflict with existing booking")
      }

      // Check for unavailable dates
      const unavailableDates = await tx.unavailableDate.findFirst({
        where: {
          listingId,
          date: {
            gte: checkIn,
            lt: checkOut,
          },
        },
      })

      if (unavailableDates) {
        throw new Error("Selected dates include unavailable days")
      }

      // Calculate price
      const days = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )
      const totalPrice = listing.pricePerDay * days

      const customerId = session.user.id
      if (!customerId) throw new Error("User ID is required")

      // Create booking
      return tx.booking.create({
        data: {
          listingId,
          customerId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfGuests,
          specialRequests,
          totalPrice,
          status: "PENDING",
        },
        include: {
          listing: true,
        },
      })
    })

    // Create notification for landlord
    await prisma.notification.create({
      data: {
        userId: listing.landlordId,
        bookingId: booking.id,
        type: "new_booking",
        title: "New Booking Request",
        message: `New booking request for ${listing.title}`,
      },
    })

    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    const message = error instanceof Error ? error.message : "Internal server error"
    const status = message.includes("conflict") || message.includes("Dates") ? 409 : 500

    return NextResponse.json(
      { error: message },
      { status }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const listingId = searchParams.get("listingId")

    if (listingId) {
      // Get bookings for a specific listing
      const bookings = await prisma.booking.findMany({
        where: {
          listingId,
          status: {
            in: ["CONFIRMED", "IN_PROGRESS"],
          },
        },
        select: {
          checkInDate: true,
          checkOutDate: true,
        },
      })

      return NextResponse.json({ bookings })
    }

    // Get user's bookings
    const bookings = await prisma.booking.findMany({
      where: {
        customerId: session.user.id,
      },
      include: {
        listing: true,
      },
      orderBy: {
        checkInDate: "desc",
      },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Fetch bookings error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
