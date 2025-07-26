'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestSupabasePage() {
  const [status, setStatus] = useState<{
    url: string
    key: string
    connection: string
    error?: string
  }>({
    url: '',
    key: '',
    connection: 'Testing...'
  })

  useEffect(() => {
    async function testConnection() {
      try {
        // Check environment variables
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET'
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'NOT_SET'
        
        setStatus(prev => ({
          ...prev,
          url: url,
          key: key.substring(0, 20) + '...' // Show first 20 chars only
        }))

        // Test Supabase connection
        const supabase = createClient()
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setStatus(prev => ({
            ...prev,
            connection: 'Failed',
            error: error.message
          }))
        } else {
          setStatus(prev => ({
            ...prev,
            connection: 'Success'
          }))
        }
      } catch (err) {
        setStatus(prev => ({
          ...prev,
          connection: 'Failed',
          error: err instanceof Error ? err.message : 'Unknown error'
        }))
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">PAM Supabase Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-gray-700">Environment Variables</h2>
            <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {status.url}</p>
            <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {status.key}</p>
          </div>
          
          <div>
            <h2 className="font-semibold text-gray-700">Connection Status</h2>
            <p className={`font-medium ${
              status.connection === 'Success' ? 'text-green-600' : 
              status.connection === 'Failed' ? 'text-red-600' : 
              'text-yellow-600'
            }`}>
              {status.connection}
            </p>
            {status.error && (
              <p className="text-red-600 text-sm mt-2">Error: {status.error}</p>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-gray-700">Expected Values</h2>
            <p className="text-sm text-gray-600">
              URL should be: https://phlyclrvbrxiszjxorza.supabase.co<br/>
              Key should start with: eyJhbGciOiJIUzI1NiIs...
            </p>
          </div>
        </div>

        <div className="mt-6">
          <a href="/login" className="text-blue-600 hover:text-blue-700 underline">
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  )
}