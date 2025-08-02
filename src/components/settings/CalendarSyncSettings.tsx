'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { calendarSyncService, CalendarProvider, CalendarSyncSettings, SyncedEvent } from '@/lib/services/calendar-sync'
import { createClient } from '@/lib/supabase/client'
import { PremiumGate } from '@/components/premium/PremiumGate'
import { 
  CalendarIcon, 
  LinkIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CogIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CloudIcon
} from '@heroicons/react/24/outline'

interface CalendarSyncSettingsProps {
  userId: string
  isPremium: boolean
}

export function CalendarSyncSettings({ userId, isPremium }: CalendarSyncSettingsProps) {
  const [providers, setProviders] = useState<CalendarProvider[]>([])
  const [connectedProviders, setConnectedProviders] = useState<CalendarSyncSettings[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isPremium) {
      loadSyncData()
    } else {
      setIsLoading(false)
    }
  }, [userId, isPremium])

  const loadSyncData = async () => {
    try {
      setIsLoading(true)
      const availableProviders = calendarSyncService.getProviders()
      setProviders(availableProviders)

      // Load connected providers from database
      const supabase = createClient()
      const { data, error } = await supabase
        .from('calendar_sync_settings')
        .select('*')
        .eq('user_id', userId)
        .eq('sync_enabled', true)

      if (error) throw error
      setConnectedProviders(data || [])
    } catch (error) {
      console.error('Error loading sync data:', error)
      setError('Failed to load calendar sync data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async (providerId: string) => {
    try {
      setIsConnecting(providerId)
      setError('')

      const { authUrl } = await calendarSyncService.initiateSync(providerId)
      
      // Open in popup window
      const popup = window.open(
        authUrl,
        `${providerId}-calendar-auth`,
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )

      // Listen for popup completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          // Reload sync data
          setTimeout(() => {
            loadSyncData()
            setSuccess(`${providerId} Calendar connected successfully!`)
          }, 1000)
        }
      }, 1000)

    } catch (error) {
      console.error(`Error connecting to ${providerId} Calendar:`, error)
      setError(`Failed to connect to ${providerId} Calendar`)
    } finally {
      setIsConnecting(null)
    }
  }

  const handleDisconnect = async (providerId: string) => {
    try {
      const supabase = createClient()
      
      await supabase
        .from('calendar_sync_settings')
        .update({ sync_enabled: false })
        .eq('user_id', userId)
        .eq('provider_id', providerId)

      setConnectedProviders(prev => prev.filter(p => p.providerId !== providerId))
      setSuccess(`${providerId} Calendar disconnected successfully`)
    } catch (error) {
      console.error('Error disconnecting calendar:', error)
      setError('Failed to disconnect calendar')
    }
  }

  const handleToggleSync = async (providerId: string) => {
    const connection = connectedProviders.find(p => p.providerId === providerId)
    if (!connection) return

    try {
      const supabase = createClient()
      const newSyncEnabled = !connection.syncEnabled

      await supabase
        .from('calendar_sync_settings')
        .update({ sync_enabled: newSyncEnabled })
        .eq('user_id', userId)
        .eq('provider_id', providerId)

      setConnectedProviders(prev => 
        prev.map(p => 
          p.providerId === providerId 
            ? { ...p, syncEnabled: newSyncEnabled }
            : p
        )
      )
      setSuccess(`${providerId} sync ${newSyncEnabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      console.error('Error toggling sync:', error)
      setError('Failed to update sync settings')
    }
  }

  const handleUpdateCategories = async (providerId: string, categories: Partial<CalendarSyncSettings['categories']>) => {
    const connection = connectedProviders.find(p => p.providerId === providerId)
    if (!connection) return

    try {
      const supabase = createClient()
      const updatedCategories = { ...connection.categories, ...categories }
      
      await supabase
        .from('calendar_sync_settings')
        .update({ categories: updatedCategories })
        .eq('user_id', userId)
        .eq('provider_id', providerId)

      setConnectedProviders(prev => 
        prev.map(p => 
          p.providerId === providerId 
            ? { ...p, categories: updatedCategories }
            : p
        )
      )
      setSuccess('Sync categories updated successfully')
    } catch (error) {
      console.error('Error updating categories:', error)
      setError('Failed to update sync categories')
    }
  }

  const handleSyncExisting = async (providerId: string) => {
    try {
      setIsSyncing(providerId)
      setError('')

      const connection = connectedProviders.find(p => p.providerId === providerId)
      if (!connection) return

      // Create sample PAM events for demonstration
      const pamEvents: SyncedEvent[] = [
        calendarSyncService.createPAMEvent(
          '18-month checkup',
          'Routine developmental checkup for your little one',
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour duration
          'checkups'
        ),
        calendarSyncService.createPAMEvent(
          'MMR Immunisation',
          'Measles, Mumps and Rubella vaccination due',
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 30 minutes duration
          'immunisations'
        )
      ]

      const result = await calendarSyncService.syncEvents(connection, pamEvents)
      
      if (result.success) {
        setSuccess(`Successfully synced ${result.syncedCount} events to ${providerId} Calendar`)
      } else {
        setError(`Sync completed with ${result.errors.length} errors: ${result.errors.join(', ')}`)
      }
    } catch (error) {
      console.error('Error syncing existing items:', error)
      setError('Failed to sync existing checklist items')
    } finally {
      setIsSyncing(null)
    }
  }

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'google':
        return ''
      case 'apple':
        return ''
      case 'outlook':
        return ''
      default:
        return ''
    }
  }

  if (!isPremium) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <CalendarIcon className="w-5 h-5" />
            Calendar Sync Integration
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
                Sync your PAM checklist with multiple calendar providers:
              </p>
              <ul className="text-sm text-orange-600 space-y-1 ml-4">
                <li>• Google Calendar integration</li>
                <li>• Microsoft Outlook support</li>
                <li>• Apple Calendar sync (coming soon)</li>
                <li>• Bidirectional synchronization</li>
                <li>• Customizable sync categories</li>
                <li>• Family calendar sharing</li>
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
            Calendar Sync Integration
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
      feature="calendarSync"
      title="Calendar Sync Integration"
      description="Sync your PAM checklist items with multiple calendar providers to stay organised across all your devices and platforms."
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Calendar Sync Integration
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

          {/* Available Providers */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Available Calendar Providers</h3>
            
            {providers.map(provider => {
              const connection = connectedProviders.find(p => p.providerId === provider.id)
              const isConnected = !!connection
              
              return (
                <div key={provider.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getProviderIcon(provider.id)}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{provider.name}</h4>
                        <p className="text-sm text-gray-500">
                          {isConnected ? 'Connected and syncing' : 'Not connected'}
                        </p>
                      </div>
                      {isConnected && (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      )}
                    </div>

                    {!isConnected ? (
                      <Button
                        onClick={() => handleConnect(provider.id)}
                        disabled={isConnecting === provider.id || !provider.supportsSync}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        {isConnecting === provider.id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Connecting...
                          </div>
                        ) : provider.supportsSync ? (
                          <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" />
                            Connect
                          </div>
                        ) : (
                          'Coming Soon'
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleDisconnect(provider.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Disconnect
                      </Button>
                    )}
                  </div>

                  {isConnected && connection && (
                    <div className="space-y-4 border-t border-gray-100 pt-4">
                      {/* Sync Toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-900">Automatic Sync</span>
                          <p className="text-xs text-gray-500">
                            Create calendar events for new checklist items
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={connection.syncEnabled}
                            onChange={() => handleToggleSync(provider.id)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pam-pink/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pam-red"></div>
                        </label>
                      </div>

                      {connection.syncEnabled && (
                        <>
                          {/* Sync Categories */}
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-gray-900">Sync Categories</span>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { key: 'immunisations', label: 'Immunisations' },
                                { key: 'checkups', label: 'Health Checkups' },
                                { key: 'milestones', label: 'Milestones' },
                                { key: 'appointments', label: 'Appointments' },
                                { key: 'me_time', label: 'Me Time' }
                              ].map(category => (
                                <label key={category.key} className="flex items-center text-sm">
                                  <input
                                    type="checkbox"
                                    checked={connection.categories[category.key as keyof typeof connection.categories]}
                                    onChange={(e) => handleUpdateCategories(provider.id, {
                                      [category.key]: e.target.checked
                                    })}
                                    className="mr-2 rounded border-gray-300 text-pam-red focus:ring-pam-red"
                                  />
                                  <span className="text-gray-700">{category.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Sync Existing Items */}
                          <Button
                            onClick={() => handleSyncExisting(provider.id)}
                            disabled={isSyncing === provider.id}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            {isSyncing === provider.id ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                Syncing...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <ArrowPathIcon className="w-4 h-4" />
                                Sync Existing Items
                              </div>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Help Text */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              <CloudIcon className="w-4 h-4 inline mr-1" />
              How Calendar Sync Works
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>1. Connect your preferred calendar provider(s)</p>
              <p>2. Choose which categories to sync automatically</p>
              <p>3. New checklist items create calendar events instantly</p>
              <p>4. Get reminders across all your devices and platforms</p>
              <p>5. Share calendars with family and healthcare providers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PremiumGate>
  )
}