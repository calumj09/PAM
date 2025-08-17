import { createClient } from '@/lib/supabase/client'
import { TrackerService } from './tracker-service'
import { GrowthTrackingService } from './growth-tracking-service'
import { MedicationService } from './medication-service'
import { ChecklistService } from './checklist-service'
import { differenceInMonths, differenceInDays, format, subDays } from 'date-fns'

export interface MCPChildContext {
  child: {
    id: string
    name: string
    age_months: number
    age_days: number
    date_of_birth: string
    gender?: string
    is_premature?: boolean
    gestational_age_weeks?: number
  }
  growth: {
    current_weight_kg?: number
    current_height_cm?: number
    current_head_circumference_cm?: number
    weight_percentile?: number
    height_percentile?: number
    last_measurement_date?: string
    growth_trend?: 'normal' | 'above_average' | 'below_average' | 'concerning'
  }
  recent_activities: {
    last_feeding?: {
      time: string
      type: string
      amount?: number
      duration?: number
    }
    last_sleep?: {
      started_at: string
      ended_at?: string
      duration_minutes?: number
      quality?: string
    }
    last_nappy_change?: {
      time: string
      type: string
    }
    daily_summary: {
      feedings_today: number
      sleep_hours_today: number
      nappy_changes_today: number
      activities_today: number
    }
  }
  health: {
    active_medications?: Array<{
      name: string
      dose: string
      frequency: string
      reason?: string
    }>
    recent_illnesses?: Array<{
      date: string
      symptoms: string[]
      duration_days: number
    }>
    allergies?: string[]
    medical_conditions?: string[]
    immunisations: {
      up_to_date: boolean
      next_due?: {
        vaccine: string
        due_date: string
      }
    }
  }
  developmental: {
    milestones: {
      completed: string[]
      upcoming: string[]
      overdue: string[]
    }
    current_abilities?: string[]
    areas_of_focus?: string[]
  }
  feeding: {
    feeding_method: 'breast' | 'bottle' | 'mixed' | 'solids' | 'combination'
    solids_introduced?: boolean
    foods_tried?: string[]
    meal_schedule?: string[]
    known_preferences?: string[]
    known_dislikes?: string[]
  }
  sleep: {
    typical_bedtime?: string
    typical_wake_time?: string
    naps_per_day?: number
    sleep_challenges?: string[]
    sleep_location?: string
    sleep_aids?: string[]
  }
  care_team: {
    primary_caregivers: string[]
    healthcare_providers?: {
      gp?: string
      pediatrician?: string
      maternal_health_nurse?: string
    }
    emergency_contacts: number
  }
  location: {
    state: string
    postcode?: string
    timezone: string
  }
}

export interface MCPConversationContext {
  current_concerns?: string[]
  recent_questions?: string[]
  user_preferences: {
    communication_style?: 'detailed' | 'concise' | 'supportive'
    medical_detail_level?: 'basic' | 'moderate' | 'detailed'
  }
  time_context: {
    current_time: string
    is_night_time: boolean
    is_weekend: boolean
  }
}

export class MCPContextService {
  
  /**
   * Build comprehensive MCP context for a child
   */
  static async buildChildContext(childId: string): Promise<MCPChildContext | null> {
    const supabase = createClient()
    
    try {
      // Get child basic info
      const { data: child, error: childError } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .single()
      
      if (childError || !child) {
        console.error('Error fetching child:', childError)
        return null
      }
      
      const now = new Date()
      const dob = new Date(child.date_of_birth)
      const ageMonths = differenceInMonths(now, dob)
      const ageDays = differenceInDays(now, dob)
      
      // Get growth data
      const growthMeasurements = await GrowthTrackingService.getChildMeasurements(childId, 1)
      const latestGrowth = growthMeasurements[0]
      
      // Get recent activities (last 24 hours)
      const activities = await TrackerService.getActivitiesForDate(childId, now)
      const yesterdayActivities = await TrackerService.getActivitiesForDate(childId, subDays(now, 1))
      const allRecentActivities = [...activities, ...yesterdayActivities]
      
      // Get daily stats
      const dailyStats = await TrackerService.getDailyStats(childId, now)
      
      // Find last activities of each type
      const lastFeeding = allRecentActivities
        .filter(a => a.activity_type === 'feeding' || a.activity_type?.category === 'feeding')
        .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0]
      
      const lastSleep = allRecentActivities
        .filter(a => a.activity_type === 'sleep' || a.activity_type?.category === 'sleep')
        .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0]
      
