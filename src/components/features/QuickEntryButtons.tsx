'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { TrackerService } from '@/lib/services/tracker-service'
import { QuickFeedingEntry, QuickSleepEntry, QuickDiaperEntry } from '@/types/tracker'

interface QuickEntryButtonsProps {
  childId: string
  childName: string
  onActivityAdded: () => void
}

export function QuickEntryButtons({ childId, childName, onActivityAdded }: QuickEntryButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleQuickEntry = async (type: string, entry: any) => {
    setIsLoading(type)
    setError('')

    try {
      switch (type) {
        case 'breastfeeding':
          await TrackerService.recordFeeding({
            child_id: childId,
            feeding_type: 'breast',
            started_at: new Date(),
            duration_minutes: 15, // Default 15 minutes
            ...entry
          } as QuickFeedingEntry)
          break

        case 'bottle':
          await TrackerService.recordFeeding({
            child_id: childId,
            feeding_type: 'bottle',
            started_at: new Date(),
            amount_ml: 120, // Default 120ml
            ...entry
          } as QuickFeedingEntry)
          break

        case 'diaper-wet':
          await TrackerService.recordDiaperChange({
            child_id: childId,
            diaper_type: 'wet',
            changed_at: new Date(),
            ...entry
          } as QuickDiaperEntry)
          break

        case 'diaper-dirty':
          await TrackerService.recordDiaperChange({
            child_id: childId,
            diaper_type: 'dirty',
            changed_at: new Date(),
            ...entry
          } as QuickDiaperEntry)
          break

        case 'sleep-start':
          await TrackerService.recordSleep({
            child_id: childId,
            started_at: new Date(),
            ...entry
          } as QuickSleepEntry)
          break

        default:
          throw new Error('Unknown activity type')
      }

      onActivityAdded()
    } catch (error) {
      console.error('Error recording activity:', error)
      setError('Failed to record activity')
    } finally {
      setIsLoading(null)
    }
  }

  const quickButtons = [
    {
      id: 'breastfeeding',
      label: 'Breastfeed',
      emoji: '🤱',
      color: 'bg-green-100 hover:bg-green-200 text-green-800',
      description: '15 min feeding'
    },
    {
      id: 'bottle',
      label: 'Bottle',
      emoji: '🍼',
      color: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
      description: '120ml formula'
    },
    {
      id: 'diaper-wet',
      label: 'Wet Diaper',
      emoji: '💧',
      color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
      description: 'Quick change'
    },
    {
      id: 'diaper-dirty',
      label: 'Dirty Diaper',
      emoji: '💩',
      color: 'bg-orange-100 hover:bg-orange-200 text-orange-800',
      description: 'Full change'
    },
    {
      id: 'sleep-start',
      label: 'Start Sleep',
      emoji: '😴',
      color: 'bg-purple-100 hover:bg-purple-200 text-purple-800',
      description: 'Begin nap/bedtime'
    },
    {
      id: 'tummy-time',
      label: 'Tummy Time',
      emoji: '🤸',
      color: 'bg-pink-100 hover:bg-pink-200 text-pink-800',
      description: '10 min activity'
    }
  ]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">⚡</span>
          <h3 className="font-semibold text-gray-900">Quick Track for {childName}</h3>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {quickButtons.map((button) => (
            <button
              key={button.id}
              onClick={() => handleQuickEntry(button.id, {})}
              disabled={isLoading === button.id}
              className={`p-4 rounded-lg border transition-all text-left ${button.color} ${
                isLoading === button.id ? 'opacity-50 cursor-wait' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{button.emoji}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{button.label}</div>
                  <div className="text-xs opacity-75">{button.description}</div>
                </div>
              </div>
              
              {isLoading === button.id && (
                <div className="mt-2 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Tap any button for quick entry with default values. For detailed tracking, use the full form below.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}