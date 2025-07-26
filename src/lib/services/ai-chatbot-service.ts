/* eslint-disable @typescript-eslint/no-explicit-any */
// AI Chatbot Service for PAM - MCP Integration
// Provides Australian-specific parenting advice with baby data context

import { createClient } from '@/lib/supabase/client'
import { AnalyticsService } from './analytics-service'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  childContext?: {
    childId: string
    childName: string
    ageMonths: number
  }
  dataContext?: {
    recentFeeding?: boolean
    recentSleep?: boolean
    patterns?: string[]
  }
}

export interface ChatSession {
  id: string
  userId: string
  childId?: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface AustralianParentingContext {
  // Australian health guidelines
  nhsCguidelines: boolean
  redNoseSafety: boolean
  // State-specific resources
  state?: 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT'
  // Healthcare system context
  medicare: boolean
  bulkBilling: boolean
  // Cultural context
  multicultural: boolean
}

export class AIChatbotService {
  private static readonly SYSTEM_PROMPT = `
You are PAM AI, an expert Australian parenting assistant specializing in child development and baby care for children aged 0-3 years. You provide evidence-based advice following Australian health guidelines.

Key Australian Context:
- Follow NHMRC (National Health and Medical Research Council) infant feeding guidelines
- Reference Red Nose safe sleeping recommendations
- Consider Medicare and bulk billing healthcare access
- Use Australian English terminology and measurements (kilograms, centimeters)
- Reference Australian Immunisation Handbook for vaccination advice
- Consider Australian climate and seasons in advice
- Acknowledge cultural diversity in Australian families

Guidelines:
1. ALWAYS prioritize safety and evidence-based advice
2. Recommend consulting GP or pediatrician for medical concerns
3. Use warm, supportive, non-judgmental tone
4. Provide practical, actionable advice
5. Reference Australian health services when appropriate
6. Acknowledge that every baby is different
7. Include confidence levels in your advice when relevant

When provided with baby tracking data, use it to give personalized advice based on the child's actual patterns and behaviors.

Important: You are NOT a replacement for medical advice. Always recommend professional healthcare consultation for concerning symptoms or developmental delays.
  `

  /**
   * Generate AI response using MCP integration
   */
  static async generateResponse(
    message: string,
    childId?: string,
    sessionHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      // Get child context if provided
      let childContext = ''
      let dataContext = ''
      
      if (childId) {
        const context = await this.buildChildContext(childId)
        childContext = context.childInfo
        dataContext = context.dataInsights
      }

      // Build conversation context
      const conversationHistory = sessionHistory
        .slice(-10) // Last 10 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n')

      // This would integrate with MCP in a real implementation
      // For now, we'll simulate intelligent responses based on patterns
      const response = await this.simulateAIResponse(
        message,
        childContext,
        dataContext,
        conversationHistory
      )

      return response
    } catch (error) {
      console.error('Error generating AI response:', error)
      return "I'm sorry, I'm having trouble processing your question right now. Please try again in a moment, or consider speaking with your healthcare provider if it's urgent."
    }
  }

