'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline'
import { ChatBubbleLeftRightIcon as ChatSolidIcon } from '@heroicons/react/24/solid'
import { AIChatbotService } from '@/lib/services/ai-chatbot-service'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  quick_actions?: Array<{
    label: string
    action: string
    data?: any
  }>
  medical_disclaimer?: boolean
  suggestions?: string[]
}

interface AIChatbotProps {
  childId?: string
  childName?: string
}

export function AIChatbot({ childId, childName }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: childName 
          ? `G'day! I'm PAM's AI assistant, here to help with all things related to ${childName}'s care. Whether you need parenting advice, want to understand developmental milestones, or have questions about feeding, sleep, or health - I'm here to help with evidence-based guidance tailored for Australian families.

What would you like to know about ${childName} today?`
          : `G'day! I'm PAM's AI assistant, here to support you with all aspects of parenting and child care. I can help with questions about feeding, sleep, development, health concerns, and general parenting advice - all based on Australian guidelines and evidence-based practices.

How can I help you today?`,
        timestamp: new Date(),
        suggestions: [
          "How much sleep should my baby get?",
          "When should I start solid foods?",
          "What are normal feeding patterns?",
          "How can I establish a bedtime routine?"
        ]
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, childName, messages.length])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      // Get system context for the AI
      const systemContext = childId 
        ? `You are PAM's AI assistant, helping with parenting questions for ${childName || 'this child'}. Provide helpful, evidence-based advice following Australian guidelines. Be warm, supportive, and concise. Always include medical disclaimers for health-related questions.`
        : `You are PAM's AI assistant, helping with general parenting questions. Provide helpful, evidence-based advice following Australian guidelines. Be warm, supportive, and concise. Always include medical disclaimers for health-related questions.`

      const context = {
        childId,
        childName,
        currentTime: new Date().toISOString()
      }

      const response = await fetch('/api/chat/ai-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          systemContext,
          context
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const aiResponse = await response.json()

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponse.message,
        timestamp: new Date(),
        quick_actions: aiResponse.quick_actions,
        medical_disclaimer: aiResponse.medical_disclaimer,
        suggestions: aiResponse.suggestions
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment, or contact our support team if you need immediate assistance.",
        timestamp: new Date(),
        medical_disclaimer: true
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
    inputRef.current?.focus()
  }

  const handleQuickAction = (action: any) => {
    // Handle quick actions like logging activities
    console.log('Quick action triggered:', action)
    // This would integrate with the TrackerService or navigate to appropriate pages
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Floating bubble when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pam-red to-pam-pink hover:from-pam-red/90 hover:to-pam-pink/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <div className="relative">
            <ChatSolidIcon className="w-8 h-8 text-white" />
            <SparklesIcon className="w-4 h-4 text-white absolute -top-1 -right-1 animate-pulse" />
          </div>
        </Button>
      </div>
    )
  }

  // Expanded chat interface
  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)]">
      <Card className="h-full flex flex-col shadow-2xl border-2 border-pam-pink/20">
        {/* Chat Header */}
        <CardHeader className="bg-gradient-to-r from-pam-red to-pam-pink text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5" />
              <div>
                <h3 className="font-semibold text-sm">PAM AI Assistant</h3>
                <p className="text-xs opacity-90">
                  {childName ? `Helping with ${childName}'s care` : 'Parenting support'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-1"
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 p-0 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-pam-red text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Medical Disclaimer */}
                    {message.medical_disclaimer && (
                      <div className="mt-2 pt-2 border-t border-gray-300 text-xs text-gray-600">
                        ⚠️ This is general information only. For medical concerns, consult your healthcare provider.
                      </div>
                    )}

                    {/* Quick Actions */}
                    {message.quick_actions && message.quick_actions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        <p className="text-xs text-gray-600 mb-1">Quick actions:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.quick_actions.map((action, index) => (
                            <Button
                              key={index}
                              onClick={() => handleQuickAction(action)}
                              size="sm"
                              variant="outline"
                              className="text-xs px-2 py-1 h-auto"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        <p className="text-xs text-gray-600 mb-1">Try asking:</p>
                        <div className="space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block text-xs text-left w-full px-2 py-1 bg-white rounded border hover:bg-gray-50 transition-colors"
                            >
                              "{suggestion}"
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-1 text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about parenting..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pam-red focus:border-transparent text-sm"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-pam-red hover:bg-pam-red/90 p-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <PaperAirplaneIcon className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Press Enter to send • Powered by AI
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}