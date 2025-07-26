// Premium Subscription Service for PAM
// Handles Australian pricing, GST compliance, and feature access

import { createClient } from '@/lib/supabase/client'

export type SubscriptionTier = 'free' | 'premium'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing'

export interface SubscriptionPlan {
  id: string
  name: string
  tier: SubscriptionTier
  priceAUD: number
  priceStripeId: string
  features: string[]
  popular?: boolean
  trialDays?: number
}

export interface UserSubscription {
  id: string
  userId: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
  createdAt: string
  updatedAt: string
}

export interface FeatureAccess {
  calendarIntegration: boolean
  advancedAnalytics: boolean
  aiChatHistory: boolean
  exportData: boolean
  prioritySupport: boolean
  unlimitedChildren: boolean
}

export class SubscriptionService {
  private static readonly PLANS: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'PAM Free',
      tier: 'free',
      priceAUD: 0,
      priceStripeId: '', // No Stripe price for free plan
      features: [
        'Track up to 2 children',
        'Basic activity tracking',
        'Automated checklists',
        'Basic analytics',
        'AI chat (limited)',
        'Push notifications',
        'Offline support'
      ]
    },
    {
      id: 'premium',
      name: 'PAM Premium',
      tier: 'premium',
      priceAUD: 9.99, // Monthly AUD price including GST
      priceStripeId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || '',
      features: [
        'Everything in Free',
        'Unlimited children',
        'Google Calendar integration',
        'Advanced analytics & insights',
        'Unlimited AI chat history',
        'Export all data',
        'Priority support',
        'Early access to new features'
      ],
      popular: true,
      trialDays: 14
    }
  ]

  /**
   * Get all available subscription plans
   */
  static getPlans(): SubscriptionPlan[] {
    return this.PLANS
  }

  /**
   * Get specific plan by ID
   */
  static getPlan(planId: string): SubscriptionPlan | null {
    return this.PLANS.find(plan => plan.id === planId) || null
  }

  /**
   * Get user's current subscription
   */
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      // Create free subscription for new users
      return await this.createFreeSubscription(userId)
    }

    return {
      id: data.id,
      userId: data.user_id,
      tier: data.tier,
      status: data.status,
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id,
      currentPeriodStart: data.current_period_start,
      currentPeriodEnd: data.current_period_end,
      cancelAtPeriodEnd: data.cancel_at_period_end,
      trialEnd: data.trial_end,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  /**
   * Create free subscription for new users
   */
  private static async createFreeSubscription(userId: string): Promise<UserSubscription> {
    const supabase = createClient()
    
    const subscriptionData = {
      user_id: userId,
      tier: 'free' as const,
      status: 'active' as const,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      cancel_at_period_end: false
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert(subscriptionData)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to create free subscription')
    }

    return {
      id: data.id,
      userId: data.user_id,
      tier: data.tier,
      status: data.status,
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id,
      currentPeriodStart: data.current_period_start,
      currentPeriodEnd: data.current_period_end,
      cancelAtPeriodEnd: data.cancel_at_period_end,
      trialEnd: data.trial_end,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  /**
   * Get feature access for user
   */
  static async getFeatureAccess(userId: string): Promise<FeatureAccess> {
    const subscription = await this.getUserSubscription(userId)
    
    if (!subscription || subscription.tier === 'free') {
      return {
        calendarIntegration: false,
        advancedAnalytics: false,
        aiChatHistory: false,
        exportData: false,
        prioritySupport: false,
        unlimitedChildren: false
      }
    }

    // Premium features
    return {
      calendarIntegration: true,
      advancedAnalytics: true,
      aiChatHistory: true,
      exportData: true,
      prioritySupport: true,
      unlimitedChildren: true
    }
  }

  /**
   * Check if user has access to specific feature
   */
  static async hasFeatureAccess(userId: string, feature: keyof FeatureAccess): Promise<boolean> {
    const access = await this.getFeatureAccess(userId)
    return access[feature]
  }

  /**
   * Check if user is on premium plan
   */
  static async isPremiumUser(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    return subscription?.tier === 'premium' && subscription?.status === 'active'
  }

  /**
   * Check if user is in trial period
   */
  static async isInTrial(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    
    if (!subscription?.trialEnd) return false
    
    return new Date(subscription.trialEnd) > new Date()
  }

  /**
   * Get days remaining in trial
   */
  static async getTrialDaysRemaining(userId: string): Promise<number> {
    const subscription = await this.getUserSubscription(userId)
    
    if (!subscription?.trialEnd) return 0
    
    const trialEnd = new Date(subscription.trialEnd)
    const now = new Date()
    
    if (trialEnd <= now) return 0
    
    return Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  /**
   * Create Stripe checkout session
   */
  static async createCheckoutSession(
    userId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ url: string }> {
    const plan = this.getPlan(planId)
    if (!plan || plan.tier === 'free') {
      throw new Error('Invalid plan selected')
    }

    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        planId,
        priceId: plan.priceStripeId,
        successUrl,
        cancelUrl
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    return await response.json()
  }

  /**
   * Create Stripe customer portal session
   */
  static async createPortalSession(userId: string, returnUrl: string): Promise<{ url: string }> {
    const subscription = await this.getUserSubscription(userId)
    
    if (!subscription?.stripeCustomerId) {
      throw new Error('No Stripe customer found')
    }

    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId: subscription.stripeCustomerId,
        returnUrl
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create portal session')
    }

    return await response.json()
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(userId: string): Promise<void> {
    const subscription = await this.getUserSubscription(userId)
    
    if (!subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription found')
    }

    const response = await fetch('/api/stripe/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId: subscription.stripeSubscriptionId
      })
    })

    if (!response.ok) {
      throw new Error('Failed to cancel subscription')
    }

    // Update local subscription
    const supabase = createClient()
    await supabase
      .from('user_subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
  }

  /**
   * Update subscription from Stripe webhook
   */
  static async updateSubscriptionFromStripe(stripeSubscription: unknown): Promise<void> {
    const supabase = createClient()

    const subscriptionData = {
      stripe_subscription_id: stripeSubscription.id,
      stripe_customer_id: stripeSubscription.customer,
      status: stripeSubscription.status,
      current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
      trial_end: stripeSubscription.trial_end ? 
        new Date(stripeSubscription.trial_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString()
    }

    // Determine tier from price ID
    const priceId = stripeSubscription.items.data[0]?.price?.id
    const tier = this.PLANS.find(p => p.priceStripeId === priceId)?.tier || 'free'
    
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        ...subscriptionData,
        tier,
        // Find user by Stripe customer ID
        user_id: await this.getUserIdByStripeCustomer(stripeSubscription.customer)
      })

    if (error) {
      console.error('Failed to update subscription:', error)
      throw error
    }
  }

  /**
   * Get user ID by Stripe customer ID
   */
  private static async getUserIdByStripeCustomer(stripeCustomerId: string): Promise<string> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', stripeCustomerId)
      .single()

    if (error || !data) {
      throw new Error('User not found for Stripe customer')
    }

    return data.user_id
  }

  /**
   * Format price for display (Australian format)
   */
  static formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount)
  }

  /**
   * Get subscription status display text
   */
  static getStatusDisplayText(status: SubscriptionStatus): string {
    switch (status) {
      case 'active':
        return 'Active'
      case 'trialing':
        return 'Free Trial'
      case 'canceled':
        return 'Canceled'
      case 'past_due':
        return 'Payment Due'
      case 'incomplete':
        return 'Incomplete'
      default:
        return 'Unknown'
    }
  }

  /**
   * Get next billing date formatted for display
   */
  static formatBillingDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }
}