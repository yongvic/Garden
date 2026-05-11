import { Role } from "@prisma/client"

/**
 * Listing avec stats calculées
 */
export interface ListingWithStats {
  id: string
  title: string
  description: string
  type: "ROOM" | "EQUIPMENT" | "SPACE"
  location: string
  latitude?: number | null
  longitude?: number | null
  pricePerDay: number
  maxOccupants?: number | null
  amenities: string[]
  images: string[]
  rules?: string | null
  cancellationPolicy?: string | null
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
  landlordId: string
  landlord: {
    id: string
    name: string | null
    image: string | null
    email: string | null
  }
  averageRating: number
  reviewCount: number
}

/**
 * Réservation avec listing et propriétaire
 */
export interface BookingWithDetails {
  id: string
  bookingNumber: string
  listingId: string
  customerId: string
  checkInDate: Date | string
  checkOutDate: Date | string
  numberOfGuests: number
  specialRequests?: string | null
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  totalPrice: number
  depositAmount?: number | null
  paymentId?: string | null
  paymentStatus: string
  createdAt: Date | string
  updatedAt: Date | string
  listing: {
    id: string
    title: string
    location: string
    images: string[]
    type: string
    pricePerDay: number
    landlordId: string
    landlord?: {
      id: string
      name: string | null
      image: string | null
      email: string | null
    }
  }
  customer?: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

/**
 * Profil utilisateur complet
 */
export interface UserProfile {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: Role
  createdAt: Date | string
  bookingStats: {
    total: number
    pending: number
    confirmed: number
    completed: number
    cancelled: number
  }
}

/**
 * Review avec utilisateur
 */
export interface ReviewWithUser {
  id: string
  listingId: string
  userId: string
  rating: number
  title: string
  comment: string
  createdAt: Date | string
  user: {
    name: string | null
    image: string | null
  }
}

/**
 * Notification
 */
export interface NotificationItem {
  id: string
  userId: string
  bookingId?: string | null
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: Date | string
  booking?: {
    id: string
    bookingNumber: string
    listing: {
      title: string
    }
  } | null
}

/**
 * Stats admin globales
 */
export interface AdminStats {
  users: {
    total: number
    customers: number
    landlords: number
    admins: number
  }
  listings: {
    total: number
    active: number
    rooms: number
    equipment: number
    spaces: number
  }
  bookings: {
    total: number
    pending: number
    confirmed: number
    inProgress: number
    completed: number
    cancelled: number
  }
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
  }
}

/**
 * Stats landlord
 */
export interface LandlordStats {
  listings: {
    total: number
    active: number
  }
  bookings: {
    total: number
    pending: number
    confirmed: number
    completed: number
  }
  revenue: {
    total: number
    thisMonth: number
  }
  occupancyRate: number
}

/**
 * Pagination méta-données
 */
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
}

/**
 * Réponse API paginée générique
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}
