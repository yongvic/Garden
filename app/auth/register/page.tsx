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
      setError('Name is required')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
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
        setError(data.error || 'Registration failed')
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
        setError('Registration successful! Please sign in.')
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Glassmorphism background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="relative w-full max-w-md backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl">
        <div className="p-8">
          {step === 'role' ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Get Started</h1>
                <p className="text-blue-100/70">Choose your account type</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleRoleSelect('CUSTOMER')}
                  className="w-full p-6 text-left rounded-lg border-2 border-white/20 hover:border-blue-400/50 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-300">
                        Customer
                      </h3>
                      <p className="text-blue-100/60 text-sm mt-1">
                        Book rooms and equipment
                      </p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 group-hover:border-blue-400"></div>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect('LANDLORD')}
                  className="w-full p-6 text-left rounded-lg border-2 border-white/20 hover:border-cyan-400/50 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300">
                        Landlord
                      </h3>
                      <p className="text-blue-100/60 text-sm mt-1">
                        List and manage your properties
                      </p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 group-hover:border-cyan-400"></div>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8">
                <button
                  onClick={() => setStep('role')}
                  className="text-blue-100 hover:text-white text-sm mb-4 flex items-center gap-2"
                >
                  ← Back to role selection
                </button>
                <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                <p className="text-blue-100/70">
                  {role === 'CUSTOMER' ? 'As a customer' : 'As a landlord'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-100 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-blue-100/70 text-sm text-center">
                  Already have an account?{' '}
                  <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300">
                    Sign in
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
