'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'

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
  { value: 'breastfeeding', label: 'Breastfeeding', emoji: '' },
  { value: 'bottle', label: 'Bottle feeding', emoji: '' },
  { value: 'mixed', label: 'Mixed feeding', emoji: '' },
]

const birthTypes = [
  { value: 'vaginal', label: 'Vaginal birth', emoji: '' },
  { value: 'c-section', label: 'C-section', emoji: '' },
]

const babyTypes = [
  { value: 'single', label: 'Single baby', emoji: '' },
  { value: 'twins', label: 'Twins', emoji: '' },
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
      console.log('Starting onboarding completion...')
      console.log('Form data collected:', {
        babyName,
        babyType,
        dateOfBirth,
        isDueDate,
        gender,
        height,
        weight,
        headCircumference,
        feedingMethod,
        birthType,
        stateTerritory
      })
      
      // Step 1: Test basic connection
      console.log('Testing Supabase connection...')
      const connectionTest = await supabase.from('profiles').select('count').limit(1)
      console.log('Connection test result:', connectionTest)
      
      console.log('Checking authentication...')
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('ERROR Auth check failed:', authError)
        throw new Error(`Authentication check failed: ${authError.message}`)
      }
      
      if (!user) {
        console.error('ERROR No user found')
        throw new Error('Not authenticated - no user found')
      }
      
      console.log('SUCCESS User authenticated:', user.id, user.email)

      // Step 2: Test profile table structure
      console.log('TESTING Testing profile table structure...')
      const profileStructureTest = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .limit(1)
      console.log('TESTING Profile structure test:', profileStructureTest)

      // Step 3: Update user profile with state
      console.log(' Updating user profile...')
      console.log('INFO Profile data to insert:', {
        id: user.id,
        state_territory: stateTerritory
      })
      
      // Use basic profile data to avoid column errors
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          state_territory: stateTerritory
        })
        .select()

      console.log(' Profile upsert result:', { data: profileData, error: profileError })

      if (profileError) {
        console.error('ERROR Profile update failed:', profileError)
        console.error('ERROR Profile error details:', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint
        })
        throw new Error(`PROFILE ERROR: ${profileError.message} (Code: ${profileError.code})`)
      }
      
      console.log('SUCCESS Profile updated successfully:', profileData)

      // Step 4: Test children table structure
      console.log('TESTING Testing children table structure...')
      const childrenStructureTest = await supabase
        .from('children')
        .select('*')
        .limit(1)
      console.log('TESTING Children structure test:', childrenStructureTest)

      // Step 5: Create baby profile with all data
      console.log(' Creating baby profile...')
      
      // Include all the collected data
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

      console.log(' Baby data to insert (full):', babyData)
      const { data: baby, error: babyError } = await supabase
        .from('children')
        .insert(babyData)
        .select()
        .single()

      console.log(' Baby creation result:', { data: baby, error: babyError })

      if (babyError) {
        console.error('ERROR Baby creation error:', babyError)
        console.error('ERROR Baby error details:', {
          message: babyError.message,
          code: babyError.code,
          details: babyError.details,
          hint: babyError.hint
        })
        
        // Try with basic data if extended columns fail
        console.log('RETRY Trying with basic baby data only...')
        const basicBabyData = {
          user_id: user.id,
          name: babyName,
          date_of_birth: dateOfBirth,
          is_premium_feature: false
        }
        
        console.log(' Basic baby data:', basicBabyData)
        const { data: basicBaby, error: basicError } = await supabase
          .from('children')
          .insert(basicBabyData)
          .select()
          .single()
          
        console.log(' Basic baby creation result:', { data: basicBaby, error: basicError })
        
        if (basicError) {
          console.error('ERROR Basic baby creation also failed:', basicError)
          throw new Error(`BABY ERROR: ${basicError.message} (Code: ${basicError.code})`)
        }
        
        baby = basicBaby
        console.log('SUCCESS Baby profile created with basic data:', baby.id)
      } else {
        console.log('SUCCESS Baby profile created with full data:', baby.id)
      }
      
      console.log('COMPLETE Baby profile successfully created:', baby)

      // Step 6: Generate checklist for the baby (optional - don't fail if this breaks)
      try {
        console.log('Form data Testing checklist table structure...')
        const checklistStructureTest = await supabase
          .from('checklist_items')
          .select('*')
          .limit(1)
        console.log('Form data Checklist structure test:', checklistStructureTest)
        
        console.log('Form data Generating checklist...')
        const checklistModule = await import('@/lib/services/checklist-service')
        console.log('PACKAGE Checklist module loaded:', !!checklistModule)
        console.log('TOOL ChecklistService available:', !!checklistModule?.ChecklistService)
        
        if (checklistModule && checklistModule.ChecklistService) {
          console.log('Form data Calling generateChecklistForChild with:', {
            babyId: baby.id,
            dateOfBirth: baby.date_of_birth,
            state: stateTerritory
          })
          
          await checklistModule.ChecklistService.generateChecklistForChild(
            baby.id,
            baby.date_of_birth,
            stateTerritory
          )
          console.log('SUCCESS Checklist generated successfully')
        } else {
          console.warn('WARNING ChecklistService not available, skipping checklist generation')
        }
      } catch (checklistError: unknown) {
        console.error('ERROR Error generating checklist:', checklistError)
        console.error('SEARCH Checklist error details:', checklistError)
        
        // Check if it's a schema error
        const error = checklistError as { message?: string; code?: string }
        if (error.message?.includes('metadata') || error.code === '42703') {
          console.warn('WARNING Database schema missing metadata column - checklist generation skipped')
        }
        
        // IMPORTANT: Don't throw here - baby creation succeeded, continue to dashboard
        console.log('NEXT Continuing to dashboard despite checklist error')
      }

      console.log('Starting Redirecting to dashboard...')
      
      // Success! Redirect immediately without setting loading to false first
      console.log('INFO About to redirect to /dashboard/today')
      
      // Try router.push first
      try {
        router.push('/dashboard/today')
        console.log('SUCCESS Router.push called successfully')
      } catch (routerError) {
        console.error('ERROR Router.push failed:', routerError)
        // Fallback to window.location
        window.location.href = '/dashboard/today'
      }
      
      // Return early to prevent setIsLoading(false) in finally block
      return
    } catch (err: unknown) {
      console.error('ERROR ONBOARDING FAILED:', err)
      console.error('ERROR Full error details:', err)
      
      // Provide very detailed error messages
      let errorMessage = 'An error occurred during setup'
      
      if (err instanceof Error) {
        if (err.message.includes('PROFILE ERROR')) {
          errorMessage = `Profile creation failed: ${err.message}`
        } else if (err.message.includes('BABY ERROR')) {
          errorMessage = `Baby profile creation failed: ${err.message}`
        } else if (err.message.includes('column') || err.message.includes('42703')) {
          errorMessage = `Database column missing: ${err.message}. Please run the database migration.`
        } else if (err.message.includes('authentication') || err.message.includes('auth')) {
          errorMessage = `Authentication error: ${err.message}`
        } else if (err.message.includes('Network') || err.message.includes('fetch')) {
          errorMessage = `Network error: ${err.message}`
        } else {
          errorMessage = `Detailed error: ${err.message}`
        }
      } else {
        errorMessage = `Unknown error: ${JSON.stringify(err)}`
      }
      
      setError(errorMessage)
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
                <p className="text-xs text-gray-500">Let&apos;s get you started!</p>
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
                <div className="text-4xl mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Tell us about your baby</h2>
                <p className="text-sm text-gray-600">This helps us personalise your timeline</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Baby&apos;s name
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
                        <span className="font-medium">{type.label}</span>
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
                <div className="text-4xl mb-4"></div>
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
                <div className="text-4xl mb-4"></div>
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
                <div className="text-4xl mb-4"></div>
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
                        <span className="font-medium">{type.label}</span>
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
                <div className="text-4xl mb-4">✓</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">You&apos;re all set!</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Welcome to PAM! We&apos;re creating your personalised timeline now.
                </p>
                
                <div className="bg-gradient-to-r from-pink-100 to-orange-100 rounded-xl p-4 border border-pink-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Heart className="w-5 h-5 text-pink-600" />
                    <span className="font-medium text-gray-900">Your PAM journey starts now</span>
                  </div>
                  <p className="text-sm text-gray-700 text-left">
                    • Get personalised Australian timeline<br/>
                    • Track {babyName}&apos;s milestones<br/>
                    • Reduce your mental load<br/>
                    • Take care of yourself too
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-red-500 text-lg">WARNING</div>
                    <div className="w-full">
                      <h4 className="text-sm font-medium text-red-800 mb-1">Setup Error</h4>
                      <p className="text-sm text-red-600 mb-2 break-words">{error}</p>
                      <details className="text-xs text-red-500">
                        <summary className="cursor-pointer hover:text-red-700">Technical details</summary>
                        <pre className="mt-2 p-2 bg-red-100 rounded overflow-x-auto text-[10px]">{error}</pre>
                      </details>
                      <p className="text-xs text-red-500 mt-2">
                        Please check the browser console for more details. Press F12 to open developer tools.
                      </p>
                    </div>
                  </div>
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
              <ChevronLeft className="w-5 h-5" />
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
                <ChevronRight className="w-5 h-5" />
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
                ) : error ? (
                  <>
                    Try Again
                    <Heart className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Start using PAM
                    <Heart className="w-5 h-5" />
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