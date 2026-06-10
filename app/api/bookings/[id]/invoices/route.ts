import { auth } from "@/auth"
import { createInvoicesForBooking } from "@/lib/invoices"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

async function getBookingWithAccess(bookingId: string, userId: string, role?: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: { select: { landlordId: true } } },
  })
  if (!booking) return { error: "Booking not found", status: 404 as const }

  const isCustomer = booking.customerId === userId
  const isLandlord = booking.listing.landlordId === userId
  const isAdmin = role === "ADMIN"

  if (!isCustomer && !isLandlord && !isAdmin) {
    return { error: "Forbidden", status: 403 as const }
  }

  return { booking }
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

    const invoices = await prisma.invoice.findMany({
      where: { bookingId: id },
      orderBy: { issuedAt: "desc" },
    })

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error("Invoices GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
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

    const existing = await prisma.invoice.findFirst({ where: { bookingId: id } })
    if (existing) {
      return NextResponse.json(
        { error: "Invoices already generated for this booking" },
        { status: 409 }
      )
    }

    const result = await createInvoicesForBooking(id)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    const status = message === "Booking not found" ? 404 : 500
    console.error("Invoices POST error:", error)
    return NextResponse.json({ error: message }, { status })
  }
}
