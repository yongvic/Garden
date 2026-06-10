export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function citySlugFromLocation(location: string): string {
  const firstPart = location.split(',')[0]?.trim() ?? location
  return slugify(firstPart)
}

export const SEO_CITIES = [
  { slug: 'lome', name: 'Lomé', country: 'Togo', lat: 6.1256, lng: 1.2254 },
  { slug: 'accra', name: 'Accra', country: 'Ghana', lat: 5.6037, lng: -0.187 },
  { slug: 'cotonou', name: 'Cotonou', country: 'Bénin', lat: 6.3654, lng: 2.4183 },
  { slug: 'abidjan', name: 'Abidjan', country: "Côte d'Ivoire", lat: 5.36, lng: -4.0083 },
  { slug: 'dakar', name: 'Dakar', country: 'Sénégal', lat: 14.7167, lng: -17.4677 },
] as const
