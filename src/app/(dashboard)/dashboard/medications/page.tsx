'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  MedicationService, 
  ChildMedication, 
  MedicationDose, 
  MedicationAlert 
} from '@/lib/services/medication-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  PlusIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BeakerIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { AddMedicationModal } from '@/components/medications/AddMedicationModal'
import { LogDoseModal } from '@/components/medications/LogDoseModal'
import { MedicationCard } from '@/components/medications/MedicationCard'
import { MedicationHistory } from '@/components/medications/MedicationHistory'
import { SafetyAlerts } from '@/components/medications/SafetyAlerts'

interface Child {
  id: string
  name: string
  date_of_birth: string
}

export default function MedicationsPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [medications, setMedications] = useState<ChildMedication[]>([])
  const [recentDoses, setRecentDoses] = useState<MedicationDose[]>([])
  const [alerts, setAlerts] = useState<MedicationAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddMedication, setShowAddMedication] = useState(false)
  const [showLogDose, setShowLogDose] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState<ChildMedication | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'alerts'>('current')

  const supabase = createClient()

  useEffect(() => {
    loadData()
    // Initialize medication database on first load
    MedicationService.initializeMedicationDatabase().catch(console.error)
  }, [])

  useEffect(() => {
    if (selectedChild) {
      loadChildMedications()
      loadRecentDoses()
      loadAlerts()
    }
  }, [selectedChild])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load children
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('id, name, date_of_birth')
        .or(`user_id.eq.${user.id},family_id.in.(select family_id from family_members where user_id = ${user.id})`)
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

  const loadChildMedications = async () => {
    if (!selectedChild) return

    try {
      const medicationsData = await MedicationService.getChildMedications(selectedChild.id)
      setMedications(medicationsData)
    } catch (error) {
      console.error('Error loading medications:', error)
      setError('Failed to load medications')
    }
  }

  const loadRecentDoses = async () => {
    if (!selectedChild) return

    try {
      const dosesData = await MedicationService.getMedicationHistory(selectedChild.id, undefined, 3)
      setRecentDoses(dosesData)
    } catch (error) {
      console.error('Error loading recent doses:', error)
    }
  }

  const loadAlerts = async () => {
    if (!selectedChild) return

    try {
      const alertsData = await MedicationService.getChildAlerts(selectedChild.id)
      setAlerts(alertsData)
    } catch (error) {
      console.error('Error loading alerts:', error)
    }
  }

  const handleLogDose = (medication: ChildMedication) => {
    setSelectedMedication(medication)
    setShowLogDose(true)
  }

  const handleDoseLogged = () => {
    setShowLogDose(false)
    setSelectedMedication(null)
    loadChildMedications()
    loadRecentDoses()
    loadAlerts()
  }

  const handleMedicationAdded = () => {
    setShowAddMedication(false)
    loadChildMedications()
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
          <BeakerIcon className="w-6 h-6 text-pam-red" />
          <h1 className="text-2xl font-bold text-gray-900">Medication Tracking</h1>
        </div>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-8 text-center">
            <BeakerIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-orange-900 mb-2">No Children Added</h3>
            <p className="text-orange-700 mb-4">
              Add a child to start tracking their medications safely.
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
          <BeakerIcon className="w-6 h-6 text-pam-red" />
          <h1 className="text-2xl font-bold text-gray-900">Medication Tracking</h1>
        </div>
        <Button
          onClick={() => setShowAddMedication(true)}
          className="bg-pam-red hover:bg-pam-red/90"
          size="sm"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Medication
        </Button>
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
              Tracking medications for:
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
                  {child.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {selectedChild && (
        <>
          {/* Safety Alerts */}
          {alerts.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  Safety Alerts ({alerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SafetyAlerts 
                  alerts={alerts} 
                  onAcknowledge={() => loadAlerts()} 
                />
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <BeakerIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{medications.length}</p>
                    <p className="text-sm text-gray-600">Active Medications</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{recentDoses.length}</p>
                    <p className="text-sm text-gray-600">Doses Last 3 Days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <ShieldCheckIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
                    <p className="text-sm text-gray-600">Safety Alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              {[
                { key: 'current', label: 'Current Medications', icon: BeakerIcon },
                { key: 'history', label: 'History', icon: ClockIcon },
                { key: 'alerts', label: 'Safety Alerts', icon: ExclamationTriangleIcon }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
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
          {activeTab === 'current' && (
            <div className="space-y-4">
              {medications.length === 0 ? (
                <Card className="border-gray-200 bg-gray-50">
                  <CardContent className="p-8 text-center">
                    <BeakerIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Medications</h3>
                    <p className="text-gray-600 mb-4">
                      Add medications to start tracking doses and safety.
                    </p>
                    <Button
                      onClick={() => setShowAddMedication(true)}
                      className="bg-pam-red hover:bg-pam-red/90"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add First Medication
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {medications.map((medication) => (
                    <MedicationCard
                      key={medication.id}
                      medication={medication}
                      onLogDose={handleLogDose}
                      onUpdate={loadChildMedications}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <MedicationHistory 
              childId={selectedChild.id}
              medications={medications}
            />
          )}

          {activeTab === 'alerts' && (
            <SafetyAlerts 
              alerts={alerts}
              onAcknowledge={() => loadAlerts()}
            />
          )}
        </>
      )}

      {/* Modals */}
      {showAddMedication && selectedChild && (
        <AddMedicationModal
          childId={selectedChild.id}
          onClose={() => setShowAddMedication(false)}
          onAdded={handleMedicationAdded}
        />
      )}

      {showLogDose && selectedMedication && selectedChild && (
        <LogDoseModal
          medication={selectedMedication}
          childId={selectedChild.id}
          onClose={() => setShowLogDose(false)}
          onLogged={handleDoseLogged}
        />
      )}

      {/* Help Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">🏥 Medication Safety Tips</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Always double-check doses before administering</p>
            <p>• Use the provided measuring tools (syringes, cups)</p>
            <p>• Check expiry dates regularly</p>
            <p>• Store medications safely away from children</p>
            <p>• Consult pharmacist or GP for any concerns</p>
            <p>• Keep a list of allergies and current medications</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}