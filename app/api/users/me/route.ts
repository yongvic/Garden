import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  image: z.string().url().optional().nullable(),
  phone: z.string().optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
})

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Booking stats
    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      prisma.booking.count({ where: { customerId: user.id } }),
      prisma.booking.count({ where: { customerId: user.id, status: "PENDING" } }),
      prisma.booking.count({ where: { customerId: user.id, status: "CONFIRMED" } }),
      prisma.booking.count({ where: { customerId: user.id, status: "COMPLETED" } }),
      prisma.booking.count({ where: { customerId: user.id, status: "CANCELLED" } }),
    ])

    return NextResponse.json({
      ...user,
      bookingStats: { total, pending, confirmed, completed, cancelled },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, image, phone, currentPassword, newPassword } = updateProfileSchema.parse(body)

    const updateData: Record<string, unknown> = {}

    if (name !== undefined) updateData.name = name
    if (image !== undefined) updateData.image = image
    if (phone !== undefined) updateData.phone = phone

    // Handle password change
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      })

      if (!user?.password) {
        return NextResponse.json(
          { error: "Password change not available for OAuth accounts" },
          { status: 400 }
        )
      }

      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json(
          { error: "Mot de passe actuel incorrect" },
          { status: 400 }
        )
      }

      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: { id: true, name: true, email: true, image: true, role: true, phone: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
