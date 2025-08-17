// Premium AI Helper Service with Advanced Capabilities

export interface PremiumAIFeatures {
  personalizedAdvice: boolean
  developmentTracking: boolean
  healthInsights: boolean
  sleepAnalysis: boolean
  feedingOptimization: boolean
  emotionalSupport: boolean
  familyPlanning: boolean
  expertConsultation: boolean
}

export interface AIConversationContext {
  childId: string
  childAge: number // in weeks
  childName: string
  previousQuestions: string[]
  parentConcerns: string[]
  developmentMilestones: {
    achieved: string[]
    pending: string[]
    delayed: string[]
  }
  healthData: {
    weight: number[]
    height: number[]
    feedingPattern: 'breastfeeding' | 'bottle' | 'mixed'
    sleepPattern: {
      nightSleep: number
      dayNaps: number
      wakeUps: number
    }
  }
  userProfile: {
    isPremium: boolean
    questionsUsed: number
    questionsLimit: number
    subscriptionTier: 'free' | 'premium' | 'family'
  }
}

export interface AIResponse {
  message: string
  confidence: number
  sources: string[]
  followUpQuestions: string[]
  recommendedActions: {
    title: string
    description: string
    urgency: 'low' | 'medium' | 'high'
    category: 'health' | 'development' | 'admin' | 'self-care'
  }[]
  disclaimers: string[]
  expertReferral?: {
    suggested: boolean
    specialty: string
    urgency: 'routine' | 'prompt' | 'urgent'
    reason: string
  }
}

export interface AIInsight {
  id: string
  type: 'developmental' | 'health' | 'behavioral' | 'sleep' | 'feeding'
  title: string
  description: string
  confidence: number
  timestamp: Date
  childId: string
  recommendations: string[]
  trend: 'improving' | 'concerning' | 'stable'
  dataPoints: {
    metric: string
    value: number
    date: Date
  }[]
}

export class PremiumAIService {
  private readonly baseModel = 'gpt-4-turbo-preview'
  private readonly maxTokens = 1000
  private readonly temperature = 0.7

