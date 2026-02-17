import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/bookings",
  "/profile",
  "/listings",
  "/admin",
]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isProtected = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  )

  // If route is protected and user is not authenticated, redirect to signin
  if (isProtected && !isLoggedIn) {
    const signInUrl = new URL("/auth/signin", nextUrl.origin)
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Role-based access control
  if (nextUrl.pathname.startsWith("/admin") && req.auth?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
