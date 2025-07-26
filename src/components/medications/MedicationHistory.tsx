'use client'

import { useState, useEffect } from 'react'
import { 
  MedicationService, 
  ChildMedication, 
  MedicationDose 
} from '@/lib/services/medication-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  ClockIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  CursorArrowRaysIcon,
  ExclamationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { format, startOfDay, endOfDay, subDays, parseISO } from 'date-fns'

interface MedicationHistoryProps {
  childId: string
  medications: ChildMedication[]
}

export function MedicationHistory({ childId, medications }: MedicationHistoryProps) {
  const [doses, setDoses] = useState<MedicationDose[]>([])
  const [filteredDoses, setFilteredDoses] = useState<MedicationDose[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMedication, setSelectedMedication] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('7')
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadHistory()
  }, [childId, dateRange])

  useEffect(() => {
    filterDoses()
  }, [doses, selectedMedication])

  const loadHistory = async () => {
    try {
      setIsLoading(true)
      const days = parseInt(dateRange)
      const history = await MedicationService.getMedicationHistory(childId, undefined, days)
      setDoses(history)
      
      // Load stats
      const medicationStats = await MedicationService.getMedicationStats(childId, days)
      setStats(medicationStats)
      
    } catch (error) {
      console.error('Error loading medication history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterDoses = () => {
    if (selectedMedication === 'all') {
      setFilteredDoses(doses)
    } else {
      const filtered = doses.filter(dose => {
        const medication = medications.find(m => m.id === dose.child_medication_id)
        return medication?.medication_id === selectedMedication || medication?.id === selectedMedication
      })
      setFilteredDoses(filtered)
    }
  }

  const exportToCSV = () => {
    const csvHeaders = [
      'Date',
      'Time',
      'Medication',
      'Dose',
      'Method',
      'Reason',
      'Temperature',
      'Notes',
      'Given By'
    ]

    const csvData = filteredDoses.map(dose => {
      const medication = medications.find(m => m.id === dose.child_medication_id)
      const medicationName = medication?.medication?.name || medication?.custom_name || 'Unknown'
      
      return [
        format(parseISO(dose.administered_at), 'dd/MM/yyyy'),
        format(parseISO(dose.administered_at), 'HH:mm'),
        medicationName,
        `${dose.dose_amount}${dose.dose_unit}`,
        dose.administration_method,
        dose.reason || '',
        dose.temperature_celsius ? `${dose.temperature_celsius}°C` : '',
        dose.notes || '',
        'Parent' // Would get from user data in real implementation
      ]
    })

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `medication-history-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const groupDosesByDate = (doses: MedicationDose[]) => {
    const groups: Record<string, MedicationDose[]> = {}
    
    doses.forEach(dose => {
      const date = format(parseISO(dose.administered_at), 'yyyy-MM-dd')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(dose)
    })

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }

  const getMedicationName = (dose: MedicationDose) => {
    const medication = medications.find(m => m.id === dose.child_medication_id)
    return medication?.medication?.name || medication?.custom_name || 'Unknown Medication'
  }

  const getReasonIcon = (reason?: string) => {
    if (reason?.toLowerCase().includes('fever')) {
      return <CursorArrowRaysIcon className="w-4 h-4 text-red-500" />
    }
    if (reason?.toLowerCase().includes('pain')) {
      return <ExclamationCircleIcon className="w-4 h-4 text-orange-500" />
    }
    return <ClockIcon className="w-4 h-4 text-gray-500" />
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  const groupedDoses = groupDosesByDate(filteredDoses)

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total_doses}</div>
              <div className="text-sm text-gray-600">Total Doses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.medications_used}</div>
              <div className="text-sm text-gray-600">Medications Used</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.adherence_rate}%</div>
              <div className="text-sm text-gray-600">Adherence Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.safety_alerts}</div>
              <div className="text-sm text-gray-600">Safety Alerts</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Export */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <select
                value={selectedMedication}
                onChange={(e) => setSelectedMedication(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pam-red focus:border-transparent"
              >
                <option value="all">All Medications</option>
                {medications.map((med) => (
                  <option key={med.id} value={med.medication_id || med.id}>
                    {med.medication?.name || med.custom_name}
                  </option>
                ))}
              </select>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pam-red focus:border-transparent"
              >
                <option value="3">Last 3 days</option>
                <option value="7">Last week</option>
                <option value="14">Last 2 weeks</option>
                <option value="30">Last month</option>
                <option value="90">Last 3 months</option>
              </select>
            </div>

            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              disabled={filteredDoses.length === 0}
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {filteredDoses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No History Found</h3>
            <p className="text-gray-600">
              {selectedMedication === 'all' 
                ? 'No medication doses have been recorded yet.'
                : 'No doses found for the selected medication and time period.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedDoses.map(([date, dayDoses]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({dayDoses.length} dose{dayDoses.length !== 1 ? 's' : ''})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dayDoses
                    .sort((a, b) => new Date(b.administered_at).getTime() - new Date(a.administered_at).getTime())
                    .map((dose) => (
                    <div key={dose.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full border-2 border-pam-pink">
                        {getReasonIcon(dose.reason)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {getMedicationName(dose)}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {MedicationService.formatDose(dose.dose_amount, dose.dose_unit)}
                              {dose.administration_method !== 'oral' && (
                                <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                                  {dose.administration_method}
                                </span>
                              )}
                            </p>
                            
                            {dose.reason && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  {dose.reason}
                                </span>
                                {dose.temperature_celsius && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                    {dose.temperature_celsius}°C
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {dose.notes && (
                              <p className="text-xs text-gray-500 mt-2">
                                <strong>Note:</strong> {dose.notes}
                              </p>
                            )}
                            
                            {dose.side_effects_noted && (
                              <p className="text-xs text-orange-600 mt-1">
                                <strong>Side effects:</strong> {dose.side_effects_noted}
                              </p>
                            )}
                          </div>
                          
                          <div className="text-right text-sm text-gray-500">
                            <div className="font-medium">
                              {format(parseISO(dose.administered_at), 'HH:mm')}
                            </div>
                            <div className="text-xs">
                              {dose.was_scheduled ? 'Scheduled' : 'Manual'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Load More Button - would implement pagination in production */}
          {filteredDoses.length >= 50 && (
            <div className="text-center">
              <Button variant="outline">
                Load Earlier History
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {filteredDoses.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-2">📊 History Summary</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Total doses in period: {filteredDoses.length}</p>
              <p>• Most common reason: {stats?.most_common_reason || 'fever'}</p>
              <p>• Average doses per day: {Math.round(filteredDoses.length / parseInt(dateRange))}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}