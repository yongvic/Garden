'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

type UserRole = 'CUSTOMER' | 'LANDLORD'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<'role' | 'details'>('role')
  const [role, setRole] = useState<UserRole>('CUSTOMER')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole)
    setStep('details')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!name.trim()) {
      setError('Le nom est requis')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'L\'inscription a échoué')
        return
      }

      // Sign in the user
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.ok) {
        router.push('/dashboard')
      } else {
        setError('Inscription réussie ! Veuillez vous connecter.')
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Glassmorphism background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse duration-[4000ms]"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse duration-[5000ms]"></div>
      </div>

      <Card className="relative w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="p-8">
          {step === 'role' ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Commencer</h1>
                <p className="text-blue-100/70">Choisissez votre type de compte</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleRoleSelect('CUSTOMER')}
                  className="w-full p-6 text-left rounded-lg border-2 border-white/20 hover:border-blue-400/50 hover:bg-white/5 transition-all group animate-in fade-in slide-in-from-left duration-300 delay-100"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                        Client
                      </h3>
                      <p className="text-blue-100/60 text-sm mt-1">
                        Réservez des chambres et des équipements
                      </p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 group-hover:border-blue-400 transition-colors"></div>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect('LANDLORD')}
                  className="w-full p-6 text-left rounded-lg border-2 border-white/20 hover:border-cyan-400/50 hover:bg-white/5 transition-all group animate-in fade-in slide-in-from-left duration-300 delay-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        Propriétaire
                      </h3>
                      <p className="text-blue-100/60 text-sm mt-1">
                        Listez et gérez vos propriétés
                      </p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 group-hover:border-cyan-400 transition-colors"></div>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8">
                <button
                  onClick={() => setStep('role')}
                  className="text-blue-100 hover:text-white text-sm mb-4 flex items-center gap-2 transition-colors"
                >
                  ← Retour au choix du rôle
                </button>
                <h1 className="text-3xl font-bold text-white mb-2">Créer un Compte</h1>
                <p className="text-blue-100/70">
                  {role === 'CUSTOMER' ? 'En tant que client' : 'En tant que propriétaire'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg animate-in fade-in slide-in-from-top duration-300">
                  <p className="text-red-100 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="animate-in fade-in slide-in-from-bottom duration-300 delay-100">
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Nom Complet
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all"
                    required
                  />
                </div>

                <div className="animate-in fade-in slide-in-from-bottom duration-300 delay-150">
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Adresse Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all"
                    required
                  />
                </div>

                <div className="animate-in fade-in slide-in-from-bottom duration-300 delay-200">
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Mot de passe
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all"
                    required
                  />
                </div>

                <div className="animate-in fade-in slide-in-from-bottom duration-300 delay-250">
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 rounded-lg transition-all mt-4 hover:scale-[1.02] shadow-lg hover:shadow-cyan-500/20 animate-in fade-in slide-in-from-bottom duration-300 delay-300"
                >
                  {isLoading ? 'Création du compte...' : 'Créer le Compte'}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in duration-500 delay-500">
                <p className="text-blue-100/70 text-sm text-center">
                  Vous avez déjà un compte ?{' '}
                  <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Se connecter
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
