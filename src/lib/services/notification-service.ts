// Push Notification Service for PAM

import { getToken, onMessage, MessagePayload } from 'firebase/messaging'
import { initializeMessaging, isFirebaseConfigured } from '@/lib/firebase/config'
import { createClient } from '@/lib/supabase/client'

export interface NotificationPreferences {
  id: string
  user_id: string
  checklist_reminders_enabled: boolean
  reminder_days_before: number
  reminder_time: string
  push_enabled: boolean
  email_enabled: boolean
}

export interface PushToken {
  id: string
  user_id: string
  token: string
  platform: 'android' | 'ios' | 'web'
  is_active: boolean
}

export interface ScheduledNotification {
  id: string
  user_id: string
  checklist_item_id?: string
  notification_type: 'checklist_reminder' | 'immunization_due' | 'appointment_reminder'
  title: string
  body: string
  scheduled_for: string
  sent_at?: string
  is_sent: boolean
}

export class NotificationService {
  private static vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY

  /**
   * Check if push notifications are supported
   */
  static isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator &&
      isFirebaseConfigured()
    )
  }

  /**
   * Request notification permission
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications not supported')
    }

    return await Notification.requestPermission()
  }

  /**
   * Get FCM registration token
   */
  static async getRegistrationToken(): Promise<string | null> {
    try {
      const messaging = await initializeMessaging()
      if (!messaging || !this.vapidKey) {
        return null
      }

      const permission = await this.requestPermission()
      if (permission !== 'granted') {
        return null
      }

      const token = await getToken(messaging, {
        vapidKey: this.vapidKey
      })

      return token || null
    } catch (error) {
      console.error('Error getting registration token:', error)
      return null
    }
  }

  /**
   * Register push token for current user
   */
  static async registerPushToken(userId: string): Promise<boolean> {
    try {
      const token = await this.getRegistrationToken()
      if (!token) {
        return false
      }

      const supabase = createClient()
      
      // Detect platform
      const platform = this.detectPlatform()

      // Upsert push token
      const { error } = await supabase
        .from('push_tokens')
        .upsert({
          user_id: userId,
          token,
          platform,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'token'
        })

      if (error) {
        console.error('Error saving push token:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error registering push token:', error)
      return false
    }
  }

  /**
   * Unregister push token
   */
  static async unregisterPushToken(userId: string): Promise<void> {
    try {
      const token = await this.getRegistrationToken()
      if (!token) return

      const supabase = createClient()
      await supabase
        .from('push_tokens')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('token', token)
    } catch (error) {
      console.error('Error unregistering push token:', error)
    }
  }

  /**
   * Set up foreground message listener
   */
  static async setupMessageListener(
    onMessageReceived: (payload: MessagePayload) => void
  ): Promise<void> {
    try {
      const messaging = await initializeMessaging()
      if (!messaging) return

      onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload)
        onMessageReceived(payload)
      })
    } catch (error) {
      console.error('Error setting up message listener:', error)
    }
  }

  /**
   * Get user's notification preferences
   */
  static async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching notification preferences:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error getting notification preferences:', error)
      return null
    }
  }

  /**
   * Update notification preferences
   */
  static async updateNotificationPreferences(
    userId: string,
    preferences: Partial<Omit<NotificationPreferences, 'id' | 'user_id'>>
  ): Promise<boolean> {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Error updating notification preferences:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      return false
    }
  }

  /**
   * Schedule notification for checklist item
   */
  static async scheduleChecklistNotification(
    checklistItemId: string,
    userId: string,
    title: string,
    body: string,
    dueDate: Date
  ): Promise<boolean> {
    try {
      const supabase = createClient()
      
      // Call the database function to schedule notification
      const { error } = await supabase.rpc('schedule_checklist_notification', {
        p_checklist_item_id: checklistItemId,
        p_user_id: userId,
        p_title: title,
        p_body: body,
        p_due_date: dueDate.toISOString().split('T')[0] // YYYY-MM-DD format
      })

      if (error) {
        console.error('Error scheduling notification:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error scheduling checklist notification:', error)
      return false
    }
  }

  /**
   * Cancel scheduled notification for checklist item
   */
  static async cancelChecklistNotification(checklistItemId: string): Promise<void> {
    try {
      const supabase = createClient()
      
      // Call the database function to cancel notification
      await supabase.rpc('cancel_checklist_notification', {
        p_checklist_item_id: checklistItemId
      })
    } catch (error) {
      console.error('Error canceling notification:', error)
    }
  }

  /**
   * Get scheduled notifications for user
   */
  static async getScheduledNotifications(userId: string): Promise<ScheduledNotification[]> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('scheduled_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_sent', false)
        .order('scheduled_for', { ascending: true })

      if (error) {
        console.error('Error fetching scheduled notifications:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error getting scheduled notifications:', error)
      return []
    }
  }

  /**
   * Show local notification (fallback for foreground messages)
   */
  static showLocalNotification(title: string, body: string, options?: NotificationOptions): void {
    if (!this.isSupported()) return

    try {
      new Notification(title, {
        body,
        icon: '/icons/pwa-192x192.png',
        badge: '/icons/pwa-96x96.png',
        tag: 'pam-notification',
        requireInteraction: true,
        ...options
      })
    } catch (error) {
      console.error('Error showing local notification:', error)
    }
  }

  /**
   * Detect platform for push token
   */
  private static detectPlatform(): 'android' | 'ios' | 'web' {
    if (typeof window === 'undefined') return 'web'

    const userAgent = window.navigator.userAgent.toLowerCase()
    
    if (/android/.test(userAgent)) {
      return 'android'
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios'
    } else {
      return 'web'
    }
  }

  /**
   * Initialize notification service for user
   */
  static async initialize(userId: string): Promise<boolean> {
    try {
      if (!this.isSupported()) {
        console.warn('Push notifications not supported')
        return false
      }

      // Register push token
      const tokenRegistered = await this.registerPushToken(userId)
      
      // Set up message listener for foreground notifications
      await this.setupMessageListener((payload) => {
        if (payload.notification) {
          this.showLocalNotification(
            payload.notification.title || 'PAM Notification',
            payload.notification.body || ''
          )
        }
      })

      return tokenRegistered
    } catch (error) {
      console.error('Error initializing notification service:', error)
      return false
    }
  }
}