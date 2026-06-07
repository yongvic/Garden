'use client'

import { ContentPage } from '@/components/marketing/content-page'
import { useI18n } from '@/lib/i18n/context'
import { marketingPages } from '@/lib/marketing-pages'

export default function HelpPage() {
  const { locale } = useI18n()
  const content = marketingPages.help[locale]

  return (
    <ContentPage
      title={content.title}
      subtitle={content.subtitle}
      sections={content.sections}
    />
  )
}
