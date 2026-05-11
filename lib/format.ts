/**
 * Formate un montant en FCFA
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount) + " FCFA"
}

/**
 * Formate une date en français
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * Formate une date courte (ex: 10 mai 2026)
 */
export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/**
 * Formate une plage de dates (ex: 10 – 15 mai 2026)
 */
export function formatDateRange(start: Date | string, end: Date | string): string {
  const s = new Date(start)
  const e = new Date(end)
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()

  if (sameMonth) {
    return `${s.getDate()} – ${formatDateShort(e)}`
  }
  return `${formatDateShort(s)} – ${formatDateShort(e)}`
}

/**
 * Calcule le nombre de jours entre deux dates
 */
export function daysBetween(start: Date | string, end: Date | string): number {
  const s = new Date(start)
  const e = new Date(end)
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Formate un statut de réservation en français
 */
export function formatBookingStatus(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    IN_PROGRESS: "En cours",
    COMPLETED: "Terminée",
    CANCELLED: "Annulée",
  }
  return labels[status] ?? status
}

/**
 * Formate un type de listing en français
 */
export function formatListingType(type: string): string {
  const labels: Record<string, string> = {
    ROOM: "Chambre",
    EQUIPMENT: "Équipement",
    SPACE: "Espace",
  }
  return labels[type] ?? type
}

/**
 * Retourne la couleur CSS (classe Tailwind) d'un statut de réservation
 */
export function getBookingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    CONFIRMED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    IN_PROGRESS: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    COMPLETED: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    CANCELLED: "bg-red-500/20 text-red-300 border-red-500/40",
  }
  return colors[status] ?? "bg-gray-500/20 text-gray-300 border-gray-500/40"
}

/**
 * Retourne la couleur CSS d'un type de listing
 */
export function getListingTypeColor(type: string): string {
  const colors: Record<string, string> = {
    ROOM: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    EQUIPMENT: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    SPACE: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  }
  return colors[type] ?? "bg-gray-500/20 text-gray-300 border-gray-500/40"
}

/**
 * Formate un timestamp en relatif (ex: "il y a 3 heures")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days} jour${days > 1 ? "s" : ""}`
  return formatDateShort(date)
}
