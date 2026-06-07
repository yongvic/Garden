'use client'

import { ContentPage } from '@/components/marketing/content-page'
import { useI18n } from '@/lib/i18n/context'
import { marketingPages } from '@/lib/marketing-pages'

export default function AboutPage() {
  const { locale } = useI18n()
  const content = marketingPages.about[locale]

  return (
    <ContentPage
      title={content.title}
      subtitle={content.subtitle}
      sections={content.sections}
    />
  )
}