      const lastNappy = allRecentActivities
        .filter(a => a.activity_type === 'nappy' || a.activity_type === 'diaper' || 
                    a.activity_type?.category === 'nappy' || a.activity_type?.category === 'diaper')
        .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0]
      
      // Get medications
      const medications = await MedicationService.getChildMedications(childId)
      
      // Get checklist items for milestones
      const checklistItems = await ChecklistService.getChildChecklistItems(childId)
      const milestones = checklistItems.filter(item => item.category === 'milestone')
      
      // Get immunisations
      const immunisations = checklistItems.filter(item => item.category === 'immunisation')
      const overdueImmunizations = immunisations.filter(item => 
        !item.is_completed && new Date(item.due_date) < now
      )
      const nextImmunization = immunisations
        .filter(item => !item.is_completed && new Date(item.due_date) >= now)
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]
      
      // Get user location
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('profiles')
        .select('state_territory, postcode')
        .eq('id', user?.id)
        .single()
      
      // Build comprehensive context
      const context: MCPChildContext = {
        child: {
          id: child.id,
          name: child.name,
          age_months: ageMonths,
          age_days: ageDays,
          date_of_birth: child.date_of_birth,
          gender: child.gender,
          is_premature: child.is_premature,
          gestational_age_weeks: child.gestational_age_weeks
        },
        growth: {
          current_weight_kg: latestGrowth?.weight_kg,
          current_height_cm: latestGrowth?.height_cm,
          current_head_circumference_cm: latestGrowth?.head_circumference_cm,
          weight_percentile: latestGrowth?.weight_percentile,
          height_percentile: latestGrowth?.height_percentile,
          last_measurement_date: latestGrowth?.measured_at,
          growth_trend: this.determineGrowthTrend(growthMeasurements)
        },
        recent_activities: {
          last_feeding: lastFeeding ? {
            time: lastFeeding.started_at,
            type: lastFeeding.activity_subtype || 'unknown',
            amount: lastFeeding.amount_ml,
            duration: lastFeeding.duration_minutes
          } : undefined,
          last_sleep: lastSleep ? {
            started_at: lastSleep.started_at,
            ended_at: lastSleep.ended_at,
            duration_minutes: lastSleep.duration_minutes,
            quality: lastSleep.sleep_quality
          } : undefined,
          last_nappy_change: lastNappy ? {
            time: lastNappy.started_at,
            type: lastNappy.activity_subtype || lastNappy.diaper_type || 'unknown'
          } : undefined,
          daily_summary: {
            feedings_today: dailyStats.feeding_count,
            sleep_hours_today: Math.round(dailyStats.sleep_duration_minutes / 60 * 10) / 10,
            nappy_changes_today: dailyStats.diaper_changes,
            activities_today: dailyStats.activities.length
          }
        },
        health: {
          active_medications: medications
            .filter(m => m.is_active)
            .map(m => ({
              name: m.medication?.name || m.custom_name || 'Unknown',
              dose: `${m.dose_amount} ${m.dose_unit}`,
              frequency: `${m.frequency_per_day} times daily`,
              reason: m.notes
            })),
          allergies: child.allergies,
          medical_conditions: child.medical_conditions,
          immunisations: {
            up_to_date: overdueImmunizations.length === 0,
            next_due: nextImmunization ? {
              vaccine: nextImmunization.title,
              due_date: nextImmunization.due_date
            } : undefined
          }
        },
        developmental: {
          milestones: {
            completed: milestones
              .filter(m => m.is_completed)
              .map(m => m.title),
            upcoming: milestones
              .filter(m => !m.is_completed && new Date(m.due_date) >= now)
              .map(m => m.title),
            overdue: milestones
              .filter(m => !m.is_completed && new Date(m.due_date) < now)
              .map(m => m.title)
          },
          current_abilities: this.getAgeAppropriateAbilities(ageMonths),
          areas_of_focus: this.getAreasOfFocus(ageMonths)
        },
        feeding: {
          feeding_method: this.determineFeedingMethod(ageMonths, allRecentActivities),
          solids_introduced: ageMonths >= 4,
          foods_tried: child.foods_tried,
          known_preferences: child.food_preferences,
          known_dislikes: child.food_dislikes
        },
        sleep: {
          typical_bedtime: this.determineTypicalBedtime(allRecentActivities),
          typical_wake_time: this.determineTypicalWakeTime(allRecentActivities),
          naps_per_day: this.countDailyNaps(activities),
          sleep_challenges: child.sleep_challenges,
          sleep_location: child.sleep_location,
          sleep_aids: child.sleep_aids
        },
        care_team: {
          primary_caregivers: ['Parent'], // Would expand with family sharing data
          healthcare_providers: {
            gp: child.gp_name,
            pediatrician: child.pediatrician_name,
            maternal_health_nurse: child.maternal_health_nurse
          },
          emergency_contacts: 1 // Would count from emergency contacts
        },
        location: {
          state: profile?.state_territory || 'Unknown',
          postcode: profile?.postcode,
          timezone: 'Australia/Sydney' // Would determine from state
        }
      }
      
      return context
      
    } catch (error) {
      console.error('Error building MCP context:', error)
      return null
    }
  }
  
  /**
   * Build conversation context
   */
  static buildConversationContext(): MCPConversationContext {
    const now = new Date()
    const hour = now.getHours()
    const isNightTime = hour >= 20 || hour < 6
    const isWeekend = now.getDay() === 0 || now.getDay() === 6
    
    return {
      user_preferences: {
        communication_style: 'supportive',
        medical_detail_level: 'moderate'
      },
      time_context: {
        current_time: now.toISOString(),
        is_night_time: isNightTime,
        is_weekend: isWeekend
      }
    }
  }
  
  /**
   * Generate enhanced system prompt with MCP context
   */
  static generateSystemPrompt(childContext: MCPChildContext | null, conversationContext: MCPConversationContext): string {
    let prompt = `You are PAM's AI assistant, an expert in Australian parenting and child development. 
You provide evidence-based advice following Australian guidelines including those from:
- Royal Children's Hospital Melbourne
- Raising Children Network
- Australian Breastfeeding Association
- Red Nose (safe sleeping)
- Australian Department of Health immunisation schedule

Your personality is warm, supportive, and reassuring while being informative and practical.`

    if (childContext) {
      prompt += `\n\nCurrent context for ${childContext.child.name}:
- Age: ${childContext.child.age_months} months (${childContext.child.age_days} days)
- Current weight: ${childContext.growth.current_weight_kg ? `${childContext.growth.current_weight_kg}kg` : 'Unknown'}
- Growth trend: ${childContext.growth.growth_trend || 'Unknown'}

Recent activity (last 24 hours):
- Feedings today: ${childContext.recent_activities.daily_summary.feedings_today}
- Sleep today: ${childContext.recent_activities.daily_summary.sleep_hours_today} hours
- Nappy changes: ${childContext.recent_activities.daily_summary.nappy_changes_today}

Key information:
- Feeding method: ${childContext.feeding.feeding_method}
- Location: ${childContext.location.state}, Australia
- Time context: ${conversationContext.time_context.is_night_time ? 'Night time' : 'Day time'}${conversationContext.time_context.is_weekend ? ', Weekend' : ''}`

      if (childContext.health.active_medications && childContext.health.active_medications.length > 0) {
        prompt += `\n- Active medications: ${childContext.health.active_medications.map(m => m.name).join(', ')}`
      }

      if (childContext.developmental.milestones.overdue.length > 0) {
        prompt += `\n- Developmental areas to monitor: ${childContext.developmental.milestones.overdue.join(', ')}`
      }
    }

    prompt += `\n\nGuidelines:
1. Always provide Australian-specific advice (metric units, local services, Aussie terminology)
2. Include medical disclaimers for health-related questions
3. Be extra gentle and supportive during night-time hours
4. Consider the child's specific age and developmental stage in all responses
5. Suggest logging activities in PAM when relevant
6. Reference Australian emergency numbers (000) when appropriate
7. Use warm, conversational Australian English (but not overly colloquial)`

    return prompt
  }
  
  /**
   * Helper methods
   */
  private static determineGrowthTrend(measurements: { weight_percentile?: number }[]): 'normal' | 'above_average' | 'below_average' | 'concerning' {
    if (measurements.length < 2) return 'normal'
    
    // Simple trend analysis based on percentiles
    const latestPercentile = measurements[0]?.weight_percentile
    const previousPercentile = measurements[1]?.weight_percentile
    
    if (!latestPercentile || !previousPercentile) return 'normal'
    
    const percentileChange = latestPercentile - previousPercentile
    
    if (Math.abs(percentileChange) < 10) return 'normal'
    if (percentileChange > 10) return 'above_average'
    if (percentileChange < -20) return 'concerning'
    return 'below_average'
  }
  
  private static determineFeedingMethod(ageMonths: number, activities: { activity_type?: string; activity_subtype?: string }[]): MCPChildContext['feeding']['feeding_method'] {
    const feedingActivities = activities.filter(a => 
      a.activity_type === 'feeding' || a.activity_type?.category === 'feeding'
    )
    
    const hasBreastfeeding = feedingActivities.some(a => a.activity_subtype === 'breast')
    const hasBottle = feedingActivities.some(a => a.activity_subtype === 'bottle')
    const hasSolids = feedingActivities.some(a => a.activity_subtype === 'solid')
    
    if (ageMonths < 4) {
      if (hasBreastfeeding && hasBottle) return 'mixed'
      if (hasBreastfeeding) return 'breast'
      return 'bottle'
    }
    
    if (hasSolids && (hasBreastfeeding || hasBottle)) return 'combination'
    if (hasSolids) return 'solids'
    if (hasBreastfeeding && hasBottle) return 'mixed'
    if (hasBreastfeeding) return 'breast'
    return 'bottle'
  }
  
  private static determineTypicalBedtime(activities: { activity_type?: string; started_at?: string }[]): string {
    const nightSleeps = activities
      .filter(a => (a.activity_type === 'sleep' || a.activity_type?.category === 'sleep') && 
                   a.duration_minutes && a.duration_minutes > 180) // Longer than 3 hours
      .map(a => new Date(a.started_at).getHours())
    
    if (nightSleeps.length === 0) return '7:00 PM'
    
    const avgHour = Math.round(nightSleeps.reduce((a, b) => a + b, 0) / nightSleeps.length)
    return `${avgHour}:00 ${avgHour >= 12 ? 'PM' : 'AM'}`
  }
  
  private static determineTypicalWakeTime(activities: { activity_type?: string; ended_at?: string }[]): string {
    const wakeUps = activities
      .filter(a => (a.activity_type === 'sleep' || a.activity_type?.category === 'sleep') && 
                   a.ended_at && a.duration_minutes && a.duration_minutes > 180)
      .map(a => new Date(a.ended_at).getHours())
    
    if (wakeUps.length === 0) return '7:00 AM'
    
    const avgHour = Math.round(wakeUps.reduce((a, b) => a + b, 0) / wakeUps.length)
    return `${avgHour}:00 ${avgHour >= 12 ? 'PM' : 'AM'}`
  }
  
  private static countDailyNaps(activities: { activity_type?: string; started_at?: string }[]): number {
    return activities.filter(a => 
      (a.activity_type === 'sleep' || a.activity_type?.category === 'sleep') && 
      a.duration_minutes && a.duration_minutes < 180 // Less than 3 hours
    ).length
  }
  
  private static getAgeAppropriateAbilities(ageMonths: number): string[] {
    const abilities: { [key: string]: string[] } = {
      '0-3': ['Visual tracking', 'Responding to sounds', 'Basic reflexes', 'Beginning social smiles'],
      '3-6': ['Rolling over', 'Reaching for objects', 'Babbling', 'Sitting with support'],
      '6-9': ['Sitting independently', 'Object permanence', 'Crawling', 'Pincer grasp developing'],
      '9-12': ['Cruising', 'First words', 'Understanding simple commands', 'Playing peek-a-boo'],
      '12-18': ['Walking', 'Using spoon', 'Building towers', 'Pointing to objects'],
      '18-24': ['Running', 'Two-word phrases', 'Pretend play', 'Following two-step commands'],
      '24-36': ['Jumping', 'Simple sentences', 'Toilet training readiness', 'Parallel play']
    }
    
    if (ageMonths < 3) return abilities['0-3']
    if (ageMonths < 6) return abilities['3-6']
    if (ageMonths < 9) return abilities['6-9']
    if (ageMonths < 12) return abilities['9-12']
    if (ageMonths < 18) return abilities['12-18']
    if (ageMonths < 24) return abilities['18-24']
    return abilities['24-36']
  }
  
  private static getAreasOfFocus(ageMonths: number): string[] {
    const focuses: { [key: string]: string[] } = {
      '0-3': ['Tummy time', 'Visual stimulation', 'Bonding', 'Sleep routines'],
      '3-6': ['Rolling practice', 'Sensory exploration', 'Introduction to solids', 'Sleep consolidation'],
      '6-9': ['Safe exploration space', 'Finger foods', 'Language exposure', 'Separation anxiety'],
      '9-12': ['Walking preparation', 'First words encouragement', 'Self-feeding', 'Social interaction'],
      '12-18': ['Walking confidence', 'Vocabulary building', 'Independence', 'Routine establishment'],
      '18-24': ['Language explosion', 'Social skills', 'Emotional regulation', 'Toilet awareness'],
      '24-36': ['Preschool readiness', 'Complex play', 'Independence', 'Peer interaction']
    }
    
    if (ageMonths < 3) return focuses['0-3']
    if (ageMonths < 6) return focuses['3-6']
    if (ageMonths < 9) return focuses['6-9']
    if (ageMonths < 12) return focuses['9-12']
    if (ageMonths < 18) return focuses['12-18']
    if (ageMonths < 24) return focuses['18-24']
    return focuses['24-36']
  }
}