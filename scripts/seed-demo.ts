import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'
import { DEMO_LISTINGS } from './seed-listings-data'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter: adapter as never })

const DEMO_LANDLORDS = [
  { name: 'Kouadjo', email: 'kouadjo.pro@example.com' },
  { name: 'Afi', email: 'afi.events@example.com' },
  { name: 'Mensah', email: 'mensah.spaces@example.com' },
  { name: 'Aminata', email: 'aminata.events@example.com' },
  { name: 'Omar', email: 'omar.pro@example.com' },
]

async function main() {
  console.log('Seeding demo listings (additive, no delete)...')

  const passwordHash = await bcrypt.hash('Password123!', 10)
  const landlordIds: string[] = []

  for (const ld of DEMO_LANDLORDS) {
    const user = await prisma.user.upsert({
      where: { email: ld.email },
      update: {},
      create: {
        name: ld.name,
        email: ld.email,
        password: passwordHash,
        role: 'LANDLORD',
        isVerified: true,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${ld.email}`,
      },
    })
    landlordIds.push(user.id)
  }

  let created = 0
  let skipped = 0

  for (let i = 0; i < DEMO_LISTINGS.length; i++) {
    const item = DEMO_LISTINGS[i]
    const existing = await prisma.listing.findFirst({
      where: { title: item.title },
    })
    if (existing) {
      skipped++
      continue
    }

    const landlordId = landlordIds[i % landlordIds.length]

    await prisma.listing.create({
      data: {
        title: item.title,
        description: item.description,
        type: item.type,
        location: item.location,
        latitude: item.latitude,
        longitude: item.longitude,
        citySlug: item.citySlug,
        neighborhood: item.neighborhood,
        pricePerDay: item.pricePerDay,
        maxOccupants: item.maxOccupants,
        amenities: item.amenities,
        images: item.images,
        rules: item.rules,
        cancellationPolicy: item.cancellationPolicy,
        bookingMode: item.bookingMode ?? 'REQUEST',
        minNights: item.minNights ?? 1,
        hourlyBookingEnabled: item.hourlyBookingEnabled ?? false,
        pricePerHour: item.pricePerHour,
        landlordId,
        isActive: true,
      },
    })
    created++
  }

  console.log(`Done: ${created} created, ${skipped} skipped (already exist).`)
  console.log(`Total demo listings defined: ${DEMO_LISTINGS.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
