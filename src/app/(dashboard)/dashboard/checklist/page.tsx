'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { australianChecklistItems, calculateDueDate, getChecklistForChild } from '@/lib/data/checklist-items'
import { getMilestoneForWeek, getUpcomingMilestones } from '@/lib/data/milestone-bubbles'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon,
  CalendarDaysIcon,
  BeakerIcon,
  UserGroupIcon,
  PlusIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
}

interface CompletedItem {
  id: string;
  child_id: string;
  checklist_item_id: string;
  completed_at: string;
}

export default function ChecklistPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [completedItems, setCompletedItems] = useState<CompletedItem[]>([])
  const [userState, setUserState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedWeeks, setExpandedWeeks] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load user profile for state information
      const { data: profileData } = await supabase
        .from('profiles')
        .select('state_territory')
        .eq('id', user.id)
        .single()
      
      if (profileData?.state_territory) {
        setUserState(profileData.state_territory)
      }

      // Load children
      const { data: childrenData } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('date_of_birth', { ascending: true })

      if (childrenData && childrenData.length > 0) {
        setChildren(childrenData)
        setSelectedChild(childrenData[0])
        
        // Load completed items from checklist_items table
        const { data: completedData } = await supabase
          .from('checklist_items')
          .select('*')
          .eq('child_id', childrenData[0].id)
          .eq('is_completed', true)

        setCompletedItems(completedData || [])
        
        // Auto-expand current week
        const currentWeek = getCurrentWeek(new Date(childrenData[0].date_of_birth))
        setExpandedWeeks([`week-${currentWeek}`])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleItemCompletion = async (itemId: string) => {
    if (!selectedChild) return

    const existingCompletion = completedItems.find(
      ci => ci.child_id === selectedChild.id && ci.checklist_item_id === itemId
    )

    if (existingCompletion) {
      // Remove completion
      await supabase
        .from('checklist_completions')
        .delete()
        .eq('id', existingCompletion.id)

      setCompletedItems(prev => prev.filter(ci => ci.id !== existingCompletion.id))
    } else {
      // Add completion
      const { data } = await supabase
        .from('checklist_completions')
        .insert({
          child_id: selectedChild.id,
          checklist_item_id: itemId,
          completed_at: new Date().toISOString()
        })
        .select()
        .single()

      if (data) {
        setCompletedItems(prev => [...prev, data])
      }
    }
  }

  const toggleWeek = (weekId: string) => {
    setExpandedWeeks(prev => 
      prev.includes(weekId) 
        ? prev.filter(w => w !== weekId)
        : [...prev, weekId]
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'immunization':
        return BeakerIcon
      case 'registration':
        return UserGroupIcon
      case 'milestone':
        return SparklesIcon
      case 'checkup':
        return CalendarDaysIcon
      default:
        return InformationCircleIcon
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'immunization':
        return 'bg-green-50 text-green-600 border-green-200'
      case 'registration':
        return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'milestone':
        return 'bg-purple-50 text-purple-600 border-purple-200'
      case 'checkup':
        return 'bg-orange-50 text-orange-600 border-orange-200'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const getWeekNumber = (birthDate: Date, targetDate: Date) => {
    const diffTime = targetDate.getTime() - birthDate.getTime()
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
    return Math.max(0, diffWeeks)
  }

  const getCurrentWeek = (birthDate: Date) => {
    return getWeekNumber(birthDate, new Date())
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
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

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Checklist</h1>
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No Children Added</h2>
            <p className="text-sm text-gray-600 mb-6">Add your child to see their personalised Australian immunisation and milestone checklist</p>
            <a href="/dashboard/children" className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">
              <PlusIcon className="w-5 h-5" />
              Add Your First Child
            </a>
          </div>
        </div>
      </div>
    )
  }

  const checklistItems = selectedChild ? getChecklistForChild(new Date(selectedChild.date_of_birth)) : []
  const birthDate = selectedChild ? new Date(selectedChild.date_of_birth) : new Date()

  // Group items by week
  const weeklyItems = checklistItems.reduce((acc, item) => {
    const dueDate = calculateDueDate(birthDate, item)
    const weekNumber = getWeekNumber(birthDate, dueDate)
    const weekKey = `week-${weekNumber}`
    
    if (!acc[weekKey]) {
      acc[weekKey] = {
        weekNumber,
        startDate: new Date(birthDate.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(birthDate.getTime() + weekNumber * 7 * 24 * 60 * 60 * 1000),
        items: []
      }
    }
    
    const isCompleted = completedItems.some(
      ci => ci.child_id === selectedChild?.id && ci.checklist_item_id === item.id
    )
    
    acc[weekKey].items.push({ ...item, isCompleted, dueDate })
    
    return acc
  }, {} as any)

  // Convert to sorted array
  const sortedWeeks = Object.values(weeklyItems)
    .sort((a: any, b: any) => a.weekNumber - b.weekNumber)
    .slice(0, 52) // First year only

  // Calculate stats
  const totalItems = checklistItems.length
  const completedCount = completedItems.filter(ci => ci.child_id === selectedChild?.id).length
  const completionRate = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0
  const currentWeek = getCurrentWeek(birthDate)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Timeline</h1>
          
          {/* Child Selector */}
          {children.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedChild?.id === child.id
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {child.name}
                </button>
              ))}
            </div>
          )}

          {/* State Indicator */}
          {userState && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500">Australian timeline for</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                {userState === 'NSW' ? 'New South Wales' :
                 userState === 'VIC' ? 'Victoria' :
                 userState === 'QLD' ? 'Queensland' :
                 userState === 'WA' ? 'Western Australia' :
                 userState === 'SA' ? 'South Australia' :
                 userState === 'TAS' ? 'Tasmania' :
                 userState === 'ACT' ? 'Australian Capital Territory' :
                 userState === 'NT' ? 'Northern Territory' : userState}
              </span>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{completedCount} of {totalItems} completed</span>
              <span>{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-4">
        {/* Current Week Highlight */}
        <div className="bg-gradient-to-r from-pink-100 to-orange-100 rounded-2xl p-4 border border-pink-200 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">📅 Week {currentWeek}</h3>
          <p className="text-sm text-gray-700">
            {selectedChild?.name} is {currentWeek} week{currentWeek !== 1 ? 's' : ''} old
          </p>
        </div>

        {/* What to Expect - Milestone Bubble */}
        {(() => {
          const currentMilestone = getMilestoneForWeek(currentWeek);
          const upcomingMilestones = getUpcomingMilestones(currentWeek, 3);
          
          if (!currentMilestone && upcomingMilestones.length === 0) return null;
          
          const milestoneToShow = currentMilestone || upcomingMilestones[0];
          const isUpcoming = !currentMilestone;
          
          return (
            <div className={`rounded-2xl p-4 border mb-6 ${
              isUpcoming 
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' 
                : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">{milestoneToShow.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {isUpcoming ? 'Coming Up' : 'What to Expect'}: {milestoneToShow.title}
                    </h3>
                    {isUpcoming && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Week {milestoneToShow.weekNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{milestoneToShow.description}</p>
                  <p className="text-xs text-gray-600 italic">💝 {milestoneToShow.encouragement}</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Weekly Timeline */}
        {sortedWeeks.map((week: any) => {
          const weekKey = `week-${week.weekNumber}`
          const isCurrentWeek = week.weekNumber === currentWeek
          const isPastWeek = week.weekNumber < currentWeek
          const completedInWeek = week.items.filter((item: any) => item.isCompleted).length
          const totalInWeek = week.items.length
          const weekMilestone = getMilestoneForWeek(week.weekNumber)
          
          if (totalInWeek === 0 && !weekMilestone) return null
          
          return (
            <div 
              key={weekKey} 
              className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 transition-all ${
                isCurrentWeek 
                  ? 'border-pink-300 shadow-md' 
                  : isPastWeek
                    ? 'border-green-200'
                    : 'border-gray-100'
              }`}
            >
              <button
                onClick={() => toggleWeek(weekKey)}
                className={`w-full px-4 py-4 flex items-center justify-between text-left transition-all ${
                  isCurrentWeek 
                    ? 'bg-gradient-to-r from-pink-50 to-orange-50' 
                    : isPastWeek && completedInWeek === totalInWeek
                      ? 'bg-green-50'
                      : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCurrentWeek 
                      ? 'bg-pink-600 text-white' 
                      : isPastWeek && completedInWeek === totalInWeek
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {week.weekNumber}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Week {week.weekNumber}
                      {isCurrentWeek && <span className="ml-2 text-pink-600">• Current</span>}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {week.startDate.toLocaleDateString('en-AU', { 
                        day: 'numeric', 
                        month: 'short' 
                      })} - {week.endDate.toLocaleDateString('en-AU', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {completedInWeek}/{totalInWeek}
                    </div>
                    <div className={`w-16 h-1.5 rounded-full ${
                      isPastWeek && completedInWeek === totalInWeek 
                        ? 'bg-green-600' 
                        : 'bg-gray-200'
                    }`}>
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCurrentWeek ? 'bg-pink-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${totalInWeek > 0 ? (completedInWeek / totalInWeek) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${
                    expandedWeeks.includes(weekKey) ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>
              
              {expandedWeeks.includes(weekKey) && (
                <div className="p-4 space-y-3 bg-gray-50">
                  {/* Milestone Information */}
                  {weekMilestone && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-200 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="text-lg">{weekMilestone.emoji}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-purple-900 mb-1">
                            Development Milestone: {weekMilestone.title}
                          </h4>
                          <p className="text-sm text-purple-700 mb-2">{weekMilestone.description}</p>
                          <p className="text-xs text-purple-600 italic">💝 {weekMilestone.encouragement}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {week.items.map((item: any) => {
                    const Icon = getCategoryIcon(item.category)
                    const now = new Date()
                    const daysPastDue = Math.floor((now.getTime() - item.dueDate.getTime()) / (1000 * 60 * 60 * 24))
                    const isOverdue = daysPastDue > 0 && !item.isCompleted
                    
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItemCompletion(item.id)}
                        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                          item.isCompleted 
                            ? 'bg-white border-green-200 opacity-75' 
                            : isOverdue
                              ? 'bg-red-50 border-red-200 hover:bg-red-100'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 rounded-xl border ${getCategoryColor(item.category)} ${
                          item.isCompleted ? 'opacity-50' : ''
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold text-gray-900 ${
                            item.isCompleted ? 'line-through' : ''
                          }`}>
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <p className={`text-xs font-medium ${
                              isOverdue 
                                ? 'text-red-600' 
                                : item.isCompleted
                                  ? 'text-green-600'
                                  : 'text-gray-500'
                            }`}>
                              {item.isCompleted ? 'Completed' : 
                               isOverdue ? `${daysPastDue} day${daysPastDue > 1 ? 's' : ''} overdue` :
                               `Due: ${item.dueDate.toLocaleDateString('en-AU', { 
                                 day: 'numeric', 
                                 month: 'short' 
                               })}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 mt-1">
                          {item.isCompleted ? (
                            <CheckCircleSolid className="w-6 h-6 text-green-600" />
                          ) : (
                            <div className={`w-6 h-6 border-2 rounded-full ${
                              isOverdue ? 'border-red-400' : 'border-gray-300'
                            }`}></div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
        
        {sortedWeeks.length === 0 && (
          <div className="text-center py-8">
            <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No timeline items found for {selectedChild?.name}</p>
          </div>
        )}
      </div>
    </div>
  )
}