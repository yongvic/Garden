import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { BookingStatus, Role } from "@prisma/client"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const { status } = await req.json()

    if (!Object.values(BookingStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid booking status" },
        { status: 400 }
      )
    }

    // Get booking with related data
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { listing: true, customer: true },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Check authorization - customer can cancel, landlord can confirm/reject
    const isCustomer = booking.customerId === session.user.id
    const isLandlord = booking.listing.landlordId === session.user.id

    if (!isCustomer && !isLandlord) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Validate status transitions
    if (isCustomer && status === BookingStatus.CANCELLED) {
      // Customer can cancel
    } else if (isLandlord && status === BookingStatus.CONFIRMED) {
      // Landlord can confirm
    } else if (isLandlord && status === BookingStatus.CANCELLED) {
      // Landlord can reject
    } else if (status === BookingStatus.COMPLETED || status === BookingStatus.IN_PROGRESS) {
      // System only - check based on dates
      const now = new Date()
      if (
        status === BookingStatus.IN_PROGRESS &&
        booking.checkInDate > now
      ) {
        return NextResponse.json(
          { error: "Check-in date has not arrived yet" },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: "Invalid status transition" },
        { status: 400 }
      )
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: { listing: true },
    })

    // Create notification
    const notificationUserId =
      isCustomer ? booking.listing.landlordId : booking.customerId

    await prisma.notification.create({
      data: {
        userId: notificationUserId,
        bookingId: id,
        type: `booking_${status.toLowerCase()}`,
        title: `Booking ${status.toLowerCase()}`,
        message: `Booking #${booking.bookingNumber} has been ${status.toLowerCase()}`,
      },
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Update booking status error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
