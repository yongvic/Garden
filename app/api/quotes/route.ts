import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const createQuoteSchema = z.object({
  listingId: z.string().cuid(),
  packageId: z.string().cuid().optional(),
  eventType: z.string().min(1),
  eventDate: z.string().datetime(),
  guests: z.number().int().positive(),
  message: z.string().min(1),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const isLandlord = session.user.role === "LANDLORD" || session.user.role === "ADMIN"

    const where = isLandlord
      ? { listing: { landlordId: userId } }
      : { customerId: userId }

    const quotes = await prisma.quoteRequest.findMany({
      where,
      include: {
        listing: { select: { id: true, title: true, location: true, images: true } },
        package: { select: { id: true, name: true, basePrice: true } },
        customer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ quotes })
  } catch (error) {
    console.error("Quotes GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = createQuoteSchema.parse(await req.json())

    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
      select: { id: true, isActive: true, landlordId: true },
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    if (!listing.isActive) {
      return NextResponse.json({ error: "Listing is not available" }, { status: 400 })
    }

    if (data.packageId) {
      const pkg = await prisma.eventPackage.findFirst({
        where: { id: data.packageId, listingId: data.listingId, isActive: true },
      })
      if (!pkg) {
        return NextResponse.json({ error: "Package not found" }, { status: 404 })
      }
    }

    const quote = await prisma.quoteRequest.create({
      data: {
        listingId: data.listingId,
        customerId: session.user.id,
        packageId: data.packageId,
        eventType: data.eventType,
        eventDate: new Date(data.eventDate),
        guests: data.guests,
        message: data.message,
      },
      include: {
        listing: { select: { id: true, title: true } },
        package: { select: { id: true, name: true } },
      },
    })

    await prisma.notification.create({
      data: {
        userId: listing.landlordId,
        type: "new_quote_request",
        title: "Nouvelle demande de devis",
        message: `Demande de devis pour "${quote.listing.title}"`,
      },
    })

    return NextResponse.json({ quote }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Quotes POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
