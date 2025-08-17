'use client'

import { useState } from 'react'

export default function DebugAuthPage() {
  const [testEmail, setTestEmail] = useState('test@example.com')
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testSignup = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/debug-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to test signup' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug Tool</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Signup Flow</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
              placeholder="Test email address"
            />
            <button
              onClick={testSignup}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test Signup'}
            </button>
          </div>
          
          {result && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Supabase Configuration Checklist</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="auth-enabled" />
              <label htmlFor="auth-enabled">Authentication → Providers → Email is enabled</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="email-confirm" />
              <label htmlFor="email-confirm">Authentication → Providers → Email confirmations are enabled</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="site-url" />
              <label htmlFor="site-url">Authentication → URL Configuration → Site URL is https://pam-7xeo.onrender.com</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="redirect-url" />
              <label htmlFor="redirect-url">Authentication → URL Configuration → Redirect URLs include https://pam-7xeo.onrender.com/auth/callback</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="email-template" />
              <label htmlFor="email-template">Authentication → Email Templates → Confirm signup template updated</label>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-semibold text-yellow-800 mb-2">Common Issues:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Email confirmations are disabled in Supabase settings</li>
              <li>• Rate limiting on built-in email service</li>
              <li>• Email provider blocking Supabase emails</li>
              <li>• Wrong Site URL configured</li>
              <li>• Email templates using wrong redirect URL</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}