import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { Role } from "@prisma/client"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== Role.LANDLORD && session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const landlordId = session.user.id
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalListings,
      activeListings,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      revenueData,
      thisMonthRevenue,
      lastMonthRevenue,
    ] = await Promise.all([
      prisma.listing.count({ where: { landlordId } }),
      prisma.listing.count({ where: { landlordId, isActive: true } }),
      prisma.booking.count({
        where: { listing: { landlordId } },
      }),
      prisma.booking.count({
        where: { listing: { landlordId }, status: "PENDING" },
      }),
      prisma.booking.count({
        where: { listing: { landlordId }, status: "CONFIRMED" },
      }),
      prisma.booking.count({
        where: { listing: { landlordId }, status: "COMPLETED" },
      }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          listing: { landlordId },
          status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] },
        },
      }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          listing: { landlordId },
          status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] },
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          listing: { landlordId },
          status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] },
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
    ])

    // Occupancy rate: completed bookings / total days available (rough estimate)
    const occupancyRate =
      totalBookings > 0
        ? Math.round((completedBookings / totalBookings) * 100)
        : 0

    return NextResponse.json({
      listings: { total: totalListings, active: activeListings },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
      },
      revenue: {
        total: revenueData._sum.totalPrice ?? 0,
        thisMonth: thisMonthRevenue._sum.totalPrice ?? 0,
        lastMonth: lastMonthRevenue._sum.totalPrice ?? 0,
      },
      occupancyRate,
    })
  } catch (error) {
    console.error("Landlord stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
