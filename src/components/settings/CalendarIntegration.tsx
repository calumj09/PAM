'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CalendarService } from '@/lib/services/calendar-service'
import { createClient } from '@/lib/supabase/client'
import { PremiumGate } from '@/components/premium/PremiumGate'
import { 
  CalendarIcon, 
  LinkIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CogIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface CalendarIntegrationProps {
  userId: string
  isPremium: boolean
}

interface Integration {
  id: string
  google_email: string
  calendar_name: string
  is_active: boolean
  sync_enabled: boolean
  created_at: string
}

interface SyncSettings {
  auto_create_events: boolean
  default_event_duration: number
  reminder_minutes_before: number[]
  default_location: string
  include_categories: string[]
  event_color_id: number
}

export function CalendarIntegration({ userId, isPremium }: CalendarIntegrationProps) {
  const [integration, setIntegration] = useState<Integration | null>(null)
  const [syncSettings, setSyncSettings] = useState<SyncSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isPremium) {
      loadIntegrationData()
    } else {
      setIsLoading(false)
    }
  }, [userId, isPremium])

  const loadIntegrationData = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()

      // Load integration and settings in parallel
      const [integrationResult, settingsResult] = await Promise.all([
        supabase
          .from('calendar_integrations')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single(),
        supabase
          .from('calendar_sync_settings')
          .select('*')
          .eq('user_id', userId)
          .single()
      ])

      if (integrationResult.data) {
        setIntegration(integrationResult.data)
      }

      if (settingsResult.data) {
        setSyncSettings(settingsResult.data)
      }
    } catch (error) {
      console.error('Error loading integration data:', error)
      setError('Failed to load calendar integration data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectGoogle = async () => {
    try {
      setIsConnecting(true)
      setError('')

      const redirectUri = `${window.location.origin}/api/calendar/callback`
      const authUrl = CalendarService.generateAuthUrl(userId, redirectUri)
      
      // Open in popup window
      const popup = window.open(
        authUrl,
        'google-calendar-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )

      // Listen for popup completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          // Reload integration data
          setTimeout(() => {
            loadIntegrationData()
          }, 1000)
        }
      }, 1000)

    } catch (error) {
      console.error('Error connecting to Google Calendar:', error)
      setError('Failed to connect to Google Calendar')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      const supabase = createClient()
      
      await supabase
        .from('calendar_integrations')
        .update({ is_active: false })
        .eq('user_id', userId)

      setIntegration(null)
      setSuccess('Google Calendar disconnected successfully')
    } catch (error) {
      console.error('Error disconnecting calendar:', error)
      setError('Failed to disconnect calendar')
    }
  }

  const handleToggleSync = async () => {
    if (!integration) return

    try {
      const supabase = createClient()
      const newSyncEnabled = !integration.sync_enabled

      await supabase
        .from('calendar_integrations')
        .update({ sync_enabled: newSyncEnabled })
        .eq('id', integration.id)

      setIntegration({ ...integration, sync_enabled: newSyncEnabled })
      setSuccess(`Calendar sync ${newSyncEnabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      console.error('Error toggling sync:', error)
      setError('Failed to update sync settings')
    }
  }

  const handleUpdateSettings = async (updates: Partial<SyncSettings>) => {
    if (!syncSettings) return

    try {
      const supabase = createClient()
      
      await supabase
        .from('calendar_sync_settings')
        .update(updates)
        .eq('user_id', userId)

      setSyncSettings({ ...syncSettings, ...updates })
      setSuccess('Settings updated successfully')
    } catch (error) {
      console.error('Error updating settings:', error)
      setError('Failed to update settings')
    }
  }

  const handleSyncExistingItems = async () => {
    try {
      setIsSyncing(true)
      setError('')

      const response = await fetch('/api/calendar/sync-existing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        throw new Error('Failed to sync existing items')
      }

      const result = await response.json()
      setSuccess(`Synced ${result.synced} items to your calendar`)
    } catch (error) {
      console.error('Error syncing existing items:', error)
      setError('Failed to sync existing checklist items')
    } finally {
      setIsSyncing(false)
    }
  }

  if (!isPremium) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <CalendarIcon className="w-5 h-5" />
            Google Calendar Integration
            <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full font-medium">
              Premium Feature
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <p className="text-sm text-orange-700 mb-2">
                Automatically sync your checklist items to Google Calendar with premium features:
              </p>
              <ul className="text-sm text-orange-600 space-y-1 ml-4">
                <li>• Automatic event creation for appointments</li>
                <li>• Customizable reminders and notifications</li>
                <li>• Sync across all your devices</li>
                <li>• Family calendar sharing</li>
                <li>• Healthcare provider integration</li>
              </ul>
            </div>
          </div>
          
          <Button 
            className="w-full bg-pam-red hover:bg-pam-red/90"
            onClick={() => window.open('/premium', '_blank')}
          >
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Google Calendar Integration
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
    <PremiumGate
      feature="calendarIntegration"
      title="Google Calendar Integration"
      description="Sync your PAM checklist items with Google Calendar to stay organised across all your devices. Never miss an important appointment or reminder again."
    >
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Google Calendar Integration
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
            Premium
          </span>
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

        {!integration ? (
          /* Not Connected */
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <XCircleIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-600">Not connected to Google Calendar</span>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What you&apos;ll get:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Automatic calendar events for immunizations</li>
                <li>• Reminders for government registration deadlines</li>
                <li>• Sync with your existing calendar</li>
                <li>• Share with partners and healthcare providers</li>
              </ul>
            </div>

            <Button
              onClick={handleConnectGoogle}
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isConnecting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connecting to Google...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Connect Google Calendar
                </div>
              )}
            </Button>
          </div>
        ) : (
          /* Connected */
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-900">Connected to Google Calendar</span>
                </div>
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Disconnect
                </Button>
              </div>

              <div className="pl-7 space-y-2 text-sm text-gray-600">
                <div>Account: {integration.google_email}</div>
                <div>Calendar: {integration.calendar_name}</div>
                <div>Connected: {new Date(integration.created_at).toLocaleDateString('en-AU')}</div>
              </div>
            </div>

            {/* Sync Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Automatic Sync</h3>
                  <p className="text-sm text-gray-500">
                    Automatically create calendar events for new checklist items
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={integration.sync_enabled}
                    onChange={handleToggleSync}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pam-pink/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pam-red"></div>
                </label>
              </div>

              {integration.sync_enabled && (
                <Button
                  onClick={handleSyncExistingItems}
                  disabled={isSyncing}
                  variant="outline"
                  className="w-full"
                >
                  {isSyncing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Syncing existing items...
                    </div>
                  ) : (
                    'Sync Existing Checklist Items'
                  )}
                </Button>
              )}
            </div>

            {/* Sync Settings */}
            {syncSettings && integration.sync_enabled && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <CogIcon className="w-4 h-4" />
                  Sync Settings
                </h4>

                {/* Event Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default event duration
                  </label>
                  <select
                    value={syncSettings.default_event_duration}
                    onChange={(e) => handleUpdateSettings({ 
                      default_event_duration: parseInt(e.target.value) 
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                {/* Categories to Sync */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sync these categories
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'immunization', label: 'Immunizations' },
                      { key: 'registration', label: 'Government Registration' },
                      { key: 'checkup', label: 'Health Checkups' },
                      { key: 'milestone', label: 'Developmental Milestones' }
                    ].map(category => (
                      <label key={category.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={syncSettings.include_categories.includes(category.key)}
                          onChange={(e) => {
                            const newCategories = e.target.checked
                              ? [...syncSettings.include_categories, category.key]
                              : syncSettings.include_categories.filter(c => c !== category.key)
                            handleUpdateSettings({ include_categories: newCategories })
                          }}
                          className="mr-2 rounded border-gray-300 text-pam-red focus:ring-pam-red"
                        />
                        <span className="text-sm text-gray-700">{category.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Default Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default location (optional)
                  </label>
                  <input
                    type="text"
                    value={syncSettings.default_location || ''}
                    onChange={(e) => handleUpdateSettings({ default_location: e.target.value })}
                    placeholder="e.g., Family GP Clinic"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How it works</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>1. Connect your Google Calendar account</p>
            <p>2. New checklist items automatically create calendar events</p>
            <p>3. Get reminders on your phone, computer, and other devices</p>
            <p>4. Share your calendar with partners and healthcare providers</p>
          </div>
        </div>
      </CardContent>
    </Card>
    </PremiumGate>
  )
}