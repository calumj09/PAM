'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DemoLoginPage() {
  const [email, setEmail] = useState('calum@cjadvisory.com.au')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simple demo login - just redirect to today page
    setTimeout(() => {
      router.push('/dashboard/today')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* App Icon and Branding */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">P</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PAM</h1>
          <p className="text-gray-600 text-base">Parent Admin Manager</p>
          <p className="text-gray-500 text-sm mt-1">Demo Mode - Skip Authentication</p>
        </div>

        {/* Demo Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6">
            <p className="text-sm text-blue-800">
              🚀 <strong>Demo Mode:</strong> Click "Enter PAM" to test the app without authentication issues!
            </p>
          </div>
          
          <form onSubmit={handleDemoLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Demo)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Your email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password (Demo)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Any password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Entering PAM...
                </div>
              ) : (
                '🚀 Enter PAM (Demo Mode)'
              )}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="text-center">
              <a href="/simple-test" className="text-blue-600 hover:text-blue-700 text-sm underline">
                🔧 Debug Connection Issues
              </a>
            </div>
            <div className="text-center">
              <a href="/login" className="text-gray-600 hover:text-gray-700 text-sm underline">
                ← Back to Real Login
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Demo mode lets you test PAM features without authentication
          </p>
        </div>
      </div>
    </div>
  )
}