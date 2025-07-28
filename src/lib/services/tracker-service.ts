import { createClient } from '@/lib/supabase/client'
import { 
  Activity, 
  ActivityType, 
  ActivityWithDetails,
  QuickFeedingEntry,
  QuickSleepEntry,
  QuickDiaperEntry,
  DailyStats,
  GrowthRecord
} from '@/types/tracker'

export class TrackerService {
  private static supabase = createClient()

  /**
   * Get all activity types
   */
  static async getActivityTypes(): Promise<ActivityType[]> {
    const { data, error } = await this.supabase
      .from('activity_types')
      .select('*')
      .eq('is_default', true)
      .order('category', { ascending: true })

    if (error) {
      console.error('Error fetching activity types:', error)
      throw error
    }

    return data || []
  }

  /**
   * Get activities for a child on a specific date
   */
  static async getActivitiesForDate(
    childId: string, 
    date: Date
  ): Promise<ActivityWithDetails[]> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Try simple activities table first (our new schema)
    try {
      const { data, error } = await this.supabase
        .from('simple_activities')
        .select('*')
        .eq('child_id', childId)
        .gte('started_at', startOfDay.toISOString())
        .lte('started_at', endOfDay.toISOString())
        .order('started_at', { ascending: false })

      if (error) throw error

      // Transform simple activities to match the expected format
      return data?.map(activity => ({
        ...activity,
        activity_type: {
          id: activity.activity_type,
          name: this.getActivityTypeName(activity.activity_type, activity.activity_subtype),
          category: activity.activity_type,
          icon: this.getActivityIcon(activity.activity_type)
        },
        duration_minutes: activity.duration_minutes || 
          (activity.ended_at ? Math.round((new Date(activity.ended_at).getTime() - new Date(activity.started_at).getTime()) / 60000) : null)
      })) || []

    } catch (error) {
      console.warn('Simple activities table not available, trying complex schema')
      
      // Fallback to complex schema
      try {
        const { data, error: complexError } = await this.supabase
          .from('activities')
          .select(`
            *,
            activity_type:activity_types(*),
            feeding_details(*),
            sleep_details(*),
            diaper_details(*),
            health_details(*)
          `)
          .eq('child_id', childId)
          .gte('started_at', startOfDay.toISOString())
          .lte('started_at', endOfDay.toISOString())
          .order('started_at', { ascending: false })

        if (complexError) throw complexError
        return data || []
      } catch (complexError) {
        console.error('Error fetching activities from both schemas:', complexError)
        return []
      }
    }
  }

  /**
   * Get recent activities across all children (for dashboard)
   */
  static async getRecentActivities(limit: number = 10): Promise<ActivityWithDetails[]> {
    const { data, error } = await this.supabase
      .from('activities')
      .select(`
        *,
        activity_type:activity_types(*),
        child:children(id, name),
        feeding_details(*),
        sleep_details(*),
        diaper_details(*),
        health_details(*)
      `)
      .order('started_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent activities:', error)
      throw error
    }

    return data || []
  }

  /**
   * Record a quick feeding entry
   */
  static async recordFeeding(entry: QuickFeedingEntry): Promise<Activity> {
    const startTime = entry.started_at || new Date()
    const endTime = entry.duration_minutes 
      ? new Date(startTime.getTime() + entry.duration_minutes * 60000)
      : null

    // Skip activity_types lookup - use simple schema directly
    console.log('Recording feeding activity using simple schema:', entry)

    // Use simple schema first (more reliable)
    let activity = null
    try {
      const { data: simpleActivity, error: simpleError } = await this.supabase
        .from('simple_activities')
        .insert({
          child_id: entry.child_id,
          activity_type: 'feeding',
          activity_subtype: entry.feeding_type,
          started_at: startTime.toISOString(),
          ended_at: endTime?.toISOString() || null,
          duration_minutes: entry.duration_minutes || null,
          amount_ml: entry.amount_ml || null,
          breast_side: entry.breast_side || null,
          food_items: entry.food_items || null,
          notes: entry.notes || null
        })
        .select()
        .single()

      if (simpleError) throw simpleError
      activity = simpleActivity
      console.log('✅ Feeding activity saved successfully:', activity)

    } catch (error) {
      console.error('Simple activities schema not available:', error)
      throw new Error('Unable to save feeding activity. Please run the database setup SQL first.')
    }

    return activity
  }

  /**
   * Record a quick sleep entry
   */
  static async recordSleep(entry: QuickSleepEntry): Promise<Activity> {
    const startTime = entry.started_at || new Date()
    const duration = entry.ended_at ? 
      Math.round((entry.ended_at.getTime() - startTime.getTime()) / 60000) : null

    // Use simple schema first (more reliable)
    let activity = null
    try {
      const { data: simpleActivity, error: simpleError } = await this.supabase
        .from('simple_activities')
        .insert({
          child_id: entry.child_id,
          activity_type: 'sleep',
          activity_subtype: entry.ended_at ? 'night_sleep' : 'nap',
          started_at: startTime.toISOString(),
          ended_at: entry.ended_at?.toISOString() || null,
          duration_minutes: duration,
          sleep_quality: entry.sleep_quality || null,
          wake_up_mood: entry.wake_up_mood || null,
          sleep_location: entry.sleep_location || null,
          notes: entry.notes || null
        })
        .select()
        .single()

      if (simpleError) throw simpleError
      activity = simpleActivity
      console.log('✅ Sleep activity saved successfully:', activity)

    } catch (error) {
      console.error('Simple activities schema not available:', error)
      throw new Error('Unable to save sleep activity. Please run the database setup SQL first.')
    }

    return activity
  }

  /**
   * Record a quick nappy change
   */
  static async recordNappyChange(entry: QuickDiaperEntry): Promise<Activity> {
    const changeTime = entry.changed_at || new Date()

    // Use simple schema first (more reliable)
    let activity = null
    try {
      const { data: simpleActivity, error: simpleError } = await this.supabase
        .from('simple_activities')
        .insert({
          child_id: entry.child_id,
          activity_type: 'nappy',
          activity_subtype: entry.diaper_type,
          started_at: changeTime.toISOString(),
          ended_at: changeTime.toISOString(), // Nappy changes are instantaneous
          diaper_consistency: entry.consistency || null,
          diaper_color: entry.color || null,
          rash_present: entry.rash_present || false,
          notes: entry.notes || null
        })
        .select()
        .single()

      if (simpleError) throw simpleError
      activity = simpleActivity
      console.log('✅ Nappy change saved successfully:', activity)

    } catch (error) {
      console.error('Simple activities schema not available:', error)
      throw new Error('Unable to save nappy change. Please run the database setup SQL first.')
    }

    return activity
  }

  /**
   * Record a quick diaper change (backwards compatibility)
   */
  static async recordDiaperChange(entry: QuickDiaperEntry): Promise<Activity> {
    return this.recordNappyChange(entry)
  }

  /**
   * Update an activity (e.g., end a sleep session)
   */
  static async updateActivity(
    activityId: string, 
    updates: Partial<Activity>
  ): Promise<Activity> {
    const { data, error } = await this.supabase
      .from('activities')
      .update(updates)
      .eq('id', activityId)
      .select()
      .single()

    if (error) {
      console.error('Error updating activity:', error)
      throw error
    }

    return data
  }

  /**
   * Delete an activity
   */
  static async deleteActivity(activityId: string): Promise<void> {
    const { error } = await this.supabase
      .from('activities')
      .delete()
      .eq('id', activityId)

    if (error) {
      console.error('Error deleting activity:', error)
      throw error
    }
  }

  /**
   * Get daily statistics for a child
   */
  static async getDailyStats(childId: string, date: Date): Promise<DailyStats> {
    const activities = await this.getActivitiesForDate(childId, date)
    
    const feedingActivities = activities.filter(a => 
      a.activity_type?.category === 'feeding' || a.activity_type === 'feeding'
    )
    
    const sleepActivities = activities.filter(a => 
      (a.activity_type?.category === 'sleep' || a.activity_type === 'sleep') && a.duration_minutes
    )
    
    const nappyActivities = activities.filter(a => 
      a.activity_type?.category === 'diaper' || a.activity_type === 'diaper' ||
      a.activity_type?.category === 'nappy' || a.activity_type === 'nappy'
    )

    const totalSleepMinutes = sleepActivities.reduce((sum, activity) => 
      sum + (activity.duration_minutes || 0), 0
    )

    return {
      date: date.toISOString().split('T')[0],
      child_id: childId,
      feeding_count: feedingActivities.length,
      sleep_duration_minutes: totalSleepMinutes,
      diaper_changes: nappyActivities.length,
      activities
    }
  }

  /**
   * Get growth records for a child
   */
  static async getGrowthRecords(childId: string): Promise<GrowthRecord[]> {
    const { data, error } = await this.supabase
      .from('growth_records')
      .select('*')
      .eq('child_id', childId)
      .order('recorded_at', { ascending: false })

    if (error) {
      console.error('Error fetching growth records:', error)
      throw error
    }

    return data || []
  }

  /**
   * Add a growth record
   */
  static async addGrowthRecord(record: Omit<GrowthRecord, 'id' | 'created_at'>): Promise<GrowthRecord> {
    const { data, error } = await this.supabase
      .from('growth_records')
      .insert(record)
      .select()
      .single()

    if (error) {
      console.error('Error adding growth record:', error)
      throw error
    }

    return data
  }

  /**
   * Helper method to get the correct activity name for feeding type
   */
  private static getFeedingActivityName(feedingType: string): string {
    switch (feedingType) {
      case 'breast': return 'Breastfeeding'
      case 'bottle': return 'Bottle Feeding'
      case 'solid': return 'Solid Food'
      default: return 'Bottle Feeding'
    }
  }

  /**
   * Helper method to get activity type name from simple schema
   */
  private static getActivityTypeName(type: string, subtype?: string): string {
    switch (type) {
      case 'feeding':
        return this.getFeedingActivityName(subtype || 'bottle')
      case 'sleep':
        return 'Sleep'
      case 'nappy':
      case 'diaper':
        return subtype === 'wet' ? 'Wet Nappy' : 'Dirty Nappy'
      case 'tummy_time':
        return 'Tummy Time'
      case 'growth':
        return 'Growth Record'
      case 'note':
        return 'Note'
      default:
        return 'Activity'
    }
  }

  /**
   * Helper method to get activity icon
   */
  private static getActivityIcon(type: string): string {
    switch (type) {
      case 'feeding': return '🍼'
      case 'sleep': return '😴'
      case 'nappy':
      case 'diaper': return '🧷'
      case 'tummy_time': return '🤸‍♀️'
      case 'growth': return '📏'
      case 'note': return '📝'
      default: return '👶'
    }
  }

  /**
   * Get active sleep sessions (not ended yet) - using simple schema
   */
  static async getActiveSleepSessions(childId: string): Promise<Activity[]> {
    try {
      // Try simple activities table first
      const { data, error } = await this.supabase
        .from('simple_activities')
        .select('*')
        .eq('child_id', childId)
        .eq('activity_type', 'sleep')
        .is('ended_at', null)
        .order('started_at', { ascending: false })

      if (error) throw error
      
      // Filter out stale sessions (older than 24 hours)
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
      
      const activeSessions = (data || []).filter(session => {
        const startTime = new Date(session.started_at)
        return startTime > twentyFourHoursAgo
      })
      
      // Auto-close any stale sessions we found
      if (data && data.length > activeSessions.length) {
        const staleSessions = data.filter(session => {
          const startTime = new Date(session.started_at)
          return startTime <= twentyFourHoursAgo
        })
        
        console.log('Auto-closing', staleSessions.length, 'stale sleep sessions')
        
        // Close stale sessions
        for (const staleSession of staleSessions) {
          await this.supabase
            .from('simple_activities')
            .update({ 
              ended_at: new Date(staleSession.started_at).getTime() + (8 * 60 * 60 * 1000) // Assume 8 hour sleep
            })
            .eq('id', staleSession.id)
        }
      }
      
      return activeSessions
    } catch (error) {
      console.warn('Simple activities table not available for active sleep sessions')
      return []
    }
  }

  /**
   * End a sleep session - using simple schema
   */
  static async endSleepSession(activityId: string): Promise<Activity> {
    const endTime = new Date()
    
    try {
      // Update in simple activities table
      const { data, error } = await this.supabase
        .from('simple_activities')
        .update({
          ended_at: endTime.toISOString()
        })
        .eq('id', activityId)
        .select()
        .single()

      if (error) throw error

      // Calculate duration
      if (data.started_at) {
        const startTime = new Date(data.started_at)
        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
        
        // Update with calculated duration
        await this.supabase
          .from('simple_activities')
          .update({ duration_minutes: durationMinutes })
          .eq('id', activityId)
      }

      console.log('✅ Sleep session ended successfully:', data)
      return data
    } catch (error) {
      console.error('Error ending sleep session:', error)
      throw new Error('Unable to end sleep session. Please try again.')
    }
  }

  /**
   * Record tummy time activity
   */
  static async recordTummyTime(entry: {
    child_id: string
    duration_minutes: number
    started_at?: Date
    notes?: string
  }): Promise<Activity> {
    const startTime = entry.started_at || new Date()
    const endTime = new Date(startTime.getTime() + entry.duration_minutes * 60000)

    try {
      const { data: simpleActivity, error: simpleError } = await this.supabase
        .from('simple_activities')
        .insert({
          child_id: entry.child_id,
          activity_type: 'tummy_time',
          activity_subtype: 'play',
          started_at: startTime.toISOString(),
          ended_at: endTime.toISOString(),
          duration_minutes: entry.duration_minutes,
          notes: entry.notes || null
        })
        .select()
        .single()

      if (simpleError) throw simpleError
      console.log('✅ Tummy time activity saved successfully:', simpleActivity)
      return simpleActivity

    } catch (error) {
      console.error('Error saving tummy time activity:', error)
      throw new Error('Unable to save tummy time activity. Please run the database setup SQL first.')
    }
  }
}