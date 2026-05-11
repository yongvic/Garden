import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"

type SessionUser = {
  id: string
  email: string | null
  name: string | null
  image?: string | null
  role: Role
}

/**
 * Récupère la session actuelle. Redirige vers /auth/signin si non authentifié.
 * À utiliser dans les Server Components et Server Actions.
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
    role: (session.user.role as Role) ?? Role.CUSTOMER,
  }
}

/**
 * Vérifie que l'utilisateur a le rôle requis.
 * Redirige vers / si le rôle est insuffisant.
 */
export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await requireAuth()

  if (user.role !== role && user.role !== Role.ADMIN) {
    redirect("/")
  }

  return user
}

/**
 * Vérifie que l'utilisateur est ADMIN.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth()

  if (user.role !== Role.ADMIN) {
    redirect("/")
  }

  return user
}

/**
 * Récupère la session sans redirection (retourne null si non authentifié).
 */
export async function getOptionalAuth(): Promise<SessionUser | null> {
  const session = await auth()

  if (!session?.user?.id) return null

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
    role: (session.user.role as Role) ?? Role.CUSTOMER,
  }
}

/**
 * Vérifie l'authentification dans une API Route.
 * Retourne null si non authentifié (l'API doit renvoyer 401).
 */
export async function getAuthForApi(): Promise<SessionUser | null> {
  return getOptionalAuth()
}
