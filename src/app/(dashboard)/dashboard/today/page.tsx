'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { australianChecklistItems, calculateDueDate, getChecklistForChild } from '@/lib/data/checklist-items'
import { 
  Heart,
  Clock,
  CheckCircle,
  Sparkles,
  Calendar,
  Sun,
  Moon,
  ChevronDown
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
  
  const supabase = createClient()

  useEffect(() => {
    loadData()
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

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
      return daysDiff >= -1 && daysDiff <= 7 // Tasks due within a week
    }).slice(0, 3) // Show max 3 tasks
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

        {/* Today's Focus */}
        {todaysTasks.length > 0 ? (
          <div className="content-card">
            <div className="px-4 py-3 bg-muted/50 -m-8 mb-4 rounded-t-2xl border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-foreground">Today's Focus</h2>
                </div>
                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {todaysTasks.length} gentle reminders
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Take these one at a time - no pressure!</p>
            </div>
            
            <div className="space-y-3">
              {todaysTasks.map((task, index) => {
                const dueDate = selectedChild ? calculateDueDate(new Date(selectedChild.date_of_birth), task) : new Date()
                const isOverdue = dueDate < new Date()
                
                return (
                  <button 
                    key={task.id} 
                    className="w-full flex items-start gap-3 p-4 rounded-xl hover:bg-muted/50 active:bg-muted transition-all duration-200 text-left touch-manipulation min-h-[80px]"
                    onClick={() => {
                      // Add gentle haptic feedback simulation
                      if (navigator.vibrate) navigator.vibrate(10)
                    }}
                  >
                    <div className="w-7 h-7 border-2 border-border rounded-full flex-shrink-0 mt-1 hover:border-primary transition-colors duration-200"></div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground leading-snug">{task.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{task.description}</p>
                      <p className={`text-xs font-medium mt-2 inline-flex items-center gap-1 ${
                        isOverdue ? 'text-error' : 'text-muted-foreground'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {isOverdue ? 'When you can' : `Due ${dueDate.toLocaleDateString('en-AU')}`}
                      </p>
                    </div>
                  </button>
                )
              })}
              
              <a 
                href={`/dashboard/checklist${selectedChild ? `?child=${selectedChild.id}` : ''}`}
                className="block text-center py-3 text-primary hover:text-primary-dark font-medium text-sm"
              >
                View Full Timeline →
              </a>
            </div>
          </div>
        ) : (
          <div className="content-card text-center">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3 fill-current" />
            <h3 className="font-semibold text-foreground mb-1">You're All Caught Up!</h3>
            <p className="text-sm text-muted-foreground">No urgent tasks for today. Great job!</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="content-card">
          <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <a href={`/dashboard/checklist${selectedChild ? `?child=${selectedChild.id}` : ''}`} className="flex flex-col items-center gap-3 p-5 rounded-xl hover:bg-muted/50 active:bg-muted transition-all duration-200 touch-manipulation min-h-[100px]">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground text-center">Timeline</span>
            </a>
            
            <a href="/dashboard/info" className="flex flex-col items-center gap-3 p-5 rounded-xl hover:bg-muted/50 active:bg-muted transition-all duration-200 touch-manipulation min-h-[100px]">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center hover:bg-success/20 transition-colors">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <span className="text-sm font-medium text-foreground text-center">Local Info</span>
            </a>
            
            <a href={`/dashboard/tracker${selectedChild ? `?child=${selectedChild.id}` : ''}`} className="flex flex-col items-center gap-3 p-5 rounded-xl hover:bg-muted/50 active:bg-muted transition-all duration-200 touch-manipulation min-h-[100px]">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground text-center">Tracker</span>
            </a>
            
            <a href={`/dashboard/growth${selectedChild ? `?child=${selectedChild.id}` : ''}`} className="flex flex-col items-center gap-3 p-5 rounded-xl hover:bg-muted/50 active:bg-muted transition-all duration-200 touch-manipulation min-h-[100px]">
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center hover:bg-warning/20 transition-colors">
                <Sparkles className="w-6 h-6 text-warning" />
              </div>
              <span className="text-sm font-medium text-foreground text-center">Growth</span>
            </a>
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