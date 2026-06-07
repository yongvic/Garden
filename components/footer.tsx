'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'

export default function Footer() {
  const { t } = useI18n()

  const columns = [
    {
      title: t.footer.product,
      links: [
        { href: '/search', label: t.nav.explore },
        { href: '/how-it-works', label: t.nav.howItWorks },
        { href: '/pricing', label: t.nav.pricing },
      ],
    },
    {
      title: t.footer.company,
      links: [
        { href: '/about', label: t.footer.about },
        { href: '/blog', label: t.footer.blog },
        { href: '/contact', label: t.footer.contact },
      ],
    },
    {
      title: t.footer.support,
      links: [
        { href: '/help', label: t.footer.help },
        { href: '/security', label: t.footer.security },
        { href: '/community', label: t.footer.community },
      ],
    },
    {
      title: t.footer.legal,
      links: [
        { href: '/privacy', label: t.footer.privacy },
        { href: '/terms', label: t.footer.terms },
        { href: '/cookies', label: t.footer.cookies },
      ],
    },
  ]

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <span className="font-display text-lg leading-none">G</span>
              </div>
              <span className="text-lg font-semibold">{t.brand.name}</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
              {t.brand.tagline}
            </p>
          </div>
          <Link
            href="/auth/register?role=LANDLORD"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.nav.hostCta}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-semibold">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
