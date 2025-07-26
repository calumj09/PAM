/* eslint-disable @typescript-eslint/no-explicit-any */
// Baby Tracker Analytics Service for PAM

import { createClient } from '@/lib/supabase/client'
import { 
  startOfDay, 
  endOfDay, 
  subDays, 
  subWeeks,
  subMonths,
  differenceInMinutes,
  format,
  isWithinInterval,
  eachDayOfInterval,
  getHours,
  parseISO
} from 'date-fns'

export interface FeedingPattern {
  averageInterval: number // minutes between feeds
  averageDuration: number // minutes per feed
  averageAmount: number // ml for bottles
  mostCommonTimes: number[] // hours of day (0-23)
  feedingTrend: 'improving' | 'worsening' | 'stable'
  breastVsBottleRatio: { breast: number, bottle: number }
  totalFeeds: number
}

export interface SleepPattern {
  averageNightSleep: number // minutes
  averageDaySleep: number // minutes
  totalSleepPerDay: number // minutes
  longestSleepStretch: number // minutes
  bedtime: number // average hour (0-23)
  wakeupTime: number // average hour (0-23)
  napCount: number
  sleepEfficiency: number // percentage
  sleepTrend: 'improving' | 'worsening' | 'stable'
}

export interface DiaperPattern {
  averageChangesPerDay: number
  wetToDirtyRatio: { wet: number, dirty: number }
  mostCommonChangeHours: number[]
  consistencyTrends: Record<string, number>
  rashFrequency: number // percentage of changes with rash
}

export interface GrowthPattern {
  weightTrend: 'gaining' | 'losing' | 'stable'
  heightTrend: 'growing' | 'stable'
  growthRate: {
    weightPerWeek: number // grams
    heightPerMonth: number // cm
  }
  percentiles: {
    weight: number
    height: number
    headCircumference: number
  }
  latestMeasurements: {
    weight?: number
    height?: number
    headCircumference?: number
    recordedAt: string
  }
}

export interface WeeklyInsights {
  period: {
    start: string
    end: string
  }
  feeding: FeedingPattern
  sleep: SleepPattern
  diaper: DiaperPattern
  growth?: GrowthPattern
  milestones: Array<{
    title: string
    achievedDate: string
    category: string
  }>
  recommendations: string[]
  concerns: string[]
}

export interface MonthlyReport {
  period: {
    start: string
    end: string
  }
  summary: {
    totalFeeds: number
    totalSleepHours: number
    totalDiaperChanges: number
    growthProgress: string
  }
  patterns: {
    feeding: FeedingPattern
    sleep: SleepPattern
    diaper: DiaperPattern
    growth?: GrowthPattern
  }
  achievements: Array<{
    week: number
    highlights: string[]
  }>
  trends: Array<{
    metric: string
    direction: 'improving' | 'stable' | 'concerning'
    description: string
  }>
  recommendations: string[]
}

export class AnalyticsService {
  /**
   * Generate weekly insights for a child
   */
  static async generateWeeklyInsights(
    childId: string, 
    targetDate: Date = new Date()
  ): Promise<WeeklyInsights> {
    const weekStart = startOfDay(subDays(targetDate, 6))
    const weekEnd = endOfDay(targetDate)

    const supabase = createClient()

    // Get all activities for the week
    const { data: activities } = await supabase
      .from('activities')
      .select(`
        *,
        activity_types (*),
        feeding_details (*),
        sleep_details (*),
        diaper_details (*)
      `)
      .eq('child_id', childId)
      .gte('started_at', weekStart.toISOString())
      .lte('started_at', weekEnd.toISOString())
      .order('started_at', { ascending: true })

    if (!activities) {
      throw new Error('Failed to fetch activity data')
    }

    // Get growth records
    const { data: growthRecords } = await supabase
      .from('growth_records')
      .select('*')
      .eq('child_id', childId)
      .gte('recorded_at', subMonths(targetDate, 1).toISOString())
      .order('recorded_at', { ascending: false })
      .limit(10)

    // Process patterns
    const feeding = await this.analyzeFeedingPattern(activities, weekStart, weekEnd)
    const sleep = await this.analyzeSleepPattern(activities, weekStart, weekEnd)
    const diaper = await this.analyzeDiaperPattern(activities, weekStart, weekEnd)
    const growth = growthRecords ? await this.analyzeGrowthPattern(growthRecords) : undefined

    // Generate recommendations and concerns
    const recommendations = this.generateRecommendations(feeding, sleep, diaper, growth)
    const concerns = this.identifyConcerns(feeding, sleep, diaper, growth)

    return {
      period: {
        start: weekStart.toISOString(),
        end: weekEnd.toISOString()
      },
      feeding,
      sleep,
      diaper,
      growth,
      milestones: [],
      recommendations,
      concerns
    }
  }

