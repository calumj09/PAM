'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SubscriptionService, UserSubscription, SubscriptionPlan } from '@/lib/services/subscription-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  StarIcon,
  CheckIcon,
  XMarkIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  SparklesIcon,
  ArrowUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { StarIcon as CrownIcon } from '@heroicons/react/24/solid'

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    loadSubscriptionData()
  }, [])

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load subscription and plans
      const [userSub, availablePlans, trialDays] = await Promise.all([
        SubscriptionService.getUserSubscription(user.id),
        SubscriptionService.getPlans(),
        SubscriptionService.getTrialDaysRemaining(user.id)
      ])

      setSubscription(userSub)
      setPlans(availablePlans)
      setTrialDaysRemaining(trialDays)
    } catch (error) {
      console.error('Error loading subscription data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = async (planId: string) => {
    try {
      setIsProcessing(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { url } = await SubscriptionService.createCheckoutSession(
        user.id,
        planId,
        `${window.location.origin}/dashboard/subscription?success=true`,
        `${window.location.origin}/dashboard/subscription?canceled=true`
      )

      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to start checkout process. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleManageBilling = async () => {
    try {
      setIsProcessing(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { url } = await SubscriptionService.createPortalSession(
        user.id,
        `${window.location.origin}/dashboard/subscription`
      )

      window.location.href = url
    } catch (error) {
      console.error('Error creating portal session:', error)
      alert('Failed to open billing portal. Please contact support.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const currentPlan = plans.find(p => p.tier === subscription?.tier)
  const isPremium = subscription?.tier === 'premium'
  const isTrialing = subscription?.status === 'trialing'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <CrownIcon className="w-6 h-6 text-pam-red" />
        <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
      </div>

      {/* Current Subscription Status */}
      {subscription && (
        <Card className={`border-l-4 ${
          isPremium ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 bg-gray-50'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${
                  isPremium ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  {isPremium ? (
                    <CrownIcon className="w-6 h-6 text-yellow-600" />
                  ) : (
                    <SparklesIcon className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {currentPlan?.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Status: {SubscriptionService.getStatusDisplayText(subscription.status)}
                  </p>
                  
                  {isTrialing && trialDaysRemaining > 0 && (
                    <p className="text-sm text-blue-600 font-medium">
                      ✨ {trialDaysRemaining} days left in your free trial
                    </p>
                  )}
                  
                  {isPremium && !isTrialing && (
                    <p className="text-sm text-gray-600">
                      Next billing: {SubscriptionService.formatBillingDate(subscription.currentPeriodEnd)}
                    </p>
                  )}
                  
                  {subscription.cancelAtPeriodEnd && (
                    <p className="text-sm text-orange-600 font-medium">
                      ⚠️ Subscription will cancel on {SubscriptionService.formatBillingDate(subscription.currentPeriodEnd)}
                    </p>
                  )}
                </div>
              </div>
              
              {isPremium && (
                <Button
                  onClick={handleManageBilling}
                  disabled={isProcessing}
                  variant="outline"
                  size="sm"
                >
                  <CreditCardIcon className="w-4 h-4 mr-2" />
                  Manage Billing
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trial Warning */}
      {isTrialing && trialDaysRemaining <= 3 && (
        <Card className="border-l-4 border-orange-500 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900">Trial Ending Soon!</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Your free trial ends in {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''}. 
                  Upgrade now to continue enjoying premium features.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative ${
                plan.popular ? 'ring-2 ring-pam-red' : ''
              } ${
                subscription?.tier === plan.tier ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-pam-red text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2">
                  {plan.tier === 'premium' ? (
                    <CrownIcon className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <SparklesIcon className="w-5 h-5 text-gray-500" />
                  )}
                  {plan.name}
                </CardTitle>
                
                <div className="mt-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {plan.priceAUD === 0 ? 'Free' : SubscriptionService.formatPrice(plan.priceAUD)}
                  </div>
                  {plan.priceAUD > 0 && (
                    <p className="text-sm text-gray-600">per month (including GST)</p>
                  )}
                  
                  {plan.trialDays && (
                    <p className="text-sm text-blue-600 font-medium mt-2">
                       {plan.trialDays}-day free trial
                    </p>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {/* Action Button */}
                <div className="pt-4">
                  {subscription?.tier === plan.tier ? (
                    <Button disabled className="w-full" variant="outline">
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : plan.tier === 'free' ? (
                    <Button 
                      disabled 
                      className="w-full opacity-50"
                      variant="outline"
                    >
                      Downgrade Available via Billing Portal
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isProcessing}
                      className="w-full bg-pam-red hover:bg-pam-red/90"
                    >
                      {isProcessing ? (
                        'Processing...'
                      ) : subscription?.tier === 'free' ? (
                        <>
                          <ArrowUpIcon className="w-4 h-4 mr-2" />
                          Start Free Trial
                        </>
                      ) : (
                        'Upgrade Plan'
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Australian Compliance Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2"> Australian Billing Information</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• All prices are in Australian Dollars (AUD) and include GST</p>
            <p>• Payments are processed securely by Stripe</p>
            <p>• You can cancel anytime through the billing portal</p>
            <p>• Questions? Contact our Australian support team</p>
          </div>
        </CardContent>
      </Card>

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium">Feature</th>
                  <th className="text-center py-3 font-medium">Free</th>
                  <th className="text-center py-3 font-medium">Premium</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {[
                  { name: 'Children profiles', free: '2', premium: 'Unlimited' },
                  { name: 'Activity tracking', free: '✓', premium: '✓' },
                  { name: 'Basic analytics', free: '✓', premium: '✓' },
                  { name: 'AI chat', free: 'Limited', premium: 'Unlimited' },
                  { name: 'Google Calendar sync', free: '✗', premium: '✓' },
                  { name: 'Advanced analytics', free: '✗', premium: '✓' },
                  { name: 'Data export', free: '✗', premium: '✓' },
                  { name: 'Priority support', free: '✗', premium: '✓' },
                ].map((feature, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 text-gray-900">{feature.name}</td>
                    <td className="py-3 text-center">
                      {feature.free === '✓' ? (
                        <CheckIcon className="w-4 h-4 text-green-600 mx-auto" />
                      ) : feature.free === '✗' ? (
                        <XMarkIcon className="w-4 h-4 text-red-500 mx-auto" />
                      ) : (
                        <span className="text-gray-600">{feature.free}</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {feature.premium === '✓' ? (
                        <CheckIcon className="w-4 h-4 text-green-600 mx-auto" />
                      ) : feature.premium === '✗' ? (
                        <XMarkIcon className="w-4 h-4 text-red-500 mx-auto" />
                      ) : (
                        <span className="text-gray-900 font-medium">{feature.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}