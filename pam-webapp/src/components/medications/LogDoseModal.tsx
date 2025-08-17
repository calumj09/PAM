'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  MedicationService, 
  ChildMedication, 
  AdministrationMethod,
  SafetyCheck
} from '@/lib/services/medication-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline'

interface LogDoseModalProps {
  medication: ChildMedication
  childId: string
  onClose: () => void
  onLogged: () => void
}

export function LogDoseModal({ medication, childId, onClose, onLogged }: LogDoseModalProps) {
  const [doseAmount, setDoseAmount] = useState(medication.dose_amount.toString())
  const [doseUnit, setDoseUnit] = useState(medication.dose_unit)
  const [administeredAt, setAdministeredAt] = useState(
    new Date().toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm format
  )
  const [administrationMethod, setAdministrationMethod] = useState<AdministrationMethod>('oral')
  const [reason, setReason] = useState('')
  const [temperature, setTemperature] = useState('')
  const [notes, setNotes] = useState('')
  const [sideEffects, setSideEffects] = useState('')
  const [isLogging, setIsLogging] = useState(false)
  const [error, setError] = useState('')
  const [safetyCheck, setSafetyCheck] = useState<SafetyCheck | null>(null)
  const [showSafetyWarning, setShowSafetyWarning] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    checkDoseSafety()
  }, [doseAmount, doseUnit])

  const checkDoseSafety = async () => {
    if (!medication.medication_id || !doseAmount || isNaN(Number(doseAmount))) {
      setSafetyCheck(null)
      return
    }

    try {
      const safety = await MedicationService.checkDoseSafety(
        childId,
        medication.medication_id,
        Number(doseAmount),
        doseUnit
      )
      setSafetyCheck(safety)
      setShowSafetyWarning(!safety.safe)
    } catch (error) {
      console.error('Error checking dose safety:', error)
    }
  }

  const handleLogDose = async () => {
    if (!doseAmount || isNaN(Number(doseAmount))) {
      setError('Please enter a valid dose amount')
      return
    }

    if (showSafetyWarning && safetyCheck && !safetyCheck.safe) {
      if (!confirm(`Safety Warning: ${safetyCheck.warning}\n\nDo you still want to log this dose?`)) {
        return
      }
    }

    try {
      setIsLogging(true)
      setError('')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const doseData = {
        child_medication_id: medication.id,
        child_id: childId,
        dose_amount: Number(doseAmount),
        dose_unit: doseUnit,
        administered_at: new Date(administeredAt).toISOString(),
        administered_by: user.id,
        administration_method: administrationMethod,
        reason: reason.trim() || undefined,
        temperature_celsius: temperature ? Number(temperature) : undefined,
        was_scheduled: false, // Manual dose logging
        notes: notes.trim() || undefined,
        side_effects_noted: sideEffects.trim() || undefined
      }

      await MedicationService.logMedicationDose(doseData)
      onLogged()
      
    } catch (error: any) {
      console.error('Error logging dose:', error)
      setError(error.message || 'Failed to log dose')
    } finally {
      setIsLogging(false)
    }
  }

  const getNextSafeTime = () => {
    if (safetyCheck?.next_safe_time) {
      const nextTime = new Date(safetyCheck.next_safe_time)
      return nextTime.toLocaleString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      })
    }
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Log Medication Dose</CardTitle>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              <XMarkIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Medication Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">
              {medication.medication?.name || medication.custom_name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Prescribed dose: {MedicationService.formatDose(medication.dose_amount, medication.dose_unit)}
            </p>
            {medication.frequency_per_day > 1 && (
              <p className="text-sm text-gray-600">
                {medication.frequency_per_day} times per day (every {medication.interval_hours} hours)
              </p>
            )}
          </div>

          {/* Safety Check Warning */}
          {showSafetyWarning && safetyCheck && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">Safety Warning</h4>
                  <p className="text-sm text-red-800 mt-1">{safetyCheck.warning}</p>
                  {safetyCheck.current_daily_total > 0 && (
                    <p className="text-sm text-red-700 mt-2">
                      Already given today: {safetyCheck.current_daily_total}{doseUnit}
                      {safetyCheck.max_daily_dose && (
                        <> / {safetyCheck.max_daily_dose}{doseUnit} max</>
                      )}
                    </p>
                  )}
                  {getNextSafeTime() && (
                    <p className="text-sm text-red-700 mt-1">
                      Next safe dose time: {getNextSafeTime()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Safety Check OK */}
          {safetyCheck?.safe && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800">Dose appears safe to administer</span>
              </div>
              {safetyCheck.current_daily_total > 0 && (
                <p className="text-sm text-green-700 mt-1">
                  Total given today: {safetyCheck.current_daily_total}{doseUnit}
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Dose Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dose Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dose Amount *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={doseAmount}
                  onChange={(e) => setDoseAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  value={doseUnit}
                  onChange={(e) => setDoseUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                >
                  <option value="ml">ml</option>
                  <option value="mg">mg</option>
                  <option value="tablets">tablets</option>
                  <option value="drops">drops</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ClockIcon className="w-4 h-4 inline mr-1" />
                Time Given *
              </label>
              <input
                type="datetime-local"
                value={administeredAt}
                onChange={(e) => setAdministeredAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How was it given?
              </label>
              <select
                value={administrationMethod}
                onChange={(e) => setAdministrationMethod(e.target.value as AdministrationMethod)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
              >
                <option value="oral">Oral (by mouth)</option>
                <option value="rectal">Rectal (suppository)</option>
                <option value="topical">Topical (on skin)</option>
                <option value="nasal">Nasal (nose)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for dose (optional)
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
              >
                <option value="">Select reason...</option>
                <option value="fever">Fever</option>
                <option value="pain">Pain</option>
                <option value="scheduled dose">Scheduled dose</option>
                <option value="teething">Teething</option>
                <option value="cold symptoms">Cold symptoms</option>
                <option value="other">Other</option>
              </select>
            </div>

            {(reason === 'fever' || reason === 'other') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CursorArrowRaysIcon className="w-4 h-4 inline mr-1" />
                  Temperature (°C) - optional
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="e.g., 38.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about this dose..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Side effects noticed (optional)
              </label>
              <textarea
                value={sideEffects}
                onChange={(e) => setSideEffects(e.target.value)}
                placeholder="Any side effects or reactions noticed..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogDose}
              disabled={isLogging}
              className={`flex-1 ${
                showSafetyWarning 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-pam-red hover:bg-pam-red/90'
              }`}
            >
              {isLogging ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging...
                </div>
              ) : showSafetyWarning ? (
                'Log Despite Warning'
              ) : (
                'Log Dose'
              )}
            </Button>
          </div>

          {/* Safety Tips */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Safety Reminder</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Always use the measuring device that came with the medication</p>
              <p>• Double-check the dose amount before giving</p>
              <p>• Contact your GP if you're unsure about anything</p>
              <p>• Keep medications locked away from children</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}