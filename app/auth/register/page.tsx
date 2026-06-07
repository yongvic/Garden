'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useI18n } from '@/lib/i18n/context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { Building2, UserRound } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

type UserRole = 'CUSTOMER' | 'LANDLORD'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'password_mismatch',
  path: ['confirmPassword'],
})

type RegisterValues = z.infer<typeof registerSchema>

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18n()
  const [step, setStep] = useState<'role' | 'details'>('role')
  const [role, setRole] = useState<UserRole>('CUSTOMER')
  const [error, setError] = useState('')

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'LANDLORD' || roleParam === 'CUSTOMER') {
      setRole(roleParam)
      setStep('details')
    }
  }, [searchParams])

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (values: RegisterValues) => {
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: values.name, email: values.email, password: values.password, role }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || t.auth.errors.failed)
        return
      }

      const signInResult = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (signInResult?.ok) {
        router.push(role === 'LANDLORD' ? '/landlord/dashboard' : '/dashboard')
      } else {
        router.push('/auth/signin')
      }
    } catch {
      setError(t.auth.errors.generic)
    }
  }

  if (step === 'role') {
    return (
      <motion.div
        key="role-step"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-border shadow-lg">
          <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <span className="font-display text-xl">G</span>
          </div>
          <CardTitle className="text-2xl">{t.auth.registerTitle}</CardTitle>
          <CardDescription>{t.auth.chooseRole}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <RoleButton
            icon={UserRound}
            title={t.auth.customer}
            desc={t.auth.customerDesc}
            selected={role === 'CUSTOMER'}
            onClick={() => { setRole('CUSTOMER'); setStep('details') }}
          />
          <RoleButton
            icon={Building2}
            title={t.auth.landlord}
            desc={t.auth.landlordDesc}
            selected={role === 'LANDLORD'}
            onClick={() => { setRole('LANDLORD'); setStep('details') }}
          />
          <p className="pt-4 text-center text-sm text-muted-foreground">
            {t.auth.hasAccount}{' '}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              {t.auth.signIn}
            </Link>
          </p>
        </CardContent>
      </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      key="details-step"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <Card className="border-border shadow-lg">
        <CardHeader>
        <button
          type="button"
          onClick={() => setStep('role')}
          className="mb-2 text-sm text-muted-foreground hover:text-foreground"
        >
          ← {t.auth.back}
        </button>
        <CardTitle className="text-2xl">{t.auth.registerTitle}</CardTitle>
        <CardDescription>
          {role === 'CUSTOMER' ? t.auth.customerDesc : t.auth.landlordDesc}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.auth.name}</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.auth.email}</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.auth.password}</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.auth.confirmPassword}</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? t.auth.loading : t.auth.signUp}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
    </motion.div>
  )
}

function RoleButton({
  icon: Icon, title, desc, selected, onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string; desc: string; selected: boolean; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-all hover:border-primary/40',
        selected ? 'border-primary bg-primary/5' : 'border-border'
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
    </button>
  )
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center garden-surface px-4 py-12 overflow-hidden">
      <Suspense fallback={<div className="text-muted-foreground">…</div>}>
        <AnimatePresence mode="wait">
          <RegisterForm />
        </AnimatePresence>
      </Suspense>
    </div>
  )
}
