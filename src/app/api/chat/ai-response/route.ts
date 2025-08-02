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

    // Use OpenAI API for AI responses (you can replace with any AI service)
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: enhancedSystemContext
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    })

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', await openaiResponse.text())
      throw new Error('Failed to get AI response')
    }

    const aiData = await openaiResponse.json()
    const aiMessage = aiData.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again."

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