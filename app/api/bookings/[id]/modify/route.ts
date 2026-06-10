import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const requestModificationSchema = z.object({
  newCheckIn: z.string().datetime(),
  newCheckOut: z.string().datetime(),
  newGuests: z.number().int().positive().optional(),
})

const respondModificationSchema = z.object({
  requestId: z.string().cuid(),
  status: z.enum(["APPROVED", "REJECTED"]),
  hostReply: z.string().optional(),
})

async function getBookingWithAccess(bookingId: string, userId: string, role?: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: { select: { landlordId: true, title: true, pricePerDay: true } } },
  })
  if (!booking) return { error: "Booking not found", status: 404 as const }

  const isCustomer = booking.customerId === userId
  const isLandlord = booking.listing.landlordId === userId
  const isAdmin = role === "ADMIN"

  if (!isCustomer && !isLandlord && !isAdmin) {
    return { error: "Forbidden", status: 403 as const }
  }

  return { booking, isCustomer, isLandlord }
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
    const access = await getBookingWithAccess(id, session.user.id, session.user.role)
    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    if (!access.isCustomer && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only the customer can request a modification" },
        { status: 403 }
      )
    }

    const { newCheckIn, newCheckOut, newGuests } = requestModificationSchema.parse(
      await req.json()
    )

    const checkIn = new Date(newCheckIn)
    const checkOut = new Date(newCheckOut)

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: "Check-out must be after check-in" },
        { status: 400 }
      )
    }

    const request = await prisma.bookingModificationRequest.create({
      data: {
        bookingId: id,
        requestedById: session.user.id,
        newCheckIn: checkIn,
        newCheckOut: checkOut,
        newGuests: newGuests ?? null,
      },
    })

    await prisma.notification.create({
      data: {
        userId: access.booking.listing.landlordId,
        bookingId: id,
        type: "modification_requested",
        title: "Demande de modification",
        message: `Modification demandée pour "${access.booking.listing.title}"`,
      },
    })

    return NextResponse.json({ request }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Modify POST error:", error)
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
    const access = await getBookingWithAccess(id, session.user.id, session.user.role)
    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    if (!access.isLandlord && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only the landlord can approve or reject modifications" },
        { status: 403 }
      )
    }

    const { requestId, status, hostReply } = respondModificationSchema.parse(
      await req.json()
    )

    const modRequest = await prisma.bookingModificationRequest.findFirst({
      where: { id: requestId, bookingId: id, status: "PENDING" },
    })

    if (!modRequest) {
      return NextResponse.json({ error: "Modification request not found" }, { status: 404 })
    }

    const updatedRequest = await prisma.bookingModificationRequest.update({
      where: { id: requestId },
      data: { status, hostReply: hostReply ?? null },
    })

    if (status === "APPROVED") {
      const days = Math.ceil(
        (modRequest.newCheckOut.getTime() - modRequest.newCheckIn.getTime()) /
          (1000 * 60 * 60 * 24)
      )
      const totalPrice = access.booking.listing.pricePerDay * days

      await prisma.booking.update({
        where: { id },
        data: {
          checkInDate: modRequest.newCheckIn,
          checkOutDate: modRequest.newCheckOut,
          numberOfGuests: modRequest.newGuests ?? access.booking.numberOfGuests,
          totalPrice,
        },
      })
    }

    await prisma.notification.create({
      data: {
        userId: access.booking.customerId,
        bookingId: id,
        type: `modification_${status.toLowerCase()}`,
        title: status === "APPROVED" ? "Modification approuvée" : "Modification refusée",
        message: `Votre demande de modification pour "${access.booking.listing.title}" a été ${
          status === "APPROVED" ? "approuvée" : "refusée"
        }.`,
      },
    })

    return NextResponse.json({ request: updatedRequest })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Modify PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
    const access = await getBookingWithAccess(id, session.user.id, session.user.role)
    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const requests = await prisma.bookingModificationRequest.findMany({
      where: { bookingId: id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("Modify GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
