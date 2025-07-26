'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { australianChecklistItems, calculateDueDate, getChecklistForChild } from '@/lib/data/checklist-items'
import { 
  HeartIcon,
  ClockIcon,
  CheckCircleIcon,
  SparklesIcon,
  CalendarDaysIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
}

export default function TodayPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
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
      return <SunIcon className="w-6 h-6 text-yellow-500" />
    }
    return <MoonIcon className="w-6 h-6 text-indigo-400" />
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
    "Remember to stay hydrated today 💧",
    "You're doing an amazing job, mama ✨",
    "Take 10 minutes for yourself when you can 🧘‍♀️",
    "Rest when baby rests - you deserve it 💤",
    "Ask for help when you need it - you're not alone 🤗"
  ]

  const randomNudge = mTimeNudges[Math.floor(Math.random() * mTimeNudges.length)]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 p-4">
        <div className="max-w-md mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const todaysTasks = getTodaysTasks()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getTimeOfDayIcon()}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {getGreeting()}, Mama!
                </h1>
                <p className="text-sm text-gray-600">
                  {currentTime.toLocaleDateString('en-AU', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Baby Info */}
          {selectedChild && (
            <div className="bg-gradient-to-r from-pink-100 to-orange-100 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedChild.name}</h2>
                  <p className="text-sm text-gray-600">{getChildAge(selectedChild.date_of_birth)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Me Time Nudge */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 border border-purple-200">
          <div className="flex items-start gap-3">
            <HeartIcon className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Me Time Reminder</h3>
              <p className="text-sm text-gray-700">{randomNudge}</p>
            </div>
          </div>
        </div>

        {/* Today's Focus */}
        {todaysTasks.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">Today's Focus</h2>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {todaysTasks.map((task, index) => {
                const dueDate = selectedChild ? calculateDueDate(new Date(selectedChild.date_of_birth), task) : new Date()
                const isOverdue = dueDate < new Date()
                
                return (
                  <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all">
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex-shrink-0 mt-1"></div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <p className={`text-xs font-medium mt-2 ${
                        isOverdue ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {isOverdue ? 'Overdue' : `Due ${dueDate.toLocaleDateString('en-AU')}`}
                      </p>
                    </div>
                  </div>
                )
              })}
              
              <a 
                href="/dashboard/checklist"
                className="block text-center py-3 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View Full Timeline →
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <CheckCircleSolid className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">You're All Caught Up!</h3>
            <p className="text-sm text-gray-600">No urgent tasks for today. Great job, mama!</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          </div>
          
          <div className="p-4 grid grid-cols-2 gap-3">
            <a href="/dashboard/checklist" className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-all">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Timeline</span>
            </a>
            
            <a href="/dashboard/info" className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-all">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Admin Help</span>
            </a>
            
            <a href="/dashboard/tracker" className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-all">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <HeartIcon className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Baby Log</span>
            </a>
            
            <a href="/dashboard/growth" className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-all">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Growth</span>
            </a>
          </div>
        </div>

        {/* Gentle Encouragement */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4 border border-yellow-200">
          <div className="text-center">
            <SparklesIcon className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">You're Doing Amazing</h3>
            <p className="text-sm text-gray-700">
              Being a new mum is hard work. Every small step counts, and you're handling it beautifully. 
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}