  /**
   * Generate monthly report for a child
   */
  static async generateMonthlyReport(
    childId: string,
    targetDate: Date = new Date()
  ): Promise<MonthlyReport> {
    const monthStart = startOfDay(subMonths(targetDate, 1))
    const monthEnd = endOfDay(targetDate)

    const supabase = createClient()

    // Get all activities for the month
    const { data: activities } = await supabase
      .from('activities')
      .select(`
        *,
        activity_types (*),
        feeding_details (*),
        sleep_details (*),
        diaper_details (*)
      `)
      .eq('child_id', childId)
      .gte('started_at', monthStart.toISOString())
      .lte('started_at', monthEnd.toISOString())
      .order('started_at', { ascending: true })

    if (!activities) {
      throw new Error('Failed to fetch activity data')
    }

    // Get growth records
    const { data: growthRecords } = await supabase
      .from('growth_records')
      .select('*')
      .eq('child_id', childId)
      .gte('recorded_at', subMonths(targetDate, 3).toISOString())
      .order('recorded_at', { ascending: false })

    // Analyze patterns
    const feeding = await this.analyzeFeedingPattern(activities, monthStart, monthEnd)
    const sleep = await this.analyzeSleepPattern(activities, monthStart, monthEnd)
    const diaper = await this.analyzeDiaperPattern(activities, monthStart, monthEnd)
    const growth = growthRecords ? await this.analyzeGrowthPattern(growthRecords) : undefined

    // Generate weekly achievements
    const achievements = await this.generateWeeklyAchievements(activities, monthStart, monthEnd)

    // Identify trends
    const trends = this.identifyTrends(feeding, sleep, diaper, growth)

    return {
      period: {
        start: monthStart.toISOString(),
        end: monthEnd.toISOString()
      },
      summary: {
        totalFeeds: feeding.totalFeeds,
        totalSleepHours: Math.round((sleep.totalSleepPerDay * 30) / 60),
        totalDiaperChanges: Math.round(diaper.averageChangesPerDay * 30),
        growthProgress: growth ? this.formatGrowthProgress(growth) : 'No recent measurements'
      },
      patterns: {
        feeding,
        sleep,
        diaper,
        growth
      },
      achievements,
      trends,
      recommendations: this.generateRecommendations(feeding, sleep, diaper, growth)
    }
  }

  /**
   * Analyze feeding patterns
   */
  private static async analyzeFeedingPattern(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activities: any[],
    _startDate: Date,
    _endDate: Date
  ): Promise<FeedingPattern> {
    const feedingActivities = activities.filter(activity => 
      activity.activity_types?.category === 'feeding'
    )

    if (feedingActivities.length === 0) {
      return {
        averageInterval: 0,
        averageDuration: 0,
        averageAmount: 0,
        mostCommonTimes: [],
        feedingTrend: 'stable',
        breastVsBottleRatio: { breast: 0, bottle: 0 },
        totalFeeds: 0
      }
    }

    // Calculate intervals between feeds
    const intervals: number[] = []
    for (let i = 1; i < feedingActivities.length; i++) {
      const interval = differenceInMinutes(
        parseISO(feedingActivities[i].started_at),
        parseISO(feedingActivities[i - 1].started_at)
      )
      if (interval > 0 && interval < 720) { // Ignore intervals > 12 hours
        intervals.push(interval)
      }
    }

    // Calculate feeding times
    const feedingTimes = feedingActivities.map(activity => 
      getHours(parseISO(activity.started_at))
    )

    // Count feeding types
    let breastFeeds = 0
    let bottleFeeds = 0
    let totalDuration = 0
    let totalAmount = 0
    let bottleCount = 0

    feedingActivities.forEach(activity => {
      if (activity.feeding_details) {
        const details = activity.feeding_details
        if (details.feeding_type === 'breast') {
          breastFeeds++
        } else if (details.feeding_type === 'bottle') {
          bottleFeeds++
          if (details.amount_ml) {
            totalAmount += details.amount_ml
            bottleCount++
          }
        }
      }

      if (activity.duration_minutes) {
        totalDuration += activity.duration_minutes
      }
    })

    // Find most common feeding times (group by hour)
    const timeFrequency = feedingTimes.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    const mostCommonTimes = Object.entries(timeFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour))

