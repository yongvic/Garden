import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ShareListClient } from './share-list-client'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const list = await prisma.sharedFavoriteList.findUnique({
    where: { slug, isPublic: true },
    include: { user: { select: { name: true } } },
  })
  if (!list) return { title: 'Shared list' }

  return {
    title: list.title ?? 'Shared wishlist',
    description: `Spaces selected by ${list.user.name ?? 'a Garden user'}`,
  }
}

export default async function SharePage({ params }: Props) {
  const { slug } = await params

  const list = await prisma.sharedFavoriteList.findUnique({
    where: { slug, isPublic: true },
    include: {
      user: { select: { name: true, image: true } },
      items: true,
    },
  })

  if (!list) notFound()

  const listingIds = list.items.map((i) => i.listingId)

  const listings = listingIds.length
    ? await prisma.listing.findMany({
        where: { id: { in: listingIds }, isActive: true },
        include: {
          reviews: { select: { rating: true } },
          landlord: { select: { name: true, image: true } },
        },
      })
    : []

  const listingsWithRatings = listings.map((listing) => {
    const averageRating =
      listing.reviews.length > 0
        ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
        : 0
    const { reviews, ...rest } = listing
    return {
      ...rest,
      averageRating: parseFloat(averageRating.toFixed(1)),
      reviewCount: reviews.length,
    }
  })

  return (
    <ShareListClient
      title={list.title}
      ownerName={list.user.name}
      ownerImage={list.user.image}
      listings={listingsWithRatings}
    />
  )
}
