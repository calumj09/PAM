'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SubscriptionService } from '@/lib/services/subscription-service'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  SparklesIcon,
  LockClosedIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { StarIcon as CrownIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

import type { FeatureAccess } from '@/lib/services/subscription-service'

interface PremiumGateProps {
  feature: keyof FeatureAccess
  title: string
  description: string
  children: React.ReactNode
  showUpgrade?: boolean
}

export function PremiumGate({ 
  feature, 
  title, 
  description, 
  children, 
  showUpgrade = true 
}: PremiumGateProps) {
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isTrialing, setIsTrialing] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    checkAccess()
  }, [feature])

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setHasAccess(false)
        setIsLoading(false)
        return
      }

      const [access, trial] = await Promise.all([
        SubscriptionService.hasFeatureAccess(user.id, feature),
        SubscriptionService.isInTrial(user.id)
      ])

      setHasAccess(access)
      setIsTrialing(trial)
    } catch (error) {
      console.error('Error checking feature access:', error)
      setHasAccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-xl"></div>
      </div>
    )
  }

  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 opacity-50"></div>
      
      <CardContent className="relative p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
          <CrownIcon className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
        
        <div className="flex items-center justify-center gap-2 mb-6">
          <LockClosedIcon className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-700">Premium Feature</span>
        </div>
        
        {showUpgrade && (
          <div className="space-y-3">
            {isTrialing ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-700 font-medium">
                    You&apos;re on a free trial! This feature is included.
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Complete your setup to start using premium features.
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-2">
                  <CrownIcon className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-yellow-700 font-medium">
                    Upgrade to PAM Premium
                  </span>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  Get 14 days free, then just $9.99/month (including GST)
                </p>
              </div>
            )}
            
            <Link href="/dashboard/subscription">
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0">
                <CrownIcon className="w-4 h-4 mr-2" />
                {isTrialing ? 'Continue with Trial' : 'Start Free Trial'}
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>✨ Cancel anytime</p>
              <p>🇦🇺 Australian billing & support</p>
              <p>💳 Secure payment by Stripe</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Hook for checking premium access
export function usePremiumAccess(feature: keyof FeatureAccess) {
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    checkAccess()
  }, [feature])

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setHasAccess(false)
        setIsLoading(false)
        return
      }

      const access = await SubscriptionService.hasFeatureAccess(user.id, feature)
      setHasAccess(access)
    } catch (error) {
      console.error('Error checking feature access:', error)
      setHasAccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  return { hasAccess, isLoading }
}