  /**
   * Create or continue chat session
   */
  static async createChatSession(
    userId: string,
    childId?: string,
    title?: string
  ): Promise<ChatSession> {
    const supabase = createClient()
    
    const sessionData = {
      id: crypto.randomUUID(),
      user_id: userId,
      child_id: childId || null,
      title: title || 'New Chat',
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert(sessionData)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      userId: data.user_id,
      childId: data.child_id,
      title: data.title,
      messages: data.messages || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  /**
   * Add message to chat session
   */
  static async addMessage(
    sessionId: string,
    message: ChatMessage
  ): Promise<void> {
    const supabase = createClient()

    // Get current session
    const { data: session, error: fetchError } = await supabase
      .from('chat_sessions')
      .select('messages')
      .eq('id', sessionId)
      .single()

    if (fetchError) throw fetchError

    const updatedMessages = [...(session.messages || []), message]

    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({
        messages: updatedMessages,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (updateError) throw updateError
  }

  /**
   * Get chat sessions for user
   */
  static async getChatSessions(userId: string): Promise<ChatSession[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return data.map(session => ({
      id: session.id,
      userId: session.user_id,
      childId: session.child_id,
      title: session.title,
      messages: session.messages || [],
      createdAt: session.created_at,
      updatedAt: session.updated_at
    }))
  }

  /**
   * Build child context for AI
   */
  private static async buildChildContext(childId: string): Promise<{
    childInfo: string
    dataInsights: string
  }> {
    const supabase = createClient()

    // Get child info
    const { data: child } = await supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .single()

    if (!child) {
      return { childInfo: '', dataInsights: '' }
    }

    const birthDate = new Date(child.date_of_birth)
    const ageMonths = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    const ageWeeks = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7))

    const childInfo = `Child: ${child.first_name}, Age: ${ageMonths} months (${ageWeeks} weeks), Gender: ${child.gender || 'not specified'}`

    // Get recent analytics insights
    try {
      const weeklyInsights = await AnalyticsService.generateWeeklyInsights(childId)
      
      const dataInsights = `
Recent Patterns (Last 7 days):
- Feeding: ${weeklyInsights.feeding.totalFeeds} feeds, averaging every ${Math.round(weeklyInsights.feeding.averageInterval / 60 * 10) / 10} hours
- Sleep: ${Math.round(weeklyInsights.sleep.totalSleepPerDay / 60)} hours per day, longest stretch ${Math.round(weeklyInsights.sleep.longestSleepStretch / 60)} hours
- Diaper: ${weeklyInsights.diaper.averageChangesPerDay} changes per day
- Trends: Feeding ${weeklyInsights.feeding.feedingTrend}, Sleep ${weeklyInsights.sleep.sleepTrend}
${weeklyInsights.concerns.length > 0 ? '- Concerns: ' + weeklyInsights.concerns.join(', ') : ''}
${weeklyInsights.recommendations.length > 0 ? '- Previous recommendations: ' + weeklyInsights.recommendations.slice(0, 2).join(', ') : ''}
      `

      return { childInfo, dataInsights }
    } catch (error) {
      console.error('Error getting analytics for context:', error)
      return { childInfo, dataInsights: 'No recent tracking data available.' }
    }
  }

  /**
   * Simulate AI response (In production, this would use MCP)
   */
  private static async simulateAIResponse(
    message: string,
    childContext: string,
    dataContext: string,
    conversationHistory: string
  ): Promise<string> {
    const lowerMessage = message.toLowerCase()

    // Pattern matching for common parenting questions
    if (lowerMessage.includes('sleep') || lowerMessage.includes('sleeping')) {
      return this.generateSleepAdvice(message, childContext, dataContext)
    }

    if (lowerMessage.includes('feed') || lowerMessage.includes('feeding') || lowerMessage.includes('milk') || lowerMessage.includes('bottle')) {
      return this.generateFeedingAdvice(message, childContext, dataContext)
    }

    if (lowerMessage.includes('cry') || lowerMessage.includes('crying') || lowerMessage.includes('fussy')) {
      return this.generateCryingAdvice(message, childContext, dataContext)
    }

    if (lowerMessage.includes('development') || lowerMessage.includes('milestone')) {
      return this.generateDevelopmentAdvice(message, childContext, dataContext)
    }

    if (lowerMessage.includes('growth') || lowerMessage.includes('weight') || lowerMessage.includes('height')) {
      return this.generateGrowthAdvice(message, childContext, dataContext)
    }

    if (lowerMessage.includes('diaper') || lowerMessage.includes('nappy') || lowerMessage.includes('poo') || lowerMessage.includes('wee')) {
      return this.generateDiaperAdvice(message, childContext, dataContext)
    }

    if (lowerMessage.includes('routine') || lowerMessage.includes('schedule')) {
      return this.generateRoutineAdvice(message, childContext, dataContext)
    }

    // Default response with Australian context
    return `Thank you for your question about ${message}. 

Based on Australian health guidelines and your baby's current patterns, I'd be happy to help. ${childContext ? `For ${childContext.split(',')[0]}, ` : ''}I recommend:

1. **Consider your baby's individual needs** - Every child develops at their own pace
2. **Trust your instincts** - You know your baby best
3. **Consult your GP or child health nurse** - They can provide personalized advice for your situation

${dataContext ? `Looking at your recent tracking data: ${dataContext.slice(0, 200)}...` : ''}

Is there a specific aspect you'd like me to focus on? I can provide more detailed guidance on sleep, feeding, development, or any other concerns you might have.

Remember: This advice is general in nature. For any health concerns or if something doesn't seem right, please contact your healthcare provider or call 13 HEALTH (13 43 25 84) for 24/7 health advice in Australia.`
  }

  private static generateSleepAdvice(message: string, childContext: string, dataContext: string): string {
    const ageInfo = childContext.match(/Age: (\d+) months/)
    const ageMonths = ageInfo ? parseInt(ageInfo[1]) : 0

    let advice = `**Sleep Guidance for ${childContext ? childContext.split(',')[0] : 'Your Baby'}**\n\n`

    if (ageMonths < 3) {
      advice += `At ${ageMonths} months, your baby is still establishing sleep patterns. This is completely normal!\n\n`
      advice += `**Newborn Sleep (0-3 months):**\n`
      advice += `- Expect 14-17 hours total sleep per day\n`
      advice += `- Sleep stretches of 2-4 hours are normal\n`
      advice += `- Day/night confusion is common\n\n`
    } else if (ageMonths < 6) {
      advice += `At ${ageMonths} months, you might start seeing longer sleep stretches.\n\n`
      advice += `**Early Infant Sleep (3-6 months):**\n`
      advice += `- Expect 12-15 hours total sleep per day\n`
      advice += `- Longer nighttime stretches (4-6 hours) may emerge\n`
      advice += `- 3-4 naps during the day are typical\n\n`
    } else {
      advice += `At ${ageMonths} months, sleep patterns are usually more established.\n\n`
      advice += `**Older Infant Sleep (6+ months):**\n`
      advice += `- Expect 11-14 hours total sleep per day\n`
      advice += `- Longer nighttime sleep (8-12 hours) with fewer night wakings\n`
      advice += `- 2-3 naps during the day\n\n`
    }

    if (dataContext.includes('sleep')) {
      advice += `**Based on your recent tracking data:**\n`
      if (dataContext.includes('worsening')) {
        advice += `I notice some sleep challenges recently. This could be due to:\n`
        advice += `- Growth spurts or developmental leaps\n`
        advice += `- Changes in routine or environment\n`
        advice += `- Sleep regressions (common at 4, 8-10, 12, 18 months)\n\n`
      } else if (dataContext.includes('improving')) {
        advice += `Great news - your sleep patterns are improving! Keep up whatever you're doing.\n\n`
      }
    }

    advice += `**Australian Safe Sleep Guidelines (Red Nose):**\n`
    advice += `- Always place baby on their back to sleep\n`
    advice += `- Use a safe cot with a firm mattress\n`
    advice += `- Keep cot bare - no pillows, toys, or loose bedding\n`
    advice += `- Room share (not bed share) for at least 6 months\n\n`

    advice += `**Creating Good Sleep Habits:**\n`
    advice += `- Consistent bedtime routine (bath, feed, cuddles)\n`
    advice += `- Watch for tired signs (yawning, rubbing eyes, grizzling)\n`
    advice += `- Create a calm, dark environment for sleep\n`
    advice += `- White noise can help some babies\n\n`

    advice += `If sleep problems persist or you're concerned, speak with your child health nurse or GP. Many community health centres in Australia offer free sleep support programs.`

    return advice
  }

  private static generateFeedingAdvice(message: string, childContext: string, dataContext: string): string {
    const ageInfo = childContext.match(/Age: (\d+) months/)
    const ageMonths = ageInfo ? parseInt(ageInfo[1]) : 0

    let advice = `**Feeding Guidance for ${childContext ? childContext.split(',')[0] : 'Your Baby'}**\n\n`

    if (ageMonths < 6) {
      advice += `**Exclusive Breastfeeding/Formula (0-6 months):**\n`
      advice += `Following NHMRC guidelines, babies should receive only breastmilk or formula until around 6 months.\n\n`
      
      if (ageMonths < 1) {
        advice += `- Newborns typically feed 8-12 times per day\n`
        advice += `- Feed on demand - watch for feeding cues\n`
        advice += `- Growth spurts at 2-3 weeks, 6 weeks, 3 months are normal\n`
      } else {
        advice += `- 6-8 feeds per day is typical at this age\n`
        advice += `- Feeding intervals of 2-4 hours are normal\n`
        advice += `- Some babies may sleep longer between night feeds\n`
      }
    } else {
      advice += `**Introduction of Solids (6+ months):**\n`
      advice += `At ${ageMonths} months, your baby can start exploring solid foods alongside breastmilk/formula.\n\n`
      advice += `- Continue breastfeeding/formula as main nutrition source\n`
      advice += `- Start with iron-rich foods (baby cereal, pureed meat)\n`
      advice += `- Introduce one new food at a time\n`
      advice += `- Baby-led weaning is also a great option\n`
    }

    if (dataContext.includes('feeding')) {
      advice += `\n**Based on your recent tracking:**\n`
      if (dataContext.includes('cluster')) {
        advice += `I notice cluster feeding patterns - this is completely normal, especially during:\n`
        advice += `- Growth spurts\n`
        advice += `- When establishing milk supply\n`
        advice += `- Evening fussy periods\n\n`
      }
      if (dataContext.includes('routine')) {
        advice += `Your feeding routine is developing well - consistency helps both you and baby!\n\n`
      }
    }

    advice += `**Australian Breastfeeding Support:**\n`
    advice += `- Australian Breastfeeding Association: 1800 686 268\n`
    advice += `- Free lactation consultants available through many hospitals\n`
    advice += `- Child health nurses can provide feeding support\n\n`

    advice += `**Signs Baby is Getting Enough:**\n`
    advice += `- Regular wet and dirty nappies (6+ wet per day after day 5)\n`
    advice += `- Steady weight gain\n`
    advice += `- Alert and content between feeds\n`
    advice += `- Reaching developmental milestones\n\n`

    advice += `Always trust your instincts. If you're concerned about feeding, contact your GP, child health nurse, or call Pregnancy, Birth and Baby helpline: 1800 882 436.`

    return advice
  }

  private static generateCryingAdvice(message: string, childContext: string, dataContext: string): string {
    const ageInfo = childContext.match(/Age: (\d+) months/)
    const ageMonths = ageInfo ? parseInt(ageInfo[1]) : 0

    let advice = `**Understanding Baby Crying for ${childContext ? childContext.split(',')[0] : 'Your Baby'}**\n\n`

    advice += `Crying is your baby's main way of communicating. At ${ageMonths} months, crying is completely normal and expected.\n\n`

    advice += `**Common Reasons for Crying:**\n`
    advice += `1. **Hunger** - Most common reason, especially in young babies\n`
    advice += `2. **Tiredness** - Overtired babies often cry more\n`
    advice += `3. **Discomfort** - Wet nappy, too hot/cold, uncomfortable position\n`
    advice += `4. **Need for comfort** - Sometimes babies just need cuddles\n`
    advice += `5. **Overstimulation** - Too much noise, light, or activity\n\n`

    if (ageMonths < 4) {
      advice += `**Newborn Specific (0-4 months):**\n`
      advice += `- Purple crying period peaks at 6-8 weeks\n`
      advice += `- Witching hour (evening fussiness) is very common\n`
      advice += `- Colic affects up to 20% of babies\n`
      advice += `- Growth spurts can cause increased crying\n\n`
    }

    advice += `**Soothing Techniques to Try:**\n`
    advice += `- **The 5 S's**: Swaddle, Side/Stomach position (while awake), Shush, Swing, Suck\n`
    advice += `- Skin-to-skin contact\n`
    advice += `- Gentle rhythmic movement (rocking, walking)\n`
    advice += `- White noise or soft music\n`
    advice += `- Fresh air and change of scenery\n`
    advice += `- Warm bath (if baby enjoys it)\n\n`

    if (dataContext) {
      advice += `**Based on Your Tracking Patterns:**\n`
      if (dataContext.includes('feeding')) {
        advice += `- Check if crying correlates with feeding times\n`
      }
      if (dataContext.includes('sleep')) {
        advice += `- Look for signs of overtiredness before sleep times\n`
      }
      advice += `Your tracking data can help identify patterns in crying times.\n\n`
    }

    advice += `**When to Seek Help:**\n`
    advice += `Contact your GP or child health nurse if:\n`
    advice += `- Crying is accompanied by fever, vomiting, or other concerning symptoms\n`
    advice += `- High-pitched, continuous crying that seems different from normal\n`
    advice += `- You're feeling overwhelmed or exhausted\n`
    advice += `- Baby isn't feeding, sleeping, or having wet nappies\n\n`

    advice += `**Support for Parents:**\n`
    advice += `- Karitane: 1800 677 961 (24/7 support)\n`
    advice += `- Tresillian: 1800 637 357 (family support)\n`
    advice += `- PANDA (Perinatal Anxiety & Depression): 1300 726 306\n\n`

    advice += `Remember: It's okay to put baby in a safe place (cot) and take a few minutes to breathe if you feel overwhelmed. You're doing a great job! 💙`

    return advice
  }

  private static generateDevelopmentAdvice(message: string, childContext: string, dataContext: string): string {
    const ageInfo = childContext.match(/Age: (\d+) months/)
    const ageMonths = ageInfo ? parseInt(ageInfo[1]) : 0

    let advice = `**Developmental Guidance for ${childContext ? childContext.split(',')[0] : 'Your Baby'} (${ageMonths} months)**\n\n`

    // Age-specific milestones based on Australian developmental guidelines
    if (ageMonths < 1) {
      advice += `**0-1 Month Milestones:**\n`
      advice += `- Lifts head briefly when on tummy\n`
      advice += `- Follows objects with eyes\n`
      advice += `- Makes eye contact\n`
      advice += `- Startles to loud sounds\n`
      advice += `- Cries to communicate needs\n\n`
    } else if (ageMonths < 3) {
      advice += `**1-3 Month Milestones:**\n`
      advice += `- Smiles responsively (around 6-8 weeks)\n`
      advice += `- Holds head up during tummy time\n`
      advice += `- Tracks moving objects\n`
      advice += `- Makes cooing sounds\n`
      advice += `- Shows interest in faces\n\n`
    } else if (ageMonths < 6) {
      advice += `**3-6 Month Milestones:**\n`
      advice += `- Laughs and squeals\n`
      advice += `- Reaches for and grasps objects\n`
      advice += `- Rolls from tummy to back (around 4 months)\n`
      advice += `- Brings hands to mouth\n`
      advice += `- Shows curiosity about surroundings\n\n`
    } else if (ageMonths < 9) {
      advice += `**6-9 Month Milestones:**\n`
      advice += `- Sits without support\n`
      advice += `- Transfers objects between hands\n`
      advice += `- Babbles (ba-ba, da-da)\n`
      advice += `- Shows stranger awareness\n`
      advice += `- Ready for solid foods\n\n`
    } else if (ageMonths < 12) {
      advice += `**9-12 Month Milestones:**\n`
      advice += `- Crawls or bottom shuffles\n`
      advice += `- Pulls to standing\n`
      advice += `- Says first words\n`
      advice += `- Plays peek-a-boo\n`
      advice += `- Uses pincer grasp\n\n`
    } else {
      advice += `**12+ Month Milestones:**\n`
      advice += `- Takes first steps (9-18 months is normal range)\n`
      advice += `- Says 2-3 words clearly\n`
      advice += `- Follows simple instructions\n`
      advice += `- Drinks from a cup\n`
      advice += `- Shows affection\n\n`
    }

    advice += `**Supporting Development:**\n`
    advice += `- **Tummy time** - Start from birth, build up gradually\n`
    advice += `- **Talk and read** - Constant narration helps language development\n`
    advice += `- **Play** - Simple games like peek-a-boo, pat-a-cake\n`
    advice += `- **Respond** - React to baby's cues and attempts to communicate\n`
    advice += `- **Safe exploration** - Let baby explore appropriate objects\n\n`

    advice += `**Remember:**\n`
    advice += `- Every baby develops at their own pace\n`
    advice += `- Milestones are guidelines, not rigid timelines\n`
    advice += `- Premature babies may reach milestones based on adjusted age\n`
    advice += `- Some babies skip certain milestones (like crawling)\n\n`

    advice += `**Australian Early Intervention:**\n`
    advice += `- Early Childhood Early Intervention (ECEI) available through NDIS\n`
    advice += `- Child development services available through community health\n`
    advice += `- Free developmental checks at 1-4 years through Medicare\n\n`

    advice += `**When to Discuss with Healthcare Provider:**\n`
    advice += `- Significant delays in multiple areas\n`
    advice += `- Loss of previously acquired skills\n`
    advice += `- Concerns about hearing or vision\n`
    advice += `- Your parental instinct says something isn't right\n\n`

    advice += `Trust your instincts and enjoy this amazing period of rapid development! 🌟`

    return advice
  }

  private static generateGrowthAdvice(message: string, childContext: string, dataContext: string): string {
    const ageInfo = childContext.match(/Age: (\d+) months/)
    const ageMonths = ageInfo ? parseInt(ageInfo[1]) : 0

    let advice = `**Growth and Weight Guidance for ${childContext ? childContext.split(',')[0] : 'Your Baby'}**\n\n`

    advice += `**Normal Growth Patterns:**\n`
    if (ageMonths < 6) {
      advice += `- Babies typically double birth weight by 4-6 months\n`
      advice += `- Average weight gain: 150-200g per week in first 6 months\n`
      advice += `- Growth spurts common at 2-3 weeks, 6 weeks, 3 months, 6 months\n`
    } else {
      advice += `- Babies typically triple birth weight by 12 months\n`
      advice += `- Weight gain slows to about 85-140g per week after 6 months\n`
      advice += `- Growth in length continues steadily\n`
    }
    advice += `- All babies follow their own growth curve\n\n`

    if (dataContext.includes('growth') || dataContext.includes('weight')) {
      advice += `**Based on Your Recent Measurements:**\n`
      if (dataContext.includes('gaining')) {
        advice += `Great news - your baby is gaining weight well! This suggests adequate nutrition and healthy development.\n\n`
      } else if (dataContext.includes('losing')) {
        advice += `I notice some weight concerns in your recent data. This should be discussed with your healthcare provider promptly.\n\n`
      }
    }

    advice += `**Australian Growth Charts:**\n`
    advice += `- Your child health nurse uses WHO growth charts\n`
    advice += `- Percentiles show how your baby compares to other babies\n`
    advice += `- 3rd-97th percentiles are considered normal range\n`
    advice += `- Following their own curve is more important than the exact percentile\n\n`

    advice += `**Factors Affecting Growth:**\n`
    advice += `- **Feeding** - Adequate nutrition is crucial\n`
    advice += `- **Sleep** - Growth hormone is released during sleep\n`
    advice += `- **Genetics** - Family patterns influence growth\n`
    advice += `- **Health** - Illness can temporarily affect growth\n`
    advice += `- **Activity** - Normal movement and play support development\n\n`

    advice += `**Signs of Healthy Growth:**\n`
    advice += `- Steady weight gain over time (not necessarily every week)\n`
    advice += `- Alert and active baby\n`
    advice += `- Meeting developmental milestones\n`
    advice += `- Good feeding patterns\n`
    advice += `- Regular wet and dirty nappies\n\n`

    advice += `**When to Be Concerned:**\n`
    advice += `- Crossing multiple percentile lines downward\n`
    advice += `- No weight gain for several weeks\n`
    advice += `- Poor feeding or refusing feeds\n`
    advice += `- Lethargy or decreased activity\n`
    advice += `- Delayed developmental milestones\n\n`

    advice += `**Australian Health Checks:**\n`
    advice += `- Regular weighing at child health nurse appointments\n`
    advice += `- Free health checks at 1-4 years through Medicare\n`
    advice += `- Growth monitoring is part of routine care\n\n`

    advice += `Remember: Healthy babies come in all shapes and sizes. If you have concerns about growth, discuss them with your child health nurse or GP. They can assess whether your baby's growth pattern is appropriate for them individually.`

    return advice
  }

  private static generateDiaperAdvice(message: string, childContext: string, dataContext: string): string {
    const ageInfo = childContext.match(/Age: (\d+) months/)
    const ageMonths = ageInfo ? parseInt(ageInfo[1]) : 0

    let advice = `**Nappy/Diaper Guidance for ${childContext ? childContext.split(',')[0] : 'Your Baby'}**\n\n`

    advice += `**Normal Nappy Patterns:**\n`
    if (ageMonths < 1) {
      advice += `**Newborn (0-1 month):**\n`
      advice += `- Day 1: 1+ wet, 1+ dirty (meconium)\n`
      advice += `- Day 2: 2+ wet, 2+ dirty\n`
      advice += `- Day 5+: 6+ wet, 3+ dirty nappies per day\n`
      advice += `- Breastfed babies: frequent, loose, yellow/green poos\n`
      advice += `- Formula babies: less frequent, firmer, pale yellow poos\n\n`
    } else {
      advice += `**Older babies (${ageMonths} months):**\n`
      advice += `- 6+ wet nappies per day\n`
      advice += `- Poo frequency varies widely (several times daily to once every few days)\n`
      advice += `- After starting solids: poos become firmer and more formed\n`
      advice += `- Colour and texture change based on diet\n\n`
    }

    if (dataContext.includes('diaper') || dataContext.includes('changes')) {
      advice += `**Based on Your Recent Tracking:**\n`
      const changesMatch = dataContext.match(/(\d+) changes per day/)
      if (changesMatch) {
        const changesPerDay = parseInt(changesMatch[1])
        if (changesPerDay < 6) {
          advice += `Your tracking shows ${changesPerDay} changes per day. This might be on the lower side - ensure baby is feeding well and producing enough wet nappies.\n\n`
        } else {
          advice += `Your nappy changing frequency looks good at ${changesPerDay} per day.\n\n`
        }
      }
    }

    advice += `**Nappy Changing Tips:**\n`
    advice += `- Change wet nappies promptly to prevent rash\n`
    advice += `- Clean gently with water or unscented wipes\n`
    advice += `- Pat dry before putting on fresh nappy\n`
    advice += `- Apply barrier cream if needed (zinc oxide)\n`
    advice += `- Ensure nappy fits properly - not too tight or loose\n\n`

    advice += `**Nappy Rash Prevention:**\n`
    advice += `- Frequent nappy changes\n`
    advice += `- Gentle cleaning\n`
    advice += `- Allow air drying time\n`
    advice += `- Use fragrance-free products\n`
    advice += `- Consider cloth nappies if recurring rash issues\n\n`

    advice += `**When to Contact Healthcare Provider:**\n`
    advice += `- Severe nappy rash that doesn't improve\n`
    advice += `- Signs of infection (fever, widespread redness)\n`
    advice += `- Blood in stool\n`
    advice += `- No wet nappies for 12+ hours\n`
    advice += `- Signs of dehydration\n`
    advice += `- Sudden changes in bowel patterns with other symptoms\n\n`

    advice += `**Australian-Specific:**\n`
    advice += `- Many councils offer cloth nappy rebates\n`
    advice += `- Biodegradable nappy options available\n`
    advice += `- Child health nurses can help with persistent nappy rash\n\n`

    advice += `Remember: Every baby's nappy patterns are different. What's normal for your baby might be different from other babies, and that's perfectly fine!`

    return advice
  }

  private static generateRoutineAdvice(message: string, childContext: string, dataContext: string): string {
    const ageInfo = childContext.match(/Age: (\d+) months/)
    const ageMonths = ageInfo ? parseInt(ageInfo[1]) : 0

    let advice = `**Routine and Schedule Guidance for ${childContext ? childContext.split(',')[0] : 'Your Baby'} (${ageMonths} months)**\n\n`

    if (ageMonths < 3) {
      advice += `**Early Days (0-3 months):**\n`
      advice += `At this age, your baby is still establishing their natural rhythms. Don't worry about strict schedules yet!\n\n`
      advice += `- Follow baby's cues for feeding and sleeping\n`
      advice += `- Start introducing gentle patterns (not rigid schedules)\n`
      advice += `- Begin simple bedtime routine from 6-8 weeks\n`
      advice += `- Expect feed-wake-sleep cycles every 2-4 hours\n\n`
    } else if (ageMonths < 6) {
      advice += `**Developing Patterns (3-6 months):**\n`
      advice += `This is a great time to start establishing more predictable routines.\n\n`
      advice += `- 3-4 naps per day are typical\n`
      advice += `- Wake windows of 1.5-2.5 hours\n`
      advice += `- Bedtime routine becomes more important\n`
      advice += `- Start to differentiate day and night activities\n\n`
    } else {
      advice += `**Established Routines (6+ months):**\n`
      advice += `Your baby can now handle more structured routines.\n\n`
      advice += `- 2-3 naps per day\n`
      advice += `- Longer wake windows (2.5-4 hours)\n`
      advice += `- Regular meal times with solid foods\n`
      advice += `- Consistent bedtime and morning wake-up\n\n`
    }

    if (dataContext) {
      advice += `**Based on Your Tracking Data:**\n`
      if (dataContext.includes('routine')) {
        advice += `Great work! I can see patterns emerging in your baby's activities. This consistency will help with:\n`
        advice += `- Better sleep quality\n`
        advice += `- Reduced fussiness\n`
        advice += `- Easier planning for parents\n\n`
      } else {
        advice += `Your tracking shows some variability in timing, which is completely normal. Consider:\n`
        advice += `- Looking for natural patterns in your data\n`
        advice += `- Starting with one consistent element (like bedtime)\n`
        advice += `- Being flexible while building structure\n\n`
      }
    }

    advice += `**Building Helpful Routines:**\n`
    advice += `1. **Start Small** - Pick one activity to make consistent first\n`
    advice += `2. **Follow Baby's Natural Rhythms** - Work with their preferences\n`
    advice += `3. **Be Flexible** - Routines should help, not stress you\n`
    advice += `4. **Stay Consistent** - Give new routines 1-2 weeks to establish\n`
    advice += `5. **Adjust as Needed** - Babies change, and routines should too\n\n`

    advice += `**Sample Daily Structure:**\n`
    if (ageMonths < 6) {
      advice += `- Wake up and feed\n`
      advice += `- Play/awake time (short)\n`
      advice += `- Nap\n`
      advice += `- Repeat cycle 6-8 times per day\n`
      advice += `- Longer sleep stretch at night\n`
    } else {
      advice += `- 6-7 AM: Wake up and morning feed\n`
      advice += `- 9-10 AM: Morning nap\n`
      advice += `- 12-1 PM: Lunch and afternoon nap\n`
      advice += `- 4-5 PM: Short late nap (if needed)\n`
      advice += `- 6-7 PM: Dinner and bedtime routine\n`
      advice += `- 7-8 PM: Bedtime\n`
    }
    advice += `\n`

    advice += `**Bedtime Routine Ideas:**\n`
    advice += `- Warm bath\n`
    advice += `- Gentle massage\n`
    advice += `- Quiet feeding\n`
    advice += `- Story or lullabies\n`
    advice += `- Dim lights and calm environment\n\n`

    advice += `**Benefits of Routines:**\n`
    advice += `- Helps baby feel secure and safe\n`
    advice += `- Improves sleep quality\n`
    advice += `- Reduces crying and fussiness\n`
    advice += `- Makes life more predictable for parents\n`
    advice += `- Supports healthy development\n\n`

    advice += `Remember: The best routine is one that works for your family. Don't compare yourself to others - every baby and family is different. Australian child health nurses can provide personalized routine guidance if you need extra support.`

    return advice
  }
}