import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slug"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { randomBytes } from "crypto"

const createShareSchema = z.object({
  title: z.string().optional(),
  listingIds: z.array(z.string().cuid()).optional(),
})

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base) || randomBytes(4).toString("hex")
  let attempt = 0
  while (await prisma.sharedFavoriteList.findUnique({ where: { slug } })) {
    attempt++
    slug = `${slugify(base) || "list"}-${attempt}`
  }
  return slug
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const lists = await prisma.sharedFavoriteList.findMany({
      where: { userId: session.user.id },
      include: {
        items: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

    return NextResponse.json({
      lists: lists.map((list) => ({
        ...list,
        url: `${baseUrl}/share/${list.slug}`,
      })),
    })
  } catch (error) {
    console.error("Favorites share GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { title, listingIds } = createShareSchema.parse(await req.json())

    let ids = listingIds
    if (!ids || ids.length === 0) {
      const favorites = await prisma.favorite.findMany({
        where: { userId },
        select: { listingId: true },
      })
      ids = favorites.map((f) => f.listingId)
    }

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "No listings to share" },
        { status: 400 }
      )
    }

    const slug = await uniqueSlug(title ?? session.user.name ?? userId)

    const list = await prisma.sharedFavoriteList.create({
      data: {
        userId,
        slug,
        title: title ?? "Ma sélection",
        items: { create: ids.map((listingId) => ({ listingId })) },
      },
      include: { items: true },
    })

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
    const url = `${baseUrl}/share/${slug}`

    return NextResponse.json({ slug, url, list }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Favorites share POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
