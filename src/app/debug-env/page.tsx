'use client'

import { useEffect, useState } from 'react'

export default function DebugEnvPage() {
  const [envData, setEnvData] = useState<{
    url: string | undefined
    key: string | undefined
    nodeEnv: string | undefined
    hasUrl: boolean
    hasKey: boolean
    urlLength: number
    keyLength: number
  }>({
    url: undefined,
    key: undefined,
    nodeEnv: undefined,
    hasUrl: false,
    hasKey: false,
    urlLength: 0,
    keyLength: 0
  })

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const nodeEnv = process.env.NODE_ENV

    setEnvData({
      url,
      key,
      nodeEnv,
      hasUrl: !!url,
      hasKey: !!key,
      urlLength: url?.length || 0,
      keyLength: key?.length || 0
    })

    console.log('Environment check:', {
      url,
      key: key ? `${key.substring(0, 20)}...` : 'MISSING',
      nodeEnv,
      hasUrl: !!url,
      hasKey: !!key
    })
  }, [])

  const testBasicFetch = async () => {
    try {
      console.log('Testing basic fetch to Google...')
      const response = await fetch('https://www.google.com', { mode: 'no-cors' })
      console.log('Google fetch successful:', response.status)
      alert('Basic fetch works!')
    } catch (error) {
      console.error('Basic fetch failed:', error)
      alert(`Basic fetch failed: ${error}`)
    }
  }

  const testSupabaseFetch = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!url || !key) {
        alert('Missing environment variables!')
        return
      }

      console.log('Testing Supabase fetch...')
      console.log('URL:', url)
      console.log('Key length:', key.length)
      
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      })
      
      console.log('Supabase fetch response:', response.status)
      const text = await response.text()
      console.log('Response text:', text.substring(0, 200))
      alert(`Supabase fetch: ${response.status}`)
    } catch (error) {
      console.error('Supabase fetch failed:', error)
      alert(`Supabase fetch failed: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Environment Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Environment Variables */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4">Environment Variables</h2>
            <div className="space-y-2 text-sm">
              <div>
                <strong>NODE_ENV:</strong> {envData.nodeEnv || 'undefined'}
              </div>
              <div>
                <strong>Has URL:</strong> {envData.hasUrl ? '✅' : '❌'}
              </div>
              <div>
                <strong>Has Key:</strong> {envData.hasKey ? '✅' : '❌'}
              </div>
              <div>
                <strong>URL Length:</strong> {envData.urlLength}
              </div>
              <div>
                <strong>Key Length:</strong> {envData.keyLength}
              </div>
              {envData.url && (
                <div>
                  <strong>URL:</strong> {envData.url}
                </div>
              )}
              {envData.key && (
                <div>
                  <strong>Key (first 30):</strong> {envData.key.substring(0, 30)}...
                </div>
              )}
            </div>
          </div>

          {/* Tests */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4">Fetch Tests</h2>
            <div className="space-y-3">
              <button
                onClick={testBasicFetch}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Test Basic Fetch (Google)
              </button>
              <button
                onClick={testSupabaseFetch}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              >
                Test Supabase Fetch
              </button>
            </div>
          </div>
        </div>

        {/* Raw Values */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Raw Values (for debugging)</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(envData, null, 2)}
          </pre>
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