'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageShell } from '@/components/page-shell'
import { PageHeader } from '@/components/dashboard/page-header'
import { StatCard } from '@/components/dashboard/stat-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n/context'
import { formatDate } from '@/lib/format'
import { toast } from 'sonner'
import { Camera, Loader2, Shield, User, Lock, Gift, Star } from 'lucide-react'
import { motion } from 'motion/react'

interface UserProfile {
  id: string; name: string | null; email: string | null
  image: string | null; role: string; createdAt: string; phone: string | null
  bookingStats: { total: number; pending: number; confirmed: number; completed: number }
}

const profileSchema = z.object({ name: z.string().min(2), phone: z.string().optional() })
const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'mismatch', path: ['confirmPassword'] })

type ProfileValues = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { data: session, status: authStatus, update: updateSession } = useSession()
  const router = useRouter()
  const { t, locale } = useI18n()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [loyalty, setLoyalty] = useState<{ points: number; totalBookings: number } | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const profileForm = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: { name: '', phone: '' } })
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (authStatus === 'unauthenticated') { router.push('/auth/signin'); return }
    if (authStatus === 'authenticated') {
      fetch('/api/users/me')
        .then((r) => r.json())
        .then((data) => {
          setProfile(data)
          profileForm.reset({ name: data.name ?? '', phone: data.phone ?? '' })
        })
        .catch(() => toast.error(t.common.error))
        .finally(() => setIsLoading(false))

      Promise.all([
        fetch('/api/loyalty').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/referral').then((r) => (r.ok ? r.json() : null)),
      ])
        .then(([loyaltyData, referralData]) => {
          if (loyaltyData?.account) {
            setLoyalty({
              points: loyaltyData.account.points,
              totalBookings: loyaltyData.account.totalBookings,
            })
          }
          if (referralData?.code) setReferralCode(referralData.code)
        })
        .catch(() => {})
    }
  }, [authStatus, router, t.common.error])

  const dashboardHref = profile?.role === 'LANDLORD' ? '/landlord/dashboard' : profile?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'avatars')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json?.error)
      const patchRes = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: json.url }),
      })
      if (!patchRes.ok) throw new Error((await patchRes.json()).error)
      setProfile((prev) => prev ? { ...prev, image: json.url } : prev)
      await updateSession({ image: json.url })
      toast.success(t.profile.avatarUpdated)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setIsUploadingAvatar(false)
      e.target.value = ''
    }
  }

  const onSaveProfile = async (values: ProfileValues) => {
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setProfile((prev) => prev ? { ...prev, ...values } : prev)
      toast.success(t.profile.saved)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  const onChangePassword = async (values: PasswordValues) => {
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success(t.profile.passwordChanged)
      passwordForm.reset()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  if (isLoading || !profile) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </PageShell>
    )
  }

  const roleLabel = t.profile.roles[profile.role as keyof typeof t.profile.roles] ?? profile.role

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-8">
        <PageHeader title={t.profile.title} backHref={dashboardHref} backLabel={t.nav.dashboard} />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-6">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="group relative shrink-0"
              >
                {profile.image ? (
                  <img src={profile.image} alt="" className="size-24 rounded-2xl object-cover" />
                ) : (
                  <div className="flex size-24 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-primary-foreground">
                    {(profile.name ?? profile.email ?? 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100">
                  {isUploadingAvatar ? <Loader2 className="size-6 animate-spin text-background" /> : <Camera className="size-6 text-background" />}
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </button>
              <div>
                <p className="text-xl font-semibold">{profile.name ?? '—'}</p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="size-3" /> {roleLabel}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {t.profile.memberSince} {formatDate(profile.createdAt, locale)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t.profile.avatarHint}</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Total" value={profile.bookingStats.total} />
              <StatCard label={t.bookings.timeline.PENDING} value={profile.bookingStats.pending} />
              <StatCard label={t.bookings.timeline.CONFIRMED} value={profile.bookingStats.confirmed} />
              <StatCard label={t.bookings.timeline.COMPLETED} value={profile.bookingStats.completed} />
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {(loyalty || referralCode) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {loyalty && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Star className="size-4" /> {t.profile.loyaltyTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.profile.loyaltyPoints}</span>
                      <span className="font-semibold tabular-nums">{loyalty.points}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.profile.loyaltyBookings}</span>
                      <span className="font-semibold tabular-nums">{loyalty.totalBookings}</span>
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">{t.profile.loyaltyHint}</p>
                  </CardContent>
                </Card>
              )}
              {referralCode && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Gift className="size-4" /> {t.profile.referralTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">{t.profile.referralCode}</p>
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(referralCode)
                          toast.success(t.profile.referralCopied)
                        }}
                        className="mt-1 font-mono text-lg font-semibold tracking-wider text-primary hover:underline"
                      >
                        {referralCode}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.profile.referralHint}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="size-4" /> {t.profile.personalInfo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
                <FormField control={profileForm.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.auth.name}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormItem>
                  <FormLabel>{t.auth.email}</FormLabel>
                  <Input value={profile.email ?? ''} disabled />
                  <p className="text-xs text-muted-foreground">{t.profile.emailLocked}</p>
                </FormItem>
                <FormField control={profileForm.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.profile.whatsapp}</FormLabel>
                    <FormControl><Input {...field} placeholder="+22891234567" /></FormControl>
                    <p className="text-xs text-muted-foreground">{t.profile.whatsappHint}</p>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                  {profileForm.formState.isSubmitting ? t.profile.saving : t.common.save}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="size-4" /> {t.profile.changePassword}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.profile.currentPassword}</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.profile.newPassword}</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.profile.confirmNewPassword}</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" variant="outline" disabled={passwordForm.formState.isSubmitting}>
                  {passwordForm.formState.isSubmitting ? t.profile.updatingPassword : t.profile.changePassword}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </PageShell>
  )
}
