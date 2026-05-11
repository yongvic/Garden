import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/favorites - list current user's favorites
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      listing: {
        select: {
          id: true, title: true, location: true, pricePerDay: true, images: true, type: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ favorites: favorites.map(f => f.listing) })
}

// POST /api/favorites - toggle favorite
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listingId } = await req.json()
  if (!listingId) return NextResponse.json({ error: 'listingId required' }, { status: 400 })

  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId: session.user.id, listingId } },
  })

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } })
    return NextResponse.json({ favorited: false })
  } else {
    await prisma.favorite.create({ data: { userId: session.user.id, listingId } })
    return NextResponse.json({ favorited: true })
  }
}
