'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  HeartIcon,
  CalendarDaysIcon,
  UsersIcon,
  LockClosedIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'

interface PremiumFeature {
  id: string
  title: string
  description: string
  icon: string
  category: 'ai' | 'calendar' | 'family' | 'insights' | 'support'
}

interface PremiumPlan {
  id: string
  name: string
  price: number
  period: 'month' | 'year'
  savings?: number
  features: string[]
  popular?: boolean
  description: string
}

interface PremiumPaywallProps {
  trigger: 'ai_limit' | 'calendar_sync' | 'family_sharing' | 'advanced_insights' | 'expert_chat'
  onClose: () => void
  onUpgrade: (planId: string) => void
  remainingQuestions?: number
}

export function PremiumPaywall({ trigger, onClose, onUpgrade, remainingQuestions }: PremiumPaywallProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('premium_monthly')

  const premiumFeatures: PremiumFeature[] = [
    {
      id: 'unlimited_ai',
      title: 'Unlimited AI Questions',
      description: 'Ask as many questions as you need with personalised advice for your baby',
      icon: '🤖',
      category: 'ai'
    },
    {
      id: 'calendar_sync',
      title: 'Calendar Sync',
      description: 'Sync with Google Calendar, Apple Calendar, and Outlook',
      icon: '📅',
      category: 'calendar'
    },
    {
      id: 'family_sharing',
      title: 'Family Sharing',
      description: 'Share milestones and progress with partners and grandparents',
      icon: '👨‍👩‍👧‍👦',
      category: 'family'
    },
    {
      id: 'advanced_insights',
      title: 'Development Insights',
      description: 'AI-powered analysis of your baby\'s sleep, feeding, and development patterns',
      icon: '📊',
      category: 'insights'
    },
    {
      id: 'expert_chat',
      title: 'Expert Consultations',
      description: 'Access to qualified maternal health experts for urgent questions',
      icon: '👩‍⚕️',
      category: 'support'
    },
    {
      id: 'priority_support',
      title: 'Priority Support',
      description: '24/7 priority customer support and faster response times',
      icon: '⚡',
      category: 'support'
    }
  ]

  const plans: PremiumPlan[] = [
    {
      id: 'premium_monthly',
      name: 'Premium Monthly',
      price: 9.99,
      period: 'month',
      description: 'Perfect for trying premium features',
      features: [
        'Unlimited AI questions',
        'Calendar sync',
        'Family sharing (up to 4 members)',
        'Development insights',
        'Priority support'
      ]
    },
    {
      id: 'premium_yearly',
      name: 'Premium Yearly',
      price: 89.99,
      period: 'year',
      savings: 25,
      popular: true,
      description: 'Best value for growing families',
      features: [
        'Everything in Premium Monthly',
        'Expert consultations (2 per month)',
        'Advanced milestone tracking',
        'Family sharing (unlimited)',
        'Export data features'
      ]
    },
    {
      id: 'family_plan',
      name: 'Family Plan',
      price: 149.99,
      period: 'year',
      description: 'For families with multiple children',
      features: [
        'Everything in Premium Yearly',
        'Multiple children profiles',
        'Unlimited expert consultations',
        'Advanced analytics dashboard',
        'Custom milestone plans'
      ]
    }
  ]

  const getTriggerContent = () => {
    switch (trigger) {
      case 'ai_limit':
        return {
          title: 'You\'ve reached your question limit',
          subtitle: `You have ${remainingQuestions || 0} free questions remaining this month`,
          description: 'Upgrade to Premium for unlimited personalised AI advice tailored to your baby\'s development.',
          icon: '🤖',
          urgency: 'high' as const
        }
      case 'calendar_sync':
        return {
          title: 'Sync with your calendar',
          subtitle: 'Never miss an important milestone or appointment',
          description: 'Connect PAM with Google Calendar, Apple Calendar, or Outlook to get reminders on all your devices.',
          icon: '📅',
          urgency: 'medium' as const
        }
      case 'family_sharing':
        return {
          title: 'Share the journey with family',
          subtitle: 'Keep everyone connected to your baby\'s progress',
          description: 'Invite partners, grandparents, and caregivers to share in your baby\'s milestones and development.',
          icon: '👨‍👩‍👧‍👦',
          urgency: 'low' as const
        }
      case 'advanced_insights':
        return {
          title: 'Unlock development insights',
          subtitle: 'AI-powered analysis of your baby\'s patterns',
          description: 'Get personalised insights about sleep, feeding, and development trends with recommendations.',
          icon: '📊',
          urgency: 'medium' as const
        }
      case 'expert_chat':
        return {
          title: 'Chat with parenting experts',
          subtitle: 'Get professional guidance when you need it',
          description: 'Access qualified maternal health experts for urgent questions and personalised advice.',
          icon: '👩‍⚕️',
          urgency: 'high' as const
        }
      default:
        return {
          title: 'Unlock Premium Features',
          subtitle: 'Get the most out of PAM',
          description: 'Access all premium features designed to support your parenting journey.',
          icon: '👑',
          urgency: 'medium' as const
        }
    }
  }

  const triggerContent = getTriggerContent()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-6 border-b border-gray-100 ${
          triggerContent.urgency === 'high' 
            ? 'bg-gradient-to-r from-red-50 to-orange-50' 
            : triggerContent.urgency === 'medium'
              ? 'bg-gradient-to-r from-yellow-50 to-orange-50'
              : 'bg-gradient-to-r from-blue-50 to-purple-50'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                triggerContent.urgency === 'high' 
                  ? 'bg-red-100' 
                  : triggerContent.urgency === 'medium'
                    ? 'bg-yellow-100'
                    : 'bg-blue-100'
              }`}>
                {triggerContent.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{triggerContent.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{triggerContent.subtitle}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-700 mt-4">{triggerContent.description}</p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Plans */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <StarSolid className="w-5 h-5 text-yellow-500" />
              Choose Your Plan
            </h3>
            
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-pam-red bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${plan.popular ? 'ring-2 ring-pam-pink ring-opacity-50' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-4 px-3 py-1 bg-pam-red text-white text-xs rounded-full font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === plan.id
                          ? 'border-pam-red bg-pam-red'
                          : 'border-gray-300'
                      }`}>
                        {selectedPlan === plan.id && (
                          <CheckIcon className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-sm text-gray-500">/{plan.period}</span>
                    </div>
                    {plan.savings && (
                      <div className="text-xs text-green-600 font-medium">
                        Save {plan.savings}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Features Preview */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">What you'll get:</h4>
            <div className="space-y-2">
              {premiumFeatures.slice(0, 4).map((feature) => (
                <div key={feature.id} className="flex items-center gap-3">
                  <span className="text-lg">{feature.icon}</span>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900">{feature.title}</h5>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </div>
                  <CheckIcon className="w-4 h-4 text-green-600" />
                </div>
              ))}
              {premiumFeatures.length > 4 && (
                <div className="text-xs text-gray-500 text-center pt-2">
                  +{premiumFeatures.length - 4} more premium features
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={() => onUpgrade(selectedPlan)}
              className="flex-1 bg-pam-red hover:bg-pam-red/90 text-white"
            >
              <StarIcon className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
            <span>💳 Cancel anytime</span>
            <span>•</span>
            <span>🔒 Secure payment</span>
            <span>•</span>
            <span>📱 Instant access</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Small inline upgrade prompt for subtle encouragement
export function PremiumPrompt({ 
  feature, 
  onUpgrade, 
  onDismiss 
}: { 
  feature: string
  onUpgrade: () => void
  onDismiss: () => void 
}) {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 my-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <SparklesIcon className="w-5 h-5 text-yellow-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">Unlock {feature}</h3>
          <p className="text-sm text-gray-600 mt-1 mb-3">
            Get personalised insights and unlimited access with Premium.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onUpgrade}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <StarIcon className="w-3 h-3 mr-1" />
              Learn More
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDismiss}
              className="text-gray-600"
            >
              Dismiss
            </Button>
          </div>
        </div>
        <button 
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Feature lock component for premium-only features
export function FeatureLock({ 
  title, 
  description, 
  onUpgrade 
}: { 
  title: string
  description: string
  onUpgrade: () => void 
}) {
  return (
    <div className="text-center py-8 px-6">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <LockClosedIcon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">{description}</p>
      <Button
        onClick={onUpgrade}
        className="bg-pam-red hover:bg-pam-red/90 text-white"
      >
        <StarIcon className="w-4 h-4 mr-2" />
        Upgrade to Premium
      </Button>
    </div>
  )
}