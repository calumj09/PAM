'use client'

import { useState } from 'react'

export default function SimpleTestPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testBasicAuth = async () => {
    setLoading(true)
    setResult('Testing...')
    
    try {
      // Test 1: Environment variables
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!url || !key) {
        setResult(`❌ Missing environment variables: URL=${!!url}, KEY=${!!key}`)
        return
      }
      
      setResult(`✅ Environment variables found\nURL: ${url}\nKEY: ${key.substring(0, 20)}...`)
      
      // Test 2: Simple fetch to Supabase (just check if server responds)
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': key
        }
      })
      
      const data = await response.text()
      setResult(prev => prev + `\n\n✅ Raw fetch test successful\nStatus: ${response.status}\nResponse: ${data.substring(0, 200)}...`)
      
    } catch (error) {
      setResult(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testSupabaseClient = async () => {
    setLoading(true)
    setResult('Testing Supabase client...')
    
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      setResult('✅ Supabase client created successfully')
      
      // Test auth session
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        setResult(prev => prev + `\n❌ Session error: ${error.message}`)
      } else {
        setResult(prev => prev + `\n✅ Session check successful`)
      }
      
    } catch (error) {
      setResult(`❌ Client error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">PAM Connection Debug</h1>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={testBasicAuth}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Test 1: Raw Fetch
          </button>
          
          <button
            onClick={testSupabaseClient}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test 2: Supabase Client
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Test Results:</h2>
          <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded">
            {result || 'Click a test button above'}
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