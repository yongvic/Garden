import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { Role } from "@prisma/client"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalUsers,
      customerCount,
      landlordCount,
      adminCount,
      totalListings,
      activeListings,
      roomCount,
      equipmentCount,
      spaceCount,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      inProgressBookings,
      completedBookings,
      cancelledBookings,
      revenueData,
      thisMonthRevenue,
      lastMonthRevenue,
      recentBookings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "LANDLORD" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.listing.count(),
      prisma.listing.count({ where: { isActive: true } }),
      prisma.listing.count({ where: { type: "ROOM" } }),
      prisma.listing.count({ where: { type: "EQUIPMENT" } }),
      prisma.listing.count({ where: { type: "SPACE" } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.count({ where: { status: "IN_PROGRESS" } }),
      prisma.booking.count({ where: { status: "COMPLETED" } }),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] } },
      }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] },
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] },
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          listing: { select: { title: true, type: true } },
          customer: { select: { name: true, email: true } },
        },
      }),
    ])

    return NextResponse.json({
      users: {
        total: totalUsers,
        customers: customerCount,
        landlords: landlordCount,
        admins: adminCount,
      },
      listings: {
        total: totalListings,
        active: activeListings,
        rooms: roomCount,
        equipment: equipmentCount,
        spaces: spaceCount,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        inProgress: inProgressBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
      },
      revenue: {
        total: revenueData._sum.totalPrice ?? 0,
        thisMonth: thisMonthRevenue._sum.totalPrice ?? 0,
        lastMonth: lastMonthRevenue._sum.totalPrice ?? 0,
      },
      recentBookings,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
