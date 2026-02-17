'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)
  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group" onClick={closeMobileMenu}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
              <span className="text-white font-bold text-lg sm:text-xl">G</span>
            </div>
            <span className="text-white font-bold text-lg sm:text-xl hidden sm:block">Garden</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link href="/search">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                Rechercher
              </Button>
            </Link>

            {session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Tableau de bord
                  </Button>
                </Link>
                {(session.user as any)?.role === 'ADMIN' && (
                  <Link href="/admin/dashboard">
                    <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                    Connexion
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all hover:scale-105">
                    Inscription
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-2 bg-slate-900/95 backdrop-blur-xl border-t border-white/10">
          <Link href="/search" onClick={closeMobileMenu}>
            <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 transition-colors h-12">
              Rechercher
            </Button>
          </Link>

          {session ? (
            <>
              <Link href="/dashboard" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 transition-colors h-12">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Tableau de bord
                </Button>
              </Link>
              {(session.user as any)?.role === 'ADMIN' && (
                <Link href="/admin/dashboard" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 transition-colors h-12">
                    Admin
                  </Button>
                </Link>
              )}
              <Button
                onClick={() => {
                  closeMobileMenu()
                  signOut({ callbackUrl: '/' })
                }}
                variant="ghost"
                className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 transition-colors h-12"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 transition-colors h-12">
                  Connexion
                </Button>
              </Link>
              <Link href="/auth/register" onClick={closeMobileMenu}>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white h-12">
                  Inscription
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
