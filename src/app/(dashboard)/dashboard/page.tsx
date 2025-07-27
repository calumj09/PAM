'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Plus,
  CheckCircle,
  BarChart3,
  Calendar,
  Bell,
  Sparkles,
  Users
} from 'lucide-react'

interface DashboardStats {
  childrenCount: number
  upcomingTasks: number
  completedTasks: number
  recentActivity: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    childrenCount: 0,
    upcomingTasks: 0,
    completedTasks: 0,
    recentActivity: 0
  })
  const [userName, setUserName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserName(user.email?.split('@')[0] || 'Parent')

      // Get children count
      const { count: childrenCount } = await supabase
        .from('children')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      setStats({
        childrenCount: childrenCount || 0,
        upcomingTasks: 3, // Placeholder
        completedTasks: 12, // Placeholder
        recentActivity: 5 // Placeholder
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const quickActions = [
    {
      title: 'Track Growth',
      subtitle: 'Log measurements',
      icon: ChartBarIcon,
      href: '/dashboard/growth',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50'
    },
    {
      title: 'Log Medicine',
      subtitle: 'Record medication',
      icon: BeakerIcon,
      href: '/dashboard/medications',
      color: 'bg-green-500',
      lightColor: 'bg-green-50'
    },
    {
      title: 'Checklist',
      subtitle: `${stats.upcomingTasks} pending`,
      icon: CheckCircleIcon,
      href: '/dashboard/checklist',
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50'
    },
    {
      title: 'Family',
      subtitle: 'Manage sharing',
      icon: UserGroupIcon,
      href: '/dashboard/family',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {getGreeting()}, {userName}!
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Ready to track your little one's progress?
              </p>
            </div>
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-400" />
              {stats.upcomingTasks > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">{stats.upcomingTasks}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats.childrenCount}</div>
            <div className="text-xs text-gray-600 mt-1">Children</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
            <div className="text-xs text-gray-600 mt-1">Completed</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{stats.upcomingTasks}</div>
            <div className="text-xs text-gray-600 mt-1">Upcoming</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          
          {stats.childrenCount === 0 ? (
            <Link href="/dashboard/children">
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-dashed border-gray-200 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Add Your First Child</h3>
                <p className="text-sm text-gray-600">Start tracking your little one's development</p>
              </div>
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className={`w-10 h-10 ${action.lightColor} rounded-xl flex items-center justify-center mb-3`}>
                      <action.icon className={`w-5 h-5 ${action.color.replace('bg-', 'text-')}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{action.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{action.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Today's Schedule */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">18-month checkup</p>
                  <p className="text-xs text-gray-600">Due in 3 days</p>
                </div>
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Panadol dose</p>
                  <p className="text-xs text-gray-600">Next at 2:00 PM</p>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Milestone tracking</p>
                  <p className="text-xs text-gray-600">Log new skills</p>
                </div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            {stats.recentActivity > 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">Your activity will appear here</p>
                <p className="text-xs text-gray-500 mt-1">Start tracking to see your history</p>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">No recent activity</p>
                <p className="text-xs text-gray-500 mt-1">Start using PAM to track your progress</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}