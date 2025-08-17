'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  GrowthTrackingService, 
  GrowthMeasurement, 
  GrowthStats, 
  GrowthAlert,
  MeasurementType 
} from '@/lib/services/growth-tracking-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  PlusIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  ScaleIcon,
  ClockIcon,
  TrophyIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { AddMeasurementModal } from '@/components/growth/AddMeasurementModal'
import { GrowthChart } from '@/components/growth/GrowthChart'
import { GrowthHistory } from '@/components/growth/GrowthHistory'
import { GrowthAlerts } from '@/components/growth/GrowthAlerts'
import { format, parseISO, differenceInWeeks } from 'date-fns'

interface Child {
  id: string
  name: string
  date_of_birth: string
}

export default function GrowthPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [measurements, setMeasurements] = useState<GrowthMeasurement[]>([])
  const [stats, setStats] = useState<GrowthStats | null>(null)
  const [alerts, setAlerts] = useState<GrowthAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddMeasurement, setShowAddMeasurement] = useState(false)
  const [selectedMeasurementType, setSelectedMeasurementType] = useState<MeasurementType>('height')
  const [activeTab, setActiveTab] = useState<'charts' | 'history' | 'alerts'>('charts')
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadData()
    // Initialize reference data on first load
    GrowthTrackingService.initializeReferenceData().catch(console.error)
  }, [])

  useEffect(() => {
    if (selectedChild) {
      loadChildGrowthData()
    }
  }, [selectedChild])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load children - simplified query without family sharing
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('id, name, date_of_birth')
        .eq('user_id', user.id)
        .order('date_of_birth', { ascending: false })

      if (childrenError) throw childrenError

      setChildren(childrenData || [])
      if (childrenData && childrenData.length > 0 && !selectedChild) {
        setSelectedChild(childrenData[0])
      }

    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load children data')
    } finally {
      setIsLoading(false)
    }
  }

  const loadChildGrowthData = async () => {
    if (!selectedChild) return

    try {
      const [measurementsData, statsData, alertsData] = await Promise.all([
        GrowthTrackingService.getChildMeasurements(selectedChild.id, 20),
        GrowthTrackingService.getGrowthStats(selectedChild.id),
        GrowthTrackingService.getChildAlerts(selectedChild.id)
      ])

      setMeasurements(measurementsData)
      setStats(statsData)
      setAlerts(alertsData)
    } catch (error) {
      console.error('Error loading growth data:', error)
      setError('Failed to load growth data')
    }
  }

  const handleMeasurementAdded = () => {
    setShowAddMeasurement(false)
    loadChildGrowthData()
  }

  const handleExportReport = async () => {
    if (!selectedChild) return

    try {
      const report = await GrowthTrackingService.generateHealthcareReport(selectedChild.id)
      
      // Create downloadable file
      const blob = new Blob([report], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${selectedChild.name}-growth-report-${format(new Date(), 'yyyy-MM-dd')}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating report:', error)
      setError('Failed to generate report')
    }
  }

  const getChildAge = (child: Child) => {
    const weeks = differenceInWeeks(new Date(), parseISO(child.date_of_birth))
    if (weeks < 4) return `${weeks} weeks`
    if (weeks < 52) return `${Math.floor(weeks / 4.33)} months`
    const years = Math.floor(weeks / 52)
    const remainingMonths = Math.floor((weeks - years * 52) / 4.33)
    return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years}y`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ScaleIcon className="w-6 h-6 text-pam-red" />
          <h1 className="text-2xl font-bold text-gray-900">Growth Tracking</h1>
        </div>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-8 text-center">
            <ChartBarIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-orange-900 mb-2">No Children Added</h3>
            <p className="text-orange-700 mb-4">
              Add a child to start tracking their growth and development.
            </p>
            <Button 
              onClick={() => window.location.href = '/dashboard/children'}
              className="bg-pam-red hover:bg-pam-red/90"
            >
              Add Child
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScaleIcon className="w-6 h-6 text-pam-red" />
          <h1 className="text-2xl font-bold text-gray-900">Growth Tracking</h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportReport}
            variant="outline"
            size="sm"
            disabled={!selectedChild}
          >
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button
            onClick={() => setShowAddMeasurement(true)}
            className="bg-pam-red hover:bg-pam-red/90"
            size="sm"
            disabled={!selectedChild}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Measurement
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Child Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Tracking growth for:
            </label>
            <select
              value={selectedChild?.id || ''}
              onChange={(e) => {
                const child = children.find(c => c.id === e.target.value)
                setSelectedChild(child || null)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name} ({getChildAge(child)})
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {selectedChild && (
        <>
          {/* Growth Alerts */}
          {alerts.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  Growth Alerts ({alerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alerts.slice(0, 2).map((alert) => (
                  <div key={alert.id} className="p-3 bg-white border border-red-200 rounded-lg mb-2 last:mb-0">
                    <h4 className="font-medium text-red-900">{alert.title}</h4>
                    <p className="text-sm text-red-800 mt-1">{alert.message}</p>
                    {alert.gp_consultation_recommended && (
                      <p className="text-xs text-red-700 mt-2">
                         Consider discussing with your GP
                      </p>
                    )}
                  </div>
                ))}
                {alerts.length > 2 && (
                  <Button
                    onClick={() => setActiveTab('alerts')}
                    variant="outline"
                    size="sm"
                    className="mt-2 text-red-700 border-red-300"
                  >
                    View All {alerts.length} Alerts
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <ScaleIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.latest_measurements.height?.value ? 
                        GrowthTrackingService.formatMeasurement(stats.latest_measurements.height.value, 'height') : 
                        '—'
                      }
                    </p>
                    <p className="text-sm text-gray-600">Latest Height</p>
                    {stats?.latest_measurements.height?.percentile && (
                      <p className={`text-xs ${GrowthTrackingService.getPercentileColor(stats.latest_measurements.height.percentile)}`}>
                        {stats.latest_measurements.height.percentile}th percentile
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrophyIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.latest_measurements.weight?.value ? 
                        GrowthTrackingService.formatMeasurement(stats.latest_measurements.weight.value, 'weight') : 
                        '—'
                      }
                    </p>
                    <p className="text-sm text-gray-600">Latest Weight</p>
                    {stats?.latest_measurements.weight?.percentile && (
                      <p className={`text-xs ${GrowthTrackingService.getPercentileColor(stats.latest_measurements.weight.percentile)}`}>
                        {stats.latest_measurements.weight.percentile}th percentile
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.growth_velocity.height_cm_per_month ? 
                        `${stats.growth_velocity.height_cm_per_month.toFixed(1)}` : 
                        '—'
                      }
                    </p>
                    <p className="text-sm text-gray-600">cm/month</p>
                    <p className="text-xs text-gray-500">Height Growth</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{measurements.length}</p>
                    <p className="text-sm text-gray-600">Total Records</p>
                    {measurements.length > 0 && (
                      <p className="text-xs text-gray-500">
                        Since {format(parseISO(measurements[measurements.length - 1].measurement_date), 'MMM yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Measurement Type Selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Show chart for:</span>
                <div className="flex gap-2">
                  {[
                    { key: 'height', label: 'Height', color: 'bg-blue-100 text-blue-800' },
                    { key: 'weight', label: 'Weight', color: 'bg-green-100 text-green-800' },
                    { key: 'head_circumference', label: 'Head Circ.', color: 'bg-purple-100 text-purple-800' }
                  ].map((type) => (
                    <button
                      key={type.key}
                      onClick={() => setSelectedMeasurementType(type.key as MeasurementType)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedMeasurementType === type.key
                          ? type.color
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              {[
                { key: 'charts', label: 'Growth Charts', icon: ChartBarIcon },
                { key: 'history', label: 'History', icon: ClockIcon },
                { key: 'alerts', label: 'Alerts', icon: ExclamationTriangleIcon }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as 'charts' | 'history' | 'alerts')}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? 'border-pam-red text-pam-red'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.key === 'alerts' && alerts.length > 0 && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        {alerts.length}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'charts' && (
            <GrowthChart
              childId={selectedChild.id}
              measurementType={selectedMeasurementType}
              childSex={'male'} // Default to male for now, can be updated later
            />
          )}

          {activeTab === 'history' && (
            <GrowthHistory
              measurements={measurements}
              onUpdate={loadChildGrowthData}
            />
          )}

          {activeTab === 'alerts' && (
            <GrowthAlerts
              alerts={alerts}
              onAcknowledge={loadChildGrowthData}
            />
          )}
        </>
      )}

      {/* Add Measurement Modal */}
      <AddMeasurementModal
        childId={selectedChild?.id || ''}
        childDateOfBirth={selectedChild?.date_of_birth}
        isOpen={showAddMeasurement && !!selectedChild}
        onClose={() => setShowAddMeasurement(false)}
        onSuccess={handleMeasurementAdded}
      />

      {/* Australian Health Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2"> Australian Growth Standards</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Charts based on WHO Child Growth Standards used by Australian GPs</p>
            <p>• Percentiles show where your child sits compared to other Australian children</p>
            <p>• 3rd-97th percentile is considered normal range</p>
            <p>• Regular measurements help track healthy development</p>
            <p>• Share reports with your GP, maternal child health nurse, or pediatrician</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}