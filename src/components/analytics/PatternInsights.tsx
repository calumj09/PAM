/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { 
  HeartIcon,
  MoonIcon,
  SparklesIcon,
  BellIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'
import { format, parseISO, differenceInMinutes, getHours } from 'date-fns'

interface PatternInsightsProps {
  childId: string
  childName: string
}

interface FeedingInsight {
  type: 'feeding_cluster' | 'feeding_routine' | 'feeding_growth_spurt'
  title: string
  description: string
  confidence: number
  actionable: boolean
  recommendation?: string
}

interface SleepInsight {
  type: 'sleep_regression' | 'sleep_improvement' | 'sleep_schedule'
  title: string
  description: string
  confidence: number
  actionable: boolean
  recommendation?: string
}

interface SmartAlert {
  id: string
  type: 'pattern_change' | 'milestone_approaching' | 'routine_suggestion'
  title: string
  message: string
  priority: 'high' | 'medium' | 'low'
  created_at: string
  actionable: boolean
  action?: {
    label: string
    url: string
  }
}

export function PatternInsights({ childId, childName }: PatternInsightsProps) {
  const [feedingInsights, setFeedingInsights] = useState<FeedingInsight[]>([])
  const [sleepInsights, setSleepInsights] = useState<SleepInsight[]>([])
  const [smartAlerts, setSmartAlerts] = useState<SmartAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    generateInsights()
  }, [childId])

  const generateInsights = async () => {
    try {
      setIsLoading(true)
      
      // Get recent activities
      const supabase = createClient()
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      
      const { data: activities } = await supabase
        .from('activities')
        .select(`
          *,
          activity_types (*),
          feeding_details (*),
          sleep_details (*)
        `)
        .eq('child_id', childId)
        .gte('started_at', oneWeekAgo.toISOString())
        .order('started_at', { ascending: true })

      if (activities) {
        const feedingPatterns = await analyzeFeedingPatterns(activities)
        const sleepPatterns = await analyzeSleepPatterns(activities)
        const alerts = await generateSmartAlerts(activities, childName)

        setFeedingInsights(feedingPatterns)
        setSleepInsights(sleepPatterns)
        setSmartAlerts(alerts)
      }
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeFeedingPatterns = async (activities: any[]): Promise<FeedingInsight[]> => {
    const insights: FeedingInsight[] = []
    
    const feedingActivities = activities.filter(a => 
      a.activity_types?.category === 'feeding'
    )

    if (feedingActivities.length < 5) return insights

    // Detect cluster feeding
    let clusterCount = 0
    for (let i = 1; i < feedingActivities.length; i++) {
      const timeDiff = differenceInMinutes(
        parseISO(feedingActivities[i].started_at),
        parseISO(feedingActivities[i-1].started_at)
      )
      if (timeDiff < 90) { // Less than 1.5 hours
        clusterCount++
      }
    }

    if (clusterCount > feedingActivities.length * 0.3) {
      insights.push({
        type: 'feeding_cluster',
        title: 'Cluster Feeding Detected',
        description: `${childName} has been cluster feeding, with ${clusterCount} feeds very close together. This is normal for growth spurts or comfort feeding.`,
        confidence: 85,
        actionable: true,
        recommendation: 'This is normal behavior. Ensure you\'re staying hydrated and consider comfort measures for yourself during these intensive feeding periods.'
      })
    }

    // Detect emerging routine
    const feedingHours = feedingActivities.map(a => getHours(parseISO(a.started_at)))
    const hourFrequency: Record<number, number> = {}
    
    feedingHours.forEach(hour => {
      hourFrequency[hour] = (hourFrequency[hour] || 0) + 1
    })

    const commonHours = Object.entries(hourFrequency)
      .filter(([_, count]) => count >= 3)
      .map(([hour]) => parseInt(hour))

    if (commonHours.length >= 3) {
      insights.push({
        type: 'feeding_routine',
        title: 'Feeding Routine Emerging',
        description: `${childName} is developing a feeding routine around ${commonHours.join(', ')} o'clock. This consistency is great for planning your day!`,
        confidence: 75,
        actionable: true,
        recommendation: 'Consider building other activities around these predictable feeding times.'
      })
    }

    return insights
  }

  const analyzeSleepPatterns = async (activities: any[]): Promise<SleepInsight[]> => {
    const insights: SleepInsight[] = []
    
    const sleepActivities = activities.filter(a => 
      a.activity_types?.category === 'sleep' && a.duration_minutes
    )

    if (sleepActivities.length < 5) return insights

    // Calculate average sleep duration trend (first half vs second half)
    const midpoint = Math.floor(sleepActivities.length / 2)
    const firstHalf = sleepActivities.slice(0, midpoint)
    const secondHalf = sleepActivities.slice(midpoint)

    const firstAvgDuration = firstHalf.reduce((sum, a) => sum + (a.duration_minutes || 0), 0) / firstHalf.length
    const secondAvgDuration = secondHalf.reduce((sum, a) => sum + (a.duration_minutes || 0), 0) / secondHalf.length

    const improvementPercent = ((secondAvgDuration - firstAvgDuration) / firstAvgDuration) * 100

    if (improvementPercent > 20) {
      insights.push({
        type: 'sleep_improvement',
        title: 'Sleep Duration Improving',
        description: `${childName}'s sleep has improved by ${Math.round(improvementPercent)}% this week. Average sleep sessions are now ${Math.round(secondAvgDuration)} minutes.`,
        confidence: 80,
        actionable: true,
        recommendation: 'Keep maintaining your current bedtime routine - it\'s working well!'
      })
    } else if (improvementPercent < -20) {
      insights.push({
        type: 'sleep_regression',
        title: 'Sleep Pattern Changes',
        description: `${childName}'s sleep duration has decreased by ${Math.round(Math.abs(improvementPercent))}% this week. This could be temporary due to growth spurts or developmental leaps.`,
        confidence: 75,
        actionable: true,
        recommendation: 'Sleep regressions are normal. Try to maintain consistent routines and consider if any recent changes might be affecting sleep.'
      })
    }

    // Detect consistent bedtime
    const nightSleep = sleepActivities.filter(a => {
      const hour = getHours(parseISO(a.started_at))
      return hour >= 18 || hour <= 6
    })

    if (nightSleep.length >= 5) {
      const bedtimes = nightSleep.map(a => getHours(parseISO(a.started_at)))
      const avgBedtime = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length
      const variance = bedtimes.reduce((sum, time) => sum + Math.pow(time - avgBedtime, 2), 0) / bedtimes.length

      if (variance < 2) { // Low variance in bedtime
        insights.push({
          type: 'sleep_schedule',
          title: 'Consistent Bedtime Established',
          description: `${childName} has a consistent bedtime around ${Math.round(avgBedtime)}:00. This routine stability is excellent for sleep quality.`,
          confidence: 90,
          actionable: false
        })
      }
    }

    return insights
  }

  const generateSmartAlerts = async (activities: any[], childName: string): Promise<SmartAlert[]> => {
    const alerts: SmartAlert[] = []

    // Alert for no recent activity
    const lastActivity = activities[activities.length - 1]
    if (lastActivity) {
      const hoursSinceLastActivity = differenceInMinutes(new Date(), parseISO(lastActivity.started_at)) / 60
      
      if (hoursSinceLastActivity > 12) {
        alerts.push({
          id: 'no_recent_activity',
          type: 'routine_suggestion',
          title: 'No Recent Activity Logged',
          message: `It's been ${Math.round(hoursSinceLastActivity)} hours since the last logged activity for ${childName}. Consider logging recent feeds or sleep.`,
          priority: 'medium',
          created_at: new Date().toISOString(),
          actionable: true,
          action: {
            label: 'Log Activity',
            url: '/dashboard/tracker'
          }
        })
      }
    }

    // Alert for upcoming growth spurt indicators
    const recentFeedings = activities.filter(a => 
      a.activity_types?.category === 'feeding' &&
      differenceInMinutes(new Date(), parseISO(a.started_at)) < 24 * 60 // Last 24 hours
    )

    if (recentFeedings.length > 12) { // More than 12 feeds in 24 hours
      alerts.push({
        id: 'growth_spurt_indicator',
        type: 'pattern_change',
        title: 'Possible Growth Spurt',
        message: `${childName} has had ${recentFeedings.length} feeds in the last 24 hours, which might indicate a growth spurt. This is normal and usually lasts 2-3 days.`,
        priority: 'low',
        created_at: new Date().toISOString(),
        actionable: true,
        action: {
          label: 'Learn More',
          url: '/dashboard/info'
        }
      })
    }

    return alerts
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-pam-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Smart Alerts */}
      {smartAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellIcon className="w-5 h-5 text-pam-red" />
              Smart Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {smartAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.priority === 'high' ? 'bg-red-50 border-red-400' :
                    alert.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                    'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    </div>
                    {alert.actionable && alert.action && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = alert.action!.url}
                      >
                        {alert.action.label}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pattern Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Feeding Insights */}
        {feedingInsights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartIcon className="w-5 h-5 text-green-600" />
                Feeding Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedingInsights.map((insight, index) => (
                  <InsightCard key={index} insight={insight} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sleep Insights */}
        {sleepInsights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MoonIcon className="w-5 h-5 text-purple-600" />
                Sleep Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sleepInsights.map((insight, index) => (
                  <InsightCard key={index} insight={insight} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* No Insights Message */}
      {feedingInsights.length === 0 && sleepInsights.length === 0 && smartAlerts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <SparklesIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Building Your Insights
            </h3>
            <p className="text-gray-600 mb-4">
              Keep tracking {childName}&apos;s activities to unlock personalized insights and pattern recognition.
            </p>
            <p className="text-sm text-gray-500">
              We need at least a week of consistent tracking to identify meaningful patterns.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function InsightCard({ 
  insight 
}: { 
  insight: FeedingInsight | SleepInsight 
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900">{insight.title}</h4>
        <div className="flex items-center gap-1">
          <SparklesIcon className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-gray-500">{insight.confidence}%</span>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
      
      {insight.recommendation && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
          <LightBulbIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800">{insight.recommendation}</p>
        </div>
      )}
    </div>
  )
}