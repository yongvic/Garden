'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  Menu, X, LogOut, LayoutDashboard, Bell, User,
  Home, Search, ChevronDown, Settings
} from 'lucide-react'

interface Notification {
  id: string; title: string; message: string; isRead: boolean; createdAt: string
}

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const role = (session?.user as any)?.role
  const dashboardHref = role === 'LANDLORD' ? '/landlord/dashboard' : role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'

  // Fetch unread count
  useEffect(() => {
    if (!session?.user) return
    fetch('/api/notifications?unread=true')
      .then(r => r.json())
      .then(data => {
        setUnreadCount(data.unreadCount ?? 0)
        setNotifications((data.notifications ?? []).slice(0, 6))
      })
      .catch(() => {})
  }, [session])

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const userInitial = (session?.user?.name ?? session?.user?.email ?? 'U')[0].toUpperCase()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-900/90 border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-lg">G</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:block tracking-tight">Garden</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/search">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/8 gap-2 text-sm">
                <Search className="w-4 h-4" /> Explorer
              </Button>
            </Link>

            {session ? (
              <>
                <Link href={dashboardHref}>
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/8 gap-2 text-sm">
                    <LayoutDashboard className="w-4 h-4" />
                    {role === 'LANDLORD' ? 'Mes annonces' : 'Tableau de bord'}
                  </Button>
                </Link>

                {/* Notification bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setNotifOpen(v => !v); setUserMenuOpen(false) }}
                    className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/8 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 backdrop-blur-xl bg-slate-900/95 border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                        <span className="text-white text-sm font-semibold">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-blue-400 text-xs hover:text-blue-300 transition-colors">
                            Tout marquer lu
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-500 text-sm">Aucune notification</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className={`px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${!n.isRead ? 'bg-blue-500/5' : ''}`}>
                              <div className="flex items-start gap-2">
                                {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />}
                                <div className={!n.isRead ? '' : 'ml-3.5'}>
                                  <p className="text-white text-xs font-medium">{n.title}</p>
                                  <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User avatar dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => { setUserMenuOpen(v => !v); setNotifOpen(false) }}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/8 transition-colors"
                  >
                    {session.user?.image ? (
                      <img src={session.user.image} alt="" className="w-7 h-7 rounded-lg object-cover" />
                    ) : (
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        {userInitial}
                      </div>
                    )}
                    <span className="text-slate-300 text-sm max-w-[80px] truncate hidden lg:block">{session.user?.name?.split(' ')[0]}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 backdrop-blur-xl bg-slate-900/95 border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-white/8">
                        <p className="text-white text-sm font-medium truncate">{session.user?.name}</p>
                        <p className="text-slate-500 text-xs truncate">{session.user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href={dashboardHref} onClick={() => setUserMenuOpen(false)}>
                          <div className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-sm">
                            <LayoutDashboard className="w-4 h-4" /> Tableau de bord
                          </div>
                        </Link>
                        <Link href="/profile" onClick={() => setUserMenuOpen(false)}>
                          <div className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-sm">
                            <User className="w-4 h-4" /> Mon profil
                          </div>
                        </Link>
                        {role === 'ADMIN' && (
                          <Link href="/admin/dashboard" onClick={() => setUserMenuOpen(false)}>
                            <div className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-sm">
                              <Settings className="w-4 h-4" /> Admin
                            </div>
                          </Link>
                        )}
                        {role === 'LANDLORD' && (
                          <>
                            <Link href="/landlord/listings" onClick={() => setUserMenuOpen(false)}>
                              <div className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-sm">
                                <Home className="w-4 h-4" /> Mes annonces
                              </div>
                            </Link>
                            <Link href="/landlord/bookings" onClick={() => setUserMenuOpen(false)}>
                              <div className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-sm">
                                <LayoutDashboard className="w-4 h-4" /> Réservations reçues
                              </div>
                            </Link>
                          </>
                        )}
                        <div className="border-t border-white/8 mt-1 pt-1">
                          <button
                            onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                            className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors text-sm w-full text-left"
                          >
                            <LogOut className="w-4 h-4" /> Déconnexion
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/8 text-sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:scale-105 transition-all text-sm">
                    S'inscrire
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/8 transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pt-2 pb-5 space-y-1 bg-slate-900/98 border-t border-white/8">
          <Link href="/search" onClick={() => setMobileOpen(false)}>
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 transition-colors">
              <Search className="w-5 h-5" /> Explorer
            </div>
          </Link>
          {session ? (
            <>
              <Link href={dashboardHref} onClick={() => setMobileOpen(false)}>
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 transition-colors">
                  <LayoutDashboard className="w-5 h-5" /> Tableau de bord
                </div>
              </Link>
              <Link href="/profile" onClick={() => setMobileOpen(false)}>
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 transition-colors">
                  <User className="w-5 h-5" /> Mon profil
                </div>
              </Link>
              {role === 'LANDLORD' && (
                <>
                  <Link href="/landlord/listings" onClick={() => setMobileOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 transition-colors">
                      <Home className="w-5 h-5" /> Mes annonces
                    </div>
                  </Link>
                  <Link href="/landlord/bookings" onClick={() => setMobileOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 transition-colors">
                      <LayoutDashboard className="w-5 h-5" /> Réservations reçues
                    </div>
                  </Link>
                </>
              )}
              {role === 'ADMIN' && (
                <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)}>
                  <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 transition-colors">
                    <Settings className="w-5 h-5" /> Administration
                  </div>
                </Link>
              )}
              <div className="pt-2 border-t border-white/8">
                <button
                  onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/' }) }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" /> Déconnexion
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/signin" onClick={() => setMobileOpen(false)}>
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 transition-colors">Connexion</div>
              </Link>
              <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                <div className="mx-3 mt-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl text-center font-medium">S'inscrire</div>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