    return {
      averageInterval: intervals.length > 0 ? Math.round(intervals.reduce((a, b) => a + b) / intervals.length) : 0,
      averageDuration: feedingActivities.length > 0 ? Math.round(totalDuration / feedingActivities.length) : 0,
      averageAmount: bottleCount > 0 ? Math.round(totalAmount / bottleCount) : 0,
      mostCommonTimes,
      feedingTrend: this.calculateTrend(feedingActivities, 'feeding'),
      breastVsBottleRatio: {
        breast: Math.round((breastFeeds / (breastFeeds + bottleFeeds)) * 100) || 0,
        bottle: Math.round((bottleFeeds / (breastFeeds + bottleFeeds)) * 100) || 0
      },
      totalFeeds: feedingActivities.length
    }
  }

  /**
   * Analyze sleep patterns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static async analyzeSleepPattern(
    activities: any[],
    _startDate: Date,
    _endDate: Date
  ): Promise<SleepPattern> {
    const sleepActivities = activities.filter(activity => 
      activity.activity_types?.category === 'sleep'
    )

    if (sleepActivities.length === 0) {
      return {
        averageNightSleep: 0,
        averageDaySleep: 0,
        totalSleepPerDay: 0,
        longestSleepStretch: 0,
        bedtime: 20,
        wakeupTime: 7,
        napCount: 0,
        sleepEfficiency: 0,
        sleepTrend: 'stable'
      }
    }

    // Group sleep sessions by day
    const dailySleep = new Map<string, any[]>()
    
    sleepActivities.forEach(activity => {
      const day = format(parseISO(activity.started_at), 'yyyy-MM-dd')
      if (!dailySleep.has(day)) {
        dailySleep.set(day, [])
      }
      dailySleep.get(day)!.push(activity)
    })

    let totalNightSleep = 0
    let totalDaySleep = 0
    let longestStretch = 0
    const bedtimes: number[] = []
    const wakeupTimes: number[] = []
    let totalNaps = 0

    dailySleep.forEach((daySessions) => {
      daySessions.forEach(session => {
        const startHour = getHours(parseISO(session.started_at))
        const duration = session.duration_minutes || 0

        // Classify as night sleep (7 PM - 6 AM) or day sleep
        if (startHour >= 19 || startHour <= 6) {
          totalNightSleep += duration
          bedtimes.push(startHour >= 19 ? startHour : startHour + 24)
          if (session.ended_at) {
            const endHour = getHours(parseISO(session.ended_at))
            wakeupTimes.push(endHour <= 12 ? endHour : endHour - 24)
          }
        } else {
          totalDaySleep += duration
          totalNaps++
        }

        longestStretch = Math.max(longestStretch, duration)
      })
    })

    const daysCount = dailySleep.size
    const averageBedtime = bedtimes.length > 0 
      ? bedtimes.reduce((a, b) => a + b) / bedtimes.length 
      : 20

    const averageWakeup = wakeupTimes.length > 0
      ? wakeupTimes.reduce((a, b) => a + b) / wakeupTimes.length
      : 7

    return {
      averageNightSleep: daysCount > 0 ? Math.round(totalNightSleep / daysCount) : 0,
      averageDaySleep: daysCount > 0 ? Math.round(totalDaySleep / daysCount) : 0,
      totalSleepPerDay: daysCount > 0 ? Math.round((totalNightSleep + totalDaySleep) / daysCount) : 0,
      longestSleepStretch: longestStretch,
      bedtime: Math.round(averageBedtime % 24),
      wakeupTime: Math.round(averageWakeup < 0 ? averageWakeup + 24 : averageWakeup),
      napCount: daysCount > 0 ? Math.round(totalNaps / daysCount) : 0,
      sleepEfficiency: 75, // Placeholder - would need more complex calculation
      sleepTrend: this.calculateTrend(sleepActivities, 'sleep')
    }
  }

  /**
   * Analyze diaper patterns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static async analyzeDiaperPattern(
    activities: any[],
    startDate: Date,
    endDate: Date
  ): Promise<DiaperPattern> {
    const diaperActivities = activities.filter(activity => 
      activity.activity_types?.category === 'diaper'
    )

    if (diaperActivities.length === 0) {
      return {
        averageChangesPerDay: 0,
        wetToDirtyRatio: { wet: 0, dirty: 0 },
        mostCommonChangeHours: [],
        consistencyTrends: {},
        rashFrequency: 0
      }
    }

    const daysCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    // Count wet vs dirty
    let wetCount = 0
    let dirtyCount = 0
    let rashCount = 0
    const consistencyCount: Record<string, number> = {}
    const changeHours: number[] = []

    diaperActivities.forEach(activity => {
      const hour = getHours(parseISO(activity.started_at))
      changeHours.push(hour)

      if (activity.diaper_details) {
        const details = activity.diaper_details
        
        if (details.diaper_type === 'wet') wetCount++
        if (details.diaper_type === 'dirty') dirtyCount++
        if (details.rash_present) rashCount++
        
        if (details.consistency) {
          consistencyCount[details.consistency] = (consistencyCount[details.consistency] || 0) + 1
        }
      }
    })

    // Find most common change hours
    const hourFrequency = changeHours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    const mostCommonChangeHours = Object.entries(hourFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour))

    return {
      averageChangesPerDay: Math.round(diaperActivities.length / daysCount),
      wetToDirtyRatio: {
        wet: Math.round((wetCount / (wetCount + dirtyCount)) * 100) || 0,
        dirty: Math.round((dirtyCount / (wetCount + dirtyCount)) * 100) || 0
      },
      mostCommonChangeHours,
      consistencyTrends: consistencyCount,
      rashFrequency: Math.round((rashCount / diaperActivities.length) * 100)
    }
  }

  /**
   * Analyze growth patterns
   */
  private static async analyzeGrowthPattern(
    growthRecords: any[]
  ): Promise<GrowthPattern | undefined> {
    if (growthRecords.length < 2) return undefined

    const sortedRecords = growthRecords.sort((a, b) => 
      new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    )

    const latest = sortedRecords[0]
    const previous = sortedRecords[1]

    // Calculate trends
    const weightTrend = latest.weight_grams && previous.weight_grams
      ? latest.weight_grams > previous.weight_grams ? 'gaining' as const
      : latest.weight_grams < previous.weight_grams ? 'losing' as const
      : 'stable' as const
      : 'stable' as const

    const heightTrend = latest.height_cm && previous.height_cm
      ? latest.height_cm > previous.height_cm ? 'growing' as const : 'stable' as const
      : 'stable' as const

    return {
      weightTrend,
      heightTrend,
      growthRate: {
        weightPerWeek: 0, // Would need more complex calculation
        heightPerMonth: 0
      },
      percentiles: {
        weight: 50, // Placeholder - would need growth charts
        height: 50,
        headCircumference: 50
      },
      latestMeasurements: {
        weight: latest.weight_grams,
        height: latest.height_cm,
        headCircumference: latest.head_circumference_cm,
        recordedAt: latest.recorded_at
      }
    }
  }

  /**
   * Calculate trend for activity type
   */
  private static calculateTrend(
    activities: any[],
    _type: 'feeding' | 'sleep'
  ): 'improving' | 'worsening' | 'stable' {
    if (activities.length < 4) return 'stable'

    // Compare first half to second half
    const midpoint = Math.floor(activities.length / 2)
    const firstHalf = activities.slice(0, midpoint)
    const secondHalf = activities.slice(midpoint)

    const firstAvg = firstHalf.length
    const secondAvg = secondHalf.length

    const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100

    if (percentChange > 10) return 'improving'
    if (percentChange < -10) return 'worsening'
    return 'stable'
  }

  /**
   * Generate recommendations based on patterns
   */
  private static generateRecommendations(
    feeding: FeedingPattern,
    sleep: SleepPattern,
    diaper: DiaperPattern,
    growth?: GrowthPattern
  ): string[] {
    const recommendations: string[] = []

    // Feeding recommendations
    if (feeding.averageInterval > 240) { // > 4 hours
      recommendations.push('Consider more frequent feeding - intervals longer than 4 hours may indicate inadequate nutrition')
    }
    if (feeding.averageInterval < 90) { // < 1.5 hours
      recommendations.push('Very frequent feeding pattern - consider cluster feeding or comfort nursing')
    }

    // Sleep recommendations
    if (sleep.totalSleepPerDay < 720) { // < 12 hours
      recommendations.push('Baby may need more sleep - most babies need 14-17 hours per day')
    }
    if (sleep.longestSleepStretch < 180) { // < 3 hours
      recommendations.push('Work on extending sleep stretches - consistent bedtime routine may help')
    }

    // Diaper recommendations
    if (diaper.averageChangesPerDay < 6) {
      recommendations.push('Low diaper change frequency - ensure adequate feeding and consult healthcare provider')
    }

    // Australian-specific recommendations
    recommendations.push('Remember to discuss these patterns with your GP at next visit')
    recommendations.push('Consider using the Red Nose safe sleeping guidelines for better sleep')

    return recommendations
  }

  /**
   * Identify concerns based on patterns
   */
  private static identifyConcerns(
    feeding: FeedingPattern,
    sleep: SleepPattern,
    diaper: DiaperPattern,
    growth?: GrowthPattern
  ): string[] {
    const concerns: string[] = []

    // Feeding concerns
    if (feeding.totalFeeds < 6) {
      concerns.push('Low feeding frequency - consult healthcare provider')
    }

    // Sleep concerns
    if (sleep.totalSleepPerDay < 600) { // < 10 hours
      concerns.push('Concerning sleep duration - discuss with pediatrician')
    }

    // Diaper concerns
    if (diaper.averageChangesPerDay < 4) {
      concerns.push('Very low diaper changes - may indicate dehydration or feeding issues')
    }
    if (diaper.rashFrequency > 50) {
      concerns.push('Frequent diaper rash - consider changing routine or consulting GP')
    }

    // Growth concerns
    if (growth?.weightTrend === 'losing') {
      concerns.push('Weight loss trend - urgent consultation with healthcare provider recommended')
    }

    return concerns
  }

  /**
   * Generate weekly achievements
   */
  private static async generateWeeklyAchievements(
    activities: any[],
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ week: number, highlights: string[] }>> {
    // This would analyze activities week by week
    // For now, return placeholder
    return [
      {
        week: 1,
        highlights: ['Established feeding routine', 'Longer sleep stretches']
      }
    ]
  }

  /**
   * Identify trends across patterns
   */
  private static identifyTrends(
    feeding: FeedingPattern,
    sleep: SleepPattern,
    diaper: DiaperPattern,
    growth?: GrowthPattern
  ): Array<{ metric: string, direction: 'improving' | 'stable' | 'concerning', description: string }> {
    const trends = []

    trends.push({
      metric: 'Feeding Pattern',
      direction: feeding.feedingTrend === 'worsening' ? 'concerning' as const : 
                 feeding.feedingTrend === 'improving' ? 'improving' as const : 'stable' as const,
      description: `Feeding ${feeding.feedingTrend} with ${feeding.totalFeeds} feeds tracked`
    })

    trends.push({
      metric: 'Sleep Quality',
      direction: sleep.sleepTrend === 'worsening' ? 'concerning' as const :
                 sleep.sleepTrend === 'improving' ? 'improving' as const : 'stable' as const,
      description: `Average ${Math.round(sleep.totalSleepPerDay / 60)} hours sleep per day`
    })

    if (growth) {
      trends.push({
        metric: 'Growth Progress',
        direction: growth.weightTrend === 'losing' ? 'concerning' as const :
                   growth.weightTrend === 'gaining' ? 'improving' as const : 'stable' as const,
        description: `Weight ${growth.weightTrend}, height ${growth.heightTrend}`
      })
    }

    return trends
  }

  /**
   * Format growth progress
   */
  private static formatGrowthProgress(growth: GrowthPattern): string {
    const parts = []
    if (growth.latestMeasurements.weight) {
      parts.push(`${Math.round(growth.latestMeasurements.weight / 1000 * 10) / 10}kg`)
    }
    if (growth.latestMeasurements.height) {
      parts.push(`${growth.latestMeasurements.height}cm`)
    }
    return parts.join(', ') || 'No recent measurements'
  }
}