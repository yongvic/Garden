import { ListingType } from '@prisma/client'
import { resolveGeoFromLocation } from '../lib/geo'

type SeedListing = {
  title: string
  description: string
  type: ListingType
  location: string
  pricePerDay: number
  maxOccupants: number | null
  amenities: string[]
  images: string[]
  rules?: string
  cancellationPolicy?: string
  bookingMode?: 'INSTANT' | 'REQUEST'
  minNights?: number
  hourlyBookingEnabled?: boolean
  pricePerHour?: number
}

const IMG = {
  conference: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  coworking: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  meeting: 'https://images.unsplash.com/photo-1497215888134-3d9c122ed274?w=800&q=80',
  loft: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
  studio: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
  rooftop: 'https://images.unsplash.com/photo-1533104816-cdd210667b93?w=800&q=80',
  training: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
  office: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
  room: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  equipment: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80',
  event: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80',
}

function L(
  title: string,
  description: string,
  type: ListingType,
  location: string,
  pricePerDay: number,
  opts: Partial<SeedListing> = {}
): SeedListing & ReturnType<typeof resolveGeoFromLocation> {
  const geo = resolveGeoFromLocation(location)!
  return {
    title,
    description,
    type,
    location,
    pricePerDay,
    maxOccupants: opts.maxOccupants ?? (type === 'EQUIPMENT' ? null : 20),
    amenities: opts.amenities ?? ['wifi', 'parking'],
    images: opts.images ?? [IMG.event, IMG.meeting],
    rules: opts.rules ?? 'Usage professionnel uniquement.',
    cancellationPolicy: opts.cancellationPolicy ?? 'Annulation gratuite 48h avant.',
    bookingMode: opts.bookingMode ?? 'REQUEST',
    minNights: opts.minNights ?? 1,
    hourlyBookingEnabled: opts.hourlyBookingEnabled ?? false,
    pricePerHour: opts.pricePerHour,
    ...geo,
  }
}

export const DEMO_LISTINGS: Array<
  SeedListing & {
    latitude: number
    longitude: number
    citySlug: string
    neighborhood: string | null
  }
