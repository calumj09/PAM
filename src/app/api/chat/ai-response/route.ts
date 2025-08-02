import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MCPContextService } from '@/lib/services/mcp-context-service'

export async function POST(request: NextRequest) {
  try {
    const { message, systemContext, context } = await request.json()

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build MCP context if childId is provided
    let mcpContext = null
    let enhancedSystemContext = systemContext
    
    if (context?.childId) {
      mcpContext = await MCPContextService.buildChildContext(context.childId)
      const conversationContext = MCPContextService.buildConversationContext()
      
      // Generate enhanced system prompt with MCP data
      enhancedSystemContext = MCPContextService.generateSystemPrompt(mcpContext, conversationContext)
    }

    // Generate AI response using built-in parenting knowledge
    const aiMessage = generateParentingResponse(message, context, mcpContext)

    // Analyze message for quick actions with MCP context
    const quickActions = analyzeForQuickActions(message, mcpContext)

    // Determine if medical disclaimer is needed
    const medicalDisclaimer = containsHealthContent(message)

    // Generate contextual suggestions based on MCP data
    const suggestions = generateSuggestions(message, context, mcpContext)

    return NextResponse.json({
      message: aiMessage,
      quick_actions: quickActions,
      medical_disclaimer: medicalDisclaimer,
      suggestions: suggestions
    })

  } catch (error) {
    console.error('Error in AI chat endpoint:', error)
    return NextResponse.json({
      message: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or contact our support team if you need immediate assistance.",
      medical_disclaimer: true
    }, { status: 500 })
  }
}

function analyzeForQuickActions(message: string, mcpContext: any) {
  const quickActions = []
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('feeding') || lowerMessage.includes('feed')) {
    quickActions.push({
      label: ' Log Feeding',
      action: 'log_feeding',
      data: { activity_type: 'feeding' }
    })
  }

  if (lowerMessage.includes('sleep') || lowerMessage.includes('nap')) {
    quickActions.push({
      label: ' Log Sleep',
      action: 'log_sleep',
      data: { activity_type: 'sleep' }
    })
  }

  if (lowerMessage.includes('nappy') || lowerMessage.includes('diaper')) {
    quickActions.push({
      label: ' Log Nappy Change',
      action: 'log_nappy',
      data: { activity_type: 'nappy' }
    })
  }

  if (lowerMessage.includes('immunisation') || lowerMessage.includes('vaccination')) {
    quickActions.push({
      label: ' View Immunisations',
      action: 'view_immunisations',
      data: { category: 'immunisation' }
    })
  }

  if (lowerMessage.includes('growth') || lowerMessage.includes('weight') || lowerMessage.includes('height')) {
    quickActions.push({
      label: ' Track Growth',
      action: 'track_growth',
      data: { category: 'growth' }
    })
  }

  // Add context-aware quick actions based on MCP data
  if (mcpContext) {
    // If it's been a while since last feeding
    if (mcpContext.recent_activities?.last_feeding) {
      const lastFeedTime = new Date(mcpContext.recent_activities.last_feeding.time)
      const hoursSinceFeeding = (Date.now() - lastFeedTime.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceFeeding > 3 && mcpContext.child.age_months < 6) {
        quickActions.push({
          label: ' Log Next Feeding',
          action: 'log_feeding',
          data: { 
            activity_type: 'feeding',
            suggested_reason: 'Regular feeding time'
          }
        })
      }
    }
    
    // Sleep tracking suggestions based on age
    if (mcpContext.child.age_months < 12) {
      const napsSoFar = mcpContext.recent_activities?.daily_summary.activities_today || 0
      if (napsSoFar < 2 && new Date().getHours() < 17) {
        quickActions.push({
          label: ' Track Nap Time',
          action: 'log_sleep',
          data: { 
            activity_type: 'sleep',
            sleep_type: 'nap'
          }
        })
      }
    }
  }
  
  return quickActions
}

function containsHealthContent(message: string): boolean {
  const healthKeywords = [
    'sick', 'fever', 'temperature', 'vomit', 'cough', 'rash', 'infection',
    'medicine', 'medication', 'doctor', 'hospital', 'emergency', 'pain',
    'bleeding', 'allergy', 'reaction', 'breathing', 'medical', 'health',
    'symptom', 'illness', 'disease', 'diagnosis'
  ]

  return healthKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  )
}

