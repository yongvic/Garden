import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const optionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  isRequired: z.boolean().optional(),
})

const createPackageSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  packageType: z.enum(["WEDDING", "CONFERENCE", "FILMING", "OTHER"]).optional(),
  basePrice: z.number().nonnegative(),
  options: z.array(optionSchema).optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    const packages = await prisma.eventPackage.findMany({
      where: { listingId: id, isActive: true },
      include: { options: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ packages })
  } catch (error) {
    console.error("Packages GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { landlordId: true },
    })
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    const isOwner = listing.landlordId === session.user.id
    const isAdmin = session.user.role === "ADMIN"
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const data = createPackageSchema.parse(body)

    const pkg = await prisma.eventPackage.create({
      data: {
        listingId: id,
        name: data.name,
        description: data.description,
        packageType: data.packageType ?? "OTHER",
        basePrice: data.basePrice,
        options: data.options
          ? { create: data.options }
          : undefined,
      },
      include: { options: true },
    })

    return NextResponse.json({ package: pkg }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Packages POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
