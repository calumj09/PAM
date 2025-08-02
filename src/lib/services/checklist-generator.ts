import { addWeeks, addDays, addMonths } from 'date-fns'
import { AUSTRALIAN_IMMUNISATION_SCHEDULE } from '@/lib/data/immunisation-schedule'
import { AUSTRALIAN_GOVERNMENT_TASKS } from '@/lib/data/government-tasks'
import { AUSTRALIAN_DEVELOPMENTAL_MILESTONES } from '@/lib/data/milestones'
import { NotificationService } from '@/lib/services/notification-service'
import { CalendarService } from '@/lib/services/calendar-service'

export interface GeneratedChecklistItem {
  id: string
  title: string
  description: string
  dueDate: Date
  category: 'immunisation' | 'registration' | 'milestone' | 'checkup'
  priority: 'high' | 'medium' | 'low'
  isCompleted: boolean
  metadata: {
    vaccines?: string[]
    requirements?: string[]
    links?: { [state: string]: string }
    milestoneType?: string
    isOptional?: boolean
  }
}

export class ChecklistGenerator {
  /**
   * Generate a complete checklist for a child based on their date of birth
   */
  static generateChecklist(
    childId: string, 
    dateOfBirth: Date, 
    userState?: string
  ): GeneratedChecklistItem[] {
    console.log('ChecklistGenerator.generateChecklist called with:', { childId, dateOfBirth, userState })
    const checklist: GeneratedChecklistItem[] = []

    // Add immunisation schedule
    const immunisations = this.generateImmunizationItems(childId, dateOfBirth)
    console.log('Generated immunisations:', immunisations.length)
    checklist.push(...immunisations)

    // Add government registration tasks
    const registrations = this.generateRegistrationItems(childId, dateOfBirth, userState)
    console.log('Generated registrations:', registrations.length)
    checklist.push(...registrations)

    // Add developmental milestones
    const milestones = this.generateMilestoneItems(childId, dateOfBirth)
    console.log('Generated milestones:', milestones.length)
    checklist.push(...milestones)

    // Add health checkups
    const checkups = this.generateHealthCheckups(childId, dateOfBirth)
    console.log('Generated checkups:', checkups.length)
    checklist.push(...checkups)

    // Sort by due date
    const sortedChecklist = checklist.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    console.log('Total checklist items generated:', sortedChecklist.length)
    
    return sortedChecklist
  }

  /**
   * Generate checklist and automatically schedule notifications and calendar events
   */
  static async generateChecklistWithIntegrations(
    childId: string,
    userId: string,
    childName: string,
    dateOfBirth: Date,
    userState?: string
  ): Promise<GeneratedChecklistItem[]> {
    const checklist = this.generateChecklist(childId, dateOfBirth, userState)

    // Schedule notifications and calendar events for each checklist item
    const integrationPromises = checklist.map(async (item) => {
      try {
        // Schedule notification
        await NotificationService.scheduleChecklistNotification(
          item.id,
          userId,
          `PAM Reminder: ${item.title}`,
          `Don't forget: ${item.description}`,
          item.dueDate
        )

        // Schedule calendar event (this will check if user has calendar integration)
        await this.scheduleCalendarEventForItem(item, userId, childName)
      } catch (error) {
        console.error(`Failed to schedule integrations for ${item.id}:`, error)
        // Continue with other items even if one fails
      }
    })

    // Wait for all integrations to complete
    await Promise.allSettled(integrationPromises)

    return checklist
  }

