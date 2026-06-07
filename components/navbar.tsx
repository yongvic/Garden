'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import type { Locale } from '@/lib/i18n/translations'
import {
  Menu, X, LogOut, LayoutDashboard, Bell, User,
  Home, Search, ChevronDown, Settings, Globe, Heart, Sun, Moon
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'

interface Notification {
  id: string; title: string; message: string; isRead: boolean; createdAt: string
}

export default function Navbar() {
  const { data: session } = useSession()
  const { t, locale, setLocale } = useI18n()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const langRef = useRef<HTMLDivElement>(null)

  const role = session?.user?.role
  const dashboardHref = role === 'LANDLORD' ? '/landlord/dashboard' : role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'

  useEffect(() => setMounted(true), [])

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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
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

  const navLink = (href: string, label: string) => (
    <Link href={href}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'text-muted-foreground hover:text-foreground',
          pathname === href && 'text-primary bg-primary/5'
        )}
      >
        {label}
      </Button>
    </Link>
  )

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-[1.02]">
            <span className="font-display text-lg leading-none">G</span>
          </div>
          <span className="hidden font-semibold tracking-tight sm:block">{t.brand.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLink('/search', t.nav.explore)}
          {navLink('/how-it-works', t.nav.howItWorks)}
          {navLink('/pricing', t.nav.pricing)}
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          {/* Language */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => { setLangOpen(v => !v); setUserMenuOpen(false); setNotifOpen(false) }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={t.nav.language}
            >
              <Globe className="size-4" />
              <span className="uppercase text-xs font-medium">{locale}</span>
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-36 overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
                >
                  {(['fr', 'en'] as Locale[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLocale(l); setLangOpen(false) }}
                      className={cn(
                        'flex w-full items-center px-4 py-2.5 text-sm transition-colors hover:bg-muted',
                        locale === l && 'text-primary font-medium'
                      )}
                    >
                      {l === 'fr' ? 'Français' : 'English'}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          )}

          {session ? (
            <>
              <Link href={dashboardHref}>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <LayoutDashboard className="size-4" />
                  {role === 'LANDLORD' ? t.nav.myListings : t.nav.dashboard}
                </Button>
              </Link>

              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setNotifOpen(v => !v); setUserMenuOpen(false) }}
                  className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={t.nav.notifications}
                >
                  <Bell className="size-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl"
                    >
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                      <span className="text-sm font-semibold">{t.nav.notifications}</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                          {t.nav.markAllRead}
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">{t.nav.noNotifications}</div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            className={cn(
                              'border-b border-border px-4 py-3 last:border-0 hover:bg-muted/50',
                              !n.isRead && 'bg-primary/5'
                            )}
                          >
                            <p className="text-xs font-medium">{n.title}</p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>

              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => { setUserMenuOpen(v => !v); setNotifOpen(false) }}
                  className="flex items-center gap-2 rounded-xl py-1.5 pl-2 pr-3 transition-colors hover:bg-muted"
                >
                  {session.user?.image ? (
                    <img src={session.user.image} alt="" className="size-7 rounded-lg object-cover" />
                  ) : (
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                      {userInitial}
                    </div>
                  )}
                  <span className="hidden max-w-[80px] truncate text-sm text-muted-foreground lg:block">
                    {session.user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className={cn('size-3.5 text-muted-foreground transition-transform', userMenuOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                {userMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl"
                  >
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-medium">{session.user?.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{session.user?.email}</p>
                    </div>
                    <div className="py-1">
                      <MenuLink href={dashboardHref} icon={LayoutDashboard} label={t.nav.dashboard} onClick={() => setUserMenuOpen(false)} />
                      <MenuLink href="/profile" icon={User} label={t.nav.profile} onClick={() => setUserMenuOpen(false)} />
                      <MenuLink href="/favorites" icon={Heart} label={t.nav.favorites} onClick={() => setUserMenuOpen(false)} />
                      <MenuLink href="/bookings" icon={Search} label={t.nav.bookings} onClick={() => setUserMenuOpen(false)} />
                      {role === 'ADMIN' && (
                        <MenuLink href="/admin/dashboard" icon={Settings} label={t.nav.admin} onClick={() => setUserMenuOpen(false)} />
                      )}
                      {role === 'LANDLORD' && (
                        <>
                          <MenuLink href="/landlord/listings" icon={Home} label={t.nav.myListings} onClick={() => setUserMenuOpen(false)} />
                          <MenuLink href="/landlord/bookings" icon={LayoutDashboard} label={t.nav.bookings} onClick={() => setUserMenuOpen(false)} />
                        </>
                      )}
                      <div className="mt-1 border-t border-border pt-1">
                        <button
                          onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: typeof window !== 'undefined' ? window.location.origin : '/' }) }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-destructive hover:bg-destructive/5"
                        >
                          <LogOut className="size-4" /> {t.nav.signOut}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">{t.nav.signIn}</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">{t.nav.signUp}</Button>
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(v => !v)}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted md:hidden"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <div className={cn('overflow-hidden transition-all duration-300 md:hidden', mobileOpen ? 'max-h-[80dvh] opacity-100' : 'max-h-0 opacity-0')}>
        <div className="space-y-1 border-t border-border bg-background px-4 py-4">
          <MobileLink href="/search" label={t.nav.explore} onClick={() => setMobileOpen(false)} />
          <MobileLink href="/how-it-works" label={t.nav.howItWorks} onClick={() => setMobileOpen(false)} />
          <MobileLink href="/pricing" label={t.nav.pricing} onClick={() => setMobileOpen(false)} />
          {session ? (
            <>
              <MobileLink href={dashboardHref} label={t.nav.dashboard} onClick={() => setMobileOpen(false)} />
              <MobileLink href="/favorites" label={t.nav.favorites} onClick={() => setMobileOpen(false)} />
              <MobileLink href="/profile" label={t.nav.profile} onClick={() => setMobileOpen(false)} />
              <button
                onClick={() => { setMobileOpen(false); signOut({ callbackUrl: typeof window !== 'undefined' ? window.location.origin : '/' }) }}
                className="flex w-full items-center rounded-xl px-3 py-3 text-destructive"
              >
                {t.nav.signOut}
              </button>
            </>
          ) : (
            <>
              <MobileLink href="/auth/signin" label={t.nav.signIn} onClick={() => setMobileOpen(false)} />
              <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="mx-3 mt-2 block rounded-xl bg-primary py-3 text-center font-medium text-primary-foreground">
                {t.nav.signUp}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function MenuLink({ href, icon: Icon, label, onClick }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick}>
      <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        <Icon className="size-4" /> {label}
      </div>
    </Link>
  )
}

function MobileLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick}>
      <div className="rounded-xl px-3 py-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">{label}</div>
    </Link>
  )
}
