'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrackerService } from '@/lib/services/tracker-service'
import { ActivityWithDetails, DailyStats } from '@/types/tracker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { QuickEntryButtons } from '@/components/features/QuickEntryButtons'
import { ActivityTimeline } from '@/components/features/ActivityTimeline'
import { VoiceInput } from '@/components/features/VoiceInput'
import { formatDateAustralian } from '@/lib/utils'
import { 
  CalendarDaysIcon, 
  ChartBarIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Child {
  id: string
  name: string
  date_of_birth: string
}

export default function TrackerPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activities, setActivities] = useState<ActivityWithDetails[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadChildren()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedChild) {
      loadActivitiesForDate()
    }
  }, [selectedChild, selectedDate]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadChildren = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('children')
        .select('id, name, date_of_birth')
        .eq('user_id', user.id)
        .order('date_of_birth', { ascending: false })

      if (error) throw error

      setChildren(data || [])
      if (data && data.length > 0 && !selectedChild) {
        setSelectedChild(data[0])
      }
    } catch (error) {
      console.error('Error loading children:', error)
      setError('Failed to load children')
    } finally {
      setIsLoading(false)
    }
  }

  const loadActivitiesForDate = async () => {
    if (!selectedChild) return

    try {
      setIsLoading(true)
      const [activitiesData, statsData] = await Promise.all([
        TrackerService.getActivitiesForDate(selectedChild.id, selectedDate),
        TrackerService.getDailyStats(selectedChild.id, selectedDate)
      ])

      setActivities(activitiesData)
      setDailyStats(statsData)
    } catch (error) {
      console.error('Error loading activities:', error)
      setError('Failed to load activities')
    } finally {
      setIsLoading(false)
    }
  }

  const handleActivityAdded = () => {
    loadActivitiesForDate()
  }

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await TrackerService.deleteActivity(activityId)
      loadActivitiesForDate()
    } catch (error) {
      console.error('Error deleting activity:', error)
      setError('Failed to delete activity')
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setSelectedDate(newDate)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isFuture = (date: Date) => {
    const today = new Date()
    return date > today
  }

  if (isLoading && children.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-xl font-semibold text-gray-900">Baby Tracker</h1>
            <p className="text-sm text-gray-600 mt-1">
              Track your baby's daily activities
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-sm text-center py-12 px-6">
            <div className="text-6xl mb-4">👶</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to start tracking?</h3>
            <p className="text-gray-600 mb-6">
              Add your baby's profile to start tracking their daily activities, feeding, and sleep patterns.
            </p>
            <Link href="/dashboard/children" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
              <UserGroupIcon className="w-5 h-5" />
              Add Your Baby
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Baby Tracker</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track {selectedChild?.name || 'your baby'}'s daily activities
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-4">

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

        {/* Child Selector */}
        {children.length > 1 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <UserGroupIcon className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Select Child:</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedChild?.id === child.id
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {child.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date Navigator */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>

            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {isToday(selectedDate) ? 'Today' : formatDateAustralian(selectedDate)}
              </div>
              <div className="text-sm text-gray-500">
                {selectedDate.toLocaleDateString('en-AU', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </div>
            </div>

            <button
              onClick={() => navigateDate('next')}
              disabled={isFuture(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRightIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Daily Stats */}
        {dailyStats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl shadow-sm text-center p-4">
              <div className="text-2xl mb-2">🍼</div>
              <div className="text-2xl font-bold text-gray-900">{dailyStats.feeding_count}</div>
              <div className="text-sm text-gray-600">Feedings</div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm text-center p-4">
              <div className="text-2xl mb-2">😴</div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(dailyStats.sleep_duration_minutes / 60 * 10) / 10}h
              </div>
              <div className="text-sm text-gray-600">Sleep</div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm text-center p-4">
              <div className="text-2xl mb-2">🧷</div>
              <div className="text-2xl font-bold text-gray-900">{dailyStats.diaper_changes}</div>
              <div className="text-sm text-gray-600">Nappies</div>
            </div>
          </div>
        )}

        {/* Voice Input */}
        {selectedChild && !isFuture(selectedDate) && (
          <VoiceInput
            childId={selectedChild.id}
            childName={selectedChild.name}
            onActivityAdded={handleActivityAdded}
          />
        )}

        {/* Quick Entry Buttons */}
        {selectedChild && !isFuture(selectedDate) && (
          <QuickEntryButtons
            childId={selectedChild.id}
            childName={selectedChild.name}
            onActivityAdded={handleActivityAdded}
          />
        )}

        {/* Activity Timeline */}
        {selectedChild && (
          <ActivityTimeline
            activities={activities}
            onDeleteActivity={handleDeleteActivity}
            childName={selectedChild.name}
          />
        )}

        {/* Analytics Preview */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <ChartBarIcon className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Coming Soon: Analytics & Patterns</h3>
          </div>
          <div className="text-center py-6 text-gray-500">
            <ChartBarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              Track patterns, growth charts, and feeding schedules.
              <br />
              Export reports for healthcare visits.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}