  /**
   * Schedule calendar event for a checklist item (if user has calendar integration)
   */
  private static async scheduleCalendarEventForItem(
    item: GeneratedChecklistItem,
    userId: string,
    childName: string
  ): Promise<void> {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Check if user has premium subscription and active calendar integration
      const [subscriptionResult, integrationResult, settingsResult] = await Promise.all([
        supabase
          .from('user_subscriptions')
          .select('id')
          .eq('user_id', userId)
          .eq('is_active', true)
          .eq('plan_type', 'premium')
          .single(),
        supabase
          .from('calendar_integrations')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .eq('sync_enabled', true)
          .single(),
        supabase
          .from('calendar_sync_settings')
          .select('*')
          .eq('user_id', userId)
          .single()
      ])

      // Exit early if user doesn't have premium or calendar integration
      if (!subscriptionResult.data || !integrationResult.data || !settingsResult.data) {
        return
      }

      const integration = integrationResult.data
      const settings = settingsResult.data

      // Check if this category should be synced
      if (!settings.auto_create_events || !settings.include_categories.includes(item.category)) {
        return
      }

      // Create calendar event
      const calendarEvent = CalendarService.createEventFromChecklistItem(
        {
          id: item.id,
          title: item.title,
          description: item.description,
          due_date: item.dueDate.toISOString().split('T')[0],
          category: item.category
        },
        childName,
        settings
      )

      // Get fresh access token
      let accessToken = integration.google_access_token
      const isValid = await CalendarService.validateTokens(accessToken)
      
      if (!isValid) {
        const refreshed = await CalendarService.refreshAccessToken(integration.google_refresh_token)
        if (!refreshed) return
        accessToken = refreshed

        // Update stored token
        await supabase
          .from('calendar_integrations')
          .update({ google_access_token: accessToken })
          .eq('id', integration.id)
      }

      // Create event in Google Calendar
      const createdEvent = await CalendarService.createCalendarEvent(
        accessToken,
        integration.calendar_id,
        calendarEvent
      )

      if (createdEvent) {
        // Save to database
        await supabase
          .from('calendar_events')
          .insert({
            user_id: userId,
            checklist_item_id: item.id,
            google_event_id: createdEvent.id!,
            calendar_id: integration.calendar_id,
            event_title: createdEvent.summary!,
            event_start_time: createdEvent.start.dateTime || createdEvent.start.date!,
            event_end_time: createdEvent.end.dateTime || createdEvent.end.date!,
            is_synced: true,
            last_synced_at: new Date().toISOString()
          })
      }
    } catch (error) {
      console.error('Error scheduling calendar event:', error)
      // Don't throw - calendar integration is optional
    }
  }

  /**
   * Generate checklist and automatically schedule notifications (backwards compatibility)
   */
  static async generateChecklistWithNotifications(
    childId: string,
    userId: string,
    dateOfBirth: Date,
    userState?: string
  ): Promise<GeneratedChecklistItem[]> {
    const checklist = this.generateChecklist(childId, dateOfBirth, userState)

    // Schedule notifications for each checklist item
    for (const item of checklist) {
      try {
        await NotificationService.scheduleChecklistNotification(
          item.id,
          userId,
          `PAM Reminder: ${item.title}`,
          `Don't forget: ${item.description}`,
          item.dueDate
        )
      } catch (error) {
        console.error(`Failed to schedule notification for ${item.id}:`, error)
        // Continue with other items even if one fails
      }
    }

    return checklist
  }

  /**
   * Generate immunisation checklist items
   */
  private static generateImmunizationItems(
    childId: string, 
    dateOfBirth: Date
  ): GeneratedChecklistItem[] {
    console.log('Immunisation schedule items:', AUSTRALIAN_IMMUNISATION_SCHEDULE.length)
    const items = AUSTRALIAN_IMMUNISATION_SCHEDULE.map(vaccine => ({
      id: `${childId}-immunisation-${vaccine.id}`,
      title: vaccine.title,
      description: vaccine.description,
      dueDate: addWeeks(dateOfBirth, vaccine.ageInWeeks),
      category: 'immunisation' as const,
      priority: vaccine.isRequired ? 'high' as const : 'medium' as const,
      isCompleted: false,
      metadata: {
        vaccines: vaccine.vaccines,
        isOptional: !vaccine.isRequired
      }
    }))
    console.log('Generated immunisation items:', items.length)
    return items
  }

  /**
   * Generate government registration checklist items
   */
  private static generateRegistrationItems(
    childId: string, 
    dateOfBirth: Date, 
    userState?: string
  ): GeneratedChecklistItem[] {
    return AUSTRALIAN_GOVERNMENT_TASKS.map(task => ({
      id: `${childId}-registration-${task.id}`,
      title: task.title,
      description: task.description,
      dueDate: addDays(dateOfBirth, task.daysAfterBirth),
      category: 'registration' as const,
      priority: task.priority,
      isCompleted: false,
      metadata: {
        requirements: task.requirements,
        links: userState && task.links[userState] 
          ? { [userState]: task.links[userState] }
          : task.links
      }
    }))
  }

  /**
   * Generate developmental milestone checklist items
   */
  private static generateMilestoneItems(
    childId: string, 
    dateOfBirth: Date
  ): GeneratedChecklistItem[] {
    return AUSTRALIAN_DEVELOPMENTAL_MILESTONES.map(milestone => ({
      id: `${childId}-milestone-${milestone.id}`,
      title: milestone.title,
      description: milestone.description,
      dueDate: addMonths(dateOfBirth, milestone.ageInMonths),
      category: 'milestone' as const,
      priority: milestone.isOptional ? 'low' as const : 'medium' as const,
      isCompleted: false,
      metadata: {
        milestoneType: milestone.milestoneType,
        isOptional: milestone.isOptional
      }
    }))
  }

  /**
   * Generate health checkup reminders
   */
  private static generateHealthCheckups(
    childId: string, 
    dateOfBirth: Date
  ): GeneratedChecklistItem[] {
    const checkups = [
      { weeks: 2, title: '2 Week Health Check', description: 'First routine health check with GP or nurse' },
      { weeks: 6, title: '6 Week Health Check', description: 'Health check before first immunisations' },
      { months: 4, title: '4 Month Health Check', description: 'Routine health and development check' },
      { months: 6, title: '6 Month Health Check', description: 'Health check and discussion about starting solids' },
      { months: 12, title: '12 Month Health Check', description: 'Annual health check and development assessment' },
      { months: 18, title: '18 Month Health Check', description: 'Health check and development milestone review' },
      { months: 24, title: '2 Year Health Check', description: 'Comprehensive health and development assessment' },
      { months: 36, title: '3 Year Health Check', description: 'Pre-school health check and development review' }
    ]

    return checkups.map(checkup => ({
      id: `${childId}-checkup-${checkup.weeks || checkup.months}${checkup.weeks ? 'w' : 'm'}`,
      title: checkup.title,
      description: checkup.description,
      dueDate: checkup.weeks 
        ? addWeeks(dateOfBirth, checkup.weeks)
        : addMonths(dateOfBirth, checkup.months!),
      category: 'checkup' as const,
      priority: 'medium' as const,
      isCompleted: false,
      metadata: {}
    }))
  }

  /**
   * Get upcoming items (next 30 days)
   */
  static getUpcomingItems(
    checklist: GeneratedChecklistItem[], 
    daysAhead: number = 30
  ): GeneratedChecklistItem[] {
    const now = new Date()
    const futureDate = addDays(now, daysAhead)
    
    return checklist.filter(item => 
      !item.isCompleted && 
      item.dueDate >= now && 
      item.dueDate <= futureDate
    )
  }

  /**
   * Get overdue items
   */
  static getOverdueItems(checklist: GeneratedChecklistItem[]): GeneratedChecklistItem[] {
    const now = new Date()
    
    return checklist.filter(item => 
      !item.isCompleted && 
      item.dueDate < now
    )
  }

  /**
   * Get items by category
   */
  static getItemsByCategory(
    checklist: GeneratedChecklistItem[], 
    category: GeneratedChecklistItem['category']
  ): GeneratedChecklistItem[] {
    return checklist.filter(item => item.category === category)
  }

  /**
   * Calculate completion percentage
   */
  static getCompletionPercentage(checklist: GeneratedChecklistItem[]): number {
    if (checklist.length === 0) return 0
    const completedCount = checklist.filter(item => item.isCompleted).length
    return Math.round((completedCount / checklist.length) * 100)
  }
}