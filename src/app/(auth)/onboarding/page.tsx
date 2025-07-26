'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeftIcon, ChevronRightIcon, HeartIcon } from '@heroicons/react/24/outline'

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
  { value: 'breastfeeding', label: 'Breastfeeding', emoji: '🤱' },
  { value: 'bottle', label: 'Bottle feeding', emoji: '🍼' },
  { value: 'mixed', label: 'Mixed feeding', emoji: '💕' },
]

const birthTypes = [
  { value: 'vaginal', label: 'Vaginal birth', emoji: '👶' },
  { value: 'c-section', label: 'C-section', emoji: '🏥' },
]

const babyTypes = [
  { value: 'single', label: 'Single baby', emoji: '👶' },
  { value: 'twins', label: 'Twins', emoji: '👶👶' },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
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
  
  const router = useRouter()
  const supabase = createClient()

  const totalSteps = 5

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = async () => {
    setIsLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Update user profile with state
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          state_territory: stateTerritory,
          updated_at: new Date().toISOString()
        })

      if (profileError) throw profileError

      // Create baby profile
      const babyData = {
        user_id: user.id,
        name: babyName,
        date_of_birth: dateOfBirth,
        is_due_date: isDueDate,
        baby_type: babyType,
        gender: gender || null,
        birth_height_cm: height ? parseFloat(height) : null,
        birth_weight_grams: weight ? parseFloat(weight) * 1000 : null, // Convert kg to grams
        head_circumference_cm: headCircumference ? parseFloat(headCircumference) : null,
        feeding_method: feedingMethod || null,
        birth_type: birthType || null,
        is_premium_feature: false
      }

      const { data: baby, error: babyError } = await supabase
        .from('children')
        .insert(babyData)
        .select()
        .single()

      if (babyError) throw babyError

      // Generate checklist for the baby
      try {
        const { ChecklistService } = await import('@/lib/services/checklist-service')
        await ChecklistService.generateChecklistForChild(
          baby.id,
          baby.date_of_birth,
          stateTerritory
        )
      } catch (checklistError) {
        console.error('Error generating checklist:', checklistError)
        // Don't throw - baby creation succeeded
      }

      // Redirect to Today page
      router.push('/dashboard/today')
    } catch (err) {
      console.error('Onboarding error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return babyName.trim() && babyType
      case 2:
        return dateOfBirth && stateTerritory
      case 3:
        return true // Optional measurements
      case 4:
        return true // Optional feeding/birth info
      case 5:
        return true // Final confirmation
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">PAM Setup</h1>
                <p className="text-xs text-gray-500">Let's get you started!</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {currentStep}/{totalSteps}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Step 1: Baby Basic Info */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">👶</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Tell us about your baby</h2>
                <p className="text-sm text-gray-600">This helps us personalize your timeline</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Baby's name
                  </label>
                  <input
                    type="text"
                    value={babyName}
                    onChange={(e) => setBabyName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="Enter baby's name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Baby type
                  </label>
                  <div className="space-y-2">
                    {babyTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setBabyType(type.value)}
                        className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                          babyType === type.value
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{type.emoji}</span>
                          <span className="font-medium">{type.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Date & Location */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">📅</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">When and where?</h2>
                <p className="text-sm text-gray-600">This helps us show the right Australian resources</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of birth (or due date)
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                  <div className="mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isDueDate}
                        onChange={(e) => setIsDueDate(e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-600">This is a due date (baby not born yet)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your state/territory
                  </label>
                  <select
                    value={stateTerritory}
                    onChange={(e) => setStateTerritory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select your state/territory</option>
                    {australianStates.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Baby Measurements (Optional) */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">📏</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Birth measurements</h2>
                <p className="text-sm text-gray-600">Optional - you can add these later in growth tracking</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender (optional)
                  </label>
                  <div className="flex gap-2">
                    {['boy', 'girl', 'other'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                          gender === g
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium capitalize">{g}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="3.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Head circumference (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={headCircumference}
                    onChange={(e) => setHeadCircumference(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="35"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Feeding & Birth Info (Optional) */}
          {currentStep === 4 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🍼</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Feeding & birth details</h2>
                <p className="text-sm text-gray-600">Optional - helps us give better suggestions</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Feeding method
                  </label>
                  <div className="space-y-2">
                    {feedingMethods.map((method) => (
                      <button
                        key={method.value}
                        onClick={() => setFeedingMethod(method.value)}
                        className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                          feedingMethod === method.value
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{method.emoji}</span>
                          <span className="font-medium">{method.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Birth type
                  </label>
                  <div className="space-y-2">
                    {birthTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setBirthType(type.value)}
                        className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                          birthType === type.value
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{type.emoji}</span>
                          <span className="font-medium">{type.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Final Welcome */}
          {currentStep === 5 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🎉</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">You're all set!</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Welcome to PAM! We're creating your personalized timeline now.
                </p>
                
                <div className="bg-gradient-to-r from-pink-100 to-orange-100 rounded-xl p-4 border border-pink-200">
                  <div className="flex items-center gap-3 mb-3">
                    <HeartIcon className="w-5 h-5 text-pink-600" />
                    <span className="font-medium text-gray-900">Your PAM journey starts now</span>
                  </div>
                  <p className="text-sm text-gray-700 text-left">
                    • Get personalized Australian timeline<br/>
                    • Track {babyName}'s milestones<br/>
                    • Reduce your mental load<br/>
                    • Take care of yourself too ✨
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <ChevronLeftIcon className="w-5 h-5" />
              Back
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  isStepValid()
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={completeOnboarding}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Setting up...
                  </>
                ) : (
                  <>
                    Start using PAM
                    <HeartIcon className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}