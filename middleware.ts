import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

const protectedRoutes = [
  "/dashboard",
  "/bookings",
  "/profile",
  "/favorites",
  "/landlord",
  "/admin",
]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isProtected = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  )

  if (isProtected && !isLoggedIn) {
    const signInUrl = new URL("/auth/signin", nextUrl.origin)
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Admin role is enforced server-side (requireAdmin) with a fresh DB lookup.
  // Middleware JWT can be stale after a role change in the database.

  if (nextUrl.pathname.startsWith("/landlord") && req.auth?.user?.role !== "LANDLORD" && req.auth?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
