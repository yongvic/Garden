import type { Locale } from './i18n/translations'

const localeMap: Record<Locale, string> = {
  fr: 'fr-FR',
  en: 'en-US',
}

/**
 * Formate un montant en FCFA (XOF)
 */
export function formatCurrency(amount: number, locale: Locale = 'fr'): string {
  const formatted = new Intl.NumberFormat(localeMap[locale], {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount)

  return locale === 'fr' ? `${formatted} FCFA` : `${formatted} XOF`
}

export function formatDate(date: Date | string, locale: Locale = 'fr'): string {
  return new Date(date).toLocaleDateString(localeMap[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(date: Date | string, locale: Locale = 'fr'): string {
  return new Date(date).toLocaleDateString(localeMap[locale], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateRange(
  start: Date | string,
  end: Date | string,
  locale: Locale = 'fr'
): string {
  const s = new Date(start)
  const e = new Date(end)
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()

  if (sameMonth) {
    return `${s.getDate()} – ${formatDateShort(e, locale)}`
  }
  return `${formatDateShort(s, locale)} – ${formatDateShort(e, locale)}`
}

export function daysBetween(start: Date | string, end: Date | string): number {
  const s = new Date(start)
  const e = new Date(end)
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
}

const bookingStatusLabels: Record<Locale, Record<string, string>> = {
  fr: {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    IN_PROGRESS: 'En cours',
    COMPLETED: 'Terminée',
    CANCELLED: 'Annulée',
  },
  en: {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    IN_PROGRESS: 'In progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  },
}

export function formatBookingStatus(status: string, locale: Locale = 'fr'): string {
  return bookingStatusLabels[locale][status] ?? status
}

const listingTypeLabels: Record<Locale, Record<string, string>> = {
  fr: { ROOM: 'Logement', EQUIPMENT: 'Équipement', SPACE: 'Espace' },
  en: { ROOM: 'Accommodation', EQUIPMENT: 'Equipment', SPACE: 'Space' },
}

export function formatListingType(type: string, locale: Locale = 'fr'): string {
  return listingTypeLabels[locale][type] ?? type
}

export function getBookingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
    COMPLETED: 'bg-primary/10 text-primary border-primary/20',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
  }
  return colors[status] ?? 'bg-muted text-muted-foreground border-border'
}

export function getListingTypeColor(type: string): string {
  const colors: Record<string, string> = {
    ROOM: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300',
    EQUIPMENT: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300',
    SPACE: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300',
  }
  return colors[type] ?? 'bg-muted text-muted-foreground'
}

export function formatRelativeTime(date: Date | string, locale: Locale = 'fr'): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (locale === 'en') {
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return formatDateShort(date, locale)
  }

  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  return formatDateShort(date, locale)
}

/** Service fee: 3% for guests */
export function calculateGuestTotal(subtotal: number): number {
  return Math.round(subtotal * 1.03)
}

/** Host payout after 8% commission */
export function calculateHostPayout(subtotal: number): number {
  return Math.round(subtotal * 0.92)
}
