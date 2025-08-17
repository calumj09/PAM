'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { australianChecklistItems, calculateDueDate, getChecklistForChild } from '@/lib/data/checklist-items'
import { TrackerAnalyticsService, SleepPattern, FeedingPattern, NappyPattern } from '@/lib/services/tracker-analytics-service'
import { 
  Heart,
  Clock,
  CheckCircle,
  Sparkles,
  Calendar,
  Sun,
  Moon,
  ChevronDown,
  MapPin,
  Phone,
  Scale,
  Baby,
  Droplets
} from 'lucide-react'

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
}

export default function TodayPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [todayStats, setTodayStats] = useState<{
    sleep: SleepPattern | null
    feeding: FeedingPattern | null
    nappy: NappyPattern | null
  }>({ sleep: null, feeding: null, nappy: null })
  
  const supabase = createClient()

  useEffect(() => {
    loadData()
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (selectedChild) {
      loadTodayStats()
    }
  }, [selectedChild])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, first_name')
        .eq('id', user.id)
        .single()

      if (profile) {
        const displayName = profile.first_name || profile.full_name || 'there'
        setUserName(displayName)
      } else {
        setUserName('there')
      }

      const { data: childrenData } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('date_of_birth', { ascending: true })

      if (childrenData && childrenData.length > 0) {
        setChildren(childrenData)
        setSelectedChild(childrenData[0])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loadTodayStats = async () => {
    if (!selectedChild) return
    
    try {
      const [sleep, feeding, nappy] = await Promise.all([
        TrackerAnalyticsService.analyzeSleepPatterns(selectedChild.id, 3), // Last 3 days
        TrackerAnalyticsService.analyzeFeedingPatterns(selectedChild.id, 3),
        TrackerAnalyticsService.analyzeNappyPatterns(selectedChild.id, 3)
      ])
      
      setTodayStats({ sleep, feeding, nappy })
    } catch (error) {
      console.error('Error loading today stats:', error)
      // Don't set error state, just fail silently for this optional feature
    }
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getTimeOfDayIcon = () => {
    const hour = currentTime.getHours()
    if (hour >= 6 && hour < 18) {
      return <Sun className="w-6 h-6 text-warning" />
    }
    return <Moon className="w-6 h-6 text-primary" />
  }

  const getTodaysTasks = () => {
    if (!selectedChild) return []
    
    const checklistItems = getChecklistForChild(new Date(selectedChild.date_of_birth))
    const today = new Date()
    
    return checklistItems.filter(item => {
      const dueDate = calculateDueDate(new Date(selectedChild.date_of_birth), item)
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff >= -7 && daysDiff <= 7 // Tasks due within a week (past or future)
    }).sort((a, b) => {
      // Sort by due date, closest first
      const aDueDate = calculateDueDate(new Date(selectedChild.date_of_birth), a)
      const bDueDate = calculateDueDate(new Date(selectedChild.date_of_birth), b)
      return aDueDate.getTime() - bDueDate.getTime()
    }).slice(0, 4) // Show max 4 tasks for the week
  }

  const getChildAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - birth.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 7) return `${diffDays} days old`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks old`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months old`
    return `${Math.floor(diffDays / 365)} years old`
  }

  const mTimeNudges = [
    "Remember to stay hydrated today - your body is working hard",
    "You're doing an amazing job - even when it doesn't feel like it",
    "Take 10 minutes for yourself when you can - you deserve it",
    "Rest when baby rests - there's no shame in prioritising sleep",
    "Ask for help when you need it - you're not alone in this journey",
    "Have you eaten something nourishing today? Your body needs fuel too",
    "It's okay to feel overwhelmed - these early days are intense",
    "Take a moment to breathe deeply - you're stronger than you know",
    "Your best is enough, even on the hardest days",
    "Remember: progress over perfection, always"
  ]

  const randomNudge = mTimeNudges[Math.floor(Math.random() * mTimeNudges.length)]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  const todaysTasks = getTodaysTasks()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getTimeOfDayIcon()}
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {getGreeting()}{userName ? `, ${userName}` : ''}!
                </h1>
                <p className="text-sm text-muted-foreground">
                  {currentTime.toLocaleDateString('en-AU', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Child Selection & Info */}
          {selectedChild && (
            <div className="bg-primary/10 rounded-2xl p-4">
              {children.length > 1 ? (
                <div className="mb-3">
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Viewing timeline for:</label>
                  <div className="relative">
                    <select
                      value={selectedChild.id}
                      onChange={(e) => {
                        const child = children.find(c => c.id === e.target.value)
                        if (child) setSelectedChild(child)
                      }}
                      className="w-full appearance-none bg-surface/80 border border-border rounded-lg px-3 py-2 pr-8 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      {children.map((child) => (
                        <option key={child.id} value={child.id}>
                          {child.name} ({getChildAge(child.date_of_birth)})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              ) : null}
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">{selectedChild.name}</h2>
                  <p className="text-sm text-muted-foreground">{getChildAge(selectedChild.date_of_birth)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Me Time Nudge */}
        <div className="content-card">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Me Time Reminder</h3>
              <p className="text-sm text-muted-foreground">{randomNudge}</p>
            </div>
          </div>
        </div>


        {/* Today's Summary */}
        {selectedChild && (todayStats.sleep || todayStats.feeding || todayStats.nappy) && (
          <div className="content-card">
            <h2 className="font-semibold text-foreground mb-4">Recent Patterns</h2>
            
            <div className="grid grid-cols-3 gap-3">
              {/* Sleep Summary */}
              {todayStats.sleep && (
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-blue-900">
                    {Math.round(todayStats.sleep.totalSleepPerDay / 60 * 10) / 10}h
                  </div>
                  <div className="text-xs text-blue-700">Daily Sleep</div>
                  <div className="text-xs text-blue-600 mt-1">
                    {todayStats.sleep.averageNapsPerDay} naps
                  </div>
                </div>
              )}
              
              {/* Feeding Summary */}
              {todayStats.feeding && (
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-green-900">
                    {todayStats.feeding.feedingsPerDay}
                  </div>
                  <div className="text-xs text-green-700">Feeds/Day</div>
                  <div className="text-xs text-green-600 mt-1">
                    {Math.round(todayStats.feeding.averageFeedingInterval / 60 * 10) / 10}h apart
                  </div>
                </div>
              )}
              
              {/* Nappy Summary */}
              {todayStats.nappy && (
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-orange-900">
                    {todayStats.nappy.averageNappiesPerDay}
                  </div>
                  <div className="text-xs text-orange-700">Changes/Day</div>
                  <div className="text-xs text-orange-600 mt-1">
                    {todayStats.nappy.longestDryStretch}h dry
                  </div>
                </div>
              )}
            </div>
            
            <a 
              href={`/dashboard/tracker${selectedChild ? `?child=${selectedChild.id}` : ''}`}
              className="block text-center mt-3 py-2 text-sm text-primary hover:text-primary-dark font-medium rounded-lg hover:bg-primary/5 transition-colors"
            >
              View Full Analytics →
            </a>
          </div>
        )}

        {/* This Week's Focus */}
        <div className="content-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">This Week's Focus</h2>
            <span className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })} - {new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          
          <div className="space-y-3">
            {/* Upcoming milestones from checklist */}
            {selectedChild && getTodaysTasks().length > 0 ? (
              getTodaysTasks().slice(0, 3).map((task, index) => {
                const dueDate = calculateDueDate(new Date(selectedChild.date_of_birth), task)
                const isOverdue = dueDate < new Date()
                const daysUntil = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                
                return (
                  <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-sm leading-tight">{task.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                      <p className={`text-xs font-medium mt-2 ${
                        isOverdue ? 'text-error' : 
                        daysUntil <= 1 ? 'text-warning' : 
                        'text-muted-foreground'
                      }`}>
                        {isOverdue ? 'Overdue' : 
                         daysUntil === 0 ? 'Due today' : 
                         daysUntil === 1 ? 'Due tomorrow' : 
                         `Due in ${daysUntil} days`}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground transform -rotate-90" />
                  </div>
                )
              })
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                <h3 className="font-medium text-foreground mb-1">All caught up!</h3>
                <p className="text-sm text-muted-foreground">No urgent milestones this week. Great job!</p>
              </div>
            )}
            
            {/* Quick action to view full timeline */}
            <button 
              onClick={() => window.location.href = `/dashboard/checklist${selectedChild ? `?child=${selectedChild.id}` : ''}`}
              className="w-full mt-3 py-2 px-3 text-sm text-primary hover:text-primary-dark font-medium rounded-lg hover:bg-primary/5 transition-colors"
            >
              View Full Timeline →
            </button>
          </div>
        </div>

        {/* Daily Affirmation */}
        <div className="content-card bg-primary/5 border border-primary/20">
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">Daily Reminder</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Being a new mum is one of the hardest jobs in the world. Every small step counts, 
              every loving moment matters, and you're handling it all with more grace than you realize. 
              <span className="block mt-2 font-medium text-foreground">You are enough. You are loved. You are doing beautifully.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}