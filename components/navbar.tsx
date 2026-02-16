'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          SpaceShare
        </Link>

        <div className="flex items-center gap-8">
          <Link href="/search" className="text-white/70 hover:text-white transition">
            Browse
          </Link>
          {session?.user && (
            <>
              <Link href="/dashboard" className="text-white/70 hover:text-white transition">
                Dashboard
              </Link>
              <Link href="/bookings" className="text-white/70 hover:text-white transition">
                My Bookings
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <span className="text-white/70">{session.user.name}</span>
              <Button
                onClick={() => signOut()}
                className="bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
