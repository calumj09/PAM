'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  MedicationService, 
  MedicationDatabase, 
  MedicationType,
  MedicationForm
} from '@/lib/services/medication-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  XMarkIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface AddMedicationModalProps {
  childId: string
  onClose: () => void
  onAdded: () => void
}

export function AddMedicationModal({ childId, onClose, onAdded }: AddMedicationModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<MedicationDatabase[]>([])
  const [selectedMedication, setSelectedMedication] = useState<MedicationDatabase | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState('')
  const [showCustomForm, setShowCustomForm] = useState(false)

  // Form data
  const [doseAmount, setDoseAmount] = useState('')
  const [doseUnit, setDoseUnit] = useState('ml')
  const [frequencyPerDay, setFrequencyPerDay] = useState(2)
  const [intervalHours, setIntervalHours] = useState(8)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')
  const [isAsNeeded, setIsAsNeeded] = useState(false)
  const [instructions, setInstructions] = useState('')
  const [prescribedBy, setPrescribedBy] = useState('')
  const [foodInstructions, setFoodInstructions] = useState('')

  // Custom medication data
  const [customName, setCustomName] = useState('')
  const [customStrength, setCustomStrength] = useState('')
  const [customForm, setCustomForm] = useState<MedicationForm>('liquid')

  const supabase = createClient()

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchMedications()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const searchMedications = async () => {
    try {
      setIsSearching(true)
      const results = await MedicationService.searchMedications(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching medications:', error)
      setError('Failed to search medications')
    } finally {
      setIsSearching(false)
    }
  }

  const handleMedicationSelect = async (medication: MedicationDatabase) => {
    setSelectedMedication(medication)
    setSearchQuery(medication.name)
    setSearchResults([])
    
    // Set default dosing based on medication type
    setIntervalHours(medication.dosing_interval_hours)
    setFrequencyPerDay(Math.round(24 / medication.dosing_interval_hours))
    
    // Get dosing recommendation
    try {
      const dosing = await MedicationService.calculateRecommendedDose(medication.id, childId)
      if (dosing.recommended_dose_mg) {
        setDoseAmount(dosing.recommended_dose_mg.toString())
        setDoseUnit('mg')
      }
    } catch (error) {
      console.error('Error calculating dose:', error)
    }
  }

  const handleAddMedication = async () => {
    if (!selectedMedication && !showCustomForm) {
      setError('Please select a medication or add a custom one')
      return
    }

    if (!doseAmount || isNaN(Number(doseAmount))) {
      setError('Please enter a valid dose amount')
      return
    }

    if (showCustomForm && !customName.trim()) {
      setError('Please enter a medication name')
      return
    }

    try {
      setIsAdding(true)
      setError('')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const medicationData = {
        child_id: childId,
        medication_id: selectedMedication?.id,
        custom_name: showCustomForm ? customName.trim() : undefined,
        custom_strength_mg: showCustomForm && customStrength ? Number(customStrength) : undefined,
        custom_form: showCustomForm ? customForm : undefined,
        prescribed_by: prescribedBy.trim() || undefined,
        dose_amount: Number(doseAmount),
        dose_unit: doseUnit,
        frequency_per_day: frequencyPerDay,
        interval_hours: intervalHours,
        start_date: startDate,
        end_date: endDate || undefined,
        is_as_needed: isAsNeeded,
        instructions: instructions.trim() || undefined,
        food_instructions: foodInstructions.trim() || undefined,
        is_active: true,
        added_by: user.id
      }

      await MedicationService.addChildMedication(medicationData)
      onAdded()
      
    } catch (error: any) {
      console.error('Error adding medication:', error)
      setError(error.message || 'Failed to add medication')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Add Medication</CardTitle>
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
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Medication Search */}
          {!showCustomForm && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Australian Medications
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name (e.g., Panadol, Nurofen...)"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  {isSearching && (
                    <div className="absolute right-3 top-2.5">
                      <div className="w-5 h-5 border-2 border-pam-red border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {searchResults.map((medication) => (
                    <div
                      key={medication.id}
                      onClick={() => handleMedicationSelect(medication)}
                      className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{medication.name}</h4>
                          {medication.generic_name && (
                            <p className="text-sm text-gray-600">Generic: {medication.generic_name}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {medication.medication_type}
                            </span>
                            {medication.tga_approved && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                TGA Approved
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {medication.strength_mg && `${medication.strength_mg}mg`}
                          <br />
                          {medication.schedule_classification}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Medication Option */}
              <div className="text-center py-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Can't find your medication?</p>
                <Button
                  onClick={() => setShowCustomForm(true)}
                  variant="outline"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Custom Medication
                </Button>
              </div>
            </div>
          )}

          {/* Custom Medication Form */}
          {showCustomForm && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Custom Medication</h3>
                <Button
                  onClick={() => setShowCustomForm(false)}
                  variant="outline"
                  size="sm"
                >
                  Back to Search
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter medication name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Strength (mg)
                  </label>
                  <input
                    type="number"
                    value={customStrength}
                    onChange={(e) => setCustomStrength(e.target.value)}
                    placeholder="e.g., 250"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Form
                  </label>
                  <select
                    value={customForm}
                    onChange={(e) => setCustomForm(e.target.value as MedicationForm)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                  >
                    <option value="liquid">Liquid</option>
                    <option value="tablet">Tablet</option>
                    <option value="drops">Drops</option>
                    <option value="suppository">Suppository</option>
                    <option value="spray">Spray</option>
                    <option value="cream">Cream</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Dosing Information */}
          {(selectedMedication || showCustomForm) && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dosing Information</h3>

              {/* Selected Medication Info */}
              {selectedMedication && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">{selectedMedication.name}</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        Recommended interval: Every {selectedMedication.dosing_interval_hours} hours
                      </p>
                      {selectedMedication.age_restriction_months > 0 && (
                        <p className="text-sm text-orange-700 mt-1">
                          ⚠️ Not recommended for children under {selectedMedication.age_restriction_months} months
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dose Amount *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={doseAmount}
                    onChange={(e) => setDoseAmount(e.target.value)}
                    placeholder="e.g., 2.5"
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
                    <option value="ml">ml (milliliters)</option>
                    <option value="mg">mg (milligrams)</option>
                    <option value="tablets">tablets</option>
                    <option value="drops">drops</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Times per Day
                  </label>
                  <select
                    value={frequencyPerDay}
                    onChange={(e) => {
                      const freq = Number(e.target.value)
                      setFrequencyPerDay(freq)
                      setIntervalHours(Math.round(24 / freq))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                  >
                    <option value={1}>1 time (daily)</option>
                    <option value={2}>2 times (12 hours)</option>
                    <option value={3}>3 times (8 hours)</option>
                    <option value={4}>4 times (6 hours)</option>
                    <option value={6}>6 times (4 hours)</option>
                  </select>
                </div>
              </div>

              {/* Schedule */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                  />
                </div>
              </div>

              {/* As Needed */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="asNeeded"
                  checked={isAsNeeded}
                  onChange={(e) => setIsAsNeeded(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-pam-red focus:ring-pam-red"
                />
                <label htmlFor="asNeeded" className="text-sm text-gray-700">
                  This is an "as needed" medication (not on a regular schedule)
                </label>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescribed By (optional)
                  </label>
                  <input
                    type="text"
                    value={prescribedBy}
                    onChange={(e) => setPrescribedBy(e.target.value)}
                    placeholder="Dr. Smith"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Food Instructions (optional)
                  </label>
                  <select
                    value={foodInstructions}
                    onChange={(e) => setFoodInstructions(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                  >
                    <option value="">No specific instructions</option>
                    <option value="with food">Take with food</option>
                    <option value="on empty stomach">Take on empty stomach</option>
                    <option value="before meals">Take before meals</option>
                    <option value="after meals">Take after meals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Instructions (optional)
                  </label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Any special instructions or notes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

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
              onClick={handleAddMedication}
              disabled={isAdding || (!selectedMedication && !showCustomForm)}
              className="flex-1 bg-pam-red hover:bg-pam-red/90"
            >
              {isAdding ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                'Add Medication'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}