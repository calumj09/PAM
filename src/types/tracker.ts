// Baby Tracker Types

export interface ActivityType {
  id: string
  name: string
  category: 'feeding' | 'sleep' | 'diaper' | 'milestone' | 'health' | 'other'
  icon: string
  color: string
  is_default: boolean
  created_at: string
}

export interface Activity {
  id: string
  child_id: string
  activity_type_id: string
  started_at: string
  ended_at: string | null
  duration_minutes: number | null
  notes: string | null
  metadata: {
    vaccines?: string[]
    requirements?: string[]
    links?: { [state: string]: string }
    milestoneType?: string
    isOptional?: boolean
  }
  created_at: string
  updated_at: string
  
  // Joined data
  activity_type?: ActivityType
  child?: {
    id: string
    name: string
  }
}

export interface FeedingDetails {
  activity_id: string
  feeding_type: 'breast' | 'bottle' | 'solid'
  amount_ml?: number
  breast_side?: 'left' | 'right' | 'both'
  food_items?: string[]
  created_at: string
}

export interface SleepDetails {
  activity_id: string
  sleep_quality: 'excellent' | 'good' | 'fair' | 'poor'
  wake_up_mood: 'happy' | 'cranky' | 'neutral' | 'sleepy'
  sleep_location?: string
  created_at: string
}

export interface DiaperDetails {
  activity_id: string
  diaper_type: 'wet' | 'dirty' | 'mixed' | 'clean'
  consistency?: 'liquid' | 'soft' | 'normal' | 'hard'
  color?: string
  rash_present: boolean
  created_at: string
}

export interface HealthDetails {
  activity_id: string
  temperature_celsius?: number
  medication_name?: string
  medication_dose?: string
  symptoms?: string[]
  healthcare_provider?: string
  created_at: string
}

export interface GrowthRecord {
  id: string
  child_id: string
  recorded_at: string
  weight_grams?: number
  height_cm?: number
  head_circumference_cm?: number
  notes?: string
  recorded_by?: string
  created_at: string
}

export interface ActivityWithDetails extends Activity {
  feeding_details?: FeedingDetails
  sleep_details?: SleepDetails
  diaper_details?: DiaperDetails
  health_details?: HealthDetails
}

// Quick entry interfaces
export interface QuickFeedingEntry {
  child_id: string
  feeding_type: 'breast' | 'bottle' | 'solid'
  started_at?: Date
  duration_minutes?: number
  amount_ml?: number
  breast_side?: 'left' | 'right' | 'both'
  food_items?: string[]
  notes?: string
}

export interface QuickSleepEntry {
  child_id: string
  started_at?: Date
  ended_at?: Date
  sleep_quality?: 'excellent' | 'good' | 'fair' | 'poor'
  wake_up_mood?: 'happy' | 'cranky' | 'neutral' | 'sleepy'
  sleep_location?: string
  notes?: string
}

export interface QuickDiaperEntry {
  child_id: string
  changed_at?: Date
  diaper_type: 'wet' | 'dirty' | 'mixed' | 'clean'
  consistency?: 'liquid' | 'soft' | 'normal' | 'hard'
  color?: string
  rash_present?: boolean
  notes?: string
}

// Analytics interfaces
export interface DailyStats {
  date: string
  child_id: string
  feeding_count: number
  sleep_duration_minutes: number
  diaper_changes: number
  activities: Activity[]
}

export interface WeeklyPattern {
  child_id: string
  week_start: string
  avg_feeding_count: number
  avg_sleep_duration: number
  avg_diaper_changes: number
  feeding_times: number[] // Hours of day when feeding typically occurs
  sleep_patterns: {
    bedtime_hour: number
    wake_time_hour: number
    nap_count: number
  }
}

// Voice input types
export interface VoiceCommand {
  text: string
  confidence: number
  activity_type?: string
  child_name?: string
  duration?: number
  time?: Date
  details?: {
    breast_side?: string
    amount_ml?: number
    food_items?: string[]
    consistency?: string
    sleep_quality?: string
  }
}

export interface VoiceRecognitionResult {
  success: boolean
  command?: VoiceCommand
  error?: string
  suggestions?: string[]
}