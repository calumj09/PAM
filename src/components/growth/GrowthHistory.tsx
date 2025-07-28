'use client'

import { useState, useEffect } from 'react'
import { 
  GrowthTrackingService,
  GrowthMeasurement
} from '@/lib/services/growth-tracking-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AddMeasurementModal } from './AddMeasurementModal'
import { 
  ClockIcon,
  ScaleIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { format, parseISO, differenceInWeeks } from 'date-fns'

interface GrowthHistoryProps {
  measurements: GrowthMeasurement[]
  onUpdate: () => void
}

export function GrowthHistory({ measurements, onUpdate }: GrowthHistoryProps) {
  const [expandedMeasurement, setExpandedMeasurement] = useState<string | null>(null)
  const [editingMeasurement, setEditingMeasurement] = useState<GrowthMeasurement | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deletingMeasurement, setDeletingMeasurement] = useState<string | null>(null)

  const handleEditMeasurement = (measurement: GrowthMeasurement) => {
    setEditingMeasurement(measurement)
    setShowEditModal(true)
  }

  const handleEditComplete = () => {
    setShowEditModal(false)
    setEditingMeasurement(null)
    onUpdate() // Refresh the measurements list
  }

  const handleDeleteMeasurement = async (measurement: GrowthMeasurement) => {
    if (!confirm(`Are you sure you want to delete the measurement from ${format(parseISO(measurement.measurement_date), 'dd/MM/yyyy')}? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingMeasurement(measurement.id)
      await GrowthTrackingService.deleteMeasurement(measurement.id)
      onUpdate() // Refresh the measurements list
    } catch (error) {
      console.error('Error deleting measurement:', error)
      alert('Failed to delete measurement. Please try again.')
    } finally {
      setDeletingMeasurement(null)
    }
  }

  const exportToCSV = () => {
    const csvHeaders = [
      'Date',
      'Age (weeks)',
      'Height (cm)',
      'Weight (kg)', 
      'Head Circumference (cm)',
      'Height Percentile',
      'Weight Percentile',
      'Head Circumference Percentile',
      'Location',
      'Method',
      'Notes',
      'Estimated'
    ]

    const csvData = measurements.map(measurement => [
      format(parseISO(measurement.measurement_date), 'dd/MM/yyyy'),
      measurement.age_weeks.toString(),
      measurement.height_cm?.toString() || '',
      measurement.weight_kg?.toString() || '',
      measurement.head_circumference_cm?.toString() || '',
      measurement.height_percentile?.toString() || '',
      measurement.weight_percentile?.toString() || '',
      measurement.head_circumference_percentile?.toString() || '',
      measurement.measurement_location || '',
      measurement.measurement_method || '',
      measurement.notes || '',
      measurement.is_estimated ? 'Yes' : 'No'
    ])

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `growth-history-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const formatAge = (weeks: number) => {
    if (weeks < 4) return `${weeks} weeks`
    if (weeks < 52) return `${Math.floor(weeks / 4.33)} months`
    const years = Math.floor(weeks / 52)
    const remainingMonths = Math.floor((weeks - years * 52) / 4.33)
    return remainingMonths > 0 ? `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : `${years} year${years > 1 ? 's' : ''}`
  }

  const getLocationIcon = (location?: string) => {
    switch (location) {
      case 'gp':
        return '🏥'
      case 'hospital':
        return '🏥'
      case 'childcare':
        return '🏫'
      case 'maternal_child_health':
        return '👩‍⚕️'
      default:
        return '🏠'
    }
  }

  const getLocationLabel = (location?: string) => {
    switch (location) {
      case 'gp':
        return 'GP Visit'
      case 'hospital':
        return 'Hospital'
      case 'childcare':
        return 'Childcare/Kinder'
      case 'maternal_child_health':
        return 'Maternal & Child Health'
      default:
        return 'Home'
    }
  }

  const getPercentileColor = (percentile?: number) => {
    if (!percentile) return 'text-gray-500'
    if (percentile < 3 || percentile > 97) return 'text-red-600'
    if (percentile < 10 || percentile > 90) return 'text-orange-600'
    return 'text-green-600'
  }

  const getMeasurementIcon = (measurement: GrowthMeasurement) => {
    const hasHeight = measurement.height_cm
    const hasWeight = measurement.weight_kg
    const hasHead = measurement.head_circumference_cm
    
    if (hasHeight && hasWeight && hasHead) {
      return <ScaleIcon className="w-5 h-5 text-blue-600" />
    }
    if (hasHeight && hasWeight) {
      return <ScaleIcon className="w-5 h-5 text-green-600" />
    }
    return <ScaleIcon className="w-5 h-5 text-gray-600" />
  }

  if (measurements.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Measurements Yet</h3>
          <p className="text-gray-600">
            Start tracking your child's growth by adding their first measurement.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          onClick={exportToCSV}
          variant="outline"
          size="sm"
        >
          <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
          Export History
        </Button>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {measurements.map((measurement) => (
          <Card key={measurement.id} className="border-l-4 border-l-pam-red">
            <CardContent className="p-4">
              <div 
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpandedMeasurement(
                  expandedMeasurement === measurement.id ? null : measurement.id
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-pam-pink/20 rounded-full flex items-center justify-center">
                    {getMeasurementIcon(measurement)}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">
                        {format(parseISO(measurement.measurement_date), 'EEEE, MMMM d, yyyy')}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {getLocationIcon(measurement.measurement_location)} {getLocationLabel(measurement.measurement_location)}
                      </span>
                      {measurement.is_estimated && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          Estimated
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      Age: {formatAge(measurement.age_weeks)}
                    </p>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {measurement.height_cm && (
                        <div>
                          <div className="font-medium text-gray-900">
                            {GrowthTrackingService.formatMeasurement(measurement.height_cm, 'height')}
                          </div>
                          <div className="text-xs text-gray-500">Height</div>
                          {measurement.height_percentile && (
                            <div className={`text-xs ${getPercentileColor(measurement.height_percentile)}`}>
                              {measurement.height_percentile}th percentile
                            </div>
                          )}
                        </div>
                      )}

                      {measurement.weight_kg && (
                        <div>
                          <div className="font-medium text-gray-900">
                            {GrowthTrackingService.formatMeasurement(measurement.weight_kg, 'weight')}
                          </div>
                          <div className="text-xs text-gray-500">Weight</div>
                          {measurement.weight_percentile && (
                            <div className={`text-xs ${getPercentileColor(measurement.weight_percentile)}`}>
                              {measurement.weight_percentile}th percentile
                            </div>
                          )}
                        </div>
                      )}

                      {measurement.head_circumference_cm && (
                        <div>
                          <div className="font-medium text-gray-900">
                            {GrowthTrackingService.formatMeasurement(measurement.head_circumference_cm, 'head_circumference')}
                          </div>
                          <div className="text-xs text-gray-500">Head Circumference</div>
                          {measurement.head_circumference_percentile && (
                            <div className={`text-xs ${getPercentileColor(measurement.head_circumference_percentile)}`}>
                              {measurement.head_circumference_percentile}th percentile
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right text-sm text-gray-500">
                  <div>
                    {format(parseISO(measurement.created_at), 'HH:mm')}
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpandedMeasurement(
                        expandedMeasurement === measurement.id ? null : measurement.id
                      )
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    {expandedMeasurement === measurement.id ? 'Less' : 'More'}
                  </Button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedMeasurement === measurement.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Measurement Details</h4>
                      <div className="space-y-1 text-gray-600">
                        <p><strong>Method:</strong> {measurement.measurement_method || 'Not specified'}</p>
                        <p><strong>Location:</strong> {getLocationLabel(measurement.measurement_location)}</p>
                        <p><strong>Estimated:</strong> {measurement.is_estimated ? 'Yes' : 'No'}</p>
                        <p><strong>Recorded:</strong> {format(parseISO(measurement.created_at), 'dd/MM/yyyy HH:mm')}</p>
                      </div>
                    </div>

                    {measurement.notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {measurement.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Percentile Analysis */}
                  {(measurement.height_percentile || measurement.weight_percentile || measurement.head_circumference_percentile) && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <h4 className="font-medium text-blue-900 mb-2">Percentile Analysis</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        {measurement.height_percentile && (
                          <p>• Height at {measurement.height_percentile}th percentile: {GrowthTrackingService.getPercentileDescription(measurement.height_percentile)}</p>
                        )}
                        {measurement.weight_percentile && (
                          <p>• Weight at {measurement.weight_percentile}th percentile: {GrowthTrackingService.getPercentileDescription(measurement.weight_percentile)}</p>
                        )}
                        {measurement.head_circumference_percentile && (
                          <p>• Head circumference at {measurement.head_circumference_percentile}th percentile: {GrowthTrackingService.getPercentileDescription(measurement.head_circumference_percentile)}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons - would implement edit/delete in production */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMeasurement(measurement)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <PencilIcon className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMeasurement(measurement)}
                      disabled={deletingMeasurement === measurement.id}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      {deletingMeasurement === measurement.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      {measurements.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-900 mb-2">📈 Growth History Summary</h4>
            <div className="text-sm text-green-800 space-y-1">
              <p>• Total measurements recorded: {measurements.length}</p>
              <p>• Tracking period: {formatAge(measurements[measurements.length - 1].age_weeks)} to {formatAge(measurements[0].age_weeks)}</p>
              <p>• Most recent measurement: {format(parseISO(measurements[0].measurement_date), 'dd/MM/yyyy')}</p>
              <p>• Complete measurements (H+W+HC): {measurements.filter(m => m.height_cm && m.weight_kg && m.head_circumference_cm).length}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      {showEditModal && editingMeasurement && (
        <AddMeasurementModal
          childId={editingMeasurement.child_id}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditComplete}
          editingMeasurement={editingMeasurement}
        />
      )}
    </div>
  )
}