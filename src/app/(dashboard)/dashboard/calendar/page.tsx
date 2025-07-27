'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Heart,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PremiumPaywall, FeatureLock } from '@/components/features/premium-paywall'
import { calendarSyncService } from '@/lib/services/calendar-sync'

interface Child {
  id: string
  name: string
  date_of_birth: string
}

interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: Date
  time?: string
  category: 'immunization' | 'registration' | 'checkup' | 'milestone' | 'appointment' | 'me-time'
  completed: boolean
  urgent: boolean
  child_id?: string
}

interface MeTimeActivity {
  id: string
  title: string
  description: string
  duration: string
  icon: string
}

export default function CalendarPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showMeTimeModal, setShowMeTimeModal] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [isPremium, setIsPremium] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadChildren()
  }, [])

  useEffect(() => {
    if (selectedChild) {
      loadEvents()
    }
  }, [selectedChild, currentDate])

  const loadChildren = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('date_of_birth', { ascending: false })

      if (error) throw error
      setChildren(data || [])
      if (data && data.length > 0) {
        setSelectedChild(data[0])
      }
    } catch (error) {
      console.error('Error loading children:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadEvents = async () => {
    if (!selectedChild) return

    // For now, we'll generate mock events based on the child's age and planning doc
    const birthDate = new Date(selectedChild.date_of_birth)
    const now = new Date()
    const ageInWeeks = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7))
    
    const mockEvents: CalendarEvent[] = []

    // Generate immunization events based on Australian schedule
    const immunizationSchedule = [
      { weeks: 8, title: '2-month immunizations', description: 'DTPa, Hib, hepatitis B, polio, pneumococcal, rotavirus' },
      { weeks: 16, title: '4-month immunizations', description: 'DTPa, Hib, hepatitis B, polio, pneumococcal, rotavirus' },
      { weeks: 24, title: '6-month immunizations', description: 'DTPa, Hib, hepatitis B, polio, pneumococcal, rotavirus' },
      { weeks: 52, title: '12-month immunizations', description: 'Hib, measles-mumps-rubella, meningococcal C, pneumococcal' },
    ]

    immunizationSchedule.forEach(schedule => {
      const eventDate = new Date(birthDate.getTime() + schedule.weeks * 7 * 24 * 60 * 60 * 1000)
      if (eventDate >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) && 
          eventDate <= new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)) {
        mockEvents.push({
          id: `imm-${schedule.weeks}`,
          title: schedule.title,
          description: schedule.description,
          date: eventDate,
          time: '10:00 AM',
          category: 'immunization',
          completed: ageInWeeks > schedule.weeks,
          urgent: ageInWeeks >= schedule.weeks && ageInWeeks <= schedule.weeks + 2,
          child_id: selectedChild.id
        })
      }
    })

    // Add some checkup events
    const checkupSchedule = [
      { weeks: 1, title: 'Maternal Health Nurse Visit', description: 'First postnatal checkup' },
      { weeks: 4, title: 'Maternal Health Nurse Visit', description: '4-week checkup' },
      { weeks: 8, title: 'Maternal Health Nurse Visit', description: '8-week checkup' },
      { weeks: 16, title: 'Maternal Health Nurse Visit', description: '4-month checkup' },
    ]

    checkupSchedule.forEach(checkup => {
      const eventDate = new Date(birthDate.getTime() + checkup.weeks * 7 * 24 * 60 * 60 * 1000)
      if (eventDate >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) && 
          eventDate <= new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)) {
        mockEvents.push({
          id: `checkup-${checkup.weeks}`,
          title: checkup.title,
          description: checkup.description,
          date: eventDate,
          time: '2:00 PM',
          category: 'checkup',
          completed: ageInWeeks > checkup.weeks,
          urgent: ageInWeeks >= checkup.weeks && ageInWeeks <= checkup.weeks + 1,
          child_id: selectedChild.id
        })
      }
    })

    // Add Me Time reminders
    const today = new Date()
    const meTimeEvents = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
      if (date >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) && 
          date <= new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)) {
        meTimeEvents.push({
          id: `metime-${date.getTime()}`,
          title: 'Me Time',
          description: 'Take 15 minutes for yourself today',
          date: date,
          time: '7:00 PM',
          category: 'me-time' as const,
          completed: false,
          urgent: false
        })
      }
    }

    setEvents([...mockEvents, ...meTimeEvents])
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() + 7)
    }
    setCurrentDate(newDate)
  }

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Start on Monday
    startOfWeek.setDate(diff)

    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      weekDays.push(date)
    }
    return weekDays
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    )
  }

  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)
    
    // Start from Monday of the first week
    const startDate = new Date(firstDay)
    const dayOfWeek = firstDay.getDay()
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startDate.setDate(firstDay.getDate() - daysToSubtract)
    
    // Generate 6 weeks (42 days) to cover all possibilities
    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    
    return days
  }

  const getCategoryColor = (category: CalendarEvent['category']) => {
    switch (category) {
      case 'immunization': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'checkup': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'registration': return 'bg-green-100 text-green-700 border-green-200'
      case 'milestone': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'appointment': return 'bg-red-100 text-red-700 border-red-200'
      case 'me-time': return 'bg-pink-100 text-pink-700 border-pink-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getCategoryIcon = (category: CalendarEvent['category']) => {
    switch (category) {
      case 'immunization': return '💉'
      case 'checkup': return '🏥'
      case 'registration': return '📋'
      case 'milestone': return '🎉'
      case 'appointment': return '📅'
      case 'me-time': return '💆‍♀️'
      default: return '📅'
    }
  }

  const meTimeActivities: MeTimeActivity[] = [
    { id: '1', title: '5-minute meditation', description: 'Quick mindfulness break', duration: '5 min', icon: '🧘‍♀️' },
    { id: '2', title: 'Warm shower', description: 'Relax and recharge', duration: '10 min', icon: '🚿' },
    { id: '3', title: 'Cup of tea', description: 'Sit and enjoy the moment', duration: '10 min', icon: '☕' },
    { id: '4', title: 'Quick walk', description: 'Fresh air and movement', duration: '15 min', icon: '🚶‍♀️' },
    { id: '5', title: 'Journal writing', description: 'Reflect on your day', duration: '10 min', icon: '📝' },
    { id: '6', title: 'Phone a friend', description: 'Connect with someone you care about', duration: '15 min', icon: '📞' },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
            <p className="text-sm text-gray-600 mt-1">Your personalised schedule</p>
          </div>
        </div>
        
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-sm text-center py-12 px-6">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your calendar awaits</h3>
            <p className="text-gray-600 mb-6">
              Add your baby's profile to see personalised appointments, immunisations, and me-time reminders.
            </p>
            <a href="/dashboard/children" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
              <Plus className="w-5 h-5" />
              Add Your Baby
            </a>
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
          <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-600 mt-1">
            Schedule for {selectedChild?.name}
          </p>
          
          {/* View Toggle */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                  viewMode === 'week' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                  viewMode === 'month' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Month
              </button>
            </div>
            
            <button
              onClick={() => setShowMeTimeModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-pink-100 text-pink-700 rounded-xl text-sm font-medium hover:bg-pink-200 transition-colors"
            >
              <Heart className="w-4 h-4" />
              Me Time
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-4">
        {/* Child Selector */}
        {children.length > 1 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Select Child:</h3>
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

        {/* Calendar Navigation */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => viewMode === 'week' ? navigateWeek('prev') : navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <h2 className="text-lg font-semibold text-gray-900">
              {currentDate.toLocaleDateString('en-AU', { 
                month: 'long', 
                year: 'numeric',
                ...(viewMode === 'week' && { day: 'numeric' })
              })}
            </h2>
            
            <button
              onClick={() => viewMode === 'week' ? navigateWeek('next') : navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Week View */}
          {viewMode === 'week' && (
            <div className="space-y-3">
              {getWeekDays().map((date, index) => {
                const dayEvents = getEventsForDate(date)
                const isToday = date.toDateString() === new Date().toDateString()
                
                return (
                  <div key={index} className={`p-3 rounded-xl border-2 ${
                    isToday ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          isToday ? 'text-red-700' : 'text-gray-900'
                        }`}>
                          {date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric' })}
                        </span>
                        {isToday && (
                          <span className="px-2 py-1 bg-red-200 text-red-700 text-xs rounded-full font-medium">
                            Today
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{dayEvents.length} events</span>
                    </div>
                    
                    {dayEvents.length === 0 ? (
                      <p className="text-xs text-gray-500">No events</p>
                    ) : (
                      <div className="space-y-2">
                        {dayEvents.map((event) => (
                          <div key={event.id} className={`p-2 rounded-lg border ${getCategoryColor(event.category)}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{getCategoryIcon(event.category)}</span>
                                <div>
                                  <h4 className="text-sm font-medium">{event.title}</h4>
                                  {event.time && (
                                    <p className="text-xs opacity-75">{event.time}</p>
                                  )}
                                </div>
                              </div>
                              {event.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-600 fill-current" />
                              ) : event.urgent ? (
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Month View */}
          {viewMode === 'month' && (
            <div>
              {/* Month header with day names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center py-2">
                    <span className="text-xs font-medium text-gray-500">{day}</span>
                  </div>
                ))}
              </div>

              {/* Month grid */}
              <div className="grid grid-cols-7 gap-1">
                {getMonthDays().map((date, index) => {
                  const dayEvents = getEventsForDate(date)
                  const isToday = date.toDateString() === new Date().toDateString()
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                  
                  return (
                    <div 
                      key={index} 
                      className={`min-h-[80px] p-1 border rounded-lg transition-colors ${
                        isToday 
                          ? 'border-red-200 bg-red-50' 
                          : isCurrentMonth 
                            ? 'border-gray-200 bg-white hover:bg-gray-50' 
                            : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${
                            isToday 
                              ? 'text-red-700 font-semibold' 
                              : isCurrentMonth 
                                ? 'text-gray-900' 
                                : 'text-gray-400'
                          }`}>
                            {date.getDate()}
                          </span>
                          {isToday && (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div 
                              key={event.id} 
                              className={`text-xs px-1 py-0.5 rounded text-center truncate ${getCategoryColor(event.category)}`}
                              title={`${event.title}${event.time ? ` at ${event.time}` : ''}`}
                            >
                              <span className="mr-1">{getCategoryIcon(event.category)}</span>
                              {event.title.length > 8 ? event.title.substring(0, 8) + '...' : event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Premium Calendar Sync */}
        {isPremium ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Calendar Sync Active</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your events are synced with Google Calendar, Apple Calendar, and Outlook.
                </p>
                <button
                  onClick={() => window.location.href = '/dashboard/settings/calendar'}
                  className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Manage Sync Settings
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">Sync with your calendar</h3>
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  Connect Google Calendar, Apple Calendar, or Outlook to get reminders on all your devices.
                </p>
                <button
                  onClick={() => setShowPaywall(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white text-sm rounded-xl hover:bg-yellow-600 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Upgrade for Calendar Sync
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Me Time Modal */}
      {showMeTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-pink-100 to-orange-100 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Me Time Ideas</h2>
                <button
                  onClick={() => setShowMeTimeModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Quick self-care activities for busy mums
              </p>
            </div>
            
            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {meTimeActivities.map((activity) => (
                <div key={activity.id} className="p-4 bg-pink-50 rounded-xl border border-pink-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{activity.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-pink-600 font-medium">{activity.duration}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Remember: Taking care of yourself helps you take better care of your baby ✨
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Premium Paywall */}
      {showPaywall && (
        <PremiumPaywall
          trigger="calendar_sync"
          onClose={() => setShowPaywall(false)}
          onUpgrade={(planId) => window.location.href = `/premium/checkout?plan=${planId}`}
        />
      )}
    </div>
  )
}