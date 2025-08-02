'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SubscriptionService } from '@/lib/services/subscription-service'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { StarIcon as CrownIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

export function Header() {
  const router = useRouter()
  const supabase = createClient()
  const [isPremium, setIsPremium] = useState(false)
  const [isTrialing, setIsTrialing] = useState(false)

  useEffect(() => {
    checkSubscriptionStatus()
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [premium, trial] = await Promise.all([
        SubscriptionService.isPremiumUser(user.id),
        SubscriptionService.isInTrial(user.id)
      ])

      setIsPremium(premium)
      setIsTrialing(trial)
    } catch (error) {
      console.error('Error checking subscription status:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/30">
      <div className="pam-container">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-primary">
            PAM
          </h1>
          
          <div className="flex items-center gap-2">
            {!isPremium && !isTrialing && (
              <Link href="/dashboard/subscription">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-sm"
                >
                  <CrownIcon className="w-4 h-4 mr-1" />
                  Upgrade
                </Button>
              </Link>
            )}
            
            {isTrialing && (
              <Link href="/dashboard/subscription">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-white"
                >
                  <CrownIcon className="w-4 h-4 mr-1" />
                  Trial
                </Button>
              </Link>
            )}
            
            {isPremium && (
              <Link href="/dashboard/subscription">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-200 text-amber-700 hover:bg-amber-50 bg-white"
                >
                  <CrownIcon className="w-4 h-4 mr-1" />
                  Pro
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-primary hover:bg-muted"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}