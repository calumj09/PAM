'use client'

import { Mail } from 'lucide-react'
import Link from 'next/link'

interface SuccessMessageProps {
  email: string
}

export function SuccessMessage({ email }: SuccessMessageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* App Icon and Branding */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-pam-burgundy rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">P</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PAM</h1>
          <p className="text-gray-600 text-base">Parent Admin Manager</p>
        </div>

        {/* Success Message */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email!</h2>
            <p className="text-sm text-gray-600 mb-6">
              We've sent a confirmation link to <strong>{email}</strong>
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> You must confirm your email before you can log in. 
                Check your spam folder if you don't see the email within a few minutes.
              </p>
            </div>
            
            <div className="space-y-3">
              <Link 
                href="/login"
                className="block w-full bg-pam-burgundy text-white py-3 px-4 rounded-xl font-semibold hover:bg-pam-burgundy/90 transition-all text-center"
              >
                Go to Sign In
              </Link>
              
              <p className="text-xs text-gray-500">
                After confirming your email, you can sign in to complete your profile setup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}