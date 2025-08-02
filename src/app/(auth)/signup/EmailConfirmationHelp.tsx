'use client'

import { useState } from 'react'
import { Mail, RefreshCw, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface EmailConfirmationHelpProps {
  email: string
}

export function EmailConfirmationHelp({ email }: EmailConfirmationHelpProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [resendError, setResendError] = useState('')

  const handleResendEmail = async () => {
    setIsResending(true)
    setResendMessage('')
    setResendError('')

    try {
      const response = await fetch('/api/check-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setResendMessage('Email sent! Please check your inbox and spam folder.')
      } else {
        setResendError(data.error || 'Failed to resend email')
      }
    } catch (error) {
      setResendError('Network error. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* App Icon and Branding */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-pam-burgundy rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">P</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PAM</h1>
          <p className="text-gray-600 text-base">Parent Admin Manager</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email!</h2>
            <p className="text-sm text-gray-600">
              We've sent a confirmation link to:
            </p>
            <p className="text-sm font-medium text-gray-900 mt-1">{email}</p>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Important:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>You must confirm your email before logging in</li>
                  <li>Check your spam/junk folder</li>
                  <li>The email may take a few minutes to arrive</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Resend Section */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Didn't receive the email?
              </p>
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="inline-flex items-center gap-2 bg-white border-2 border-pam-burgundy text-pam-burgundy px-4 py-2 rounded-xl font-medium hover:bg-pam-burgundy hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Resend Confirmation Email
                  </>
                )}
              </button>
            </div>

            {resendMessage && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-sm text-green-700 text-center">{resendMessage}</p>
              </div>
            )}

            {resendError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-600 text-center">{resendError}</p>
              </div>
            )}
          </div>

          {/* Alternative Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-3">
              <Link 
                href="/login"
                className="block w-full bg-pam-burgundy text-white py-3 px-4 rounded-xl font-semibold hover:bg-pam-burgundy/90 transition-all text-center"
              >
                Go to Sign In
              </Link>
              
              <Link 
                href="/signup"
                className="block w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:border-gray-400 transition-all text-center"
              >
                Try Different Email
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              If you continue to have issues, please ensure:
            </p>
            <ul className="text-xs text-gray-500 mt-2 space-y-1">
              <li>• Email address is typed correctly</li>
              <li>• Your email provider isn't blocking our emails</li>
              <li>• You're checking the right email account</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}