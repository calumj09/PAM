'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { NotificationService, NotificationPreferences, ScheduledNotification } from '@/lib/services/notification-service'

export function useNotifications(userId: string | null) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([])
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check notification support and permission
  useEffect(() => {
    setIsSupported(NotificationService.isSupported())
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  // Load user preferences and scheduled notifications
  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    loadUserData()
  }, [userId])

  const loadUserData = async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      setError(null)

      // Load preferences and scheduled notifications in parallel
      const [prefsResult, notificationsResult] = await Promise.all([
        NotificationService.getNotificationPreferences(userId),
        NotificationService.getScheduledNotifications(userId)
      ])

      setPreferences(prefsResult)
      setScheduledNotifications(notificationsResult)
    } catch (err) {
      console.error('Error loading notification data:', err)
      setError('Failed to load notification settings')
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize notifications for user
  const initializeNotifications = useCallback(async () => {
    if (!userId || !isSupported) return false

    try {
      const success = await NotificationService.initialize(userId)
      if (success) {
        setPermission('granted')
        await loadUserData() // Reload data
      }
      return success
    } catch (err) {
      console.error('Error initializing notifications:', err)
      setError('Failed to initialize notifications')
      return false
    }
  }, [userId, isSupported])

  // Update notification preferences
  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    if (!userId) return false

    try {
      const success = await NotificationService.updateNotificationPreferences(userId, updates)
      if (success && preferences) {
        setPreferences({ ...preferences, ...updates })
      }
      return success
    } catch (err) {
      console.error('Error updating preferences:', err)
      setError('Failed to update preferences')
      return false
    }
  }, [userId, preferences])

  // Schedule a new notification
  const scheduleNotification = useCallback(async (
    checklistItemId: string,
    title: string,
    body: string,
    dueDate: Date
  ) => {
    if (!userId) return false

    try {
      const success = await NotificationService.scheduleChecklistNotification(
        checklistItemId,
        userId,
        title,
        body,
        dueDate
      )
      
      if (success) {
        await loadUserData() // Reload to get new notification
      }
      
      return success
    } catch (err) {
      console.error('Error scheduling notification:', err)
      setError('Failed to schedule notification')
      return false
    }
  }, [userId])

  // Cancel a scheduled notification
  const cancelNotification = useCallback(async (checklistItemId: string) => {
    try {
      await NotificationService.cancelChecklistNotification(checklistItemId)
      await loadUserData() // Reload to remove cancelled notification
    } catch (err) {
      console.error('Error canceling notification:', err)
      setError('Failed to cancel notification')
    }
  }, [])

  // Disable notifications
  const disableNotifications = useCallback(async () => {
    if (!userId) return

    try {
      await NotificationService.unregisterPushToken(userId)
      await updatePreferences({ push_enabled: false })
    } catch (err) {
      console.error('Error disabling notifications:', err)
      setError('Failed to disable notifications')
    }
  }, [userId, updatePreferences])

  // Set up real-time updates for scheduled notifications
  useEffect(() => {
    if (!userId) return

    const supabase = createClient()
    
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scheduled_notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Reload notifications when they change
          loadUserData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return {
    // State
    preferences,
    scheduledNotifications,
    isSupported,
    permission,
    isLoading,
    error,
    
    // Computed
    isEnabled: permission === 'granted' && preferences?.push_enabled === true,
    notificationCount: scheduledNotifications.length,
    
    // Actions
    initializeNotifications,
    updatePreferences,
    scheduleNotification,
    cancelNotification,
    disableNotifications,
    refreshData: loadUserData,
    
    // Clear error
    clearError: () => setError(null)
  }
}