'use client'

import { useState, useEffect } from 'react'
import { 
  MedicationService, 
  ChildMedication, 
  MedicationDose 
} from '@/lib/services/medication-service'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeSlashIcon,
  CalendarDaysIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { formatDistanceToNow, addHours, format } from 'date-fns'

interface MedicationCardProps {
  medication: ChildMedication
  onLogDose: (medication: ChildMedication) => void
  onUpdate: () => void
}

export function MedicationCard({ medication, onLogDose, onUpdate }: MedicationCardProps) {
  const [lastDose, setLastDose] = useState<MedicationDose | null>(null)
  const [nextDueTime, setNextDueTime] = useState<Date | null>(null)
  const [timeUntilNext, setTimeUntilNext] = useState<string>('')
  const [isOverdue, setIsOverdue] = useState(false)
  const [isDueSoon, setIsDueSoon] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLastDose()
    const interval = setInterval(updateTimeDisplay, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [medication.id])

  useEffect(() => {
    updateTimeDisplay()
  }, [lastDose, nextDueTime])

  const loadLastDose = async () => {
    try {
      setIsLoading(true)
      const history = await MedicationService.getMedicationHistory(
        medication.child_id,
        medication.medication_id,
        1
      )
      
      if (history.length > 0) {
        const last = history[0]
        setLastDose(last)
        
        // Calculate next due time if not as-needed
        if (!medication.is_as_needed) {
          const nextTime = addHours(new Date(last.administered_at), medication.interval_hours)
          setNextDueTime(nextTime)
        }
      } else if (!medication.is_as_needed) {
        // If no doses yet, next dose is now
        setNextDueTime(new Date())
      }
    } catch (error) {
      console.error('Error loading last dose:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateTimeDisplay = () => {
    if (!nextDueTime || medication.is_as_needed) return

    const now = new Date()
    const diffMs = nextDueTime.getTime() - now.getTime()
    
    setIsOverdue(diffMs < 0)
    setIsDueSoon(diffMs > 0 && diffMs < 30 * 60 * 1000) // Due within 30 minutes
    
    if (diffMs < 0) {
      setTimeUntilNext(`Overdue by ${formatDistanceToNow(nextDueTime)}`)
    } else {
      setTimeUntilNext(`Due in ${formatDistanceToNow(nextDueTime)}`)
    }
  }

  const handleToggleActive = async () => {
    try {
      await MedicationService.updateMedicationStatus(medication.id, !medication.is_active)
      onUpdate()
    } catch (error) {
      console.error('Error updating medication status:', error)
    }
  }

  const getMedicationTypeColor = (type?: string) => {
    const colors: Record<string, string> = {
      paracetamol: 'bg-blue-100 text-blue-800',
      ibuprofen: 'bg-orange-100 text-orange-800',
      antibiotic: 'bg-green-100 text-green-800',
      prescription: 'bg-purple-100 text-purple-800',
      vitamin: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[type || 'other'] || colors.other
  }

  const getStatusIndicator = () => {
    if (medication.is_as_needed) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-blue-700">As needed</span>
        </div>
      )
    }

    if (isOverdue) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-red-700 font-medium">Overdue</span>
        </div>
      )
    }

    if (isDueSoon) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-sm text-yellow-700 font-medium">Due soon</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-green-700">On schedule</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${!medication.is_active ? 'opacity-60' : ''} ${
      isOverdue ? 'border-red-200 bg-red-50' : isDueSoon ? 'border-yellow-200 bg-yellow-50' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Medication Name & Type */}
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {medication.medication?.name || medication.custom_name}
                </h3>
                {medication.medication?.generic_name && (
                  <p className="text-sm text-gray-600">
                    Generic: {medication.medication.generic_name}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {medication.medication?.medication_type && (
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      getMedicationTypeColor(medication.medication.medication_type)
                    }`}>
                      {medication.medication.medication_type}
                    </span>
                  )}
                  {!medication.is_active && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
              
              {/* Status Indicator */}
              <div className="text-right">
                {getStatusIndicator()}
              </div>
            </div>

            {/* Dosing Info */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <InformationCircleIcon className="w-4 h-4" />
                <span>
                  {MedicationService.formatDose(medication.dose_amount, medication.dose_unit)}
                  {!medication.is_as_needed && (
                    <> • {medication.frequency_per_day}x daily (every {medication.interval_hours}h)</>
                  )}
                </span>
              </div>

              {/* Last Dose */}
              {lastDose && (
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>
                    Last: {format(new Date(lastDose.administered_at), 'MMM d, HH:mm')}
                    {lastDose.reason && <> • {lastDose.reason}</>}
                  </span>
                </div>
              )}

              {/* Next Due */}
              {nextDueTime && !medication.is_as_needed && (
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span className={`${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                    {timeUntilNext}
                  </span>
                </div>
              )}

              {/* Additional Instructions */}
              {medication.instructions && (
                <div className="p-2 bg-blue-50 rounded text-blue-800 text-xs">
                  <strong>Instructions:</strong> {medication.instructions}
                </div>
              )}

              {medication.food_instructions && (
                <div className="text-xs text-gray-500">
                  Food: {medication.food_instructions}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
          <Button
            onClick={() => onLogDose(medication)}
            disabled={!medication.is_active}
            className={`flex-1 ${
              isOverdue 
                ? 'bg-red-600 hover:bg-red-700' 
                : isDueSoon 
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-pam-red hover:bg-pam-red/90'
            }`}
            size="sm"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {isOverdue ? 'Give Overdue Dose' : 'Log Dose'}
          </Button>

          <Button
            onClick={handleToggleActive}
            variant="outline"
            size="sm"
            className="text-gray-600"
          >
            {medication.is_active ? (
              <>
                <EyeSlashIcon className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Resume
              </>
            )}
          </Button>
        </div>

        {/* Safety Warnings */}
        {medication.medication?.contraindications && medication.medication.contraindications.length > 0 && (
          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-orange-600 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-orange-900">Contraindications:</p>
                <p className="text-xs text-orange-800">
                  {medication.medication.contraindications.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Prescription Info */}
        {medication.prescribed_by && (
          <div className="mt-2 text-xs text-gray-500">
            Prescribed by: {medication.prescribed_by}
          </div>
        )}
      </CardContent>
    </Card>
  )
}