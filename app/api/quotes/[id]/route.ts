import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const respondQuoteSchema = z.object({
  quotedPrice: z.number().nonnegative().optional(),
  hostReply: z.string().optional(),
  status: z.enum(["QUOTED", "REJECTED", "ACCEPTED", "EXPIRED"]),
})

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
    const data = respondQuoteSchema.parse(await req.json())

    const quote = await prisma.quoteRequest.findUnique({
      where: { id },
      include: { listing: { select: { landlordId: true, title: true } } },
    })

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    const isLandlord = quote.listing.landlordId === session.user.id
    const isAdmin = session.user.role === "ADMIN"
    if (!isLandlord && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updated = await prisma.quoteRequest.update({
      where: { id },
      data: {
        status: data.status,
        quotedPrice: data.quotedPrice,
        hostReply: data.hostReply,
      },
      include: {
        listing: { select: { id: true, title: true } },
        customer: { select: { id: true, name: true, email: true } },
      },
    })

    await prisma.notification.create({
      data: {
        userId: quote.customerId,
        type: "quote_updated",
        title: "Réponse à votre devis",
        message: `Le hôte a répondu à votre demande de devis pour "${quote.listing.title}"`,
      },
    })

    return NextResponse.json({ quote: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Quote PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
