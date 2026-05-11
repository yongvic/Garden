'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/format'
import { User, Mail, Lock, Camera, CheckCircle, AlertTriangle, ArrowLeft, Shield } from 'lucide-react'

interface UserProfile {
  id: string; name: string | null; email: string | null
  image: string | null; role: string; createdAt: string
  bookingStats: { total: number; pending: number; confirmed: number; completed: number; cancelled: number }
}

export default function ProfilePage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Form state
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (authStatus === 'unauthenticated') { router.push('/auth/signin'); return }
    if (authStatus === 'authenticated') {
      fetch('/api/users/me')
        .then(r => r.json())
        .then(data => {
          setProfile(data)
          setName(data.name ?? '')
        })
        .catch(console.error)
        .finally(() => setIsLoading(false))
    }
  }, [authStatus, router])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setProfile(prev => prev ? { ...prev, name } : prev)
      setSuccess('Profil mis à jour avec succès.')
    } catch (e) { setError((e as Error).message) }
    finally { setIsSaving(false) }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return }
    if (newPassword.length < 8) { setError('Le nouveau mot de passe doit faire au moins 8 caractères.'); return }
    setIsSaving(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setSuccess('Mot de passe changé avec succès.')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (e) { setError((e as Error).message) }
    finally { setIsSaving(false) }
  }

  const roleLabel = (role: string) => ({ CUSTOMER: 'Client', LANDLORD: 'Propriétaire', ADMIN: 'Administrateur' }[role] ?? role)

  if (isLoading || !profile) {
    return (
      <><Navbar />
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
        </main></>
    )
  }

  const dashboardHref = profile.role === 'LANDLORD' ? '/landlord/dashboard' : profile.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'

  return (
    <><Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 pt-24 pb-12">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 space-y-6 animate-in fade-in duration-500">

          <Link href={dashboardHref} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Tableau de bord
          </Link>

          <h1 className="text-3xl font-bold text-white">Mon Profil</h1>

          {success && (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl animate-in fade-in duration-300">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-emerald-300 text-sm">{success}</p>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Avatar + account type */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-7">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="relative">
                {profile.image ? (
                  <img src={profile.image} alt={profile.name ?? ''} className="w-20 h-20 rounded-2xl object-cover" />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-violet-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                    {(profile.name ?? profile.email ?? 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-white text-xl font-semibold">{profile.name ?? '—'}</p>
                <p className="text-slate-400 text-sm">{profile.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center gap-1 text-xs px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                    <Shield className="w-3 h-3" /> {roleLabel(profile.role)}
                  </span>
                  <span className="text-slate-600 text-xs">Membre depuis {formatDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/5">
              {[
                { label: 'Total', value: profile.bookingStats.total },
                { label: 'En attente', value: profile.bookingStats.pending },
                { label: 'Confirmées', value: profile.bookingStats.confirmed },
                { label: 'Terminées', value: profile.bookingStats.completed },
              ].map(s => (
                <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-white text-xl font-bold">{s.value}</p>
                  <p className="text-slate-500 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Edit profile */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-7">
            <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" /> Informations personnelles
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Nom complet</label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Votre nom"
                  className="bg-white/5 border-white/15 text-white placeholder-slate-600 focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Adresse email</label>
                <Input value={profile.email ?? ''} disabled className="bg-white/5 border-white/10 text-slate-500 cursor-not-allowed" />
                <p className="text-slate-600 text-xs mt-1">L'email ne peut pas être modifié.</p>
              </div>
              <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white">
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </form>
          </div>

          {/* Change password */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-7">
            <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" /> Changer le mot de passe
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Mot de passe actuel</label>
                <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="bg-white/5 border-white/15 text-white placeholder-slate-600" />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Nouveau mot de passe</label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Au moins 8 caractères" className="bg-white/5 border-white/15 text-white placeholder-slate-600" />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Confirmer le nouveau mot de passe</label>
                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="bg-white/5 border-white/15 text-white placeholder-slate-600" />
              </div>
              <Button type="submit" disabled={isSaving || !currentPassword || !newPassword} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                {isSaving ? 'Mise à jour...' : 'Changer le mot de passe'}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