function generateParentingResponse(message: string, context: any, mcpContext: any): string {
  const lowerMessage = message.toLowerCase()
  const childName = context?.childName || 'your baby'
  
  // Sleep-related responses
  if (lowerMessage.includes('sleep') || lowerMessage.includes('nap')) {
    if (lowerMessage.includes('how much') || lowerMessage.includes('how many hours')) {
      return `Great question about ${childName}'s sleep! Newborns (0-3 months) typically need 14-17 hours per day, while older babies (4-11 months) need about 12-15 hours including naps. Every baby is different, but establishing consistent bedtime routines can help.

📍 For Australian families: The Raising Children Network has excellent sleep guidance, and your Maternal & Child Health nurse can provide personalized advice.

⚠️ If you have concerns about ${childName}'s sleep patterns, discuss with your healthcare provider.`
    }
    return `Sleep can be challenging! Here are some evidence-based tips for ${childName}:

• Establish a consistent bedtime routine
• Create a calm sleep environment
• Watch for sleep cues like yawning or fussiness
• Consider age-appropriate wake windows

💡 The Australian 24-Hour Movement Guidelines recommend prioritizing sleep for healthy development.`
  }
  
  // Feeding-related responses
  if (lowerMessage.includes('feed') || lowerMessage.includes('milk') || lowerMessage.includes('bottle') || lowerMessage.includes('breast')) {
    if (lowerMessage.includes('how often') || lowerMessage.includes('how much')) {
      return `Feeding frequency varies by age and baby! Here's what's typically expected:

🍼 Newborns (0-3 months): 8-12 times per day (every 1.5-3 hours)
🍼 Older babies (4-6 months): 6-8 times per day
🍼 Babies 6+ months: 4-6 milk feeds plus solid foods

📍 Australian guidelines: Follow your baby's hunger cues rather than strict schedules. Your Maternal & Child Health nurse can help assess if ${childName} is getting enough.

⚠️ If you're concerned about feeding, contact your healthcare provider.`
    }
    return `Feeding ${childName} can feel overwhelming, but you're doing great! Remember:

• Follow ${childName}'s hunger and fullness cues
• Both breastfeeding and formula feeding can be nutritious
• Growth patterns matter more than individual feeds
• Trust your instincts as ${childName}'s parent

💡 The Australian Breastfeeding Association and your local Maternal & Child Health service offer excellent support.`
  }
  
  // Solid food introduction
  if (lowerMessage.includes('solid') || lowerMessage.includes('food') || lowerMessage.includes('eating')) {
    return `Introducing solids is an exciting milestone! Australian guidelines recommend:

🥄 Start around 6 months when ${childName} shows readiness signs
🥄 Begin with iron-rich foods like iron-fortified cereals or pureed meat
🥄 Introduce one new food at a time
🥄 Let ${childName} explore and self-feed when ready

📍 The Australian Guide to Healthy Eating provides excellent first foods guidance. Your Maternal & Child Health nurse can help with timing and food choices.

⚠️ Watch for allergic reactions and discuss family allergy history with your doctor.`
  }
  
  // Development and milestones
  if (lowerMessage.includes('milestone') || lowerMessage.includes('development') || lowerMessage.includes('crawl') || lowerMessage.includes('walk') || lowerMessage.includes('talk')) {
    return `Every baby develops at their own pace! Here's what to generally expect:

📈 0-3 months: Smiling, head control, following objects
📈 4-6 months: Rolling, sitting with support, babbling
📈 7-12 months: Crawling, pulling to stand, first words
📈 12+ months: Walking, more words, following simple instructions

📍 Your Australian Maternal & Child Health visits include developmental checks. The Ages & Stages Questionnaire helps track ${childName}'s progress.

⚠️ If you have concerns about ${childName}'s development, discuss with your healthcare provider early.`
  }
  
  // Crying and fussiness
  if (lowerMessage.includes('cry') || lowerMessage.includes('fussy') || lowerMessage.includes('colic')) {
    return `Crying is ${childName}'s main way to communicate! Common reasons include:

👶 Hunger, tiredness, or needing a nappy change
👶 Overstimulation or understimulation
👶 Discomfort or wind
👶 Just needing comfort and connection

💡 Try the 5 S's: Swaddling, Side position, Shushing, Swinging, Sucking

📍 If crying seems excessive (more than 3 hours daily for 3+ days), discuss with your Maternal & Child Health nurse about possible colic.

⚠️ If you're feeling overwhelmed, reach out for support. Karitane and Tresillian offer excellent resources for Australian families.`
  }
  
  // General parenting support
  if (lowerMessage.includes('overwhelm') || lowerMessage.includes('tired') || lowerMessage.includes('help') || lowerMessage.includes('support')) {
    return `Parenting is one of the hardest jobs in the world - you're not alone! 💙

🤗 It's completely normal to feel overwhelmed sometimes
🤗 Self-care isn't selfish - you need to care for yourself to care for ${childName}
🤗 Accept help when offered and ask for it when needed
🤗 Connect with other parents through local groups or online communities

📍 Australian support services:
• Maternal & Child Health line: 13 22 29
• Karitane: 1300 227 464
• PANDA (perinatal anxiety & depression): 1300 726 306

⚠️ If you're experiencing persistent sadness, anxiety, or thoughts of harm, please reach out to your GP or call Lifeline: 13 11 14`
  }
  
  // Default helpful response
  return `That's a great question about caring for ${childName}! While I can provide general information based on Australian guidelines and evidence-based practices, every baby is unique.

💡 Key resources for Australian families:
• Raising Children Network (raisingchildren.net.au)
• Your local Maternal & Child Health service
• Australian Breastfeeding Association
• Karitane and Tresillian family centres

📍 Your Maternal & Child Health nurse is an excellent first point of contact for specific concerns about ${childName}.

⚠️ For medical concerns, always consult your healthcare provider. Trust your parental instincts - you know ${childName} best!`
}