> = [
  // —— Lomé (12) ——
  L('Amphithéâtre Business 200 places', 'Grande salle modulable pour conférences et lancements produit.', 'SPACE', 'Lomé, Nyékonakpoè', 500000, { maxOccupants: 200, amenities: ['wifi', 'projector', 'ac', 'parking', 'catering'], images: [IMG.event, IMG.conference], bookingMode: 'REQUEST' }),
  L('Coworking Tech Tokoin', 'Open space fibre optique, cabines et café illimité.', 'SPACE', 'Lomé, Tokoin', 15000, { maxOccupants: 1, amenities: ['wifi', 'ac', 'kitchen'], images: [IMG.coworking, IMG.office], hourlyBookingEnabled: true, pricePerHour: 2500, bookingMode: 'INSTANT' }),
  L('Salle exécutive Tokoin', 'Réunion VIP, écran 85" et service traiteur.', 'SPACE', 'Lomé, Tokoin', 95000, { maxOccupants: 12, amenities: ['wifi', 'projector', 'ac', 'catering'], images: [IMG.meeting] }),
  L('Loft événementiel Bè', 'Afterwork, expositions et tournages commerciaux.', 'SPACE', 'Lomé, Bè-Klikamé', 200000, { maxOccupants: 50, amenities: ['wifi', 'security', 'catering'], images: [IMG.loft] }),
  L('Studio photo cyclorama', 'Fond vert/blanc, lumière modulable.', 'SPACE', 'Lomé, Kegué', 100000, { maxOccupants: 15, amenities: ['wifi', 'ac', 'parking'], images: [IMG.studio] }),
  L('Rooftop networking Baguida', 'Vue mer, cocktails B2B.', 'SPACE', 'Lomé, Baguida', 350000, { maxOccupants: 100, amenities: ['wifi', 'catering', 'security'], images: [IMG.rooftop] }),
  L('Salle formation Agoè', '30 places, vidéoprojecteur et paperboard.', 'SPACE', 'Lomé, Agoè', 55000, { maxOccupants: 30, amenities: ['wifi', 'projector', 'ac'], images: [IMG.training] }),
  L('Bureau privé jour — Kodjoviakopé', 'Bureau fermé 4 postes pour missions courtes.', 'ROOM', 'Lomé, Kodjoviakopé', 35000, { maxOccupants: 4, amenities: ['wifi', 'ac', 'parking'], images: [IMG.office], bookingMode: 'INSTANT' }),
  L('Pack sonorisation Bose', 'Système pro avec caissons et console.', 'EQUIPMENT', 'Lomé, Agoè', 85000, { amenities: ['parking', 'security'], images: [IMG.equipment] }),
  L('Écran tactile 85" 4K', 'Présentations interactives et workshops.', 'EQUIPMENT', 'Lomé, Bè', 70000, { amenities: ['wifi', 'parking'], images: [IMG.equipment] }),
  L('50 chaises Chiavari', 'Location événementiel, livraison Lomé.', 'EQUIPMENT', 'Lomé, Nyékonakpoè', 25000, { amenities: ['parking'], images: [IMG.event] }),
  L('Kit vidéo Sony FX6', 'Interviews corporate et documentaires.', 'EQUIPMENT', 'Lomé, Kegué', 200000, { amenities: ['security'], images: [IMG.studio] }),

  // —— Accra (10) ——
  L('Conference Hall Osu', 'Salle 150 places, AC et traduction simultanée.', 'SPACE', 'Accra, Osu', 420000, { maxOccupants: 150, amenities: ['wifi', 'projector', 'ac', 'catering', 'elevator'], images: [IMG.conference] }),
  L('Innovation Hub Airport City', 'Coworking premium proche aéroport.', 'SPACE', 'Accra, Airport City', 22000, { maxOccupants: 1, amenities: ['wifi', 'ac', 'kitchen', 'parking'], images: [IMG.coworking], hourlyBookingEnabled: true, pricePerHour: 4000, bookingMode: 'INSTANT' }),
  L('Boardroom Labone', 'Table 16 places, vue jardin.', 'SPACE', 'Accra, Labone', 110000, { maxOccupants: 16, amenities: ['wifi', 'projector', 'ac'], images: [IMG.meeting] }),
  L('Creative Loft Jamestown', 'Espace créatif pour shootings et pop-ups.', 'SPACE', 'Accra, Jamestown', 180000, { maxOccupants: 40, amenities: ['wifi', 'security'], images: [IMG.loft] }),
  L('Training Room East Legon', 'Formation et ateliers startups.', 'SPACE', 'Accra, East Legon', 65000, { maxOccupants: 25, amenities: ['wifi', 'projector', 'ac', 'parking'], images: [IMG.training] }),
  L('Executive Suite Cantonments', 'Bureau meublé journée/semaine.', 'ROOM', 'Accra, Cantonments', 45000, { maxOccupants: 3, amenities: ['wifi', 'ac', 'kitchen'], images: [IMG.room], bookingMode: 'INSTANT' }),
  L('LED Wall 4x3m', 'Mur LED événementiel.', 'EQUIPMENT', 'Accra, Osu', 250000, { amenities: ['security', 'parking'], images: [IMG.equipment] }),
  L('PA System 2000W', 'Sonorisation extérieure.', 'EQUIPMENT', 'Accra, Labone', 95000, { amenities: ['parking'], images: [IMG.equipment] }),
  L('Projecteur laser 8000lm', 'Grand auditorium.', 'EQUIPMENT', 'Accra, Airport City', 130000, { amenities: ['parking'], images: [IMG.equipment] }),
  L('Tables cocktail x10', 'Mange-debout avec housses.', 'EQUIPMENT', 'Accra, East Legon', 35000, { amenities: ['parking'], images: [IMG.event] }),

  // —— Cotonou (8) ——
  L('Centre de conférences Ganhi', '200 places, interprétation et parking.', 'SPACE', 'Cotonou, Ganhi', 380000, { maxOccupants: 200, amenities: ['wifi', 'projector', 'ac', 'parking', 'catering'], images: [IMG.conference] }),
  L('Hub coworking Fidjrossè', 'Open space climatisé 24/7.', 'SPACE', 'Cotonou, Fidjrossè', 18000, { maxOccupants: 1, amenities: ['wifi', 'ac', 'kitchen'], images: [IMG.coworking], bookingMode: 'INSTANT' }),
  L('Salle conseil Cadjehoun', 'Réunions direction, 14 places.', 'SPACE', 'Cotonou, Cadjehoun', 85000, { maxOccupants: 14, amenities: ['wifi', 'projector', 'ac'], images: [IMG.meeting] }),
  L('Espace événementiel Akpakpa', 'Réceptions et lancements.', 'SPACE', 'Cotonou, Akpakpa', 160000, { maxOccupants: 60, amenities: ['wifi', 'catering', 'security'], images: [IMG.loft] }),
  L('Studio podcast Cadjehoun', 'Isolation phonique, 4 micros.', 'SPACE', 'Cotonou, Cadjehoun', 75000, { maxOccupants: 6, amenities: ['wifi', 'ac'], images: [IMG.studio] }),
  L('Bureau équipe 6 — Ganhi', 'Espace projet temporaire.', 'ROOM', 'Cotonou, Ganhi', 40000, { maxOccupants: 6, amenities: ['wifi', 'ac', 'parking'], images: [IMG.office] }),
  L('Kit micros HF Shure x4', 'Panels et conférences.', 'EQUIPMENT', 'Cotonou, Fidjrossè', 40000, { amenities: ['parking'], images: [IMG.equipment] }),
  L('Tente réception 200m²', 'Structure professionnelle.', 'EQUIPMENT', 'Cotonou, Akpakpa', 120000, { amenities: ['security', 'parking'], images: [IMG.event] }),

  // —— Abidjan (8) ——
  L('Palais des congrès Plateau', 'Grande capacité, prestige.', 'SPACE', 'Abidjan, Plateau', 550000, { maxOccupants: 300, amenities: ['wifi', 'projector', 'ac', 'elevator', 'catering', 'security'], images: [IMG.conference] }),
  L('Coworking Cocody Riviera', 'Espace moderne startups.', 'SPACE', 'Abidjan, Cocody', 25000, { maxOccupants: 1, amenities: ['wifi', 'ac', 'kitchen', 'parking'], images: [IMG.coworking], hourlyBookingEnabled: true, pricePerHour: 4500 }),
  L('Salle réunion Marcory', '18 places, visioconférence.', 'SPACE', 'Abidjan, Marcory', 90000, { maxOccupants: 18, amenities: ['wifi', 'projector', 'ac'], images: [IMG.meeting] }),
  L('Showroom Zone 4', 'Expositions produits B2B.', 'SPACE', 'Abidjan, Zone 4', 140000, { maxOccupants: 35, amenities: ['wifi', 'security', 'parking'], images: [IMG.loft] }),
  L('Salle formation Yopougon', 'Ateliers et bootcamps.', 'SPACE', 'Abidjan, Yopougon', 60000, { maxOccupants: 28, amenities: ['wifi', 'projector', 'ac'], images: [IMG.training] }),
  L('Suite bureau Plateau', 'Bureau exécutif journée.', 'ROOM', 'Abidjan, Plateau', 50000, { maxOccupants: 2, amenities: ['wifi', 'ac', 'elevator'], images: [IMG.room], bookingMode: 'INSTANT' }),
  L('Caméra broadcast + régie', 'Couverture événement.', 'EQUIPMENT', 'Abidjan, Cocody', 220000, { amenities: ['security'], images: [IMG.equipment] }),
  L('Mobilier séminaire 80 places', 'Tables + chaises + nappes.', 'EQUIPMENT', 'Abidjan, Marcory', 55000, { amenities: ['parking'], images: [IMG.event] }),

  // —— Dakar (8) ——
  L('Auditorium Almadies', 'Conférences internationales.', 'SPACE', 'Dakar, Almadies', 480000, { maxOccupants: 180, amenities: ['wifi', 'projector', 'ac', 'catering', 'parking'], images: [IMG.conference] }),
  L('Coworking Plateau Dakar', 'Open space centre-ville.', 'SPACE', 'Dakar, Plateau', 20000, { maxOccupants: 1, amenities: ['wifi', 'ac', 'kitchen'], images: [IMG.coworking], bookingMode: 'INSTANT' }),
  L('Salle VIP Mermoz', 'Réunions investisseurs.', 'SPACE', 'Dakar, Mermoz', 100000, { maxOccupants: 10, amenities: ['wifi', 'projector', 'ac', 'catering'], images: [IMG.meeting] }),
  L('Terrasse événementielle Ouakam', 'Vue océan, networking.', 'SPACE', 'Dakar, Ouakam', 280000, { maxOccupants: 80, amenities: ['wifi', 'catering', 'security'], images: [IMG.rooftop] }),
  L('Studio vidéo Point E', 'Plateau tournage interviews.', 'SPACE', 'Dakar, Point E', 95000, { maxOccupants: 12, amenities: ['wifi', 'ac'], images: [IMG.studio] }),
  L('Bureau projet Médina', '4 postes équipe terrain.', 'ROOM', 'Dakar, Médina', 30000, { maxOccupants: 4, amenities: ['wifi', 'parking'], images: [IMG.office] }),
  L('Éclairage scène LED', 'Pack événementiel complet.', 'EQUIPMENT', 'Dakar, Almadies', 150000, { amenities: ['security'], images: [IMG.equipment] }),
  L('Groupe électrogène 20kVA', 'Alimentation secours événement.', 'EQUIPMENT', 'Dakar, Plateau', 80000, { amenities: ['parking', 'security'], images: [IMG.equipment] }),

  // —— Villes secondaires Togo (6) ——
  L('Salle formation Kara', 'Nord Togo, ateliers pro.', 'SPACE', 'Kara, Chaminade', 60000, { maxOccupants: 30, amenities: ['wifi', 'projector', 'ac'], images: [IMG.training] }),
  L('Salle réunion Kpalimé', 'Vue collines, 15 places.', 'SPACE', 'Kpalimé, Kpodzi', 80000, { maxOccupants: 15, amenities: ['wifi', 'projector', 'catering'], images: [IMG.meeting] }),
  L('Studio Tsévié', 'Shooting produit et portrait.', 'SPACE', 'Tsévié, Centre', 70000, { maxOccupants: 10, amenities: ['wifi', 'ac'], images: [IMG.studio] }),
  L('Salle polyvalente Sokodé', 'Événements régionaux.', 'SPACE', 'Sokodé, Centre', 45000, { maxOccupants: 40, amenities: ['wifi', 'parking'], images: [IMG.event] }),
  L('Projecteur Kpalimé', 'Location matériel audiovisuel.', 'EQUIPMENT', 'Kpalimé', 120000, { amenities: ['parking'], images: [IMG.equipment] }),
  L('Sonorisation Sokodé', 'Système complet + technicien option.', 'EQUIPMENT', 'Sokodé, Centre', 85000, { amenities: ['parking'], images: [IMG.equipment] }),
]
