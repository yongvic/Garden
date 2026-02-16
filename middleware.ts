import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/bookings",
  "/profile",
  "/listings",
  "/admin",
]

// Public routes (accessible without auth)
const publicRoutes = [
  "/",
  "/about",
  "/search",
  "/auth/signin",
  "/auth/error",
]

export const middleware = auth((req: any) => {
  const pathname = req.nextUrl.pathname
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // If route is protected and user is not authenticated, redirect to signin
  if (isProtected && !req.auth) {
    const signInUrl = new URL("/auth/signin", req.nextUrl.origin)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Role-based access control
  if (pathname.startsWith("/admin") && req.auth?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin))
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
