// Premium Calendar Sync Service for Google Calendar, Apple Calendar, and Outlook

export interface CalendarProvider {
  id: 'google' | 'apple' | 'outlook'
  name: string
  icon: string
  color: string
  authUrl?: string
  supportsSync: boolean
}

export interface SyncedEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  attendees?: string[]
  recurrence?: string
  calendarId: string
  providerId: string
  reminders?: {
    method: 'email' | 'popup'
    minutes: number
  }[]
}

export interface CalendarSyncSettings {
  providerId: string
  accessToken?: string
  refreshToken?: string
  calendarId: string
  syncEnabled: boolean
  lastSyncTime?: Date
  syncDirection: 'bidirectional' | 'to_external' | 'from_external'
  categories: {
    immunizations: boolean
    checkups: boolean
    milestones: boolean
    appointments: boolean
    me_time: boolean
  }
}

export class CalendarSyncService {
  private readonly providers: CalendarProvider[] = [
    {
      id: 'google',
      name: 'Google Calendar',
      icon: '📅',
      color: '#4285F4',
      authUrl: '/api/auth/google-calendar',
      supportsSync: true
    },
    {
      id: 'apple',
      name: 'Apple Calendar',
      icon: '🍎',
      color: '#007AFF',
      supportsSync: false // iCloud API requires special setup
    },
    {
      id: 'outlook',
      name: 'Outlook',
      icon: '📮',
      color: '#0078D4',
      authUrl: '/api/auth/outlook-calendar',
      supportsSync: true
    }
  ]

  getProviders(): CalendarProvider[] {
    return this.providers
  }

  async initiateSync(providerId: string): Promise<{ authUrl: string }> {
    const provider = this.providers.find(p => p.id === providerId)
    if (!provider || !provider.authUrl) {
      throw new Error(`Provider ${providerId} not supported for sync`)
    }

    // Generate auth URL with proper scopes
    const scopes = this.getScopesForProvider(providerId)
    const state = this.generateState()
    
    const authUrl = `${provider.authUrl}?scopes=${encodeURIComponent(scopes.join(' '))}&state=${state}`
    
    return { authUrl }
  }

  private getScopesForProvider(providerId: string): string[] {
    switch (providerId) {
      case 'google':
        return [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events'
        ]
      case 'outlook':
        return [
          'https://graph.microsoft.com/calendars.readwrite',
          'https://graph.microsoft.com/calendars.read'
        ]
      default:
        return []
    }
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  async syncEvents(
    settings: CalendarSyncSettings,
    pamEvents: SyncedEvent[]
  ): Promise<{ success: boolean; syncedCount: number; errors: string[] }> {
    try {
      const filteredEvents = this.filterEventsByCategories(pamEvents, settings.categories)
      let syncedCount = 0
      const errors: string[] = []

      for (const event of filteredEvents) {
        try {
          await this.syncSingleEvent(event, settings)
          syncedCount++
        } catch (error) {
          errors.push(`Failed to sync "${event.title}": ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      return {
        success: errors.length === 0,
        syncedCount,
        errors
      }
    } catch (error) {
      return {
        success: false,
        syncedCount: 0,
        errors: [error instanceof Error ? error.message : 'Sync failed']
      }
    }
  }

  private filterEventsByCategories(
    events: SyncedEvent[],
    categories: CalendarSyncSettings['categories']
  ): SyncedEvent[] {
    return events.filter(event => {
      // Map PAM event types to categories
      const eventType = this.getEventCategory(event)
      return categories[eventType] === true
    })
  }

  private getEventCategory(event: SyncedEvent): keyof CalendarSyncSettings['categories'] {
    // Determine category based on event title/description
    const title = event.title.toLowerCase()
    if (title.includes('immunization') || title.includes('vaccine')) return 'immunizations'
    if (title.includes('checkup') || title.includes('visit')) return 'checkups'
    if (title.includes('milestone') || title.includes('development')) return 'milestones'
    if (title.includes('me time') || title.includes('self-care')) return 'me_time'
    return 'appointments'
  }

  private async syncSingleEvent(event: SyncedEvent, settings: CalendarSyncSettings): Promise<void> {
    switch (settings.providerId) {
      case 'google':
        return this.syncToGoogle(event, settings)
      case 'outlook':
        return this.syncToOutlook(event, settings)
      default:
        throw new Error(`Sync not implemented for provider: ${settings.providerId}`)
    }
  }

  private async syncToGoogle(event: SyncedEvent, settings: CalendarSyncSettings): Promise<void> {
    if (!settings.accessToken) {
      throw new Error('Google Calendar access token not found')
    }

    const googleEvent = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      location: event.location,
      attendees: event.attendees?.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: event.reminders?.map(reminder => ({
          method: reminder.method,
          minutes: reminder.minutes
        })) || [{ method: 'popup', minutes: 15 }]
      }
    }

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${settings.calendarId}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleEvent)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Google Calendar API error: ${error.error?.message || 'Unknown error'}`)
    }
  }

  private async syncToOutlook(event: SyncedEvent, settings: CalendarSyncSettings): Promise<void> {
    if (!settings.accessToken) {
      throw new Error('Outlook access token not found')
    }

    const outlookEvent = {
      subject: event.title,
      body: {
        contentType: 'text',
        content: event.description || ''
      },
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      location: {
        displayName: event.location || ''
      },
      attendees: event.attendees?.map(email => ({
        emailAddress: { address: email, name: email }
      })),
      reminderMinutesBeforeStart: event.reminders?.[0]?.minutes || 15
    }

    const response = await fetch(`https://graph.microsoft.com/v1.0/me/calendars/${settings.calendarId}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(outlookEvent)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Outlook API error: ${error.error?.message || 'Unknown error'}`)
    }
  }

  async getCalendars(providerId: string, accessToken: string): Promise<{ id: string; name: string; primary?: boolean }[]> {
    switch (providerId) {
      case 'google':
        return this.getGoogleCalendars(accessToken)
      case 'outlook':
        return this.getOutlookCalendars(accessToken)
      default:
        throw new Error(`Provider ${providerId} not supported`)
    }
  }

  private async getGoogleCalendars(accessToken: string): Promise<{ id: string; name: string; primary?: boolean }[]> {
    const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Google calendars')
    }

    const data = await response.json()
    return data.items.map((cal: any) => ({
      id: cal.id,
      name: cal.summary,
      primary: cal.primary
    }))
  }

  private async getOutlookCalendars(accessToken: string): Promise<{ id: string; name: string; primary?: boolean }[]> {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/calendars', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Outlook calendars')
    }

    const data = await response.json()
    return data.value.map((cal: any) => ({
      id: cal.id,
      name: cal.name,
      primary: cal.isDefaultCalendar
    }))
  }

  createPAMEvent(
    title: string,
    description: string,
    startTime: Date,
    endTime: Date,
    category: keyof CalendarSyncSettings['categories']
  ): SyncedEvent {
    return {
      id: `pam-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title,
      description,
      startTime,
      endTime,
      calendarId: 'pam-primary',
      providerId: 'pam',
      reminders: [
        { method: 'popup', minutes: 15 },
        { method: 'email', minutes: 60 }
      ]
    }
  }
}

export const calendarSyncService = new CalendarSyncService()