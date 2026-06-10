import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SEO_CITIES } from '@/lib/slug'
import { prisma } from '@/lib/prisma'
import { CitySearchClient } from './city-search-client'

type Props = {
  params: Promise<{ city: string }>
}

export async function generateStaticParams() {
  return SEO_CITIES.map((city) => ({ city: city.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params
  const city = SEO_CITIES.find((c) => c.slug === citySlug)
  if (!city) return { title: 'City not found' }

  return {
    title: `Espaces professionnels à ${city.name} · Garden`,
    description: `Réservez salles de conférence, studios et équipements pro à ${city.name}, ${city.country}. Hôtes vérifiés, paiement sécurisé.`,
    openGraph: {
      title: `Espaces à ${city.name}`,
      description: `Découvrez les espaces professionnels disponibles à ${city.name}.`,
    },
  }
}

export default async function CitySearchPage({ params }: Props) {
  const { city: citySlug } = await params
  const city = SEO_CITIES.find((c) => c.slug === citySlug)
  if (!city) notFound()

  const listings = await prisma.listing.findMany({
    where: {
      isActive: true,
      OR: [
        { citySlug },
        { location: { contains: city.name, mode: 'insensitive' } },
      ],
    },
    include: {
      reviews: { select: { rating: true } },
      landlord: { select: { name: true, image: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 24,
  })

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
    <CitySearchClient
      city={city}
      initialListings={listingsWithRatings}
    />
  )
}
