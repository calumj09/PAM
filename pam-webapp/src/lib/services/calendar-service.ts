// Google Calendar Integration Service for PAM

export interface CalendarEvent {
  id?: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  location?: string
  attendees?: Array<{
    email: string
    displayName?: string
  }>
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: 'email' | 'popup'
      minutes: number
    }>
  }
  colorId?: string
  status?: 'confirmed' | 'tentative' | 'cancelled'
  transparency?: 'opaque' | 'transparent'
}

export interface CalendarIntegration {
  id: string
  user_id: string
  google_access_token: string
  google_refresh_token: string
  google_email: string
  calendar_id: string
  is_active: boolean
  sync_enabled: boolean
  created_at: string
  updated_at: string
}

export interface CalendarSyncSettings {
  auto_create_events: boolean
  default_event_duration: number // minutes
  reminder_minutes_before: number[]
  default_location?: string
  include_categories: string[]
  event_color_id?: string
}

export class CalendarService {
  private static readonly SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ]
  
  private static readonly CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3'

  /**
   * Generate Google OAuth URL for calendar access
   */
  static generateAuthUrl(userId: string, redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: this.SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: userId // Pass user ID for security
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  /**
   * Exchange authorization code for access tokens
   */
  static async exchangeCodeForTokens(code: string): Promise<{
    access_token: string
    refresh_token: string
    expires_in: number
    email: string
  } | null> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to exchange code for tokens')
      }

      const tokens = await response.json()

      // Get user email from Google
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`
      )
      const userInfo = await userInfoResponse.json()

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        email: userInfo.email
      }
    } catch (error) {
      console.error('Error exchanging code for tokens:', error)
      return null
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to refresh access token')
      }

      const tokens = await response.json()
      return tokens.access_token
    } catch (error) {
      console.error('Error refreshing access token:', error)
      return null
    }
  }

  /**
   * Create calendar event
   */
  static async createCalendarEvent(
    accessToken: string,
    calendarId: string,
    event: CalendarEvent
  ): Promise<CalendarEvent | null> {
    try {
      const response = await fetch(
        `${this.CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      )

      if (!response.ok) {
        const error = await response.text()
        console.error('Calendar API error:', error)
        throw new Error(`Failed to create calendar event: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating calendar event:', error)
      return null
    }
  }

  /**
   * Update calendar event
   */
  static async updateCalendarEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
    event: Partial<CalendarEvent>
  ): Promise<CalendarEvent | null> {
    try {
      const response = await fetch(
        `${this.CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to update calendar event: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating calendar event:', error)
      return null
    }
  }

  /**
   * Delete calendar event
   */
  static async deleteCalendarEvent(
    accessToken: string,
    calendarId: string,
    eventId: string
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      return response.ok
    } catch (error) {
      console.error('Error deleting calendar event:', error)
      return false
    }
  }

  /**
   * List user's calendars
   */
  static async listCalendars(accessToken: string): Promise<Array<{
    id: string
    summary: string
    description?: string
    accessRole: string
    primary?: boolean
  }> | null> {
    try {
      const response = await fetch(
        `${this.CALENDAR_API_BASE}/users/me/calendarList`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to list calendars: ${response.status}`)
      }

      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error('Error listing calendars:', error)
      return null
    }
  }

  /**
   * Get events from calendar in date range
   */
  static async getCalendarEvents(
    accessToken: string,
    calendarId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[] | null> {
    try {
      const params = new URLSearchParams({
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '250'
      })

      const response = await fetch(
        `${this.CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to get calendar events: ${response.status}`)
      }

      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error('Error getting calendar events:', error)
      return null
    }
  }

  /**
   * Create event from checklist item
   */
  static createEventFromChecklistItem(
    checklistItem: {
      id: string
      title: string
      description: string
      due_date: string
      category: string
    },
    childName: string,
    settings: CalendarSyncSettings
  ): CalendarEvent {
    const dueDate = new Date(checklistItem.due_date)
    
    // Set default time to 9 AM if no time specified
    const startDateTime = new Date(dueDate)
    startDateTime.setHours(9, 0, 0, 0)
    
    const endDateTime = new Date(startDateTime)
    endDateTime.setMinutes(endDateTime.getMinutes() + settings.default_event_duration)

    // Create event summary and description
    const summary = `${checklistItem.title} - ${childName}`
    const description = [
      checklistItem.description,
      '',
      `Category: ${checklistItem.category}`,
      `Child: ${childName}`,
      '',
      'Created by PAM (Parenting Assistance Mobile)',
      `Checklist Item ID: ${checklistItem.id}`
    ].join('\n')

    // Set reminders
    const reminders = settings.reminder_minutes_before.map(minutes => ({
      method: 'popup' as const,
      minutes
    }))

    // Determine color based on category
    const categoryColors: Record<string, string> = {
      immunisation: '11', // Red
      registration: '9',  // Blue  
      milestone: '10',    // Green
      checkup: '5'        // Yellow
    }

    return {
      summary,
      description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Australia/Sydney'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Australia/Sydney'
      },
      location: settings.default_location,
      reminders: {
        useDefault: false,
        overrides: reminders
      },
      colorId: settings.event_color_id || categoryColors[checklistItem.category] || '1',
      status: 'confirmed',
      transparency: 'opaque'
    }
  }

  /**
   * Check if tokens are valid by making a test API call
   */
  static async validateTokens(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.CALENDAR_API_BASE}/users/me/calendarList?maxResults=1`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      return response.ok
    } catch (error) {
      console.error('Error validating tokens:', error)
      return false
    }
  }

  /**
   * Format date for Australian display
   */
  static formatDateForDisplay(date: Date): string {
    return date.toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  }

  /**
   * Create batch of events for multiple checklist items
   */
  static async createBatchEvents(
    accessToken: string,
    calendarId: string,
    events: CalendarEvent[]
  ): Promise<{ success: CalendarEvent[], failed: number }> {
    const results: { success: CalendarEvent[], failed: number } = { success: [], failed: 0 }

    // Process events in batches of 10 to avoid rate limits
    const batchSize = 10
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize)
      
      const promises = batch.map(async (event) => {
        const result = await this.createCalendarEvent(accessToken, calendarId, event)
        return result
      })

      const batchResults = await Promise.all(promises)
      
      batchResults.forEach(result => {
        if (result) {
          results.success.push(result)
        } else {
          results.failed++
        }
      })

      // Add delay between batches to respect rate limits
      if (i + batchSize < events.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return results
  }
}