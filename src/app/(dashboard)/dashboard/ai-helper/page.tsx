'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AIHelper } from '@/components/ai/AIHelper'
import { 
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { CrownIcon } from '@heroicons/react/24/solid'
import { PremiumPaywall, PremiumPrompt } from '@/components/features/premium-paywall'

interface UserProfile {
  is_premium: boolean
  ai_questions_used: number
  ai_questions_limit: number
}

export default function AIHelperPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [remainingQuestions, setRemainingQuestions] = useState(5)
  const [showPaywall, setShowPaywall] = useState(false)
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_premium, ai_questions_used, ai_questions_limit')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        // Create profile if it doesn't exist
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            is_premium: false,
            ai_questions_used: 0,
            ai_questions_limit: 5
          })
          .select('is_premium, ai_questions_used, ai_questions_limit')
          .single()

        if (newProfile) {
          setUserProfile(newProfile)
          setRemainingQuestions(newProfile.ai_questions_limit - newProfile.ai_questions_used)
        }
      } else if (data) {
        setUserProfile(data)
        setRemainingQuestions(data.ai_questions_limit - data.ai_questions_used)
      }

    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuestionUsed = () => {
    if (!userProfile?.is_premium && remainingQuestions <= 1) {
      setShowPaywall(true)
      return
    }
    setRemainingQuestions(prev => Math.max(0, prev - 1))
    // Reload profile to get updated data
    loadUserProfile()
  }

  const handleUpgrade = (planId: string) => {
    // Redirect to payment flow
    window.location.href = `/premium/checkout?plan=${planId}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <SparklesIcon className="w-8 h-8 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading AI Helper...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-purple-600" />
            AI Smart Helper
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Your personal parenting assistant
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-4">
        {/* Premium Banner */}
        {!userProfile?.is_premium && remainingQuestions <= 2 && (
          <PremiumPrompt
            feature="Unlimited AI Advice"
            onUpgrade={() => setShowPaywall(true)}
            onDismiss={() => setShowPremiumPrompt(false)}
          />
        )}

        {/* Questions Remaining Warning */}
        {!userProfile?.is_premium && remainingQuestions <= 1 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <SparklesIcon className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">Almost out of questions!</h3>
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  You have {remainingQuestions} question{remainingQuestions !== 1 ? 's' : ''} left this month. Upgrade for unlimited access.
                </p>
                <button
                  onClick={() => setShowPaywall(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600 transition-colors"
                >
                  <CrownIcon className="w-4 h-4" />
                  Get Unlimited Access
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Helper Component */}
        <AIHelper
          isPremium={userProfile?.is_premium || false}
          remainingQuestions={remainingQuestions}
          onQuestionUsed={handleQuestionUsed}
        />

        {/* Features Info */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
            <LightBulbIcon className="w-4 h-4" />
            What I can help with:
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-purple-600">👶</span>
              <span>Baby development, feeding, sleep, and milestones</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600">🏥</span>
              <span>Australian healthcare, Medicare, and immunizations</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600">📋</span>
              <span>Government admin, Centrelink, and registrations</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600">💝</span>
              <span>Self-care tips and mental health support</span>
            </div>
          </div>
        </div>

        {/* Example Questions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            Popular questions:
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div>"Is my baby getting enough sleep?"</div>
            <div>"How do I apply for Family Tax Benefit?"</div>
            <div>"When should I introduce solid foods?"</div>
            <div>"What should I expect at the 6-week checkup?"</div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-gradient-to-r from-pink-100 to-orange-100 rounded-xl p-4 border border-pink-200">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <HeartIcon className="w-4 h-4" />
            Important reminder
          </h3>
          <p className="text-sm text-gray-700">
            While I'm here to support you, always consult your GP, maternal health nurse, or other healthcare professionals for medical concerns. You're doing an amazing job! 💕
          </p>
        </div>
      </div>

      {/* Premium Paywall */}
      {showPaywall && (
        <PremiumPaywall
          trigger="ai_limit"
          remainingQuestions={remainingQuestions}
          onClose={() => setShowPaywall(false)}
          onUpgrade={handleUpgrade}
        />
      )}
    </div>
  )
}