import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const checkInDate = searchParams.get("checkInDate")
    const checkOutDate = searchParams.get("checkOutDate")

    // Verify listing exists
    const listing = await prisma.listing.findUnique({
      where: { id },
    })

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      )
    }

    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate)
      const checkOut = new Date(checkOutDate)

      // Check for conflicting bookings using database transaction for atomicity
      const [conflictingBooking, unavailableDates] = await Promise.all([
        prisma.booking.findFirst({
          where: {
            listingId: id,
            status: { in: ["CONFIRMED", "IN_PROGRESS"] },
            OR: [
              {
                checkInDate: { lt: checkOut },
                checkOutDate: { gt: checkIn },
              },
            ],
          },
        }),
        prisma.unavailableDate.findFirst({
          where: {
            listingId: id,
            date: {
              gte: checkIn,
              lt: checkOut,
            },
          },
        }),
      ])

      const isAvailable = !conflictingBooking && !unavailableDates

      return NextResponse.json({
        isAvailable,
        conflictingBooking: conflictingBooking ? true : false,
        unavailableReason: unavailableDates?.reason || null,
      })
    }

    // Get all booked dates for the listing
    const confirmedBookings = await prisma.booking.findMany({
      where: {
        listingId: id,
        status: { in: ["CONFIRMED", "IN_PROGRESS"] },
      },
      select: {
        checkInDate: true,
        checkOutDate: true,
      },
    })

    const unavailableDates = await prisma.unavailableDate.findMany({
      where: { listingId: id },
      select: {
        date: true,
        reason: true,
      },
    })

    return NextResponse.json({
      bookedDates: confirmedBookings,
      unavailableDates,
    })
  } catch (error) {
    console.error("Availability check error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
