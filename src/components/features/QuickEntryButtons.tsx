'use client'

import { useState, useEffect } from 'react'
import { TrackerService } from '@/lib/services/tracker-service'
import { QuickFeedingEntry, QuickSleepEntry, QuickDiaperEntry, Activity } from '@/types/tracker'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

interface QuickEntryButtonsProps {
  childId: string
  childName: string
  onActivityAdded: () => void
}

interface ManualEntry {
  type: 'feeding' | 'sleep' | 'tummy_time' | 'medicine'
  show: boolean
}

interface QuickFeedingModal {
  show: boolean
}

export function QuickEntryButtons({ childId, childName, onActivityAdded }: QuickEntryButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [activeSleep, setActiveSleep] = useState<Activity | null>(null)
  const [manualEntry, setManualEntry] = useState<ManualEntry>({ type: 'feeding', show: false })
  const [quickFeedingModal, setQuickFeedingModal] = useState<QuickFeedingModal>({ show: false })
  
  // Manual entry form states
  const [feedingType, setFeedingType] = useState<'breast' | 'bottle' | 'solid'>('bottle')
  const [feedingAmount, setFeedingAmount] = useState(120)
  const [feedingDuration, setFeedingDuration] = useState(15)
  const [sleepStartTime, setSleepStartTime] = useState('')
  const [sleepEndTime, setSleepEndTime] = useState('')
  const [tummyTimeDuration, setTummyTimeDuration] = useState(10)
  const [medicineName, setMedicineName] = useState('')
  const [medicineDosage, setMedicineDosage] = useState('')
  const [medicineType, setMedicineType] = useState<'medicine' | 'vitamin'>('medicine')

  useEffect(() => {
    loadActiveSleep()
  }, [childId])

  const loadActiveSleep = async () => {
    try {
      const activeSessions = await TrackerService.getActiveSleepSessions(childId)
      setActiveSleep(activeSessions[0] || null)
    } catch (error) {
      console.error('Error loading active sleep sessions:', error)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleQuickEntry = async (type: string, entry: any) => {
    setIsLoading(type)
    setError('')

    try {
      switch (type) {
        case 'feeding':
          // Show quick feeding modal instead of recording immediately
          setQuickFeedingModal({ show: true })
          setIsLoading(null) // Clear loading state
          return

        case 'nappy-wet':
          await TrackerService.recordNappyChange({
            child_id: childId,
            diaper_type: 'wet',
            changed_at: new Date(),
            ...entry
          } as QuickDiaperEntry)
          break

        case 'nappy-dirty':
          await TrackerService.recordNappyChange({
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
          await loadActiveSleep() // Refresh active sleep
          break

        case 'tummy-time':
          await TrackerService.recordTummyTime({
            child_id: childId,
            duration_minutes: 10,
            started_at: new Date(),
            ...entry
          })
          break

        case 'medicine':
          // Show medicine entry modal
          setManualEntry({ type: 'medicine', show: true })
          setIsLoading(null)
          return

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

  const handleStopSleep = async () => {
    if (!activeSleep) return
    
    setIsLoading('stop-sleep')
    try {
      await TrackerService.endSleepSession(activeSleep.id)
      setActiveSleep(null)
      onActivityAdded()
    } catch (error) {
      console.error('Error stopping sleep:', error)
      setError('Failed to stop sleep session')
    } finally {
      setIsLoading(null)
    }
  }

  const handleManualFeeding = async () => {
    setIsLoading('manual-feeding')
    try {
      const entry: QuickFeedingEntry = {
        child_id: childId,
        feeding_type: feedingType,
        started_at: new Date(),
        ...(feedingType === 'bottle' && { amount_ml: feedingAmount }),
        ...(feedingType !== 'solid' && { duration_minutes: feedingDuration })
      }
      
      await TrackerService.recordFeeding(entry)
      setManualEntry({ type: 'feeding', show: false })
      onActivityAdded()
    } catch (error) {
      console.error('Error recording manual feeding:', error)
      setError('Failed to record feeding')
    } finally {
      setIsLoading(null)
    }
  }

  const handleManualSleep = async () => {
    setIsLoading('manual-sleep')
    try {
      const startTime = sleepStartTime ? new Date(`${new Date().toDateString()} ${sleepStartTime}`) : new Date()
      const endTime = sleepEndTime ? new Date(`${new Date().toDateString()} ${sleepEndTime}`) : undefined

      const entry: QuickSleepEntry = {
        child_id: childId,
        started_at: startTime,
        ended_at: endTime
      }
      
      await TrackerService.recordSleep(entry)
      setManualEntry({ type: 'sleep', show: false })
      setSleepStartTime('')
      setSleepEndTime('')
      onActivityAdded()
    } catch (error) {
      console.error('Error recording manual sleep:', error)
      setError('Failed to record sleep')
    } finally {
      setIsLoading(null)
    }
  }

  const handleManualTummyTime = async () => {
    setIsLoading('manual-tummy-time')
    try {
      await TrackerService.recordTummyTime({
        child_id: childId,
        duration_minutes: tummyTimeDuration,
        started_at: new Date()
      })
      
      setManualEntry({ type: 'tummy_time', show: false })
      onActivityAdded()
    } catch (error) {
      console.error('Error recording tummy time:', error)
      setError('Failed to record tummy time')
    } finally {
      setIsLoading(null)
    }
  }

  const handleQuickFeeding = async (type: 'breast' | 'bottle' | 'solid') => {
    setIsLoading('quick-feeding')
    try {
      const entry: QuickFeedingEntry = {
        child_id: childId,
        feeding_type: type,
        started_at: new Date(),
        ...(type === 'bottle' && { amount_ml: 120 }),
        ...(type !== 'solid' && { duration_minutes: type === 'breast' ? 15 : 10 })
      }
      
      await TrackerService.recordFeeding(entry)
      setQuickFeedingModal({ show: false })
      onActivityAdded()
    } catch (error) {
      console.error('Error recording quick feeding:', error)
      setError('Failed to record feeding')
    } finally {
      setIsLoading(null)
    }
  }

  const handleMedicineEntry = async () => {
    setIsLoading('manual-medicine')
    try {
      const supabase = createClient()
      
      // Record as a simple activity with medicine details
      const { error } = await supabase
        .from('simple_activities')
        .insert({
          child_id: childId,
          activity_type: medicineType,
          started_at: new Date().toISOString(),
          ended_at: new Date().toISOString(), // Instant activity
          notes: `${medicineName} - ${medicineDosage}`,
          metadata: {
            medicine_name: medicineName,
            dosage: medicineDosage,
            type: medicineType
          }
        })

      if (error) throw error

      setManualEntry({ type: 'medicine', show: false })
      setMedicineName('')
      setMedicineDosage('')
      onActivityAdded()
    } catch (error) {
      console.error('Error recording medicine:', error)
      setError('Failed to record medicine')
    } finally {
      setIsLoading(null)
    }
  }

  const quickButtons = [
    {
      id: 'feeding',
      label: 'Feed Baby',
      emoji: '',
      color: 'bg-green-100 hover:bg-green-200 text-green-800',
      description: 'Breast/bottle/solid'
    },
    {
      id: 'nappy-wet',
      label: 'Wet Nappy',
      emoji: '',
      color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
      description: 'Quick change'
    },
    {
      id: 'nappy-dirty',
      label: 'Dirty Nappy',
      emoji: '',
      color: 'bg-orange-100 hover:bg-orange-200 text-orange-800',
      description: 'Full change'
    },
    {
      id: 'sleep-start',
      label: 'Start Sleep',
      emoji: '',
      color: 'bg-purple-100 hover:bg-purple-200 text-purple-800',
      description: 'Begin nap/bedtime'
    },
    {
      id: 'tummy-time',
      label: 'Tummy Time',
      emoji: '',
      color: 'bg-pink-100 hover:bg-pink-200 text-pink-800',
      description: '10 min activity'
    },
    {
      id: 'medicine',
      label: 'Medicine',
      emoji: '',
      color: 'bg-red-100 hover:bg-red-200 text-red-800',
      description: 'Medicine/vitamin'
    }
  ]

  const getCurrentTime = () => {
    return new Date().toTimeString().slice(0, 5)
  }

  if (quickFeedingModal.show) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">How did you feed {childName}?</h3>
          <button 
            onClick={() => setQuickFeedingModal({ show: false })}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => handleQuickFeeding('breast')}
            disabled={isLoading === 'quick-feeding'}
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors text-left"
          >
            <span className="text-2xl"></span>
            <div>
              <div className="font-medium text-green-800">Breastfeeding</div>
              <div className="text-sm text-green-600">Default: 15 minutes</div>
            </div>
          </button>

          <button
            onClick={() => handleQuickFeeding('bottle')}
            disabled={isLoading === 'quick-feeding'}
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors text-left"
          >
            <span className="text-2xl"></span>
            <div>
              <div className="font-medium text-blue-800">Bottle Feeding</div>
              <div className="text-sm text-blue-600">Default: 120ml, 10 minutes</div>
            </div>
          </button>

          <button
            onClick={() => handleQuickFeeding('solid')}
            disabled={isLoading === 'quick-feeding'}
            className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-colors text-left"
          >
            <span className="text-2xl"></span>
            <div>
              <div className="font-medium text-orange-800">Solid Food</div>
              <div className="text-sm text-orange-600">Meal or snack time</div>
            </div>
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              setQuickFeedingModal({ show: false })
              setManualEntry({ type: 'feeding', show: true })
            }}
            className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Need custom times/amounts? Use manual entry
          </button>
        </div>

        {isLoading === 'quick-feeding' && (
          <div className="mt-4 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-pam-red border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    )
  }

  if (manualEntry.show) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            {manualEntry.type === 'feeding' && 'Record Feeding'}
            {manualEntry.type === 'sleep' && 'Record Sleep'}
            {manualEntry.type === 'tummy_time' && 'Record Tummy Time'}
            {manualEntry.type === 'medicine' && 'Record Medicine/Vitamin'}
          </h3>
          <button 
            onClick={() => setManualEntry({ ...manualEntry, show: false })}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {manualEntry.type === 'feeding' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['bottle', 'breast', 'solid'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFeedingType(type)}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      feedingType === type
                        ? 'bg-pam-red text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'bottle' && ' Bottle'}
                    {type === 'breast' && ' Breast'}
                    {type === 'solid' && ' Solid'}
                  </button>
                ))}
              </div>
            </div>

            {feedingType === 'bottle' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (ml)</label>
                <input
                  type="number"
                  value={feedingAmount}
                  onChange={(e) => setFeedingAmount(Number(e.target.value))}
                  min="1"
                  max="500"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                />
              </div>
            )}

            {feedingType !== 'solid' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={feedingDuration}
                  onChange={(e) => setFeedingDuration(Number(e.target.value))}
                  min="1"
                  max="120"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                />
              </div>
            )}

            <Button
              onClick={handleManualFeeding}
              disabled={isLoading === 'manual-feeding'}
              className="w-full bg-pam-red hover:bg-pam-red/90 text-white"
            >
              {isLoading === 'manual-feeding' ? 'Saving...' : 'Save Feeding'}
            </Button>
          </div>
        )}

        {manualEntry.type === 'sleep' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={sleepStartTime || getCurrentTime()}
                onChange={(e) => setSleepStartTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time (optional)</label>
              <input
                type="time"
                value={sleepEndTime}
                onChange={(e) => setSleepEndTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty if sleep is ongoing</p>
            </div>

            <Button
              onClick={handleManualSleep}
              disabled={isLoading === 'manual-sleep'}
              className="w-full bg-pam-red hover:bg-pam-red/90 text-white"
            >
              {isLoading === 'manual-sleep' ? 'Saving...' : 'Save Sleep'}
            </Button>
          </div>
        )}

        {manualEntry.type === 'tummy_time' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={tummyTimeDuration}
                onChange={(e) => setTummyTimeDuration(Number(e.target.value))}
                min="1"
                max="60"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
              />
            </div>

            <Button
              onClick={handleManualTummyTime}
              disabled={isLoading === 'manual-tummy-time'}
              className="w-full bg-pam-red hover:bg-pam-red/90 text-white"
            >
              {isLoading === 'manual-tummy-time' ? 'Saving...' : 'Save Tummy Time'}
            </Button>
          </div>
        )}

        {manualEntry.type === 'medicine' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(['medicine', 'vitamin'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setMedicineType(type)}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      medicineType === type
                        ? 'bg-pam-red text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'medicine' && ' Medicine'}
                    {type === 'vitamin' && ' Vitamin'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {medicineType === 'medicine' ? 'Medicine Name' : 'Vitamin Name'}
              </label>
              <input
                type="text"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                placeholder={medicineType === 'medicine' ? 'e.g. Panadol, Nurofen' : 'e.g. Vitamin D, Iron'}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
              <input
                type="text"
                value={medicineDosage}
                onChange={(e) => setMedicineDosage(e.target.value)}
                placeholder="e.g. 2.5ml, 1 tablet, 5 drops"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
              />
            </div>

            <Button
              onClick={handleMedicineEntry}
              disabled={isLoading === 'manual-medicine' || !medicineName.trim() || !medicineDosage.trim()}
              className="w-full bg-pam-red hover:bg-pam-red/90 text-white"
            >
              {isLoading === 'manual-medicine' ? 'Saving...' : `Save ${medicineType === 'medicine' ? 'Medicine' : 'Vitamin'}`}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">⚡</span>
        <h3 className="font-semibold text-gray-900">Quick Track for {childName}</h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Active Sleep Warning */}
      {activeSleep && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800"> Sleep in progress</p>
              <p className="text-xs text-purple-600">Started {new Date(activeSleep.started_at).toLocaleTimeString()}</p>
            </div>
            <Button
              onClick={handleStopSleep}
              disabled={isLoading === 'stop-sleep'}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1"
            >
              {isLoading === 'stop-sleep' ? 'Stopping...' : 'Stop Sleep'}
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {quickButtons.map((button) => (
          <button
            key={button.id}
            onClick={() => handleQuickEntry(button.id, {})}
            disabled={isLoading === button.id || (button.id === 'sleep-start' && activeSleep)}
            className={`p-4 rounded-xl border transition-all text-left ${button.color} ${
              isLoading === button.id ? 'opacity-50 cursor-wait' : ''
            } ${(button.id === 'sleep-start' && activeSleep) ? 'opacity-50 cursor-not-allowed' : ''}`}
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

      {/* Manual Entry Options */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3">Need custom times or amounts?</p>
        <div className="flex gap-2">
          <button
            onClick={() => setManualEntry({ type: 'feeding', show: true })}
            className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
             Custom Feed
          </button>
          <button
            onClick={() => setManualEntry({ type: 'sleep', show: true })}
            className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
             Custom Sleep
          </button>
          <button
            onClick={() => setManualEntry({ type: 'tummy_time', show: true })}
            className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Custom Tummy
          </button>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs text-gray-500 text-center">
          Tap any button for quick entry with default values, or use custom options for specific times/amounts.
        </p>
      </div>
    </div>
  )
}