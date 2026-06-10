import { auth } from "@/auth"
import { generateCheckInQrDataUrl, setupDigitalCheckIn } from "@/lib/check-in"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const setInstructionsSchema = z.object({
  instructions: z.string().min(1),
  accessCode: z.string().optional(),
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

    if (!access.isCustomer && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { booking } = access

    if (!booking.checkInQrToken) {
      return NextResponse.json(
        { error: "Check-in not configured yet" },
        { status: 404 }
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
    const qrDataUrl = await generateCheckInQrDataUrl(booking.checkInQrToken, baseUrl)

    return NextResponse.json({
      instructions: booking.checkInInstructions,
      accessCode: booking.accessCode,
      qrDataUrl,
      checkInUrl: `${baseUrl}/check-in/${booking.checkInQrToken}`,
    })
  } catch (error) {
    console.error("Check-in GET error:", error)
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { instructions, accessCode } = setInstructionsSchema.parse(await req.json())

    const booking = await setupDigitalCheckIn(id, instructions, accessCode)

    await prisma.notification.create({
      data: {
        userId: access.booking.customerId,
        bookingId: id,
        type: "check_in_ready",
        title: "Instructions d'arrivée disponibles",
        message: `Les instructions d'arrivée pour "${access.booking.listing.title}" sont prêtes.`,
      },
    })

    return NextResponse.json({
      checkInInstructions: booking.checkInInstructions,
      accessCode: booking.accessCode,
      checkInQrToken: booking.checkInQrToken,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Check-in PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
