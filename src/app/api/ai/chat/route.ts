import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

// Only initialize OpenAI if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function POST(request: NextRequest) {
  try {
    // Check if AI service is available
    if (!openai) {
      return NextResponse.json({ 
        error: 'AI service is temporarily unavailable. Please try again later.' 
      }, { status: 503 })
    }

    const { message, context, history } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Verify user is authenticated
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has premium access or remaining free questions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_premium, ai_questions_used, ai_questions_limit')
      .eq('user_id', user.id)
      .single()

    const isPremium = profile?.is_premium || false
    const questionsUsed = profile?.ai_questions_used || 0
    const questionsLimit = profile?.ai_questions_limit || 5

    if (!isPremium && questionsUsed >= questionsLimit) {
      return NextResponse.json({ 
        error: 'Free question limit reached. Upgrade to Premium for unlimited questions.' 
      }, { status: 403 })
    }

    // Build the system prompt for PAM AI Assistant
    const systemPrompt = `You are PAM's AI Assistant, a helpful and empathetic AI companion for new mums in Australia. Your role is to:

1. Provide accurate, supportive advice about baby care, development, and parenting
2. Help with Australian government admin processes (Medicare, Centrelink, birth registration, etc.)
3. Offer gentle, non-judgmental guidance for overwhelmed new mothers
4. Reference official Australian health guidelines when appropriate
5. Always encourage consulting healthcare professionals for medical concerns

Key principles:
- Be warm, understanding, and supportive
- Use Australian terminology and references
- Focus on reducing mental load for busy mums
- Provide practical, actionable advice
- Include safety disclaimers for medical topics
- Celebrate small wins and normalize struggles

${context}

Remember: You're talking to a new mum who may be tired, overwhelmed, or anxious. Be patient, kind, and encouraging.`

    // Prepare conversation for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.split('\n').filter(line => line.trim()).map(line => {
        const [role, ...content] = line.split(': ')
        return { role: role as 'user' | 'assistant', content: content.join(': ') }
      }),
      { role: 'user', content: message }
    ]

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages as any,
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response. Please try again.'

    // Update question usage for non-premium users
    if (!isPremium) {
      await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ai_questions_used: questionsUsed + 1,
          ai_questions_limit: questionsLimit,
          updated_at: new Date().toISOString()
        })
    }

    // Log the interaction (optional)
    await supabase
      .from('ai_interactions')
      .insert({
        user_id: user.id,
        question: message,
        response: response,
        is_premium: isPremium,
        created_at: new Date().toISOString()
      })

    return NextResponse.json({ 
      response,
      questionsRemaining: isPremium ? null : Math.max(0, questionsLimit - questionsUsed - 1)
    })

  } catch (error) {
    console.error('AI Chat API Error:', error)
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json({ 
        error: 'AI service is temporarily unavailable. Please try again later.' 
      }, { status: 503 })
    }

    return NextResponse.json({ 
      error: 'Something went wrong. Please try again.' 
    }, { status: 500 })
  }
}