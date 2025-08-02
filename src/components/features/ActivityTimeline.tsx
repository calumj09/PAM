'use client'

import { ActivityWithDetails } from '@/types/tracker'
import { TrashIcon, ClockIcon } from '@heroicons/react/24/outline'

interface ActivityTimelineProps {
  activities: ActivityWithDetails[]
  onDeleteActivity: (activityId: string) => void
  childName: string
}

export function ActivityTimeline({ activities, onDeleteActivity, childName }: ActivityTimelineProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return null
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const getActivityIcon = (category: string, name: string) => {
    switch (category) {
      case 'feeding':
        if (name.includes('Breast')) return 'BF'
        if (name.includes('Bottle')) return 'BT'
        if (name.includes('Solid')) return 'SF'
        return 'FD'
      case 'sleep':
        return 'SL'
      case 'diaper':
        if (name.includes('Wet')) return 'WD'
        if (name.includes('Dirty')) return 'DD'
        return 'DP'
      case 'milestone':
        return 'MS'
      case 'health':
        return 'HL'
      case 'other':
        if (name.includes('Tummy')) return 'TT'
        if (name.includes('Bath')) return 'BT'
        if (name.includes('Play')) return 'PL'
        return 'OT'
      default:
        return 'OT'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'feeding': return 'border-green-200 bg-green-50'
      case 'sleep': return 'border-purple-200 bg-purple-50'
      case 'diaper': return 'border-yellow-200 bg-yellow-50'
      case 'milestone': return 'border-pink-200 bg-pink-50'
      case 'health': return 'border-red-200 bg-red-50'
      case 'other': return 'border-blue-200 bg-blue-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const renderActivityDetails = (activity: ActivityWithDetails) => {
    const details = []

    if (activity.feeding_details) {
      const fd = activity.feeding_details
      if (fd.amount_ml) details.push(`${fd.amount_ml}ml`)
      if (fd.breast_side) details.push(`${fd.breast_side} side`)
      if (fd.food_items && fd.food_items.length > 0) {
        details.push(fd.food_items.join(', '))
      }
    }

    if (activity.sleep_details) {
      const sd = activity.sleep_details
      if (sd.sleep_quality) details.push(`Quality: ${sd.sleep_quality}`)
      if (sd.wake_up_mood) details.push(`Mood: ${sd.wake_up_mood}`)
      if (sd.sleep_location) details.push(`Location: ${sd.sleep_location}`)
    }

    if (activity.diaper_details) {
      const dd = activity.diaper_details
      if (dd.consistency) details.push(`Consistency: ${dd.consistency}`)
      if (dd.color) details.push(`Color: ${dd.color}`)
      if (dd.rash_present) details.push('Rash present')
    }

    if (activity.health_details) {
      const hd = activity.health_details
      if (hd.temperature_celsius) details.push(`${hd.temperature_celsius}°C`)
      if (hd.medication_name) details.push(`Medicine: ${hd.medication_name}`)
      if (hd.symptoms && hd.symptoms.length > 0) {
        details.push(`Symptoms: ${hd.symptoms.join(', ')}`)
      }
    }

    return details
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm text-center py-12 px-6">
        <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet today</h3>
        <p className="text-gray-600">
          Use the quick entry buttons above to start tracking {childName}&apos;s activities
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <ClockIcon className="w-5 h-5 text-gray-500" />
        <h3 className="font-semibold text-gray-900">Today&apos;s Timeline</h3>
      </div>

      {activities.map((activity, index) => {
        const icon = getActivityIcon(
          activity.activity_type?.category || 'other',
          activity.activity_type?.name || ''
        )
        const colorClass = getCategoryColor(activity.activity_type?.category || 'other')
        const details = renderActivityDetails(activity)
        const duration = formatDuration(activity.duration_minutes)
        
        return (
          <div key={activity.id} className={`bg-white rounded-2xl shadow-sm border-l-4 p-4 ${colorClass}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">{icon}</span>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {activity.activity_type?.name || 'Unknown Activity'}
                    </h4>
                    {duration && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {duration}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {formatTime(activity.started_at)}
                    {activity.ended_at && activity.ended_at !== activity.started_at && (
                      <span> - {formatTime(activity.ended_at)}</span>
                    )}
                  </div>

                  {details.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {details.map((detail, i) => (
                        <span 
                          key={i}
                          className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        >
                          {detail}
                        </span>
                      ))}
                    </div>
                  )}

                  {activity.notes && (
                    <p className="text-sm text-gray-700 italic">
                      &quot;{activity.notes}&quot;
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => onDeleteActivity(activity.id)}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-2"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}