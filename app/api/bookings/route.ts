import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import type { BookingPricingType, BookingStatus, Prisma } from "@prisma/client"
import { validateStayRules, getInitialBookingStatus } from "@/lib/booking-rules"
import {
  calculateDailyPrice,
  calculateHourlyPrice,
  calculatePackagePrice,
} from "@/lib/pricing"
import { getOrCreateLoyaltyAccount, isEligibleForThirdBookingDiscount } from "@/lib/loyalty"
import { getReferralCreditForUser, redeemReferralCredit } from "@/lib/referral"

const createBookingSchema = z.object({
  listingId: z.string().cuid(),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime(),
  numberOfGuests: z.number().int().positive(),
  specialRequests: z.string().optional(),
  pricingType: z.enum(["DAILY", "HOURLY", "PACKAGE"]).default("DAILY"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  packageId: z.string().cuid().optional(),
  optionIds: z.array(z.string().cuid()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createBookingSchema.parse(body)
    const {
      listingId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      specialRequests,
      pricingType,
      startTime,
      endTime,
      packageId,
      optionIds,
    } = parsed

    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        pricingRules: { where: { isActive: true } },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    if (!listing.isActive) {
      return NextResponse.json({ error: "Listing is not available" }, { status: 400 })
    }

    if (listing.maxOccupants && numberOfGuests > listing.maxOccupants) {
      return NextResponse.json(
        { error: "Number of guests exceeds listing capacity" },
        { status: 400 }
      )
    }

    if (pricingType === "DAILY") {
      const violation = validateStayRules(listing, checkIn, checkOut)
      if (violation) {
        const messages: Record<string, string> = {
          min_nights: `Minimum stay is ${listing.minNights} night(s)`,
          max_nights: `Maximum stay is ${listing.maxNights} night(s)`,
          advance_notice: `Booking requires ${listing.advanceNoticeDays} day(s) advance notice`,
          past_date: "Check-in date cannot be in the past",
          invalid_range: "Check-out date must be after check-in date",
        }
        return NextResponse.json({ error: messages[violation] }, { status: 400 })
      }
    }

    if (pricingType === "HOURLY" && !listing.hourlyBookingEnabled) {
      return NextResponse.json(
        { error: "Hourly booking is not available for this listing" },
        { status: 400 }
      )
    }

    if (pricingType === "PACKAGE" && !packageId) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 })
    }

    const [loyaltyAccount, referralCredit] = await Promise.all([
      getOrCreateLoyaltyAccount(session.user.id),
      getReferralCreditForUser(session.user.id),
    ])

    let priceBreakdown
    let hours: number | undefined

    if (pricingType === "HOURLY") {
      if (!startTime || !endTime) {
        return NextResponse.json(
          { error: "Start and end times are required for hourly booking" },
          { status: 400 }
        )
      }
      const [startH, startM] = startTime.split(":").map(Number)
      const [endH, endM] = endTime.split(":").map(Number)
      hours = endH + endM / 60 - (startH + startM / 60)
      if (hours <= 0 || hours > 24) {
        return NextResponse.json({ error: "Invalid time range" }, { status: 400 })
      }
      priceBreakdown = calculateHourlyPrice(listing, hours, { referralCredit })
    } else if (pricingType === "PACKAGE") {
      const pkg = await prisma.eventPackage.findFirst({
        where: { id: packageId, listingId, isActive: true },
        include: { options: true },
      })
      if (!pkg) {
        return NextResponse.json({ error: "Package not found" }, { status: 404 })
      }
      const selectedOptions = optionIds?.length
        ? pkg.options.filter((o) => optionIds.includes(o.id))
        : []
      priceBreakdown = calculatePackagePrice(
        pkg.basePrice,
        selectedOptions.map((o) => o.price),
        { referralCredit }
      )
    } else {
      priceBreakdown = calculateDailyPrice(
        listing,
        checkIn,
        checkOut,
        listing.pricingRules,
        {
          loyaltyBookingCount: isEligibleForThirdBookingDiscount(
            loyaltyAccount.totalBookings
          )
            ? loyaltyAccount.totalBookings
            : undefined,
          referralCredit,
        }
      )
    }

    const status = getInitialBookingStatus(listing.bookingMode)

    const booking = await prisma.$transaction(async (tx) => {
      const conflictingBooking = await tx.booking.findFirst({
        where: {
          listingId,
          status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
          checkInDate: { lt: checkOut },
          checkOutDate: { gt: checkIn },
        },
      })

      if (conflictingBooking) {
        throw new Error("Dates conflict with existing booking")
      }

      const unavailableDates = await tx.unavailableDate.findFirst({
        where: {
          listingId,
          date: { gte: checkIn, lt: checkOut },
        },
      })

      if (unavailableDates) {
        throw new Error("Selected dates include unavailable days")
      }

      const customerId = session.user.id
      if (!customerId) throw new Error("User ID is required")

      if (priceBreakdown.referralCredit > 0) {
        await redeemReferralCredit(customerId)
      }

      return tx.booking.create({
        data: {
          listingId,
          customerId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfGuests,
          specialRequests,
          totalPrice: priceBreakdown.total,
          loyaltyDiscount: priceBreakdown.loyaltyDiscount,
          referralCredit: priceBreakdown.referralCredit,
          pricingType: pricingType as BookingPricingType,
          startTime: pricingType === "HOURLY" ? startTime : null,
          endTime: pricingType === "HOURLY" ? endTime : null,
          packageId: pricingType === "PACKAGE" ? packageId : null,
          status,
        },
        include: { listing: true },
      })
    })

    await prisma.notification.create({
      data: {
        userId: listing.landlordId,
        bookingId: booking.id,
        type: status === "CONFIRMED" ? "booking_confirmed" : "new_booking",
        title: status === "CONFIRMED" ? "Nouvelle réservation confirmée" : "Nouvelle demande de réservation",
        message: `${status === "CONFIRMED" ? "Réservation confirmée" : "Demande de réservation"} pour ${listing.title}`,
      },
    })

    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking,
        priceBreakdown,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    const message = error instanceof Error ? error.message : "Internal server error"
    const status =
      message.includes("conflict") ||
      message.includes("Dates") ||
      message.includes("unavailable")
        ? 409
        : 500

    return NextResponse.json({ error: message }, { status })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const listingId = searchParams.get("listingId")
    const status = searchParams.get("status")

    if (listingId) {
      const bookings = await prisma.booking.findMany({
        where: {
          listingId,
          status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
        },
        select: {
          checkInDate: true,
          checkOutDate: true,
        },
      })

      return NextResponse.json({ bookings })
    }

    const where: Prisma.BookingWhereInput = { customerId: session.user.id }
    if (status && status !== "ALL") {
      where.status = status as BookingStatus
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: { listing: true },
      orderBy: { checkInDate: "desc" },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Fetch bookings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
