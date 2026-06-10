import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const list = await prisma.sharedFavoriteList.findUnique({
      where: { slug },
      include: {
        items: { orderBy: { addedAt: "desc" } },
        user: { select: { name: true, image: true } },
      },
    })

    if (!list || !list.isPublic) {
      return NextResponse.json({ error: "List not found" }, { status: 404 })
    }

    const listingIds = list.items.map((item) => item.listingId)
    const listings = await prisma.listing.findMany({
      where: { id: { in: listingIds }, isActive: true },
      select: {
        id: true,
        title: true,
        location: true,
        pricePerDay: true,
        images: true,
        type: true,
        neighborhood: true,
      },
    })

    const listingMap = new Map(listings.map((l) => [l.id, l]))
    const orderedListings = listingIds
      .map((id) => listingMap.get(id))
      .filter(Boolean)

    return NextResponse.json({
      title: list.title,
      slug: list.slug,
      createdAt: list.createdAt,
      sharedBy: list.user,
      listings: orderedListings,
    })
  } catch (error) {
    console.error("Share GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
