'use client'

import { ContentPage } from '@/components/marketing/content-page'
import { useI18n } from '@/lib/i18n/context'
import { marketingPages } from '@/lib/marketing-pages'

export default function TermsPage() {
  const { locale } = useI18n()
  const content = marketingPages.terms[locale]

  return (
    <ContentPage
      title={content.title}
      subtitle={content.subtitle}
      sections={content.sections}
    />
  )
}
