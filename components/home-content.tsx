'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ListingCard } from '@/components/listing-card'
import { useI18n } from '@/lib/i18n/context'
import { Search, CreditCard, KeyRound, Shield, Calendar, Layers, Umbrella, Headphones, Star } from 'lucide-react'
import { motion } from 'motion/react'

type HomeStats = {
  usersCount: number
  listingsCount: number
  bookingsCount: number
  featuredListings: Array<{
    id: string; title: string; description: string; type: string
    location: string; pricePerDay: number; images: string[]
    averageRating: number; reviewCount: number
    landlord: { name: string | null; image: string | null }
  }>
  latestReviews: Array<{
    id: string; rating: number; title: string; comment: string
    user: { name: string | null; image: string | null }
    listing: { title: string }
  }>
}

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

const STAGGER = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

export function HomeContent({ stats }: { stats: HomeStats }) {
  const { t } = useI18n()

  const steps = [
    { icon: Search, title: t.howItWorks.step1Title, desc: t.howItWorks.step1Desc },
    { icon: CreditCard, title: t.howItWorks.step2Title, desc: t.howItWorks.step2Desc },
    { icon: KeyRound, title: t.howItWorks.step3Title, desc: t.howItWorks.step3Desc },
  ]

  const features = [
    { icon: Shield, title: t.features.secure, desc: t.features.secureDesc },
    { icon: Calendar, title: t.features.flexible, desc: t.features.flexibleDesc },
    { icon: Layers, title: t.features.variety, desc: t.features.varietyDesc },
    { icon: Umbrella, title: t.features.protection, desc: t.features.protectionDesc },
    { icon: Headphones, title: t.features.support, desc: t.features.supportDesc },
    { icon: Star, title: t.features.reviews, desc: t.features.reviewsDesc },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--garden-glow),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-32 lg:pt-28">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <motion.div 
              className="max-w-xl"
              initial="hidden"
              animate="show"
              variants={STAGGER}
            >
              <motion.p variants={FADE_UP} className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                {t.hero.eyebrow}
              </motion.p>
              <motion.h1 variants={FADE_UP} className="font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.08] tracking-[-0.03em] text-foreground">
                {t.hero.title}
              </motion.h1>
              <motion.p variants={FADE_UP} className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                {t.hero.subtitle}
              </motion.p>
              <motion.div variants={FADE_UP} className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/search">
                  <Button size="lg" className="w-full sm:w-auto px-8 transition-transform active:scale-95">
                    {t.hero.ctaExplore}
                  </Button>
                </Link>
                <Link href="/auth/register?role=LANDLORD">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 transition-transform active:scale-95">
                    {t.hero.ctaHost}
                  </Button>
                </Link>
              </motion.div>
              <motion.dl variants={FADE_UP} className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-10">
                <div>
                  <dd className="text-3xl font-semibold tabular-nums text-foreground">{stats.listingsCount}+</dd>
                  <dt className="mt-1 text-sm text-muted-foreground">{t.hero.statListings}</dt>
                </div>
                <div>
                  <dd className="text-3xl font-semibold tabular-nums text-foreground">{stats.usersCount}+</dd>
                  <dt className="mt-1 text-sm text-muted-foreground">{t.hero.statUsers}</dt>
                </div>
                <div>
                  <dd className="text-3xl font-semibold tabular-nums text-foreground">{stats.bookingsCount}+</dd>
                  <dt className="mt-1 text-sm text-muted-foreground">{t.hero.statBookings}</dt>
                </div>
              </motion.dl>
            </motion.div>

            <motion.div 
              className="grid grid-cols-2 gap-4"
              initial="hidden"
              animate="show"
              variants={STAGGER}
            >
              {stats.featuredListings.slice(0, 4).map((listing, i) => (
                <motion.div 
                  key={listing.id} 
                  variants={FADE_UP}
                  className={i % 2 === 1 ? 'mt-8' : ''}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-card/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={STAGGER}
          >
            <motion.h2 variants={FADE_UP} className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
              {t.howItWorks.title}
            </motion.h2>
            <motion.p variants={FADE_UP} className="mt-4 text-muted-foreground leading-relaxed">{t.howItWorks.subtitle}</motion.p>
          </motion.div>
          <motion.div 
            className="mt-16 grid gap-10 md:grid-cols-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={STAGGER}
          >
            {steps.map((step, i) => (
              <motion.div key={step.title} variants={FADE_UP} className="relative group">
                <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <step.icon className="size-5" strokeWidth={1.75} />
                </div>
                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured listings */}
      {stats.featuredListings.length > 0 && (
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="flex items-end justify-between gap-4"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={STAGGER}
            >
              <div>
                <motion.h2 variants={FADE_UP} className="font-display text-3xl tracking-tight">{t.search.title}</motion.h2>
                <motion.p variants={FADE_UP} className="mt-2 text-muted-foreground">{t.hero.subtitle.slice(0, 80)}…</motion.p>
              </div>
              <motion.div variants={FADE_UP}>
                <Link href="/search" className="hidden sm:block">
                  <Button variant="outline" className="transition-transform active:scale-95">{t.hero.ctaExplore}</Button>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div 
              className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={STAGGER}
            >
              {stats.featuredListings.map((listing) => (
                <motion.div key={listing.id} variants={FADE_UP} whileHover={{ y: -4 }}>
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {stats.latestReviews.length > 0 && (
        <section className="border-t border-border bg-muted/30 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="mx-auto max-w-2xl text-center"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={STAGGER}
            >
              <motion.h2 variants={FADE_UP} className="font-display text-3xl tracking-tight">{t.reviews.title}</motion.h2>
              <motion.p variants={FADE_UP} className="mt-4 text-muted-foreground">{t.reviews.subtitle}</motion.p>
            </motion.div>
            <motion.div 
              className="mt-12 grid gap-6 md:grid-cols-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={STAGGER}
            >
              {stats.latestReviews.map((review) => (
                <motion.blockquote
                  key={review.id}
                  variants={FADE_UP}
                  whileHover={{ scale: 1.02 }}
                  className="flex flex-col rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${i < review.rating ? 'fill-accent text-accent' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                  <p className="mt-4 font-medium">{review.title}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {review.comment}
                  </p>
                  <footer className="mt-6 flex items-center gap-3 border-t border-border pt-6">
                    {review.user.image && (
                      <img src={review.user.image} alt="" className="size-10 rounded-full object-cover" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{review.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.reviews.onListing}: {review.listing.title}
                      </p>
                    </div>
                  </footer>
                </motion.blockquote>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={STAGGER}
          >
            <motion.h2 variants={FADE_UP} className="font-display text-3xl tracking-tight">{t.features.title}</motion.h2>
            <motion.p variants={FADE_UP} className="mt-4 text-muted-foreground">{t.features.subtitle}</motion.p>
          </motion.div>
          <motion.div 
            className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={STAGGER}
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={FADE_UP} className="group">
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-secondary text-primary transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="size-5" strokeWidth={1.75} />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center sm:px-16 lg:py-20"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.5_0.1_155/0.4),transparent_60%)]" />
            <div className="relative">
              <h2 className="font-display text-3xl tracking-tight text-primary-foreground sm:text-4xl">
                {t.cta.title}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80 leading-relaxed">
                {t.cta.subtitle}
              </p>
              <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/search">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8 transition-transform active:scale-95">
                    {t.cta.explore}
                  </Button>
                </Link>
                <Link href="/auth/register?role=LANDLORD">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto px-8 transition-transform active:scale-95"
                  >
                    {t.cta.host}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}