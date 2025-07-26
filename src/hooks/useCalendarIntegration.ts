'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CalendarService } from '@/lib/services/calendar-service'

export interface CalendarIntegration {
  id: string
  google_email: string
  calendar_name: string
  google_access_token: string
  google_refresh_token: string
  calendar_id: string
  is_active: boolean
  sync_enabled: boolean
  created_at: string
}

export interface CalendarSyncSettings {
  auto_create_events: boolean
  default_event_duration: number
  reminder_minutes_before: number[]
  default_location: string
  include_categories: string[]
  event_color_id: string
}

export interface CalendarEvent {
  id: string
  checklist_item_id: string
  google_event_id: string
  event_title: string
  event_start_time: string
  event_end_time: string
  is_synced: boolean
}

export function useCalendarIntegration(userId: string | null, isPremium: boolean) {
  const [integration, setIntegration] = useState<CalendarIntegration | null>(null)
  const [syncSettings, setSyncSettings] = useState<CalendarSyncSettings | null>(null)
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load all calendar data
  const loadCalendarData = useCallback(async () => {
    if (!userId || !isPremium) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()

      // Load integration, settings, and events in parallel
      const [integrationResult, settingsResult, eventsResult] = await Promise.all([
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
          .single(),
        supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', userId)
          .eq('is_synced', true)
          .order('event_start_time', { ascending: true })
      ])

      setIntegration(integrationResult.data || null)
      setSyncSettings(settingsResult.data || null)
      setCalendarEvents(eventsResult.data || [])

    } catch (err) {
      console.error('Error loading calendar data:', err)
      setError('Failed to load calendar integration data')
    } finally {
      setIsLoading(false)
    }
  }, [userId, isPremium])

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadCalendarData()
  }, [loadCalendarData])

  // Connect to Google Calendar
  const connectCalendar = useCallback(async () => {
    if (!userId) return false

    try {
      const redirectUri = `${window.location.origin}/api/calendar/callback`
      const authUrl = CalendarService.generateAuthUrl(userId, redirectUri)
      
      // Open popup window
      const popup = window.open(
        authUrl,
        'google-calendar-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )

      return new Promise<boolean>((resolve) => {
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed)
            // Reload data after connection
            setTimeout(() => {
              loadCalendarData().then(() => resolve(true))
            }, 1000)
          }
        }, 1000)

        // Listen for messages from popup
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'calendar-connected' && event.data.success) {
            clearInterval(checkClosed)
            popup?.close()
            loadCalendarData().then(() => resolve(true))
            window.removeEventListener('message', handleMessage)
          }
        }

        window.addEventListener('message', handleMessage)

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed)
          popup?.close()
          window.removeEventListener('message', handleMessage)
          resolve(false)
        }, 300000)
      })
    } catch (err) {
      console.error('Error connecting calendar:', err)
      setError('Failed to connect to Google Calendar')
      return false
    }
  }, [userId, loadCalendarData])

  // Disconnect calendar
  const disconnectCalendar = useCallback(async () => {
    if (!userId || !integration) return false

    try {
      const supabase = createClient()
      
      await supabase
        .from('calendar_integrations')
        .update({ is_active: false })
        .eq('user_id', userId)

      setIntegration(null)
      setCalendarEvents([])
      return true
    } catch (err) {
      console.error('Error disconnecting calendar:', err)
      setError('Failed to disconnect calendar')
      return false
    }
  }, [userId, integration])

  // Toggle sync enabled/disabled
  const toggleSync = useCallback(async () => {
    if (!integration) return false

    try {
      const supabase = createClient()
      const newSyncEnabled = !integration.sync_enabled

      await supabase
        .from('calendar_integrations')
        .update({ sync_enabled: newSyncEnabled })
        .eq('id', integration.id)

      setIntegration({ ...integration, sync_enabled: newSyncEnabled })
      return true
    } catch (err) {
      console.error('Error toggling sync:', err)
      setError('Failed to update sync settings')
      return false
    }
  }, [integration])

  // Update sync settings
  const updateSyncSettings = useCallback(async (updates: Partial<CalendarSyncSettings>) => {
    if (!userId || !syncSettings) return false

    try {
      const supabase = createClient()
      
      await supabase
        .from('calendar_sync_settings')
        .update(updates)
        .eq('user_id', userId)

      setSyncSettings({ ...syncSettings, ...updates })
      return true
    } catch (err) {
      console.error('Error updating sync settings:', err)
      setError('Failed to update sync settings')
      return false
    }
  }, [userId, syncSettings])

  // Sync existing checklist items
  const syncExistingItems = useCallback(async () => {
    if (!userId) return { synced: 0, failed: 0, total: 0 }

    try {
      const response = await fetch('/api/calendar/sync-existing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        throw new Error('Failed to sync existing items')
      }

      const result = await response.json()
      
      // Reload calendar events to show new synced items
      await loadCalendarData()
      
      return result
    } catch (err) {
      console.error('Error syncing existing items:', err)
      setError('Failed to sync existing checklist items')
      return { synced: 0, failed: 0, total: 0 }
    }
  }, [userId, loadCalendarData])

  // Schedule calendar event for specific checklist item
  const scheduleCalendarEvent = useCallback(async (
    checklistItemId: string,
    title: string,
    description: string,
    dueDate: Date,
    childName: string
  ) => {
    if (!userId || !integration || !syncSettings) return false

    try {
      const supabase = createClient()

      // Check if already synced
      const { data: existingEvent } = await supabase
        .from('calendar_events')
        .select('id')
        .eq('checklist_item_id', checklistItemId)
        .eq('is_synced', true)
        .single()

      if (existingEvent) {
        return true // Already synced
      }

      // Create calendar event
      const event = CalendarService.createEventFromChecklistItem(
        {
          id: checklistItemId,
          title,
          description,
          due_date: dueDate.toISOString().split('T')[0],
          category: 'immunization' // Default category
        },
        childName,
        syncSettings
      )

      // Get fresh access token
      let accessToken = integration.google_access_token
      const isValid = await CalendarService.validateTokens(accessToken)
      
      if (!isValid) {
        const refreshed = await CalendarService.refreshAccessToken(integration.google_refresh_token)
        if (!refreshed) return false
        accessToken = refreshed
      }

      // Create event in Google Calendar
      const createdEvent = await CalendarService.createCalendarEvent(
        accessToken,
        integration.calendar_id,
        event
      )

      if (!createdEvent) return false

      // Save to database
      await supabase
        .from('calendar_events')
        .insert({
          user_id: userId,
          checklist_item_id: checklistItemId,
          google_event_id: createdEvent.id!,
          calendar_id: integration.calendar_id,
          event_title: createdEvent.summary!,
          event_start_time: createdEvent.start.dateTime || createdEvent.start.date!,
          event_end_time: createdEvent.end.dateTime || createdEvent.end.date!,
          is_synced: true,
          last_synced_at: new Date().toISOString()
        })

      // Reload events
      await loadCalendarData()
      
      return true
    } catch (err) {
      console.error('Error scheduling calendar event:', err)
      setError('Failed to schedule calendar event')
      return false
    }
  }, [userId, integration, syncSettings, loadCalendarData])

  // Set up real-time updates
  useEffect(() => {
    if (!userId || !isPremium) return

    const supabase = createClient()
    
    const channel = supabase
      .channel('user-calendar-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_integrations',
          filter: `user_id=eq.${userId}`
        },
        () => loadCalendarData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_sync_settings',
          filter: `user_id=eq.${userId}`
        },
        () => loadCalendarData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
          filter: `user_id=eq.${userId}`
        },
        () => loadCalendarData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, isPremium, loadCalendarData])

  return {
    // State
    integration,
    syncSettings,
    calendarEvents,
    isLoading,
    error,
    
    // Computed
    isConnected: !!integration,
    isSyncEnabled: integration?.sync_enabled || false,
    syncedEventCount: calendarEvents.length,
    
    // Actions
    connectCalendar,
    disconnectCalendar,
    toggleSync,
    updateSyncSettings,
    syncExistingItems,
    scheduleCalendarEvent,
    refreshData: loadCalendarData,
    
    // Clear error
    clearError: () => setError(null)
  }
}