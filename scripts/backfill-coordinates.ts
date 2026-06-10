import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'
import { resolveGeoFromLocation } from '../lib/geo'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter: adapter as never })

async function main() {
  const listings = await prisma.listing.findMany({
    where: {
      OR: [{ latitude: null }, { longitude: null }, { citySlug: null }],
    },
  })

  let updated = 0
  for (const listing of listings) {
    const geo = resolveGeoFromLocation(listing.location)
    if (!geo) {
      console.warn(`No geo match: "${listing.location}" (${listing.id})`)
      continue
    }

    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        latitude: listing.latitude ?? geo.latitude,
        longitude: listing.longitude ?? geo.longitude,
        citySlug: listing.citySlug ?? geo.citySlug,
        neighborhood: listing.neighborhood ?? geo.neighborhood,
      },
    })
    updated++
  }

  console.log(`Backfilled ${updated} / ${listings.length} listings.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
