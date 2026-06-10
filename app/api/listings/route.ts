import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { citySlugFromLocation } from "@/lib/slug"

const createListingSchema = z.object({
  title: z.string({ required_error: "Le titre est requis" }).min(5, "Le titre doit faire au moins 5 caractères"),
  description: z.string({ required_error: "La description est requise" }).min(20, "La description doit faire au moins 20 caractères"),
  type: z.enum(["ROOM", "EQUIPMENT", "SPACE"], { required_error: "Le type est invalide" }),
  location: z.string({ required_error: "La localisation est requise" }).min(5, "La localisation est trop courte"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  pricePerDay: z.number({ required_error: "Le prix par jour est requis", invalid_type_error: "Le prix doit être un nombre" }).positive("Le prix doit être positif"),
  maxOccupants: z.number().int().positive().optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).min(1, "Veuillez uploader au moins une image"),
  rules: z.string().optional(),
  cancellationPolicy: z.string().optional(),
})

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userRole = (session.user as { role?: string }).role as string
    if (!["LANDLORD", "ADMIN"].includes(userRole)) {
      return NextResponse.json(
        { error: "Seuls les propriétaires peuvent créer des annonces. Vérifiez que votre compte a le rôle LANDLORD." },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = createListingSchema.parse(body)

    const listing = await prisma.listing.create({
      data: {
        ...validatedData,
        landlordId: session.user.id,
        citySlug: citySlugFromLocation(validatedData.location),
      },
    })

    return NextResponse.json(
      { message: "Listing created successfully", listing },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    console.error("Create listing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const type = searchParams.get("type")
    const location = searchParams.get("location")
    const citySlug = searchParams.get("citySlug")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const checkInDate = searchParams.get("checkInDate")
    const checkOutDate = searchParams.get("checkOutDate")
    const guests = searchParams.get("guests")
    const minRating = searchParams.get("minRating")
    const amenitiesParam = searchParams.get("amenities")
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const mine = searchParams.get("mine") === "true"

    const where: Record<string, unknown> = {}

    if (mine) {
      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      where.landlordId = session.user.id
    } else {
      where.isActive = true
    }

    if (type && ["ROOM", "EQUIPMENT", "SPACE"].includes(type)) {
      where.type = type
    }

    if (citySlug) {
      where.citySlug = citySlug
    } else if (location) {
      where.location = { contains: location, mode: "insensitive" }
    }

    if (minPrice || maxPrice) {
      where.pricePerDay = {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
      }
    }

    if (guests) {
      const guestCount = parseInt(guests, 10)
      if (!Number.isNaN(guestCount)) {
        where.OR = [
          { maxOccupants: { gte: guestCount } },
          { maxOccupants: null },
        ]
      }
    }

    if (amenitiesParam) {
      const amenities = amenitiesParam.split(",").filter(Boolean)
      if (amenities.length) {
        where.amenities = { hasEvery: amenities }
      }
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          reviews: { select: { rating: true } },
          landlord: { select: { name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ])

    let results = listings.map((listing) => {
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

    if (minRating) {
      const min = parseFloat(minRating)
      results = results.filter((l) => l.averageRating >= min)
    }

    if (lat && lng && radius) {
      const centerLat = parseFloat(lat)
      const centerLng = parseFloat(lng)
      const radiusKm = parseFloat(radius)
      if (!Number.isNaN(centerLat) && !Number.isNaN(centerLng) && !Number.isNaN(radiusKm)) {
        results = results.filter((l) => {
          if (l.latitude == null || l.longitude == null) return false
          return haversineKm(centerLat, centerLng, l.latitude, l.longitude) <= radiusKm
        })
      }
    }

    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate)
      const checkOut = new Date(checkOutDate)

      const availableResults = await Promise.all(
        results.map(async (listing) => {
          const [conflict, blocked] = await Promise.all([
            prisma.booking.findFirst({
              where: {
                listingId: listing.id,
                status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
                checkInDate: { lt: checkOut },
                checkOutDate: { gt: checkIn },
              },
            }),
            prisma.unavailableDate.findFirst({
              where: {
                listingId: listing.id,
                date: { gte: checkIn, lt: checkOut },
              },
            }),
          ])
          return conflict || blocked ? null : listing
        })
      )
      results = availableResults.filter((l): l is NonNullable<typeof l> => l !== null)
    }

    return NextResponse.json({
      listings: results,
      pagination: {
        total: checkInDate && checkOutDate ? results.length : total,
        page,
        limit,
        pages: Math.ceil((checkInDate && checkOutDate ? results.length : total) / limit),
      },
    })
  } catch (error) {
    console.error("Fetch listings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
