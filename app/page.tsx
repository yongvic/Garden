import { prisma } from '@/lib/prisma'
import { PageShell } from '@/components/page-shell'
import { HomeContent } from '@/components/home-content'

async function getHomeStats() {
  const [usersCount, listingsCount, bookingsCount, featuredListings, latestReviews] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count({ where: { isActive: true } }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.listing.findMany({
      where: { isActive: true },
      take: 6,
      orderBy: { viewCount: 'desc' },
      select: {
        id: true, title: true, description: true, type: true,
        location: true, pricePerDay: true, images: true,
        landlord: { select: { name: true, image: true } },
        reviews: { select: { rating: true } },
      },
    }),
    prisma.review.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, image: true } },
        listing: { select: { title: true } },
      },
    }),
  ])

  const listingsWithRatings = featuredListings.map((l) => {
    const count = l.reviews.length
    const avg = count > 0 ? l.reviews.reduce((s, r) => s + r.rating, 0) / count : 0
    const { reviews, ...rest } = l
    return { ...rest, averageRating: parseFloat(avg.toFixed(1)), reviewCount: count }
  })

  return { usersCount, listingsCount, bookingsCount, featuredListings: listingsWithRatings, latestReviews }
}

export default async function Home() {
  const stats = await getHomeStats()

  return (
    <PageShell withGrid>
      <HomeContent stats={stats} />
    </PageShell>
  )
}
