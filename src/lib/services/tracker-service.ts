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

    const { data, error } = await this.supabase
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

    if (error) {
      console.error('Error fetching activities:', error)
      throw error
    }

    return data || []
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

    // Get feeding activity type
    const { data: activityTypes } = await this.supabase
      .from('activity_types')
      .select('id')
      .eq('name', this.getFeedingActivityName(entry.feeding_type))
      .single()

    if (!activityTypes) {
      throw new Error('Feeding activity type not found')
    }

    // Insert main activity
    const { data: activity, error: activityError } = await this.supabase
      .from('activities')
      .insert({
        child_id: entry.child_id,
        activity_type_id: activityTypes.id,
        started_at: startTime.toISOString(),
        ended_at: endTime?.toISOString() || null,
        notes: entry.notes || null
      })
      .select()
      .single()

    if (activityError) {
      console.error('Error inserting feeding activity:', activityError)
      throw activityError
    }

    // Insert feeding details
    const { error: detailsError } = await this.supabase
      .from('feeding_details')
      .insert({
        activity_id: activity.id,
        feeding_type: entry.feeding_type,
        amount_ml: entry.amount_ml || null,
        breast_side: entry.breast_side || null,
        food_items: entry.food_items || null
      })

    if (detailsError) {
      console.error('Error inserting feeding details:', detailsError)
      // Don't throw - activity was created successfully
    }

    return activity
  }

  /**
   * Record a quick sleep entry
   */
  static async recordSleep(entry: QuickSleepEntry): Promise<Activity> {
    const startTime = entry.started_at || new Date()

    // Get sleep activity type
    const { data: activityTypes } = await this.supabase
      .from('activity_types')
      .select('id')
      .eq('name', entry.ended_at ? 'Night Sleep' : 'Nap')
      .single()

    if (!activityTypes) {
      throw new Error('Sleep activity type not found')
    }

    // Insert main activity
    const { data: activity, error: activityError } = await this.supabase
      .from('activities')
      .insert({
        child_id: entry.child_id,
        activity_type_id: activityTypes.id,
        started_at: startTime.toISOString(),
        ended_at: entry.ended_at?.toISOString() || null,
        notes: entry.notes || null
      })
      .select()
      .single()

    if (activityError) {
      console.error('Error inserting sleep activity:', activityError)
      throw activityError
    }

    // Insert sleep details if provided
    if (entry.sleep_quality || entry.wake_up_mood || entry.sleep_location) {
      const { error: detailsError } = await this.supabase
        .from('sleep_details')
        .insert({
          activity_id: activity.id,
          sleep_quality: entry.sleep_quality || null,
          wake_up_mood: entry.wake_up_mood || null,
          sleep_location: entry.sleep_location || null
        })

      if (detailsError) {
        console.error('Error inserting sleep details:', detailsError)
      }
    }

    return activity
  }

  /**
   * Record a quick diaper change
   */
  static async recordDiaperChange(entry: QuickDiaperEntry): Promise<Activity> {
    const changeTime = entry.changed_at || new Date()

    // Get diaper activity type
    const { data: activityTypes } = await this.supabase
      .from('activity_types')
      .select('id')
      .eq('name', `${entry.diaper_type.charAt(0).toUpperCase() + entry.diaper_type.slice(1)} Diaper`)
      .single()

    if (!activityTypes) {
      throw new Error('Diaper activity type not found')
    }

    // Insert main activity
    const { data: activity, error: activityError } = await this.supabase
      .from('activities')
      .insert({
        child_id: entry.child_id,
        activity_type_id: activityTypes.id,
        started_at: changeTime.toISOString(),
        ended_at: changeTime.toISOString(), // Diaper changes are instantaneous
        notes: entry.notes || null
      })
      .select()
      .single()

    if (activityError) {
      console.error('Error inserting diaper activity:', activityError)
      throw activityError
    }

    // Insert diaper details
    const { error: detailsError } = await this.supabase
      .from('diaper_details')
      .insert({
        activity_id: activity.id,
        diaper_type: entry.diaper_type,
        consistency: entry.consistency || null,
        color: entry.color || null,
        rash_present: entry.rash_present || false
      })

    if (detailsError) {
      console.error('Error inserting diaper details:', detailsError)
    }

    return activity
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
      a.activity_type?.category === 'feeding'
    )
    
    const sleepActivities = activities.filter(a => 
      a.activity_type?.category === 'sleep' && a.duration_minutes
    )
    
    const diaperActivities = activities.filter(a => 
      a.activity_type?.category === 'diaper'
    )

    const totalSleepMinutes = sleepActivities.reduce((sum, activity) => 
      sum + (activity.duration_minutes || 0), 0
    )

    return {
      date: date.toISOString().split('T')[0],
      child_id: childId,
      feeding_count: feedingActivities.length,
      sleep_duration_minutes: totalSleepMinutes,
      diaper_changes: diaperActivities.length,
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
   * Get active sleep sessions (not ended yet)
   */
  static async getActiveSleepSessions(childId: string): Promise<Activity[]> {
    const { data, error } = await this.supabase
      .from('activities')
      .select(`
        *,
        activity_type:activity_types(*)
      `)
      .eq('child_id', childId)
      .is('ended_at', null)
      .eq('activity_types.category', 'sleep')

    if (error) {
      console.error('Error fetching active sleep sessions:', error)
      throw error
    }

    return data || []
  }

  /**
   * End a sleep session
   */
  static async endSleepSession(activityId: string): Promise<Activity> {
    return this.updateActivity(activityId, {
      ended_at: new Date().toISOString()
    })
  }
}