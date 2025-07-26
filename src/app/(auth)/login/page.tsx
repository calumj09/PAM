'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  // Check if we're in demo mode
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Demo mode - skip authentication
    if (isDemoMode) {
      if (!email || !password) {
        setError('Please enter email and password')
        setIsLoading(false)
        return
      }

      // Simulate loading and redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
      return
    }

    // Real Supabase authentication
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-pam-red font-heading mb-2">
            PAM
          </h1>
          <p className="text-gray-600">
            Welcome back to your parenting assistant
          </p>
          {isDemoMode && (
            <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded text-sm text-blue-800">
              🧪 Demo Mode - Authentication bypassed for testing
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
              
              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
              >
                {isDemoMode ? 'Enter Demo' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <Link 
                href="/forgot-password" 
                className="block text-sm text-pam-red hover:text-pam-red/80"
              >
                Forgot your password?
              </Link>
              
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link 
                  href="/signup" 
                  className="text-pam-red hover:text-pam-red/80 font-medium"
                >
                  Create one
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {isDemoMode && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">🚀 Quick Demo Access</h3>
            <p className="text-sm text-green-800 mb-3">
              Use any email/password combination to access the demo dashboard and test the growth tracking features.
            </p>
            <div className="text-sm text-green-700">
              <p><strong>Demo Features Available:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Growth tracking with charts</li>
                <li>Add measurements</li>
                <li>View growth history</li>
                <li>Export healthcare reports</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}