import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const updateStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED", "IN_PROGRESS"]),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            landlord: {
              select: { id: true, name: true, image: true, email: true },
            },
          },
        },
        customer: {
          select: { id: true, name: true, email: true, image: true },
        },
        damageClaims: true,
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const userId = session.user.id
    const userRole = session.user.role

    // Only customer, landlord of the listing, or admin can view
    const isCustomer = booking.customerId === userId
    const isLandlord = booking.listing.landlordId === userId
    const isAdmin = userRole === "ADMIN"

    if (!isCustomer && !isLandlord && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Get booking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
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
    const { status } = updateStatusSchema.parse(body)

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        listing: { select: { landlordId: true, title: true } },
        customer: { select: { id: true, name: true } },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const userId = session.user.id
    const userRole = session.user.role

    const isCustomer = booking.customerId === userId
    const isLandlord = booking.listing.landlordId === userId
    const isAdmin = userRole === "ADMIN"

    // Business rules
    if (status === "CANCELLED" && !isCustomer && !isAdmin) {
      return NextResponse.json({ error: "Only the customer can cancel" }, { status: 403 })
    }

    if (status === "CONFIRMED" && !isLandlord && !isAdmin) {
      return NextResponse.json({ error: "Only the landlord can confirm" }, { status: 403 })
    }

    if (status === "COMPLETED" && !isLandlord && !isAdmin) {
      return NextResponse.json({ error: "Only the landlord can complete" }, { status: 403 })
    }

    if (!isCustomer && !isLandlord && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Cannot cancel a completed booking
    if (booking.status === "COMPLETED" && status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot cancel a completed booking" },
        { status: 400 }
      )
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    })

    // Create notification for relevant party
    const notifyUserId =
      status === "CANCELLED" ? booking.listing.landlordId : booking.customerId

    await prisma.notification.create({
      data: {
        userId: notifyUserId,
        bookingId: id,
        type: `booking_${status.toLowerCase()}`,
        title:
          status === "CONFIRMED"
            ? "Réservation confirmée"
            : status === "CANCELLED"
            ? "Réservation annulée"
            : status === "COMPLETED"
            ? "Réservation terminée"
            : "Statut mis à jour",
        message: `La réservation pour "${booking.listing.title}" a été ${
          status === "CONFIRMED"
            ? "confirmée"
            : status === "CANCELLED"
            ? "annulée"
            : status === "COMPLETED"
            ? "marquée comme terminée"
            : "mise à jour"
        }.`,
      },
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Update booking status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
