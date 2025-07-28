'use client'

import { useState, useMemo } from 'react'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import { getMilestoneForWeek, MilestoneBubble } from '@/lib/data/milestone-bubbles'
import { MilestoneModal } from './MilestoneModal'

interface ChecklistItem {
  id: string
  title: string
  description: string
  due_date: string
  category: 'immunization' | 'registration' | 'milestone' | 'checkup' | 'appointment'
  is_completed: boolean
  completed_date: string | null
  metadata?: {
    source?: string
    [key: string]: any
  }
}

interface TimelineCalendarProps {
  checklistItems: ChecklistItem[]
  birthDate: Date
  onItemClick: (itemId: string) => void
  onItemDelete?: (itemId: string, event: React.MouseEvent) => void
  selectedChild: { id: string; name: string } | null
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  items: (ChecklistItem & { weekNumber: number })[]
  milestone?: {
    weekNumber: number
    title: string
    emoji: string
    description: string
  }
}

export function TimelineCalendar({ 
  checklistItems, 
  birthDate, 
  onItemClick, 
  onItemDelete,
  selectedChild 
}: TimelineCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneBubble | null>(null)

  const getWeekNumber = (targetDate: Date) => {
    const diffTime = targetDate.getTime() - birthDate.getTime()
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
    return Math.max(0, diffWeeks)
  }

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Get first day of month and adjust for Monday start
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    const dayOfWeek = firstDay.getDay()
    startDate.setDate(firstDay.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

    // Get last day of month
    const lastDay = new Date(year, month + 1, 0)
    const endDate = new Date(lastDay)
    const lastDayOfWeek = lastDay.getDay()
    endDate.setDate(lastDay.getDate() + (lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek))

    const days: CalendarDay[] = []
    const currentDatePointer = new Date(startDate)
    const today = new Date()

    while (currentDatePointer <= endDate) {
      const dateStr = currentDatePointer.toISOString().split('T')[0]
      const weekNumber = getWeekNumber(currentDatePointer)
      const milestone = getMilestoneForWeek(weekNumber)

      // Find items for this date
      const dayItems = checklistItems
        .filter(item => item.due_date === dateStr)
        .map(item => ({ ...item, weekNumber }))

      days.push({
        date: new Date(currentDatePointer),
        isCurrentMonth: currentDatePointer.getMonth() === month,
        isToday: currentDatePointer.toDateString() === today.toDateString(),
        items: dayItems,
        milestone: milestone ? { ...milestone, weekNumber } : undefined
      })

      currentDatePointer.setDate(currentDatePointer.getDate() + 1)
    }

    return days
  }, [currentDate, checklistItems, birthDate])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7)
      } else {
        newDate.setDate(newDate.getDate() + 7)
      }
      return newDate
    })
  }

  const getCurrentWeek = () => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    return { startOfWeek, endOfWeek }
  }

  const weekData = useMemo(() => {
    if (viewMode !== 'week') return []
    
    const { startOfWeek, endOfWeek } = getCurrentWeek()
    return calendarData.filter(day => 
      day.date >= startOfWeek && day.date <= endOfWeek
    )
  }, [calendarData, currentDate, viewMode])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'immunization': return 'bg-green-100 text-green-700 border-green-300'
      case 'registration': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'milestone': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'checkup': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'appointment': return 'bg-pink-100 text-pink-700 border-pink-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-AU', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const formatWeekRange = (start: Date, end: Date) => {
    return `${start.toLocaleDateString('en-AU', { 
      day: 'numeric', 
      month: 'short' 
    })} - ${end.toLocaleDateString('en-AU', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    })}`
  }

  if (viewMode === 'week') {
    const { startOfWeek, endOfWeek } = getCurrentWeek()
    
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Week Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">
                {formatWeekRange(startOfWeek, endOfWeek)}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => setViewMode('month')}
                  className="text-xs bg-pam-red text-white px-2 py-1 rounded-full hover:bg-pam-red/90 transition-colors"
                >
                  Switch to Month
                </button>
              </div>
            </div>

            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Week Days */}
        <div className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 pb-2">
                {day}
              </div>
            ))}
            
            {weekData.map((day, index) => (
              <div key={index} className="min-h-[120px] border border-gray-200 rounded-lg p-2">
                <div className={`text-sm font-medium mb-2 ${
                  day.isToday 
                    ? 'bg-pam-red text-white w-6 h-6 rounded-full flex items-center justify-center' 
                    : 'text-gray-900'
                }`}>
                  {day.date.getDate()}
                </div>
                
                {/* Milestone */}
                {day.milestone && (
                  <div className="mb-2">
                    <button
                      onClick={() => setSelectedMilestone(day.milestone!)}
                      className="w-full bg-purple-50 border border-purple-200 rounded p-1.5 hover:bg-purple-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs">{day.milestone.emoji}</span>
                        <span className="text-xs font-medium text-purple-700 truncate">
                          Week {day.milestone.weekNumber}
                        </span>
                      </div>
                      <div className="text-xs text-purple-600 truncate mt-1 text-left">
                        {day.milestone.title}
                      </div>
                    </button>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-1">
                  {day.items.slice(0, 3).map(item => {
                    const isDeletable = item.metadata?.source === 'optional_admin_checklist' || 
                                       item.metadata?.source === 'custom'
                    
                    return (
                      <div
                        key={item.id}
                        className={`w-full text-left p-1.5 rounded text-xs border transition-all ${
                          item.is_completed 
                            ? 'bg-green-50 border-green-200 opacity-75' 
                            : getCategoryColor(item.category)
                        } hover:shadow-sm`}
                      >
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onItemClick(item.id)}
                            className="flex items-center gap-1 flex-1 min-w-0"
                          >
                            {item.is_completed && (
                              <CheckCircleSolid className="w-3 h-3 text-green-600 flex-shrink-0" />
                            )}
                            <span className={`truncate ${item.is_completed ? 'line-through' : ''}`}>
                              {item.title}
                            </span>
                          </button>
                          {isDeletable && onItemDelete && (
                            <button
                              onClick={(e) => onItemDelete(item.id, e)}
                              className="p-0.5 rounded hover:bg-red-100 text-red-600 transition-colors flex-shrink-0"
                              title="Delete optional task"
                            >
                              <TrashIcon className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  
                  {day.items.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{day.items.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Month Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="text-center">
            <h3 className="font-semibold text-gray-900">
              {formatMonthYear(currentDate)}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setViewMode('week')}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                Week View
              </button>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-600">
                {selectedChild?.name}'s Timeline
              </span>
            </div>
          </div>

          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((day, index) => (
            <div 
              key={index} 
              className={`min-h-[80px] p-1 border border-gray-100 rounded-lg ${
                !day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'
              } ${day.isToday ? 'ring-2 ring-pam-pink' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                day.isToday 
                  ? 'bg-pam-red text-white w-6 h-6 rounded-full flex items-center justify-center text-xs' 
                  : day.isCurrentMonth 
                    ? 'text-gray-900' 
                    : 'text-gray-400'
              }`}>
                {day.date.getDate()}
              </div>

              {/* Milestone indicator */}
              {day.milestone && day.isCurrentMonth && (
                <div className="mb-1">
                  <button
                    onClick={() => setSelectedMilestone(day.milestone!)}
                    className="w-full bg-purple-50 rounded px-1 py-0.5 border border-purple-200 hover:bg-purple-100 transition-colors"
                  >
                    <div className="text-xs text-purple-700 font-medium flex items-center gap-1">
                      <span>{day.milestone.emoji}</span>
                      <span className="truncate">W{day.milestone.weekNumber}</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Items */}
              {day.isCurrentMonth && (
                <div className="space-y-0.5">
                  {day.items.slice(0, 2).map(item => {
                    const isDeletable = item.metadata?.source === 'optional_admin_checklist' || 
                                       item.metadata?.source === 'custom'
                    
                    return (
                      <div
                        key={item.id}
                        className={`w-full text-left px-1 py-0.5 rounded text-xs border transition-all ${
                          item.is_completed 
                            ? 'bg-green-50 border-green-200 opacity-75' 
                            : getCategoryColor(item.category)
                        } hover:shadow-sm`}
                      >
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onItemClick(item.id)}
                            className="flex items-center gap-1 flex-1 min-w-0"
                          >
                            {item.is_completed && (
                              <CheckCircleSolid className="w-2 h-2 text-green-600 flex-shrink-0" />
                            )}
                            <span className={`truncate ${item.is_completed ? 'line-through' : ''}`}>
                              {item.title}
                            </span>
                          </button>
                          {isDeletable && onItemDelete && (
                            <button
                              onClick={(e) => onItemDelete(item.id, e)}
                              className="p-0.5 rounded hover:bg-red-100 text-red-600 transition-colors flex-shrink-0"
                              title="Delete optional task"
                            >
                              <TrashIcon className="w-2 h-2" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  
                  {day.items.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{day.items.length - 2}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded"></div>
            <span className="text-gray-600">Milestones</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span className="text-gray-600">Immunisations</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
            <span className="text-gray-600">Registration</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
            <span className="text-gray-600">Checkups</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-pink-100 border border-pink-200 rounded"></div>
            <span className="text-gray-600">Appointments</span>
          </div>
        </div>
      </div>

      {/* Milestone Detail Modal */}
      {selectedMilestone && (
        <MilestoneModal
          milestone={selectedMilestone}
          onClose={() => setSelectedMilestone(null)}
        />
      )}
    </div>
  )
}