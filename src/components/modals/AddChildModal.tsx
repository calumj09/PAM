'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'

interface AddChildModalProps {
  isOpen: boolean
  onClose: () => void
  onChildAdded: () => void
  userId: string
}

const australianStates = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'SA', label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NT', label: 'Northern Territory' },
]

const feedingMethods = [
  { value: 'breastfeeding', label: 'Breastfeeding' },
  { value: 'bottle', label: 'Bottle feeding' },
  { value: 'mixed', label: 'Mixed feeding' },
]

const birthTypes = [
  { value: 'vaginal', label: 'Vaginal birth' },
  { value: 'c-section', label: 'C-section' },
]

const babyTypes = [
  { value: 'single', label: 'Single baby' },
  { value: 'twins', label: 'Twins' },
]

export function AddChildModal({ isOpen, onClose, onChildAdded, userId }: AddChildModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form data
  const [babyName, setBabyName] = useState('')
  const [babyType, setBabyType] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [isDueDate, setIsDueDate] = useState(false)
  const [gender, setGender] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [headCircumference, setHeadCircumference] = useState('')
  const [feedingMethod, setFeedingMethod] = useState('')
  const [birthType, setBirthType] = useState('')
  const [stateTerritory, setStateTerritory] = useState('')
  
  const supabase = createClient()

  const resetForm = () => {
    setBabyName('')
    setBabyType('')
    setDateOfBirth('')
    setIsDueDate(false)
    setGender('')
    setHeight('')
    setWeight('')
    setHeadCircumference('')
    setFeedingMethod('')
    setBirthType('')
    setStateTerritory('')
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const babyData = {
        user_id: userId,
        name: babyName,
        date_of_birth: dateOfBirth,
        is_due_date: isDueDate,
        baby_type: babyType,
        gender: gender || null,
        birth_height_cm: height ? parseFloat(height) : null,
        birth_weight_grams: weight ? parseFloat(weight) * 1000 : null,
        head_circumference_cm: headCircumference ? parseFloat(headCircumference) : null,
        feeding_method: feedingMethod || null,
        birth_type: birthType || null,
        is_premium_feature: false
      }

      const { error: insertError } = await supabase
        .from('children')
        .insert(babyData)

      if (insertError) throw insertError

      // Generate checklist if we have state territory
      if (stateTerritory) {
        try {
          const checklistModule = await import('@/lib/services/checklist-service')
          if (checklistModule && checklistModule.ChecklistService) {
            await checklistModule.ChecklistService.generateChecklistForChild(
              babyData.user_id,
              dateOfBirth,
              stateTerritory
            )
          }
        } catch (checklistError) {
          console.error('Error generating checklist:', checklistError)
          // Continue anyway - don't block child creation
        }
      }

      onChildAdded()
      handleClose()
    } catch (err: unknown) {
      console.error('Error adding child:', err)
      setError(err instanceof Error ? err.message : 'Failed to add child')
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = babyName.trim() && babyType && dateOfBirth

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-surface rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Add Child</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Baby's name *
            </label>
            <input
              type="text"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              className="input-field"
              placeholder="Enter baby's name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Baby type *
            </label>
            <div className="space-y-2">
              {babyTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setBabyType(type.value)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    babyType === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Location */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Date of birth (or due date) *
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="input-field"
              required
            />
            <div className="mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isDueDate}
                  onChange={(e) => setIsDueDate(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">This is a due date (baby not born yet)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your state/territory
            </label>
            <select
              value={stateTerritory}
              onChange={(e) => setStateTerritory(e.target.value)}
              className="select-field"
            >
              <option value="">Select your state/territory</option>
              {australianStates.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>

          {/* Optional measurements */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Gender (optional)
            </label>
            <div className="flex gap-2">
              {['boy', 'girl', 'other'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`toggle-button flex-1 ${
                    gender === g ? 'selected' : ''
                  }`}
                >
                  <div className="text-sm font-medium capitalize">{g}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="input-field"
                placeholder="3.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="input-field"
                placeholder="50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Head circumference (cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={headCircumference}
              onChange={(e) => setHeadCircumference(e.target.value)}
              className="input-field"
              placeholder="35"
            />
          </div>

          {/* Optional feeding & birth info */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Feeding method
            </label>
            <div className="space-y-2">
              {feedingMethods.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setFeedingMethod(method.value)}
                  className={`toggle-button w-full text-left ${
                    feedingMethod === method.value ? 'selected' : ''
                  }`}
                >
                  <span className="font-medium">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Birth type
            </label>
            <div className="space-y-2">
              {birthTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setBirthType(type.value)}
                  className={`toggle-button w-full text-left ${
                    birthType === type.value ? 'selected' : ''
                  }`}
                >
                  <span className="font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-3">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="button-secondary flex-1"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button-primary flex-1"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                'Add Child'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}