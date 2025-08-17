// Firebase Cloud Functions for PAM Notifications

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { createClient } from '@supabase/supabase-js'

// Initialize Firebase Admin
admin.initializeApp()

// Initialize Supabase client with service role key
const supabase = createClient(
  functions.config().supabase.url,
  functions.config().supabase.service_role_key
)

interface ScheduledNotification {
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

interface PushToken {
  id: string
  user_id: string
  token: string
  platform: 'android' | 'ios' | 'web'
  is_active: boolean
}

/**
 * Scheduled function to send pending notifications
 * Runs every 5 minutes to check for notifications to send
 */
export const sendScheduledNotifications = functions.pubsub
  .schedule('every 5 minutes')
  .timeZone('Australia/Sydney')
  .onRun(async (context) => {
    try {
      console.log('Checking for scheduled notifications...')

      // Get notifications that should be sent now
      const now = new Date().toISOString()
      const { data: notifications, error: notificationsError } = await supabase
        .from('scheduled_notifications')
        .select('*')
        .eq('is_sent', false)
        .lte('scheduled_for', now)
        .limit(50) // Process max 50 at a time

      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError)
        return
      }

      if (!notifications || notifications.length === 0) {
        console.log('No notifications to send')
        return
      }

      console.log(`Found ${notifications.length} notifications to send`)

      // Group notifications by user for batch processing
      const notificationsByUser = notifications.reduce((acc, notification) => {
        if (!acc[notification.user_id]) {
          acc[notification.user_id] = []
        }
        acc[notification.user_id].push(notification)
        return acc
      }, {} as Record<string, ScheduledNotification[]>)

      // Process notifications for each user
      for (const [userId, userNotifications] of Object.entries(notificationsByUser)) {
        await processUserNotifications(userId, userNotifications)
      }

      console.log('Finished processing scheduled notifications')
    } catch (error) {
      console.error('Error in sendScheduledNotifications:', error)
    }
  })

/**
 * Process notifications for a specific user
 */
async function processUserNotifications(userId: string, notifications: ScheduledNotification[]) {
  try {
    // Get user's active push tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (tokensError) {
      console.error(`Error fetching tokens for user ${userId}:`, tokensError)
      return
    }

    if (!tokens || tokens.length === 0) {
      console.log(`No active push tokens for user ${userId}`)
      
      // Mark notifications as sent even if no tokens (to avoid retrying)
      await markNotificationsAsSent(notifications.map(n => n.id))
      return
    }

    // Send notifications to all user's devices
    for (const notification of notifications) {
      const success = await sendNotificationToTokens(notification, tokens)
      
      if (success) {
        await markNotificationsAsSent([notification.id])
        console.log(`Sent notification ${notification.id} to user ${userId}`)
      } else {
        console.error(`Failed to send notification ${notification.id}`)
      }
    }
  } catch (error) {
    console.error(`Error processing notifications for user ${userId}:`, error)
  }
}

/**
 * Send a notification to multiple push tokens
 */
async function sendNotificationToTokens(
  notification: ScheduledNotification, 
  tokens: PushToken[]
): Promise<boolean> {
  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        type: notification.notification_type,
        checklist_item_id: notification.checklist_item_id || '',
        url: getNotificationUrl(notification),
      },
      android: {
        notification: {
          icon: 'notification_icon',
          color: '#7D0820', // PAM red
          channelId: 'pam_reminders',
          priority: 'high' as const,
        }
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
            category: 'PAM_REMINDER',
          }
        }
      },
      webpush: {
        notification: {
          icon: '/icons/pwa-192x192.png',
          badge: '/icons/pwa-96x96.png',
          tag: 'pam-reminder',
          requireInteraction: true,
        },
        fcmOptions: {
          link: getNotificationUrl(notification),
        }
      }
    }

    // Extract token strings
    const tokenStrings = tokens.map(t => t.token)

    // Send to multiple tokens
    const response = await admin.messaging().sendMulticast({
      tokens: tokenStrings,
      ...message
    })

    console.log(`Sent notification to ${response.successCount}/${tokenStrings.length} devices`)

    // Handle failed tokens (they might be invalid)
    if (response.failureCount > 0) {
      const failedTokens: string[] = []
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokenStrings[idx])
          console.error(`Token ${tokenStrings[idx]} failed:`, resp.error)
        }
      })

      // Deactivate failed tokens
      await deactivateTokens(failedTokens)
    }

    return response.successCount > 0
  } catch (error) {
    console.error('Error sending notification:', error)
    return false
  }
}

/**
 * Get the appropriate URL for a notification
 */
function getNotificationUrl(notification: ScheduledNotification): string {
  switch (notification.notification_type) {
    case 'checklist_reminder':
    case 'immunization_due':
    case 'appointment_reminder':
      return '/dashboard/checklist'
    default:
      return '/dashboard'
  }
}

/**
 * Mark notifications as sent
 */
async function markNotificationsAsSent(notificationIds: string[]) {
  try {
    const { error } = await supabase
      .from('scheduled_notifications')
      .update({
        is_sent: true,
        sent_at: new Date().toISOString()
      })
      .in('id', notificationIds)

    if (error) {
      console.error('Error marking notifications as sent:', error)
    }
  } catch (error) {
    console.error('Error updating notification status:', error)
  }
}

/**
 * Deactivate invalid push tokens
 */
async function deactivateTokens(tokens: string[]) {
  try {
    const { error } = await supabase
      .from('push_tokens')
      .update({ is_active: false })
      .in('token', tokens)

    if (error) {
      console.error('Error deactivating tokens:', error)
    } else {
      console.log(`Deactivated ${tokens.length} invalid tokens`)
    }
  } catch (error) {
    console.error('Error deactivating tokens:', error)
  }
}

/**
 * HTTP function to test notification sending (for development)
 */
export const testNotification = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed')
      return
    }

    const { userId, title, body } = req.body

    if (!userId || !title || !body) {
      res.status(400).send('Missing required fields: userId, title, body')
      return
    }

    // Get user's tokens
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (!tokens || tokens.length === 0) {
      res.status(404).send('No active push tokens found for user')
      return
    }

    // Send test notification
    const testNotification = {
      id: 'test',
      user_id: userId,
      notification_type: 'checklist_reminder' as const,
      title,
      body,
      scheduled_for: new Date().toISOString(),
      is_sent: false,
    }

    const success = await sendNotificationToTokens(testNotification, tokens)

    if (success) {
      res.json({ success: true, message: 'Test notification sent' })
    } else {
      res.status(500).json({ success: false, message: 'Failed to send notification' })
    }
  } catch (error) {
    console.error('Error in test notification:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * Clean up old sent notifications (runs daily)
 */
export const cleanupNotifications = functions.pubsub
  .schedule('0 2 * * *') // 2 AM daily
  .timeZone('Australia/Sydney')
  .onRun(async (context) => {
    try {
      // Delete notifications older than 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { error } = await supabase
        .from('scheduled_notifications')
        .delete()
        .eq('is_sent', true)
        .lt('sent_at', thirtyDaysAgo.toISOString())

      if (error) {
        console.error('Error cleaning up notifications:', error)
      } else {
        console.log('Successfully cleaned up old notifications')
      }
    } catch (error) {
      console.error('Error in cleanup function:', error)
    }
  })