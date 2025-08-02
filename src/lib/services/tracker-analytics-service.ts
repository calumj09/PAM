import { createClient } from '@/lib/supabase/client'
import { Activity } from '@/types/tracker'

export interface DailyAnalytics {
  date: string
  feedingCount: number
  feedingTotalMinutes: number
  feedingTotalMl: number
  sleepCount: number
  sleepTotalMinutes: number
  nappyCount: number
  wetNappies: number
  dirtyNappies: number
  tummyTimeMinutes: number
}

export interface SleepPattern {
  averageSleepDuration: number
  averageNapsPerDay: number
  longestSleepStretch: number
  totalSleepPerDay: number
  nightSleepStart: string | null
  morningWakeTime: string | null
  sleepEfficiency: number // percentage of day spent sleeping
}

export interface FeedingPattern {
  averageFeedingInterval: number // minutes between feeds
  averageFeedingDuration: number
  averageBottleAmount: number
  feedingsPerDay: number
  preferredFeedingTimes: string[]
  breastVsBottleRatio: number
}

export interface NappyPattern {
  averageNappiesPerDay: number
  wetVsDirtyRatio: number
  longestDryStretch: number
  typicalChangeHours: string[]
}

export interface WeeklyInsight {
  week: number
  insight: string
  category: 'sleep' | 'feeding' | 'nappy' | 'development'
  emoji: string
  isPositive: boolean
}

export interface HealthcareReport {
  childName: string
  dateRange: { start: Date; end: Date }
  summary: {
    totalDays: number
    avgFeedingsPerDay: number
    avgSleepHoursPerDay: number
    avgNappiesPerDay: number
    growthNotes: string[]
  }
  patterns: {
    sleep: SleepPattern
    feeding: FeedingPattern
    nappy: NappyPattern
  }
  concerns: string[]
  milestones: string[]
}

export class TrackerAnalyticsService {
  private static supabase = createClient()

