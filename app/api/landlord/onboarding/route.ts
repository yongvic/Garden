import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const updateOnboardingSchema = z.object({
  profileComplete: z.boolean().optional(),
  firstListingCreated: z.boolean().optional(),
  calendarConfigured: z.boolean().optional(),
  pricingConfigured: z.boolean().optional(),
  photosUploaded: z.boolean().optional(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isLandlord =
      session.user.role === "LANDLORD" || session.user.role === "ADMIN"
    if (!isLandlord) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const progress = await prisma.landlordOnboarding.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
    })

    const steps = [
      progress.profileComplete,
      progress.firstListingCreated,
      progress.calendarConfigured,
      progress.pricingConfigured,
      progress.photosUploaded,
    ]
    const completedCount = steps.filter(Boolean).length
    const totalSteps = steps.length
    const percentComplete = Math.round((completedCount / totalSteps) * 100)

    return NextResponse.json({
      progress,
      completedCount,
      totalSteps,
      percentComplete,
      isComplete: !!progress.completedAt,
    })
  } catch (error) {
    console.error("Landlord onboarding GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isLandlord =
      session.user.role === "LANDLORD" || session.user.role === "ADMIN"
    if (!isLandlord) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const flags = updateOnboardingSchema.parse(await req.json())

    const existing = await prisma.landlordOnboarding.findUnique({
      where: { userId: session.user.id },
    })

    const merged = {
      profileComplete: flags.profileComplete ?? existing?.profileComplete ?? false,
      firstListingCreated:
        flags.firstListingCreated ?? existing?.firstListingCreated ?? false,
      calendarConfigured:
        flags.calendarConfigured ?? existing?.calendarConfigured ?? false,
      pricingConfigured:
        flags.pricingConfigured ?? existing?.pricingConfigured ?? false,
      photosUploaded: flags.photosUploaded ?? existing?.photosUploaded ?? false,
    }

    const allComplete = Object.values(merged).every(Boolean)

    const progress = await prisma.landlordOnboarding.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...merged,
        completedAt: allComplete ? new Date() : null,
      },
      update: {
        ...flags,
        completedAt: allComplete ? new Date() : undefined,
      },
    })

    return NextResponse.json({ progress })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Landlord onboarding PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
