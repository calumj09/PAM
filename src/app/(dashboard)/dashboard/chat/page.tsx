'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AIChatbotService, ChatMessage, ChatSession } from '@/lib/services/ai-chatbot-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  UserCircleIcon,
  ComputerDesktopIcon,
  PlusIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface Child {
  id: string
  first_name: string
  date_of_birth: string
  gender?: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [showSessionList, setShowSessionList] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load children
      const { data: childrenData } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('date_of_birth', { ascending: false })

      if (childrenData) {
        setChildren(childrenData)
        if (childrenData.length > 0 && !selectedChildId) {
          setSelectedChildId(childrenData[0].id)
        }
      }

      // Load chat sessions
      const sessions = await AIChatbotService.getChatSessions(user.id)
      setChatSessions(sessions)

      // Start new session if none exists
      if (sessions.length === 0) {
        await startNewChat()
      } else {
        setCurrentSession(sessions[0])
        setMessages(sessions[0].messages)
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const startNewChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const selectedChild = children.find(c => c.id === selectedChildId)
      const title = selectedChild 
        ? `Chat about ${selectedChild.first_name}` 
        : 'General Parenting Chat'

      const session = await AIChatbotService.createChatSession(
        user.id,
        selectedChildId || undefined,
        title
      )

      setCurrentSession(session)
      setMessages([])
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: selectedChild 
          ? `Hi! I'm PAM AI, your Australian parenting assistant. I'm here to help with questions about ${selectedChild.first_name}'s development, feeding, sleep, and general baby care. I have access to your tracking data to provide personalised advice.\n\nWhat would you like to discuss today?`
          : `Hi! I'm PAM AI, your Australian parenting assistant. I'm here to help with questions about child development, feeding, sleep, and general parenting. I can provide advice based on Australian health guidelines.\n\nWhat would you like to discuss today?`,
        timestamp: new Date().toISOString()
      }

      setMessages([welcomeMessage])
      await AIChatbotService.addMessage(session.id, welcomeMessage)

      // Refresh sessions list
      const sessions = await AIChatbotService.getChatSessions(user.id)
      setChatSessions(sessions)
    } catch (error) {
      console.error('Error starting new chat:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSession || isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      childContext: selectedChildId ? {
        childId: selectedChildId,
        childName: children.find(c => c.id === selectedChildId)?.first_name || '',
        ageMonths: Math.floor((Date.now() - new Date(children.find(c => c.id === selectedChildId)?.date_of_birth || '').getTime()) / (1000 * 60 * 60 * 24 * 30.44))
      } : undefined
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputMessage('')
    setIsLoading(true)

    try {
      // Add user message to session
      await AIChatbotService.addMessage(currentSession.id, userMessage)

      // Generate AI response
      const aiResponse = await AIChatbotService.generateResponse(
        userMessage.content,
        selectedChildId || undefined,
        newMessages.slice(-10)
      )

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])
      await AIChatbotService.addMessage(currentSession.id, assistantMessage)

      // Refresh sessions to update title if needed
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const sessions = await AIChatbotService.getChatSessions(user.id)
        setChatSessions(sessions)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble right now. Please try again in a moment, or contact your healthcare provider if it's urgent.",
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const selectSession = (session: ChatSession) => {
    setCurrentSession(session)
    setMessages(session.messages)
    setSelectedChildId(session.childId || '')
    setShowSessionList(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (showSessionList) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-pam-red" />
            <h1 className="text-2xl font-bold text-gray-900">Chat Sessions</h1>
          </div>
          <Button 
            onClick={() => setShowSessionList(false)}
            variant="outline"
            size="sm"
          >
            Back to Chat
          </Button>
        </div>

        <div className="space-y-3">
          <Button
            onClick={startNewChat}
            className="w-full justify-start bg-pam-red hover:bg-pam-red/90"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Start New Chat
          </Button>

          {chatSessions.map((session) => (
            <Card 
              key={session.id}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => selectSession(session)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{session.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {session.messages.length} messages
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <ClockIcon className="w-3 h-3" />
                      {formatDate(session.updatedAt)}
                    </div>
                  </div>
                  {session.messages.length > 0 && (
                    <div className="text-xs text-gray-400 max-w-48 truncate">
                      {session.messages[session.messages.length - 1].content.slice(0, 60)}...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-pam-red" />
          <h1 className="text-2xl font-bold text-gray-900">PAM AI Assistant</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {children.length > 0 && (
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
            >
              <option value="">General Chat</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  About {child.first_name}
                </option>
              ))}
            </select>
          )}
          
          <Button
            onClick={() => setShowSessionList(true)}
            variant="outline"
            size="sm"
          >
            Sessions ({chatSessions.length})
          </Button>
          
          <Button
            onClick={startNewChat}
            size="sm"
            className="bg-pam-red hover:bg-pam-red/90"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`p-2 rounded-full flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-pam-red text-white' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {message.role === 'user' ? (
                    <UserCircleIcon className="w-5 h-5" />
                  ) : (
                    <SparklesIcon className="w-5 h-5" />
                  )}
                </div>
                
                <div className={`flex-1 max-w-[80%] ${
                  message.role === 'user' ? 'text-right' : ''
                }`}>
                  <div className={`inline-block p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-pam-red text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </div>
                  
                  <div className={`text-xs text-gray-500 mt-1 ${
                    message.role === 'user' ? 'text-right' : ''
                  }`}>
                    {formatDate(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask me anything about ${selectedChildId ? children.find(c => c.id === selectedChildId)?.first_name + "'s" : 'baby'} care, development, or general parenting...`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pam-red focus:border-transparent"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-pam-red hover:bg-pam-red/90"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <ComputerDesktopIcon className="w-3 h-3" />
              PAM AI - Australian Parenting Assistant
            </div>
            <div>
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}