  /**
   * Get daily analytics for a date range
   */
  static async getDailyAnalytics(
    childId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DailyAnalytics[]> {
    const { data: activities, error } = await this.supabase
      .from('simple_activities')
      .select('*')
      .eq('child_id', childId)
      .gte('started_at', startDate.toISOString())
      .lte('started_at', endDate.toISOString())
      .order('started_at', { ascending: true })

    if (error) throw error

    // Group activities by day
    const dailyData = new Map<string, DailyAnalytics>()
    
    activities?.forEach(activity => {
      const date = new Date(activity.started_at).toISOString().split('T')[0]
      
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date,
          feedingCount: 0,
          feedingTotalMinutes: 0,
          feedingTotalMl: 0,
          sleepCount: 0,
          sleepTotalMinutes: 0,
          nappyCount: 0,
          wetNappies: 0,
          dirtyNappies: 0,
          tummyTimeMinutes: 0
        })
      }
      
      const dayStats = dailyData.get(date)!
      
      switch (activity.activity_type) {
        case 'feeding':
          dayStats.feedingCount++
          dayStats.feedingTotalMinutes += activity.duration_minutes || 0
          dayStats.feedingTotalMl += activity.amount_ml || 0
          break
          
        case 'sleep':
          dayStats.sleepCount++
          dayStats.sleepTotalMinutes += activity.duration_minutes || 0
          break
          
        case 'nappy':
        case 'diaper':
          dayStats.nappyCount++
          if (activity.activity_subtype === 'wet') {
            dayStats.wetNappies++
          } else {
            dayStats.dirtyNappies++
          }
          break
          
        case 'tummy_time':
          dayStats.tummyTimeMinutes += activity.duration_minutes || 0
          break
      }
    })
    
    return Array.from(dailyData.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }

  /**
   * Analyze sleep patterns
   */
  static async analyzeSleepPatterns(
    childId: string,
    days: number = 7
  ): Promise<SleepPattern> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: sleepActivities, error } = await this.supabase
      .from('simple_activities')
      .select('*')
      .eq('child_id', childId)
      .eq('activity_type', 'sleep')
      .gte('started_at', startDate.toISOString())
      .lte('started_at', endDate.toISOString())
      .order('started_at', { ascending: true })

    if (error) throw error

    if (!sleepActivities || sleepActivities.length === 0) {
      return {
        averageSleepDuration: 0,
        averageNapsPerDay: 0,
        longestSleepStretch: 0,
        totalSleepPerDay: 0,
        nightSleepStart: null,
        morningWakeTime: null,
        sleepEfficiency: 0
      }
    }

    // Calculate metrics
    const totalSleepMinutes = sleepActivities.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
    const averageSleepDuration = totalSleepMinutes / sleepActivities.length
    const longestSleepStretch = Math.max(...sleepActivities.map(s => s.duration_minutes || 0))

    // Group by day for daily counts
    const sleepsByDay = new Map<string, number>()
    sleepActivities.forEach(sleep => {
      const date = new Date(sleep.started_at).toISOString().split('T')[0]
      sleepsByDay.set(date, (sleepsByDay.get(date) || 0) + 1)
    })
    
    const averageNapsPerDay = Array.from(sleepsByDay.values()).reduce((sum, count) => sum + count, 0) / sleepsByDay.size
    const totalSleepPerDay = totalSleepMinutes / sleepsByDay.size

    // Find typical night sleep times
    const nightSleeps = sleepActivities.filter(s => {
      const hour = new Date(s.started_at).getHours()
      return hour >= 18 || hour <= 6
    })

    let nightSleepStart = null
    let morningWakeTime = null
    
    if (nightSleeps.length > 0) {
      const avgStartHour = nightSleeps.reduce((sum, s) => {
        const hour = new Date(s.started_at).getHours()
        return sum + (hour < 12 ? hour + 24 : hour)
      }, 0) / nightSleeps.length
      
      nightSleepStart = `${Math.floor(avgStartHour % 24)}:${Math.round((avgStartHour % 1) * 60).toString().padStart(2, '0')}`
      
      const wakeups = nightSleeps
        .filter(s => s.ended_at)
        .map(s => new Date(s.ended_at!).getHours())
      
      if (wakeups.length > 0) {
        const avgWakeHour = wakeups.reduce((sum, h) => sum + h, 0) / wakeups.length
        morningWakeTime = `${Math.floor(avgWakeHour)}:${Math.round((avgWakeHour % 1) * 60).toString().padStart(2, '0')}`
      }
    }

    const sleepEfficiency = (totalSleepPerDay / (24 * 60)) * 100

    return {
      averageSleepDuration: Math.round(averageSleepDuration),
      averageNapsPerDay: Math.round(averageNapsPerDay * 10) / 10,
      longestSleepStretch,
      totalSleepPerDay: Math.round(totalSleepPerDay),
      nightSleepStart,
      morningWakeTime,
      sleepEfficiency: Math.round(sleepEfficiency)
    }
  }

  /**
   * Analyze feeding patterns
   */
  static async analyzeFeedingPatterns(
    childId: string,
    days: number = 7
  ): Promise<FeedingPattern> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: feedingActivities, error } = await this.supabase
      .from('simple_activities')
      .select('*')
      .eq('child_id', childId)
      .eq('activity_type', 'feeding')
      .gte('started_at', startDate.toISOString())
      .lte('started_at', endDate.toISOString())
      .order('started_at', { ascending: true })

    if (error) throw error

    if (!feedingActivities || feedingActivities.length === 0) {
      return {
        averageFeedingInterval: 0,
        averageFeedingDuration: 0,
        averageBottleAmount: 0,
        feedingsPerDay: 0,
        preferredFeedingTimes: [],
        breastVsBottleRatio: 0
      }
    }

    // Calculate intervals between feedings
    const intervals: number[] = []
    for (let i = 1; i < feedingActivities.length; i++) {
      const interval = new Date(feedingActivities[i].started_at).getTime() - 
                      new Date(feedingActivities[i - 1].started_at).getTime()
      intervals.push(interval / 1000 / 60) // Convert to minutes
    }
    
    const averageFeedingInterval = intervals.length > 0 
      ? intervals.reduce((sum, i) => sum + i, 0) / intervals.length 
      : 0

    // Calculate average duration
    const durationsWithValue = feedingActivities.filter(f => f.duration_minutes)
    const averageFeedingDuration = durationsWithValue.length > 0
      ? durationsWithValue.reduce((sum, f) => sum + f.duration_minutes!, 0) / durationsWithValue.length
      : 0

    // Calculate average bottle amount
    const bottleFeedings = feedingActivities.filter(f => f.amount_ml)
    const averageBottleAmount = bottleFeedings.length > 0
      ? bottleFeedings.reduce((sum, f) => sum + f.amount_ml!, 0) / bottleFeedings.length
      : 0

    // Group by day
    const feedingsByDay = new Map<string, number>()
    feedingActivities.forEach(feeding => {
      const date = new Date(feeding.started_at).toISOString().split('T')[0]
      feedingsByDay.set(date, (feedingsByDay.get(date) || 0) + 1)
    })
    
    const feedingsPerDay = Array.from(feedingsByDay.values()).reduce((sum, count) => sum + count, 0) / feedingsByDay.size

    // Find preferred feeding times
    const hourCounts = new Map<number, number>()
    feedingActivities.forEach(feeding => {
      const hour = new Date(feeding.started_at).getHours()
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
    })
    
    const preferredFeedingTimes = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`)

    // Calculate breast vs bottle ratio
    const breastFeedings = feedingActivities.filter(f => f.activity_subtype === 'breast').length
    const bottleCount = feedingActivities.filter(f => f.activity_subtype === 'bottle').length
    const breastVsBottleRatio = bottleCount > 0 ? breastFeedings / bottleCount : breastFeedings

    return {
      averageFeedingInterval: Math.round(averageFeedingInterval),
      averageFeedingDuration: Math.round(averageFeedingDuration),
      averageBottleAmount: Math.round(averageBottleAmount),
      feedingsPerDay: Math.round(feedingsPerDay * 10) / 10,
      preferredFeedingTimes,
      breastVsBottleRatio: Math.round(breastVsBottleRatio * 100) / 100
    }
  }

  /**
   * Analyze nappy patterns
   */
  static async analyzeNappyPatterns(
    childId: string,
    days: number = 7
  ): Promise<NappyPattern> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: nappyActivities, error } = await this.supabase
      .from('simple_activities')
      .select('*')
      .eq('child_id', childId)
      .in('activity_type', ['nappy', 'diaper'])
      .gte('started_at', startDate.toISOString())
      .lte('started_at', endDate.toISOString())
      .order('started_at', { ascending: true })

    if (error) throw error

    if (!nappyActivities || nappyActivities.length === 0) {
      return {
        averageNappiesPerDay: 0,
        wetVsDirtyRatio: 0,
        longestDryStretch: 0,
        typicalChangeHours: []
      }
    }

    // Group by day
    const nappiesByDay = new Map<string, number>()
    nappyActivities.forEach(nappy => {
      const date = new Date(nappy.started_at).toISOString().split('T')[0]
      nappiesByDay.set(date, (nappiesByDay.get(date) || 0) + 1)
    })
    
    const averageNappiesPerDay = Array.from(nappiesByDay.values()).reduce((sum, count) => sum + count, 0) / nappiesByDay.size

    // Calculate wet vs dirty ratio
    const wetCount = nappyActivities.filter(n => n.activity_subtype === 'wet').length
    const dirtyCount = nappyActivities.filter(n => n.activity_subtype === 'dirty').length
    const wetVsDirtyRatio = dirtyCount > 0 ? wetCount / dirtyCount : wetCount

    // Find longest dry stretch
    const dryStretches: number[] = []
    for (let i = 1; i < nappyActivities.length; i++) {
      const stretch = new Date(nappyActivities[i].started_at).getTime() - 
                     new Date(nappyActivities[i - 1].started_at).getTime()
      dryStretches.push(stretch / 1000 / 60 / 60) // Convert to hours
    }
    
    const longestDryStretch = dryStretches.length > 0 
      ? Math.max(...dryStretches)
      : 0

    // Find typical change hours
    const hourCounts = new Map<number, number>()
    nappyActivities.forEach(nappy => {
      const hour = new Date(nappy.started_at).getHours()
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
    })
    
    const typicalChangeHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([hour]) => `${hour}:00`)
      .sort()

    return {
      averageNappiesPerDay: Math.round(averageNappiesPerDay * 10) / 10,
      wetVsDirtyRatio: Math.round(wetVsDirtyRatio * 10) / 10,
      longestDryStretch: Math.round(longestDryStretch * 10) / 10,
      typicalChangeHours
    }
  }

  /**
   * Generate weekly insights
   */
  static async generateWeeklyInsights(
    childId: string,
    weekNumber: number
  ): Promise<WeeklyInsight[]> {
    const insights: WeeklyInsight[] = []
    
    // Get data for the week
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - (weekNumber * 7 + 7))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const [sleepPattern, feedingPattern, nappyPattern] = await Promise.all([
      this.analyzeSleepPatterns(childId, 7),
      this.analyzeFeedingPatterns(childId, 7),
      this.analyzeNappyPatterns(childId, 7)
    ])

    // Sleep insights
    if (sleepPattern.totalSleepPerDay > 14 * 60) {
      insights.push({
        week: weekNumber,
        insight: `Great sleep this week! ${Math.round(sleepPattern.totalSleepPerDay / 60)} hours average per day`,
        category: 'sleep',
        emoji: '',
        isPositive: true
      })
    } else if (sleepPattern.totalSleepPerDay < 10 * 60) {
      insights.push({
        week: weekNumber,
        insight: `Less sleep than usual - only ${Math.round(sleepPattern.totalSleepPerDay / 60)} hours per day`,
        category: 'sleep',
        emoji: '',
        isPositive: false
      })
    }

    // Feeding insights
    if (feedingPattern.feedingsPerDay >= 8) {
      insights.push({
        week: weekNumber,
        insight: `Frequent feeder! Averaging ${feedingPattern.feedingsPerDay} feeds per day`,
        category: 'feeding',
        emoji: '',
        isPositive: true
      })
    }

    if (feedingPattern.averageFeedingInterval < 150) {
      insights.push({
        week: weekNumber,
        insight: `Cluster feeding detected - feeds every ${Math.round(feedingPattern.averageFeedingInterval / 60)} hours`,
        category: 'feeding',
        emoji: '',
        isPositive: true
      })
    }

    // Nappy insights
    if (nappyPattern.averageNappiesPerDay >= 6) {
      insights.push({
        week: weekNumber,
        insight: `Healthy nappy output! ${nappyPattern.averageNappiesPerDay} changes per day`,
        category: 'nappy',
        emoji: '',
        isPositive: true
      })
    }

    return insights
  }

  /**
   * Generate healthcare report
   */
  static async generateHealthcareReport(
    childId: string,
    childName: string,
    days: number = 30
  ): Promise<HealthcareReport> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [sleepPattern, feedingPattern, nappyPattern, dailyAnalytics] = await Promise.all([
      this.analyzeSleepPatterns(childId, days),
      this.analyzeFeedingPatterns(childId, days),
      this.analyzeNappyPatterns(childId, days),
      this.getDailyAnalytics(childId, startDate, endDate)
    ])

    const totalDays = dailyAnalytics.length
    const avgFeedingsPerDay = feedingPattern.feedingsPerDay
    const avgSleepHoursPerDay = sleepPattern.totalSleepPerDay / 60
    const avgNappiesPerDay = nappyPattern.averageNappiesPerDay

    // Identify concerns
    const concerns: string[] = []
    
    if (avgSleepHoursPerDay < 10) {
      concerns.push('Below average sleep duration')
    }
    
    if (avgFeedingsPerDay < 6) {
      concerns.push('Lower than typical feeding frequency')
    }
    
    if (avgNappiesPerDay < 4) {
      concerns.push('Lower than typical nappy output')
    }
    
    if (nappyPattern.longestDryStretch > 6) {
      concerns.push(`Long dry stretches noted (up to ${Math.round(nappyPattern.longestDryStretch)} hours)`)
    }

    // Growth notes
    const growthNotes: string[] = []
    
    if (sleepPattern.nightSleepStart && sleepPattern.morningWakeTime) {
      growthNotes.push(`Typical sleep schedule: ${sleepPattern.nightSleepStart} to ${sleepPattern.morningWakeTime}`)
    }
    
    if (feedingPattern.preferredFeedingTimes.length > 0) {
      growthNotes.push(`Preferred feeding times: ${feedingPattern.preferredFeedingTimes.join(', ')}`)
    }
    
    if (feedingPattern.breastVsBottleRatio > 0) {
      const breastPercentage = Math.round((feedingPattern.breastVsBottleRatio / (1 + feedingPattern.breastVsBottleRatio)) * 100)
      growthNotes.push(`Feeding method: ${breastPercentage}% breastfeeding`)
    }

    // Milestones based on patterns
    const milestones: string[] = []
    
    if (sleepPattern.longestSleepStretch > 360) {
      milestones.push('Sleeping through the night (6+ hour stretches)')
    }
    
    if (feedingPattern.averageFeedingInterval > 180) {
      milestones.push('Extended feeding intervals (3+ hours)')
    }
    
    const tummyTimeTotal = dailyAnalytics.reduce((sum, d) => sum + d.tummyTimeMinutes, 0)
    if (tummyTimeTotal > 0) {
      milestones.push(`Active tummy time: ${tummyTimeTotal} minutes total`)
    }

    return {
      childName,
      dateRange: { start: startDate, end: endDate },
      summary: {
        totalDays,
        avgFeedingsPerDay,
        avgSleepHoursPerDay,
        avgNappiesPerDay,
        growthNotes
      },
      patterns: {
        sleep: sleepPattern,
        feeding: feedingPattern,
        nappy: nappyPattern
      },
      concerns,
      milestones
    }
  }

  /**
   * Get trend analysis
   */
  static async getTrendAnalysis(
    childId: string,
    metric: 'sleep' | 'feeding' | 'nappy',
    days: number = 14
  ): Promise<{ trend: 'increasing' | 'decreasing' | 'stable'; percentage: number }> {
    const dailyData = await this.getDailyAnalytics(
      childId,
      new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      new Date()
    )

    if (dailyData.length < 3) {
      return { trend: 'stable', percentage: 0 }
    }

    // Split data into first and second half
    const midpoint = Math.floor(dailyData.length / 2)
    const firstHalf = dailyData.slice(0, midpoint)
    const secondHalf = dailyData.slice(midpoint)

    let firstAvg = 0
    let secondAvg = 0

    switch (metric) {
      case 'sleep':
        firstAvg = firstHalf.reduce((sum, d) => sum + d.sleepTotalMinutes, 0) / firstHalf.length
        secondAvg = secondHalf.reduce((sum, d) => sum + d.sleepTotalMinutes, 0) / secondHalf.length
        break
      case 'feeding':
        firstAvg = firstHalf.reduce((sum, d) => sum + d.feedingCount, 0) / firstHalf.length
        secondAvg = secondHalf.reduce((sum, d) => sum + d.feedingCount, 0) / secondHalf.length
        break
      case 'nappy':
        firstAvg = firstHalf.reduce((sum, d) => sum + d.nappyCount, 0) / firstHalf.length
        secondAvg = secondHalf.reduce((sum, d) => sum + d.nappyCount, 0) / secondHalf.length
        break
    }

    const percentageChange = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0
    
    if (Math.abs(percentageChange) < 5) {
      return { trend: 'stable', percentage: 0 }
    }
    
    return {
      trend: percentageChange > 0 ? 'increasing' : 'decreasing',
      percentage: Math.abs(Math.round(percentageChange))
    }
  }
}