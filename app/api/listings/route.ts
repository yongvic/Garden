import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

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

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const userRole = (session.user as any).role as string
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
      },
    })

    return NextResponse.json(
      {
        message: "Listing created successfully",
        listing,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    console.error("Create listing error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const type = searchParams.get("type")
    const location = searchParams.get("location")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")

    const mine = searchParams.get("mine") === "true"

    const where: any = {}

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

    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive",
      }
    }

    if (minPrice) {
      where.pricePerDay = { gte: parseFloat(minPrice) }
    }

    if (maxPrice) {
      where.pricePerDay = {
        ...where.pricePerDay,
        lte: parseFloat(maxPrice),
      }
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          reviews: {
            select: {
              rating: true,
            },
          },
          landlord: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ])

    const listingsWithRatings = listings.map((listing) => {
      const averageRating =
        listing.reviews.length > 0
          ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) /
            listing.reviews.length
          : 0

      const { reviews, ...rest } = listing
      return {
        ...rest,
        averageRating: parseFloat(averageRating.toFixed(1)),
        reviewCount: reviews.length,
      }
    })

    return NextResponse.json({
      listings: listingsWithRatings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Fetch listings error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
