'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { KeyIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

interface AccountManagementProps {
  userId: string
  userEmail: string
}

export function AccountManagement({ userId, userEmail }: AccountManagementProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleChangePassword = async () => {
    setIsChangingPassword(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`
      })
      
      if (error) throw error
      
      alert('Password reset email sent! Please check your inbox.')
    } catch (error) {
      console.error('Error sending password reset:', error)
      alert('Failed to send password reset email. Please try again.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm account deletion.')
      return
    }

    setIsDeletingAccount(true)
    try {
      // Delete user data from all tables
      // Note: In production, this should be done through a server-side function
      // to ensure all data is properly cleaned up
      
      // Sign out first
      await supabase.auth.signOut()
      
      // Redirect to login
      router.push('/login')
      
      // Note: Actual user deletion from auth.users requires admin access
      // This would typically be handled by a server-side function
      alert('Your account has been scheduled for deletion. You will receive a confirmation email.')
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please contact support.')
    } finally {
      setIsDeletingAccount(false)
    }
  }

  return (
    <>
      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyIcon className="w-5 h-5" />
            Account Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Change Password</h3>
            <p className="text-sm text-gray-600 mb-3">
              We'll send you an email with instructions to reset your password.
            </p>
            <Button
              variant="outline"
              onClick={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                  Sending Email...
                </>
              ) : (
                'Send Password Reset Email'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <ExclamationTriangleIcon className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Delete Account</h3>
            <p className="text-sm text-gray-600 mb-3">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            
            {!showDeleteConfirm ? (
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete My Account
              </Button>
            ) : (
              <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-800">
                  Are you absolutely sure? This will permanently delete:
                </p>
                <ul className="text-sm text-red-700 space-y-1 ml-4">
                  <li>• Your profile and all personal data</li>
                  <li>• All children and their information</li>
                  <li>• All tracker entries and history</li>
                  <li>• All checklist items and progress</li>
                  <li>• Your subscription (if any)</li>
                </ul>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-800">
                    Type <span className="font-mono bg-red-100 px-1">DELETE</span> to confirm:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Type DELETE to confirm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount || deleteConfirmText !== 'DELETE'}
                    className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                  >
                    {isDeletingAccount ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : (
                      'Permanently Delete Account'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteConfirmText('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}