  async generatePremiumResponse(
    question: string,
    context: AIConversationContext
  ): Promise<AIResponse> {
    if (!context.userProfile.isPremium) {
      return this.generateFreeResponse(question, context)
    }

    const systemPrompt = this.buildPremiumSystemPrompt(context)
    const userPrompt = this.buildUserPrompt(question, context)

    try {
      const response = await fetch('/api/ai/premium-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.baseModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature
        })
      })

      if (!response.ok) {
        throw new Error('AI service unavailable')
      }

      const data = await response.json()
      return this.parseAIResponse(data.choices[0].message.content, context)
    } catch (error) {
      console.error('Premium AI error:', error)
      return this.getFallbackResponse(question)
    }
  }

  private buildPremiumSystemPrompt(context: AIConversationContext): string {
    return `You are PAM's Premium AI Assistant, a specialized parenting advisor for Australian parents with children aged 0-3 years.

CHILD CONTEXT:
- Name: ${context.childName}
- Age: ${context.childAge} weeks old
- Development milestones achieved: ${context.developmentMilestones.achieved.join(', ')}
- Pending milestones: ${context.developmentMilestones.pending.join(', ')}
- Feeding method: ${context.healthData.feedingPattern}
- Sleep pattern: ${context.healthData.sleepPattern.nightSleep}h night sleep, ${context.healthData.sleepPattern.dayNaps} naps

PREMIUM CAPABILITIES:
- Provide personalised advice based on child's specific data
- Analyze development patterns and trends
- Offer Australian-specific healthcare guidance
- Reference Medicare, Centrelink, and state-specific resources
- Suggest when professional consultation is needed
- Provide emotional support and self-care advice

RESPONSE FORMAT:
Always respond with empathy and understanding. Include:
1. Direct answer to the question
2. Personalized insights based on child's data
3. Australian-specific guidance when relevant
4. Follow-up questions to better understand concerns
5. Recommended actions (if any)
6. Clear disclaimers about medical advice

MEDICAL DISCLAIMER:
Always remind parents to consult healthcare professionals for medical concerns. You provide information and support, not medical diagnosis or treatment.

Be warm, supportive, and evidence-based in your responses.`
  }

  private buildUserPrompt(question: string, context: AIConversationContext): string {
    let prompt = `Question: "${question}"\n\n`
    
    if (context.previousQuestions.length > 0) {
      prompt += `Recent conversation context:\n${context.previousQuestions.slice(-3).join('\n')}\n\n`
    }

    if (context.parentConcerns.length > 0) {
      prompt += `Parent's ongoing concerns: ${context.parentConcerns.join(', ')}\n\n`
    }

    prompt += `Please provide a comprehensive, personalised response for ${context.childName} (${context.childAge} weeks old).`

    return prompt
  }

  private parseAIResponse(content: string, context: AIConversationContext): AIResponse {
    // Parse the AI response and extract structured data
    const lines = content.split('\n').filter(line => line.trim())
    
    let message = content
    let followUpQuestions: string[] = []
    let recommendedActions: AIResponse['recommendedActions'] = []
    let disclaimers: string[] = []

    // Extract follow-up questions (lines starting with "?")
    lines.forEach(line => {
      if (line.trim().startsWith('?')) {
        followUpQuestions.push(line.substring(1).trim())
      }
    })

    // Add standard disclaimers
    disclaimers.push('This advice is for informational purposes only and should not replace professional medical advice.')
    disclaimers.push('Always consult your GP, maternal health nurse, or other healthcare professionals for medical concerns.')

    return {
      message,
      confidence: 0.85, // High confidence for premium responses
      sources: [
        'Australian Government Department of Health',
        'Royal Children\'s Hospital Melbourne',
        'Raising Children Network Australia'
      ],
      followUpQuestions,
      recommendedActions,
      disclaimers
    }
  }

  private generateFreeResponse(question: string, context: AIConversationContext): AIResponse {
    return {
      message: `I'd love to give you a detailed, personalised answer about ${context.childName}! Premium members get personalised advice based on their child's specific development, health patterns, and Australian healthcare resources.\n\nFor now, here's some general guidance: Remember that every baby develops at their own pace. If you have specific concerns, your local maternal health nurse or GP is always your best resource.`,
      confidence: 0.6,
      sources: ['General parenting guidance'],
      followUpQuestions: ['Would you like to upgrade to Premium for personalised advice?'],
      recommendedActions: [{
        title: 'Upgrade to Premium',
        description: 'Get unlimited personalised AI advice for your family',
        urgency: 'low',
        category: 'self-care'
      }],
      disclaimers: ['This is general information only. Always consult healthcare professionals for specific concerns.']
    }
  }

  private getFallbackResponse(question: string): AIResponse {
    return {
      message: "I'm having trouble processing your question right now. Please try again in a moment, or contact our support team if the issue persists.",
      confidence: 0.1,
      sources: [],
      followUpQuestions: [],
      recommendedActions: [],
      disclaimers: ['Technical issue - please retry or contact support']
    }
  }

  async generateDevelopmentInsights(context: AIConversationContext): Promise<AIInsight[]> {
    if (!context.userProfile.isPremium) {
      return []
    }

    const insights: AIInsight[] = []

    // Analyze sleep patterns
    if (context.healthData.sleepPattern) {
      const sleepInsight = await this.analyzeSleepPattern(context)
      if (sleepInsight) insights.push(sleepInsight)
    }

    // Analyze development progress
    const devInsight = await this.analyzeDevelopmentProgress(context)
    if (devInsight) insights.push(devInsight)

    // Analyze feeding patterns (if data available)
    const feedingInsight = await this.analyzeFeedingPattern(context)
    if (feedingInsight) insights.push(feedingInsight)

    return insights
  }

  private async analyzeSleepPattern(context: AIConversationContext): Promise<AIInsight | null> {
    const { sleepPattern } = context.healthData
    const expectedSleepForAge = this.getExpectedSleepForAge(context.childAge)

    const sleepDifference = sleepPattern.nightSleep - expectedSleepForAge.nightSleep
    let trend: 'improving' | 'concerning' | 'stable' = 'stable'
    let confidence = 0.7

    if (Math.abs(sleepDifference) > 2) {
      trend = sleepDifference < 0 ? 'concerning' : 'improving'
      confidence = 0.8
    }

    return {
      id: `sleep-${Date.now()}`,
      type: 'sleep',
      title: 'Sleep Pattern Analysis',
      description: `${context.childName} is getting ${sleepPattern.nightSleep} hours of night sleep, which is ${sleepDifference > 0 ? 'above' : sleepDifference < 0 ? 'below' : 'within'} the typical range for ${context.childAge}-week-old babies.`,
      confidence,
      timestamp: new Date(),
      childId: context.childId,
      recommendations: this.getSleepRecommendations(sleepPattern, expectedSleepForAge),
      trend,
      dataPoints: [{
        metric: 'night_sleep_hours',
        value: sleepPattern.nightSleep,
        date: new Date()
      }]
    }
  }

  private async analyzeDevelopmentProgress(context: AIConversationContext): Promise<AIInsight | null> {
    const expectedMilestones = this.getExpectedMilestonesForAge(context.childAge)
    const achievedCount = context.developmentMilestones.achieved.length
    const expectedCount = expectedMilestones.length

    const progressPercentage = (achievedCount / expectedCount) * 100
    let trend: 'improving' | 'concerning' | 'stable' = 'stable'

    if (progressPercentage > 80) trend = 'improving'
    else if (progressPercentage < 60) trend = 'concerning'

    return {
      id: `dev-${Date.now()}`,
      type: 'developmental',
      title: 'Development Progress',
      description: `${context.childName} has achieved ${achievedCount} out of ${expectedCount} typical milestones for their age (${Math.round(progressPercentage)}%).`,
      confidence: 0.75,
      timestamp: new Date(),
      childId: context.childId,
      recommendations: this.getDevelopmentRecommendations(context.developmentMilestones, context.childAge),
      trend,
      dataPoints: [{
        metric: 'milestones_achieved',
        value: achievedCount,
        date: new Date()
      }]
    }
  }

  private async analyzeFeedingPattern(context: AIConversationContext): Promise<AIInsight | null> {
    // This would analyze feeding frequency, duration, etc. if we had that data
    return null
  }

  private getExpectedSleepForAge(ageInWeeks: number): { nightSleep: number; dayNaps: number } {
    if (ageInWeeks < 4) return { nightSleep: 3, dayNaps: 4 }
    if (ageInWeeks < 12) return { nightSleep: 6, dayNaps: 3 }
    if (ageInWeeks < 24) return { nightSleep: 8, dayNaps: 2 }
    return { nightSleep: 10, dayNaps: 1 }
  }

  private getExpectedMilestonesForAge(ageInWeeks: number): string[] {
    // Return expected milestones based on age
    if (ageInWeeks < 4) return ['responds_to_sounds', 'follows_objects']
    if (ageInWeeks < 8) return ['social_smiles', 'holds_head_up', 'makes_cooing_sounds']
    if (ageInWeeks < 16) return ['reaches_for_objects', 'rolls_over', 'laughs']
    return ['sits_with_support', 'transfers_objects', 'babbles']
  }

  private getSleepRecommendations(actual: any, expected: any): string[] {
    const recommendations = []
    
    if (actual.nightSleep < expected.nightSleep - 1) {
      recommendations.push('Consider adjusting bedtime routine for longer night sleep')
      recommendations.push('Ensure room is dark and quiet during night feeds')
    }
    
    if (actual.wakeUps > 3) {
      recommendations.push('Try dream feeds to reduce night wakings')
    }
    
    return recommendations
  }

  private getDevelopmentRecommendations(milestones: any, ageInWeeks: number): string[] {
    const recommendations = []
    
    if (milestones.pending.length > 3) {
      recommendations.push('Consider more tummy time to encourage development')
      recommendations.push('Schedule a check with your maternal health nurse')
    }
    
    recommendations.push('Continue regular play and interaction activities')
    
    return recommendations
  }

  async scheduleExpertConsultation(
    childId: string,
    concern: string,
    urgency: 'routine' | 'prompt' | 'urgent'
  ): Promise<{ consultationId: string; estimatedWait: string }> {
    // This would integrate with actual expert consultation service
    const consultationId = `expert-${Date.now()}`
    let estimatedWait = '2-3 business days'
    
    if (urgency === 'prompt') estimatedWait = '24-48 hours'
    if (urgency === 'urgent') estimatedWait = '2-4 hours'
    
    return { consultationId, estimatedWait }
  }
}

export const premiumAIService = new PremiumAIService()