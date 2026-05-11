import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { Role } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (
      !session?.user?.id ||
      (session.user.role !== Role.LANDLORD && session.user.role !== Role.ADMIN)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const landlordId = session.user.id
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const where: Record<string, unknown> = {
      listing: { landlordId },
    }

    if (status && status !== "ALL") {
      where.status = status
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          listing: {
            select: { id: true, title: true, images: true, type: true, location: true },
          },
          customer: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ])

    return NextResponse.json({
      bookings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Landlord bookings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
