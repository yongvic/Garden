import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
})

async function getBookingWithAccess(bookingId: string, userId: string, role?: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: { select: { landlordId: true, title: true } } },
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

    const conversation = await prisma.conversation.findUnique({
      where: { bookingId: id },
      include: {
        messages: {
          include: {
            sender: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    })

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error("Messages GET error:", error)
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
    const access = await getBookingWithAccess(id, session.user.id, session.user.role)
    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const { content } = sendMessageSchema.parse(await req.json())
    const { booking } = access
    const userId = session.user.id

    let conversation = await prisma.conversation.findUnique({
      where: { bookingId: id },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          bookingId: id,
          customerId: booking.customerId,
          landlordId: booking.listing.landlordId,
        },
      })
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    })

    const recipientId =
      userId === booking.customerId
        ? booking.listing.landlordId
        : booking.customerId

    await prisma.notification.create({
      data: {
        userId: recipientId,
        bookingId: id,
        type: "new_message",
        title: "Nouveau message",
        message: `Nouveau message concernant "${booking.listing.title}"`,
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Messages POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
