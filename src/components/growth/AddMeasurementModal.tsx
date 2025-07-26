'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  GrowthTrackingService,
  MeasurementType
} from '@/lib/services/growth-tracking-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  XMarkIcon,
  ScaleIcon,
  ClockIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { differenceInWeeks, parseISO, format } from 'date-fns'

interface AddMeasurementModalProps {
  childId: string
  childDateOfBirth: string
  onClose: () => void
  onAdded: () => void
}

export function AddMeasurementModal({ 
  childId, 
  childDateOfBirth, 
  onClose, 
  onAdded 
}: AddMeasurementModalProps) {
  const [measurementDate, setMeasurementDate] = useState(
    new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  )
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [headCircumference, setHeadCircumference] = useState('')
  const [measurementLocation, setMeasurementLocation] = useState('home')
  const [notes, setNotes] = useState('')
  const [isEstimated, setIsEstimated] = useState(false)
  const [measurementMethod, setMeasurementMethod] = useState('digital_scale')
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState('')
  const [percentilePreviews, setPercentilePreviews] = useState<{
    height?: number
    weight?: number 
    head_circumference?: number
  }>({})

  const supabase = createClient()

  useEffect(() => {
    calculatePreviews()
  }, [height, weight, headCircumference, measurementDate])

  const calculatePreviews = async () => {
    const ageWeeks = differenceInWeeks(new Date(measurementDate), parseISO(childDateOfBirth))
    if (ageWeeks < 0) return

    const previews: typeof percentilePreviews = {}

    // Get child details for sex
    const { data: child } = await supabase
      .from('children')
      .select('sex')
      .eq('id', childId)
      .single()
    
    const childSex = child?.sex || 'male'

    try {
      if (height && !isNaN(Number(height))) {
        const percentile = await GrowthTrackingService.calculatePercentile(
          childSex, ageWeeks, 'height', Number(height)
        )
        if (percentile) previews.height = percentile
      }

      if (weight && !isNaN(Number(weight))) {
        const percentile = await GrowthTrackingService.calculatePercentile(
          childSex, ageWeeks, 'weight', Number(weight)
        )
        if (percentile) previews.weight = percentile
      }

      if (headCircumference && !isNaN(Number(headCircumference))) {
        const percentile = await GrowthTrackingService.calculatePercentile(
          childSex, ageWeeks, 'head_circumference', Number(headCircumference)
        )
        if (percentile) previews.head_circumference = percentile
      }

      setPercentilePreviews(previews)
    } catch (error) {
      console.error('Error calculating percentile previews:', error)
    }
  }

  const validateMeasurements = () => {
    if (!height && !weight && !headCircumference) {
      setError('Please enter at least one measurement')
      return false
    }

    if (height && (isNaN(Number(height)) || Number(height) <= 0 || Number(height) > 150)) {
      setError('Height must be between 0 and 150 cm')
      return false
    }

    if (weight && (isNaN(Number(weight)) || Number(weight) <= 0 || Number(weight) > 50)) {
      setError('Weight must be between 0 and 50 kg')
      return false
    }

    if (headCircumference && (isNaN(Number(headCircumference)) || Number(headCircumference) <= 0 || Number(headCircumference) > 80)) {
      setError('Head circumference must be between 0 and 80 cm')
      return false
    }

    const ageWeeks = differenceInWeeks(new Date(measurementDate), parseISO(childDateOfBirth))
    if (ageWeeks < 0) {
      setError('Measurement date cannot be before birth date')
      return false
    }

    if (ageWeeks > 260) { // ~5 years
      setError('Child appears too old for pediatric growth tracking')
      return false
    }

    return true
  }

  const handleAddMeasurement = async () => {
    if (!validateMeasurements()) return

    try {
      setIsAdding(true)
      setError('')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const ageWeeks = differenceInWeeks(new Date(measurementDate), parseISO(childDateOfBirth))

      const measurementData = {
        child_id: childId,
        measurement_date: measurementDate,
        age_weeks: ageWeeks,
        height_cm: height ? Number(height) : undefined,
        weight_kg: weight ? Number(weight) : undefined,
        head_circumference_cm: headCircumference ? Number(headCircumference) : undefined,
        measured_by: user.id,
        measurement_location: measurementLocation,
        notes: notes.trim() || undefined,
        is_estimated: isEstimated,
        measurement_method: measurementMethod
      }

      await GrowthTrackingService.addMeasurement(measurementData)
      onAdded()
      
    } catch (error: any) {
      console.error('Error adding measurement:', error)
      setError(error.message || 'Failed to add measurement')
    } finally {
      setIsAdding(false)
    }
  }

  const getPercentileColor = (percentile: number) => {
    if (percentile < 3 || percentile > 97) return 'text-red-600'
    if (percentile < 10 || percentile > 90) return 'text-orange-600'
    return 'text-green-600'
  }

  const getPercentileIndicator = (type: MeasurementType) => {
    const percentile = percentilePreviews[type]
    if (!percentile) return null

    return (
      <div className={`text-xs mt-1 ${getPercentileColor(percentile)}`}>
        ~{percentile}th percentile
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <ScaleIcon className="w-5 h-5 text-pam-red" />
              Add Growth Measurement
            </CardTitle>
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
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ClockIcon className="w-4 h-4 inline mr-1" />
                Measurement Date *
              </label>
              <input
                type="date"
                value={measurementDate}
                onChange={(e) => setMeasurementDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Child will be {differenceInWeeks(new Date(measurementDate), parseISO(childDateOfBirth))} weeks old
              </p>
            </div>
          </div>

          {/* Measurements */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Measurements</h3>
            <p className="text-sm text-gray-600">Enter at least one measurement:</p>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g., 75.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                />
                {getPercentileIndicator('height')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 9.25"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                />
                {getPercentileIndicator('weight')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Head Circumference (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={headCircumference}
                  onChange={(e) => setHeadCircumference(e.target.value)}
                  placeholder="e.g., 46.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                />
                {getPercentileIndicator('head_circumference')}
              </div>
            </div>
          </div>

          {/* Measurement Context */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Measurement Details</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPinIcon className="w-4 h-4 inline mr-1" />
                Where was this measured?
              </label>
              <select
                value={measurementLocation}
                onChange={(e) => setMeasurementLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
              >
                <option value="home">At home</option>
                <option value="gp">GP visit</option>
                <option value="hospital">Hospital</option>
                <option value="childcare">Childcare/Kinder</option>
                <option value="maternal_child_health">Maternal & Child Health</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How was it measured?
              </label>
              <select
                value={measurementMethod}
                onChange={(e) => setMeasurementMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
              >
                <option value="digital_scale">Digital scale & measuring tape</option>
                <option value="mechanical_scale">Mechanical scale</option>
                <option value="growth_chart">Wall growth chart</option>
                <option value="professional_equipment">Professional medical equipment</option>
                <option value="estimated">Estimated</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isEstimated"
                checked={isEstimated}
                onChange={(e) => setIsEstimated(e.target.checked)}
                className="w-4 h-4 text-pam-red bg-gray-100 border-gray-300 rounded focus:ring-pam-red focus:ring-2"
              />
              <label htmlFor="isEstimated" className="text-sm text-gray-700">
                This measurement is estimated (not precise)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about this measurement..."
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
              onClick={handleAddMeasurement}
              disabled={isAdding}
              className="flex-1 bg-pam-red hover:bg-pam-red/90"
            >
              {isAdding ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                'Add Measurement'
              )}
            </Button>
          </div>

          {/* Info Panel */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📊 Australian Growth Standards</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Percentiles shown are based on WHO standards used by Australian GPs</p>
              <p>• 3rd-97th percentile is considered normal range</p>
              <p>• Consistent measurements over time are more important than single readings</p>
              <p>• Share this data with your healthcare provider for the best advice</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}