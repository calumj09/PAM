'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getAppUrl } from '@/lib/config/app'
import { EmailConfirmationHelp } from './EmailConfirmationHelp'

const australianStates = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'SA', label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NT', label: 'Northern Territory' },
]

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [stateTerritory, setStateTerritory] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    if (!stateTerritory) {
      setError('Please select your state/territory')
      setIsLoading(false)
      return
    }

    try {
      console.log('Starting signup with:', { email, stateTerritory })
      
      // Simplified signup - just email and password first
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: `${getAppUrl()}/auth/callback?type=email`,
          data: {
            state_territory: stateTerritory
          }
        }
      })

      console.log('Signup response:', { data, authError })

      if (authError) {
        console.error('Auth error:', authError)
        setError(authError.message)
      } else if (data.user) {
        console.log('Signup successful')
        // Always show success message for email confirmation
        setShowSuccess(true)
      } else {
        setError('Signup failed - no user returned')
      }
    } catch (err) {
      console.error('Signup catch error:', err)
      setError(`Signup failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (showSuccess) {
    return <EmailConfirmationHelp email={email} />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* App Icon and Branding */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-primary-foreground">P</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">PAM</h1>
          <p className="text-muted-foreground text-base">Parent Admin Manager</p>
          <p className="text-muted-foreground text-sm mt-1 opacity-80">Join thousands of Australian mums</p>
        </div>

        {/* Signup Form */}
        <div className="content-card">
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">Create Your Account</h2>
          
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                State/Territory
              </label>
              <select
                value={stateTerritory}
                onChange={(e) => setStateTerritory(e.target.value)}
                className="select-field"
                required
              >
                <option value="">Select your state/territory</option>
                {australianStates.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Must be at least 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Confirm your password"
                required
              />
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 rounded-xl p-3">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="button-primary"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-primary hover:text-primary-dark font-semibold"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            Designed for Australian mums with babies aged 0-3
          </p>
        </div>
      </div>
    </div>
  )
}