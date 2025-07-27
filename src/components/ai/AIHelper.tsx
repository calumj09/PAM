'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  MessageCircle,
  Send,
  Sparkles,
  X,
  AlertTriangle,
  Info,
  Crown
} from 'lucide-react'
import { PremiumGate } from '@/components/premium/PremiumGate'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Child {
  id: string
  name: string
  date_of_birth: string
  baby_type: string
  feeding_method?: string
  birth_type?: string
}

interface AIHelperProps {
  isPremium: boolean
  remainingQuestions?: number
  onQuestionUsed?: () => void
  className?: string
}

export function AIHelper({ 
  isPremium, 
  remainingQuestions = 5, 
  onQuestionUsed,
  className = ''
}: AIHelperProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [child, setChild] = useState<Child | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadChildProfile()
    // Add welcome message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your PAM AI assistant 👋 I'm here to help with any questions about your baby, Australian admin processes, or parenting tips. What would you like to know?",
      timestamp: new Date()
    }])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChildProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('date_of_birth', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error('No child profile found:', error)
        return
      }

      setChild(data)
    } catch (error) {
      console.error('Error loading child profile:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const generateContextPrompt = () => {
    if (!child) return ''
    
    const birthDate = new Date(child.date_of_birth)
    const now = new Date()
    const ageInWeeks = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7))
    const ageInMonths = Math.floor(ageInWeeks / 4.33)

    return `Context about the user's baby:
- Name: ${child.name}
- Age: ${ageInWeeks} weeks old (${ageInMonths} months)
- Type: ${child.baby_type}
- Feeding: ${child.feeding_method || 'Not specified'}
- Birth type: ${child.birth_type || 'Not specified'}
- Location: Australia

Please provide helpful, accurate advice suitable for Australian parents. Focus on being supportive and understanding of the challenges new mums face.`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputValue.trim() || isLoading) return
    
    if (!isPremium && remainingQuestions <= 0) {
      setError('You\'ve used all your free questions. Upgrade to Premium for unlimited AI assistance!')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setError('')

    try {
      const contextPrompt = generateContextPrompt()
      const conversationHistory = messages.map(m => `${m.role}: ${m.content}`).join('\n')
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue.trim(),
          context: contextPrompt,
          history: conversationHistory
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Use up a question if not premium
      if (!isPremium && onQuestionUsed) {
        onQuestionUsed()
      }

    } catch (error) {
      console.error('Error getting AI response:', error)
      setError('Sorry, I couldn\'t process your question right now. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const suggestedQuestions = [
    "Is it normal for my baby to sleep this much?",
    "When should I start introducing solid foods?",
    "How do I apply for Family Tax Benefit?",
    "What immunizations does my baby need next?",
    "How can I tell if my baby is getting enough milk?",
    "What should I pack for my 6-week checkup?"
  ]

  if (!isPremium && remainingQuestions <= 0) {
    return (
      <div className={className}>
        <div className="bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-2xl p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Helper Limit Reached</h3>
            <p className="text-gray-600 mb-4">
              You've used all 5 free questions this month. Upgrade to Premium for unlimited AI assistance!
            </p>
            <button
              onClick={() => window.open('/premium', '_blank')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  AI Smart Helper
                  {isPremium && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                      Premium
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  {isPremium ? 'Unlimited questions' : `${remainingQuestions} questions remaining`}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMinimized ? '⬆️' : '⬇️'}
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-red-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-4 pb-2">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Try asking:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {suggestedQuestions.slice(0, 3).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(question)}
                      className="text-left p-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      "{question}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-gray-100 p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your baby or admin tasks..."
                  className="flex-1 resize-none p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={1}
                  disabled={isLoading || (!isPremium && remainingQuestions <= 0)}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading || (!isPremium && remainingQuestions <= 0)}
                  className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        )}

        {/* Premium Upgrade Notice */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-t border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-gray-700">
                  {remainingQuestions} free questions left
                </span>
              </div>
              <button
                onClick={() => window.open('/premium', '_blank')}
                className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full hover:bg-orange-200 transition-colors"
              >
                Get Unlimited
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}