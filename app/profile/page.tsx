'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/format'
import { User, Mail, Lock, Camera, CheckCircle, AlertTriangle, ArrowLeft, Shield, Phone, Loader2 } from 'lucide-react'

interface UserProfile {
  id: string; name: string | null; email: string | null
  image: string | null; role: string; createdAt: string
  phone: string | null
  bookingStats: { total: number; pending: number; confirmed: number; completed: number; cancelled: number }
}

export default function ProfilePage() {
  const { data: session, status: authStatus, update: updateSession } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
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
          setPhone(data.phone ?? '')
        })
        .catch(console.error)
        .finally(() => setIsLoading(false))
    }
  }, [authStatus, router])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingAvatar(true); setError(''); setSuccess('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'avatars')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)

      // Save URL to user profile
      const patchRes = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: json.url }),
      })
      if (!patchRes.ok) throw new Error((await patchRes.json()).error)
      setProfile(prev => prev ? { ...prev, image: json.url } : prev)
      await updateSession({ image: json.url })
      setSuccess('Photo de profil mise à jour !')
    } catch (e) { setError((e as Error).message) }
    finally { setIsUploadingAvatar(false); e.target.value = '' }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setProfile(prev => prev ? { ...prev, name, phone } : prev)
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
              {/* Clickable Avatar */}
              <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                {profile.image ? (
                  <img src={profile.image} alt={profile.name ?? ''} className="w-24 h-24 rounded-2xl object-cover" />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-violet-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                    {(profile.name ?? profile.email ?? 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploadingAvatar ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
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
                <p className="text-slate-500 text-xs mt-1.5">Cliquez sur la photo pour la changer</p>
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
              <div>
                <label className="block text-slate-400 text-sm mb-2 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#25D366]"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  Numéro WhatsApp (avec indicatif pays)
                </label>
                <Input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Ex: +22891234567"
                  className="bg-white/5 border-white/15 text-white placeholder-slate-600 focus:border-[#25D366]/50"
                />
                <p className="text-slate-600 text-xs mt-1">Affiché sur vos annonces pour que les clients vous contactent.</p>
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



