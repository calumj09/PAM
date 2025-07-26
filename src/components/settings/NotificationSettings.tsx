'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { NotificationService, NotificationPreferences } from '@/lib/services/notification-service'
import { BellIcon, BellSlashIcon } from '@heroicons/react/24/outline'

interface NotificationSettingsProps {
  userId: string
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    loadPreferences()
    checkNotificationPermission()
  }, [userId])

  const checkNotificationPermission = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }

  const loadPreferences = async () => {
    try {
      setIsLoading(true)
      const prefs = await NotificationService.getNotificationPreferences(userId)
      setPreferences(prefs)
    } catch (error) {
      console.error('Error loading preferences:', error)
      setError('Failed to load notification preferences')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInitializeNotifications = async () => {
    try {
      setIsInitializing(true)
      setError('')
      
      const initialized = await NotificationService.initialize(userId)
      
      if (initialized) {
        setSuccess('Push notifications enabled successfully!')
        checkNotificationPermission()
        
        // Update preferences to enable push notifications
        if (preferences) {
          const updated = { ...preferences, push_enabled: true }
          setPreferences(updated)
          await NotificationService.updateNotificationPreferences(userId, { push_enabled: true })
        }
      } else {
        setError('Failed to enable push notifications. Please check your browser settings.')
      }
    } catch (error) {
      console.error('Error initializing notifications:', error)
      setError('Failed to initialize push notifications')
    } finally {
      setIsInitializing(false)
    }
  }

  const handleUpdatePreferences = async (updates: Partial<NotificationPreferences>) => {
    try {
      setIsSaving(true)
      setError('')
      setSuccess('')

      const success = await NotificationService.updateNotificationPreferences(userId, updates)
      
      if (success) {
        const updatedPreferences = { ...preferences, ...updates } as NotificationPreferences
        setPreferences(updatedPreferences)
        setSuccess('Preferences updated successfully!')
      } else {
        setError('Failed to update preferences')
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
      setError('Failed to update preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDisableNotifications = async () => {
    try {
      await NotificationService.unregisterPushToken(userId)
      await handleUpdatePreferences({ push_enabled: false })
      setSuccess('Push notifications disabled')
    } catch (error) {
      console.error('Error disabling notifications:', error)
      setError('Failed to disable notifications')
    }
  }

  const timeOptions = [
    { value: '07:00:00', label: '7:00 AM' },
    { value: '08:00:00', label: '8:00 AM' },
    { value: '09:00:00', label: '9:00 AM' },
    { value: '10:00:00', label: '10:00 AM' },
    { value: '11:00:00', label: '11:00 AM' },
    { value: '12:00:00', label: '12:00 PM' },
    { value: '13:00:00', label: '1:00 PM' },
    { value: '14:00:00', label: '2:00 PM' },
    { value: '15:00:00', label: '3:00 PM' },
    { value: '16:00:00', label: '4:00 PM' },
    { value: '17:00:00', label: '5:00 PM' },
    { value: '18:00:00', label: '6:00 PM' },
    { value: '19:00:00', label: '7:00 PM' },
    { value: '20:00:00', label: '8:00 PM' }
  ]

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="w-5 h-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-pam-red border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellIcon className="w-5 h-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Push Notification Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Push Notifications</h3>
              <p className="text-sm text-gray-500">
                Get reminders for important appointments and tasks
              </p>
            </div>
            
            {notificationPermission === 'granted' && preferences?.push_enabled ? (
              <div className="flex items-center gap-2">
                <BellIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Enabled</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <BellSlashIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">Disabled</span>
              </div>
            )}
          </div>

          {notificationPermission !== 'granted' || !preferences?.push_enabled ? (
            <Button
              onClick={handleInitializeNotifications}
              disabled={isInitializing}
              className="w-full bg-pam-red hover:bg-pam-red/90"
            >
              {isInitializing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enabling Notifications...
                </div>
              ) : (
                'Enable Push Notifications'
              )}
            </Button>
          ) : (
            <Button
              onClick={handleDisableNotifications}
              variant="outline"
              className="w-full"
            >
              Disable Push Notifications
            </Button>
          )}
        </div>

        {preferences?.push_enabled && notificationPermission === 'granted' && (
          <>
            {/* Checklist Reminders Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Checklist Reminders</h3>
                  <p className="text-sm text-gray-500">
                    Get notified about upcoming appointments and tasks
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.checklist_reminders_enabled}
                    onChange={(e) => handleUpdatePreferences({ 
                      checklist_reminders_enabled: e.target.checked 
                    })}
                    disabled={isSaving}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pam-pink/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pam-red"></div>
                </label>
              </div>

              {preferences.checklist_reminders_enabled && (
                <div className="pl-4 space-y-4 border-l-2 border-pam-pink/20">
                  {/* Reminder Timing */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remind me before due date
                    </label>
                    <select
                      value={preferences.reminder_days_before}
                      onChange={(e) => handleUpdatePreferences({ 
                        reminder_days_before: parseInt(e.target.value) 
                      })}
                      disabled={isSaving}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                    >
                      <option value={1}>1 day before</option>
                      <option value={2}>2 days before</option>
                      <option value={3}>3 days before</option>
                      <option value={7}>1 week before</option>
                    </select>
                  </div>

                  {/* Reminder Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred notification time
                    </label>
                    <select
                      value={preferences.reminder_time}
                      onChange={(e) => handleUpdatePreferences({ 
                        reminder_time: e.target.value 
                      })}
                      disabled={isSaving}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                    >
                      {timeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Email Notifications */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Email Reminders</h3>
                  <p className="text-sm text-gray-500">
                    Also send reminders via email (coming soon)
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.email_enabled}
                    onChange={(e) => handleUpdatePreferences({ 
                      email_enabled: e.target.checked 
                    })}
                    disabled={true} // Disabled for now
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pam-pink/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pam-red opacity-50"></div>
                </label>
              </div>
            </div>
          </>
        )}

        {/* Browser Support Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Browser Support</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>✅ Chrome, Firefox, Safari (iOS 16.4+)</p>
            <p>✅ Mobile browsers with PWA support</p>
            <p>ℹ️ Notifications work even when PAM is closed</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}