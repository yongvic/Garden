'use client'

import { PageShell } from '@/components/page-shell'

type ContentSection = {
  title: string
  paragraphs: string[]
}

type ContentPageProps = {
  title: string
  subtitle?: string
  sections: ContentSection[]
}

export function ContentPage({ title, subtitle, sections }: ContentPageProps) {
  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-12 border-b border-border pb-10">
          <h1 className="font-display text-4xl tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{subtitle}</p>
          )}
        </header>
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <div className="mt-4 space-y-4">
                {section.paragraphs.map((p, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed">{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </PageShell>
  )
}