function generateSuggestions(message: string, context: any, mcpContext: any): string[] {
  // Generate contextual suggestions based on MCP data
  let baseSuggestions = [
    "How much sleep should my baby get?",
    "When should I start solid foods?",
    "What are normal feeding patterns?",
    "How can I establish a bedtime routine?"
  ]
  
  if (mcpContext) {
    // Age-appropriate suggestions
    if (mcpContext.child.age_months < 4) {
      baseSuggestions = [
        "Is my baby feeding enough?",
        "What's a normal sleep pattern for a newborn?",
        "When should I worry about crying?",
        "How do I know my baby is gaining weight properly?"
      ]
    } else if (mcpContext.child.age_months >= 4 && mcpContext.child.age_months < 6) {
      baseSuggestions = [
        "When should I start introducing solids?",
        "How do I know my baby is ready for food?",
        "What foods should I start with?",
        "Is it normal for sleep to regress at this age?"
      ]
    } else if (mcpContext.child.age_months >= 6 && mcpContext.child.age_months < 12) {
      baseSuggestions = [
        "What finger foods are safe?",
        "How many meals should my baby have?",
        "When will my baby sleep through the night?",
        "What developmental milestones should I expect?"
      ]
    }
    
    // Add contextual suggestions based on recent activities
    if (mcpContext.recent_activities?.daily_summary.feedings_today < 4 && mcpContext.child.age_months < 6) {
      baseSuggestions.unshift("Should I be concerned about low feeding frequency?")
    }
    
    if (mcpContext.recent_activities?.daily_summary.sleep_hours_today < 10 && mcpContext.child.age_months < 3) {
      baseSuggestions.unshift("My baby isn't sleeping much - is this normal?")
    }
    
    // Growth-related suggestions
    if (mcpContext.growth?.growth_trend === 'concerning') {
      baseSuggestions.unshift("Should I be worried about my baby's growth?")
    }
    
    // Milestone-based suggestions
    if (mcpContext.developmental?.milestones.overdue.length > 0) {
      baseSuggestions.unshift("When should I be concerned about developmental delays?")
    }
  }

  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('sleep')) {
    return [
      "Is this sleep pattern normal for my baby's age?",
      "How can I help my baby sleep longer?",
      "What's a good bedtime routine?",
      "How many naps should my baby have?"
    ]
  }

  if (lowerMessage.includes('feed')) {
    return [
      "How often should I feed my baby?",
      "Are these feeding amounts appropriate?",
      "When should I introduce solids?",
      "What are signs my baby is full?"
    ]
  }

  if (lowerMessage.includes('cry')) {
    return [
      "Why is my baby crying so much?",
      "How can I soothe a fussy baby?",
      "What's the witching hour?",
      "When should I be concerned about crying?"
    ]
  }

  return baseSuggestions
}