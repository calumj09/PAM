'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { 
  Smartphone, Baby, Calendar, Brain, ChartBar, CheckCircle2,
  Map, Bell, Users, Shield, Clock, Heart, Camera, FileText,
  Mic, Activity, Moon, Sun, ChevronLeft, ChevronRight, Play, Phone
} from 'lucide-react'

export default function DemoPage() {
  const [activeFeature, setActiveFeature] = useState('today')
  const [deviceView, setDeviceView] = useState<'iphone' | 'android'>('iphone')

  const features = [
    { 
      id: 'today', 
      name: 'Today View', 
      icon: Sun,
      description: 'Start your day with a gentle, personalized overview'
    },
    { 
      id: 'timeline', 
      name: 'Smart Timeline', 
      icon: CheckCircle2,
      description: 'Never miss important milestones and appointments'
    },
    { 
      id: 'tracker', 
      name: 'Baby Tracker', 
      icon: Baby,
      description: 'Log activities quickly with voice or touch'
    },
    { 
      id: 'calendar', 
      name: 'Calendar Sync', 
      icon: Calendar,
      description: 'All appointments in one place, synced everywhere'
    },
    { 
      id: 'local', 
      name: 'Local Info', 
      icon: Map,
      description: 'Australian resources and guides at your fingertips'
    },
    { 
      id: 'ai', 
      name: 'AI Assistant', 
      icon: Brain,
      description: '24/7 support for your parenting questions'
    },
    { 
      id: 'analytics', 
      name: 'Analytics', 
      icon: ChartBar,
      description: 'Understand patterns and track growth'
    }
  ]

  const screenshots = {
    today: {
      title: 'Your Personalized Daily Dashboard',
      features: [
        'Time-aware greetings that understand your schedule',
        'Today\'s checklist items at a glance',
        'Gentle "Me Time" reminders for self-care',
        'Quick access to tracking and logging',
        'Empathetic messaging throughout'
      ],
      mockup: (
        <div className="bg-gradient-to-b from-pam-cream to-pam-white rounded-[2rem] p-4 h-full">
          <div className="space-y-4">
            {/* Header */}
            <div className="text-center pt-4">
              <p className="text-sm text-pam-gray-600">Good morning, Sarah</p>
              <h2 className="text-2xl font-bold text-pam-gray-900">Thursday, March 14</h2>
              <p className="text-sm text-pam-primary mt-1">Emma is 4 months old today! 🎉</p>
            </div>

            {/* Me Time Nudge */}
            <div className="bg-pam-pink/20 rounded-xl p-4 mx-2">
              <div className="flex items-center space-x-3">
                <Heart className="w-5 h-5 text-pam-primary flex-shrink-0" />
                <p className="text-sm text-pam-gray-700">
                  You\'re doing amazing! Remember to take 5 minutes for yourself today.
                </p>
              </div>
            </div>

            {/* Today's Tasks */}
            <div className="bg-white rounded-xl p-4 mx-2 shadow-sm">
              <h3 className="font-semibold text-pam-gray-900 mb-3">Today\'s Tasks</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-pam-success flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-pam-gray-700 line-through">Morning feed - 7:30am</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full border-2 border-pam-primary"></div>
                  <span className="text-sm text-pam-gray-700">4-month immunizations - 2:00pm</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full border-2 border-pam-gray-300"></div>
                  <span className="text-sm text-pam-gray-700">Tummy time session</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-3 px-2">
              <button className="bg-white rounded-xl p-3 shadow-sm">
                <Baby className="w-6 h-6 text-pam-primary mx-auto mb-1" />
                <span className="text-xs text-pam-gray-600">Feed</span>
              </button>
              <button className="bg-white rounded-xl p-3 shadow-sm">
                <Moon className="w-6 h-6 text-pam-primary mx-auto mb-1" />
                <span className="text-xs text-pam-gray-600">Sleep</span>
              </button>
              <button className="bg-white rounded-xl p-3 shadow-sm">
                <Activity className="w-6 h-6 text-pam-primary mx-auto mb-1" />
                <span className="text-xs text-pam-gray-600">Nappy</span>
              </button>
              <button className="bg-white rounded-xl p-3 shadow-sm">
                <Camera className="w-6 h-6 text-pam-primary mx-auto mb-1" />
                <span className="text-xs text-pam-gray-600">Photo</span>
              </button>
            </div>
          </div>
        </div>
      )
    },
    timeline: {
      title: 'Smart Timeline That Grows With Your Baby',
      features: [
        'Auto-generated tasks based on baby\'s age',
        'Australian immunization schedule integrated',
        'Government registration reminders',
        'Customizable milestone tracking',
        'Document upload for important papers'
      ],
      mockup: (
        <div className="bg-pam-gray-50 rounded-[2rem] p-4 h-full">
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="text-xl font-bold text-pam-gray-900">Emma\'s Timeline</h2>
              <p className="text-sm text-pam-gray-600">4 months old</p>
            </div>

            {/* Timeline Cards */}
            <div className="space-y-3">
              {/* This Week */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-pam-gray-900">This Week</h3>
                  <span className="text-xs bg-pam-primary/10 text-pam-primary px-2 py-1 rounded-full">2 tasks</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <Bell className="w-4 h-4 text-pam-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-pam-gray-900">4-month immunizations</p>
                      <p className="text-xs text-pam-gray-600">Thursday 2:00pm at Bondi Medical Centre</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FileText className="w-4 h-4 text-pam-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-pam-gray-900">Apply for childcare</p>
                      <p className="text-xs text-pam-gray-600">Start application process (6 month waitlist)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Week */}
              <div className="bg-white rounded-xl p-4 shadow-sm opacity-90">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-pam-gray-900">Next Week</h3>
                  <span className="text-xs bg-pam-gray-100 text-pam-gray-600 px-2 py-1 rounded-full">3 tasks</span>
                </div>
                <div className="space-y-2 text-sm text-pam-gray-600">
                  <p>• Maternal health nurse check</p>
                  <p>• Start solid foods preparation</p>
                  <p>• Update emergency contacts</p>
                </div>
              </div>

              {/* Milestone Bubble */}
              <div className="bg-gradient-to-r from-pam-pink/20 to-pam-primary/10 rounded-xl p-4">
                <h4 className="font-medium text-pam-gray-900 mb-2">What to expect at 4 months</h4>
                <p className="text-sm text-pam-gray-700">
                  Emma might start rolling over, laughing out loud, and showing more interest in toys!
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    tracker: {
      title: 'Track Everything With a Tap or Your Voice',
      features: [
        'One-tap quick logging for common activities',
        'Voice commands for hands-free tracking',
        'Pattern recognition and insights',
        'Share real-time updates with partners',
        'Export data for healthcare visits'
      ],
      mockup: (
        <div className="bg-white rounded-[2rem] p-4 h-full">
          <div className="space-y-4">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-pam-gray-900">Baby Tracker</h2>
              <p className="text-sm text-pam-gray-600">Today\'s Activities</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-pam-gray-50 rounded-xl p-3 text-center">
                <Baby className="w-8 h-8 text-pam-primary mx-auto mb-1" />
                <p className="text-2xl font-bold text-pam-gray-900">6</p>
                <p className="text-xs text-pam-gray-600">Feeds</p>
              </div>
              <div className="bg-pam-gray-50 rounded-xl p-3 text-center">
                <Moon className="w-8 h-8 text-pam-primary mx-auto mb-1" />
                <p className="text-2xl font-bold text-pam-gray-900">14h</p>
                <p className="text-xs text-pam-gray-600">Sleep</p>
              </div>
              <div className="bg-pam-gray-50 rounded-xl p-3 text-center">
                <Activity className="w-8 h-8 text-pam-primary mx-auto mb-1" />
                <p className="text-2xl font-bold text-pam-gray-900">8</p>
                <p className="text-xs text-pam-gray-600">Nappies</p>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="space-y-3">
              <h3 className="font-semibold text-pam-gray-900 px-2">Recent Activities</h3>
              <div className="space-y-2">
                <div className="bg-pam-gray-50 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Baby className="w-5 h-5 text-pam-primary" />
                    <div>
                      <p className="text-sm font-medium text-pam-gray-900">Breastfeed</p>
                      <p className="text-xs text-pam-gray-600">15 mins • Left side</p>
                    </div>
                  </div>
                  <span className="text-xs text-pam-gray-500">10:30am</span>
                </div>
                <div className="bg-pam-gray-50 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-pam-success" />
                    <div>
                      <p className="text-sm font-medium text-pam-gray-900">Nappy Change</p>
                      <p className="text-xs text-pam-gray-600">Wet</p>
                    </div>
                  </div>
                  <span className="text-xs text-pam-gray-500">10:15am</span>
                </div>
                <div className="bg-pam-gray-50 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Moon className="w-5 h-5 text-indigo-500" />
                    <div>
                      <p className="text-sm font-medium text-pam-gray-900">Sleep</p>
                      <p className="text-xs text-pam-gray-600">1h 30min nap</p>
                    </div>
                  </div>
                  <span className="text-xs text-pam-gray-500">8:45am</span>
                </div>
              </div>
            </div>

            {/* Voice Input */}
            <div className="fixed bottom-20 left-0 right-0 px-6">
              <button className="w-full bg-pam-primary text-white rounded-full py-4 flex items-center justify-center space-x-2 shadow-lg">
                <Mic className="w-5 h-5" />
                <span className="font-medium">Tap to speak</span>
              </button>
            </div>
          </div>
        </div>
      )
    },
    calendar: {
      title: 'All Your Appointments in One Place',
      features: [
        'Sync with Google Calendar and Outlook',
        'Auto-add appointments from timeline',
        'Color-coded event categories',
        'Share calendar with family members',
        'Get smart reminders before appointments'
      ],
      mockup: (
        <div className="bg-white rounded-[2rem] p-4 h-full">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-pam-gray-900">March 2024</h2>
              <button className="text-pam-primary">
                <Calendar className="w-6 h-6" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-pam-gray-50 rounded-xl p-3">
              <div className="grid grid-cols-7 gap-1 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                  <div key={day} className="text-xs font-medium text-pam-gray-600 py-2">
                    {day}
                  </div>
                ))}
                {/* Sample calendar days */}
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 2; // Start from Thursday
                  const isToday = day === 14;
                  const hasEvent = day === 14 || day === 18 || day === 25;
                  
                  if (day < 1 || day > 31) {
                    return <div key={i} className="py-2" />;
                  }
                  
                  return (
                    <div
                      key={i}
                      className={`py-2 rounded-lg ${
                        isToday ? 'bg-pam-primary text-white' : 
                        hasEvent ? 'bg-pam-pink/20' : ''
                      }`}
                    >
                      <span className="text-sm">{day}</span>
                      {hasEvent && !isToday && (
                        <div className="w-1 h-1 bg-pam-primary rounded-full mx-auto mt-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Today's Events */}
            <div className="space-y-3">
              <h3 className="font-semibold text-pam-gray-900">Today\'s Schedule</h3>
              <div className="space-y-2">
                <div className="bg-pam-pink/10 rounded-xl p-3 border-l-4 border-pam-primary">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-pam-gray-900">4-month immunizations</p>
                      <p className="text-sm text-pam-gray-600">Bondi Medical Centre</p>
                    </div>
                    <span className="text-sm font-medium text-pam-primary">2:00pm</span>
                  </div>
                </div>
                <div className="bg-pam-gray-50 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-pam-gray-900">Playgroup</p>
                      <p className="text-sm text-pam-gray-600">Bondi Beach Library</p>
                    </div>
                    <span className="text-sm text-pam-gray-600">10:00am</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sync Status */}
            <div className="bg-pam-success/10 rounded-xl p-3 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-pam-success" />
              <span className="text-sm text-pam-gray-700">Synced with Google Calendar</span>
            </div>
          </div>
        </div>
      )
    },
    local: {
      title: 'Local Resources at Your Fingertips',
      features: [
        'State-specific government guides',
        'Step-by-step admin walkthroughs',
        'Emergency contacts for your area',
        'Local playgroups and services',
        'Direct links to official forms'
      ],
      mockup: (
        <div className="bg-pam-gray-50 rounded-[2rem] p-4 h-full">
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="text-xl font-bold text-pam-gray-900">Local Info Hub</h2>
              <p className="text-sm text-pam-gray-600">New South Wales Resources</p>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white rounded-xl p-4 shadow-sm text-left">
                <FileText className="w-8 h-8 text-pam-primary mb-2" />
                <h3 className="font-medium text-pam-gray-900">Registrations</h3>
                <p className="text-xs text-pam-gray-600">Birth cert, Medicare</p>
              </button>
              <button className="bg-white rounded-xl p-4 shadow-sm text-left">
                <Shield className="w-8 h-8 text-pam-primary mb-2" />
                <h3 className="font-medium text-pam-gray-900">Health Services</h3>
                <p className="text-xs text-pam-gray-600">Nurses, clinics</p>
              </button>
              <button className="bg-white rounded-xl p-4 shadow-sm text-left">
                <Users className="w-8 h-8 text-pam-primary mb-2" />
                <h3 className="font-medium text-pam-gray-900">Playgroups</h3>
                <p className="text-xs text-pam-gray-600">Local activities</p>
              </button>
              <button className="bg-white rounded-xl p-4 shadow-sm text-left">
                <Bell className="w-8 h-8 text-pam-primary mb-2" />
                <h3 className="font-medium text-pam-gray-900">Emergency</h3>
                <p className="text-xs text-pam-gray-600">24/7 contacts</p>
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-pam-gray-900 mb-3">Quick Links</h3>
              <div className="space-y-3">
                <a className="flex items-center justify-between p-2 hover:bg-pam-gray-50 rounded-lg">
                  <span className="text-sm text-pam-gray-700">Apply for birth certificate</span>
                  <ChevronRight className="w-4 h-4 text-pam-gray-400" />
                </a>
                <a className="flex items-center justify-between p-2 hover:bg-pam-gray-50 rounded-lg">
                  <span className="text-sm text-pam-gray-700">Find maternal health nurse</span>
                  <ChevronRight className="w-4 h-4 text-pam-gray-400" />
                </a>
                <a className="flex items-center justify-between p-2 hover:bg-pam-gray-50 rounded-lg">
                  <span className="text-sm text-pam-gray-700">Centrelink family payments</span>
                  <ChevronRight className="w-4 h-4 text-pam-gray-400" />
                </a>
              </div>
            </div>

            {/* Emergency Banner */}
            <div className="bg-red-50 rounded-xl p-3 flex items-center space-x-3">
              <Phone className="w-5 h-5 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Emergency: 000</p>
                <p className="text-xs text-red-700">HealthDirect: 1800 022 222</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    ai: {
      title: 'Your 24/7 Parenting Assistant',
      features: [
        'Instant answers based on Australian guidelines',
        'Personalized advice for your baby\'s age',
        'Upload photos of forms for help',
        'Medical disclaimer and safety first',
        'Save helpful responses for later'
      ],
      mockup: (
        <div className="bg-white rounded-[2rem] p-4 h-full">
          <div className="space-y-4">
            {/* Header */}
            <div className="text-center">
              <Brain className="w-12 h-12 text-pam-primary mx-auto mb-2" />
              <h2 className="text-xl font-bold text-pam-gray-900">AI Assistant</h2>
              <p className="text-sm text-pam-gray-600">Ask me anything about parenting</p>
            </div>

            {/* Chat Messages */}
            <div className="space-y-3 px-2">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-pam-primary text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                  <p className="text-sm">Is it normal for my 4-month-old to wake up 3 times at night?</p>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start">
                <div className="bg-pam-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                  <p className="text-sm text-pam-gray-800 mb-2">
                    Yes, this is completely normal! At 4 months, many babies still wake 2-3 times per night for feeds. 
                  </p>
                  <p className="text-sm text-pam-gray-800 mb-2">
                    According to Australian sleep guidelines, babies this age typically:
                  </p>
                  <ul className="text-sm text-pam-gray-700 ml-4 space-y-1">
                    <li>• Sleep 12-16 hours total per day</li>
                    <li>• Take 2-3 daytime naps</li>
                    <li>• May still need 1-2 night feeds</li>
                  </ul>
                  <p className="text-xs text-pam-gray-500 mt-3">
                    Always consult your healthcare provider for personalized advice.
                  </p>
                </div>
              </div>

              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-pam-primary text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                  <p className="text-sm">When should I start introducing solids?</p>
                </div>
              </div>

              {/* AI Typing */}
              <div className="flex justify-start items-center space-x-2">
                <div className="bg-pam-gray-100 rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-pam-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-pam-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-pam-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="fixed bottom-20 left-0 right-0 px-6">
              <div className="bg-pam-gray-100 rounded-full px-4 py-3 flex items-center space-x-3">
                <input 
                  type="text" 
                  placeholder="Ask a question..." 
                  className="flex-1 bg-transparent outline-none text-sm"
                />
                <button className="text-pam-primary">
                  <Mic className="w-5 h-5" />
                </button>
                <button className="text-pam-primary">
                  <Camera className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    analytics: {
      title: 'Understand Your Baby\'s Patterns',
      features: [
        'Visual charts for sleep and feeding patterns',
        'Growth tracking against WHO standards',
        'Weekly and monthly trend analysis',
        'Export reports for doctor visits',
        'Milestone achievement tracking'
      ],
      mockup: (
        <div className="bg-white rounded-[2rem] p-4 h-full">
          <div className="space-y-4">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-pam-gray-900">Analytics</h2>
              <p className="text-sm text-pam-gray-600">Emma\'s patterns this week</p>
            </div>

            {/* Sleep Chart */}
            <div className="bg-pam-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-pam-gray-900 mb-3">Sleep Pattern</h3>
              <div className="space-y-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                  <div key={day} className="flex items-center space-x-3">
                    <span className="text-xs text-pam-gray-600 w-8">{day}</span>
                    <div className="flex-1 bg-white rounded-full h-6 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-full rounded-full"
                        style={{ width: `${65 + i * 5}%` }}
                      />
                    </div>
                    <span className="text-xs text-pam-gray-700 font-medium">{13 + i}h</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-pam-gray-600 mt-3">Average: 14.5 hours/day</p>
            </div>

            {/* Feeding Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-pam-pink/10 rounded-xl p-4 text-center">
                <Baby className="w-8 h-8 text-pam-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-pam-gray-900">6-8</p>
                <p className="text-xs text-pam-gray-600">Feeds per day</p>
              </div>
              <div className="bg-pam-success/10 rounded-xl p-4 text-center">
                <Clock className="w-8 h-8 text-pam-success mx-auto mb-2" />
                <p className="text-2xl font-bold text-pam-gray-900">3-4h</p>
                <p className="text-xs text-pam-gray-600">Between feeds</p>
              </div>
            </div>

            {/* Growth Chart Preview */}
            <div className="bg-pam-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-pam-gray-900">Growth Tracking</h3>
                <ChevronRight className="w-4 h-4 text-pam-gray-400" />
              </div>
              <div className="flex items-end space-x-2 h-24">
                {[40, 55, 65, 72, 78, 85, 90].map((height, i) => (
                  <div key={i} className="flex-1 bg-pam-primary/20 rounded-t" style={{ height: `${height}%` }} />
                ))}
              </div>
              <p className="text-xs text-pam-success mt-2">✓ Tracking well for age</p>
            </div>

            {/* Export Button */}
            <button className="w-full bg-pam-primary text-white rounded-xl py-3 flex items-center justify-center space-x-2">
              <FileText className="w-5 h-5" />
              <span className="font-medium">Export Report for Doctor</span>
            </button>
          </div>
        </div>
      )
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-pam-white to-pam-gray-50 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-pam-gray-900 mb-6">
              See PAM in Action
            </h1>
            <p className="text-lg sm:text-xl text-pam-gray-700 mb-8">
              Experience how PAM makes parenting easier with our interactive demo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-pam-primary hover:bg-pam-primary-dark text-pam-white px-8 py-6 text-lg">
                  Start Free Trial
                </Button>
              </Link>
              <button className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-6 text-lg font-medium text-pam-primary hover:text-pam-primary-dark">
                <Play className="w-5 h-5" />
                <span>Watch Video Tour</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-16 sm:py-20 bg-pam-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Feature Navigation */}
          <div className="flex overflow-x-auto pb-4 mb-8 scrollbar-hide">
            <div className="flex space-x-2 mx-auto">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeature(feature.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                      activeFeature === feature.id
                        ? 'bg-pam-primary text-pam-white'
                        : 'bg-pam-gray-100 text-pam-gray-700 hover:bg-pam-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{feature.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Demo Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Feature Description */}
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold text-pam-gray-900 mb-4">
                {screenshots[activeFeature as keyof typeof screenshots].title}
              </h2>
              <p className="text-lg text-pam-gray-700 mb-6">
                {features.find(f => f.id === activeFeature)?.description}
              </p>
              <ul className="space-y-3">
                {screenshots[activeFeature as keyof typeof screenshots].features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-pam-success mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-pam-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/features">
                  <Button variant="outline" className="border-pam-primary text-pam-primary hover:bg-pam-primary hover:text-pam-white">
                    Learn More About Features
                  </Button>
                </Link>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="order-1 lg:order-2">
              <div className="relative mx-auto max-w-sm">
                {/* Device Frame */}
                <div className={`relative ${deviceView === 'iphone' ? 'iphone-frame' : 'android-frame'}`}>
                  <div className="absolute inset-0 bg-black rounded-[3rem] shadow-2xl" />
                  <div className="relative z-10 mx-6 my-6">
                    {/* Status Bar */}
                    <div className="h-6 bg-black rounded-t-2xl flex items-center justify-between px-6 text-white text-xs">
                      <span>9:41</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-3 border border-white rounded-sm">
                          <div className="w-2 h-1.5 bg-white rounded-sm ml-auto mr-0.5 mt-0.5" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Screen Content */}
                    <div className="h-[600px] overflow-hidden">
                      {screenshots[activeFeature as keyof typeof screenshots].mockup}
                    </div>

                    {/* Home Indicator */}
                    {deviceView === 'iphone' && (
                      <div className="h-8 bg-black rounded-b-2xl flex items-end justify-center pb-2">
                        <div className="w-32 h-1 bg-white/30 rounded-full" />
                      </div>
                    )}
                  </div>
                  {/* Notch (iPhone) */}
                  {deviceView === 'iphone' && (
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-black rounded-b-2xl" />
                  )}
                </div>

                {/* Device Switcher */}
                <div className="flex justify-center mt-6 space-x-4">
                  <button
                    onClick={() => setDeviceView('iphone')}
                    className={`text-sm font-medium ${
                      deviceView === 'iphone' ? 'text-pam-primary' : 'text-pam-gray-500'
                    }`}
                  >
                    iPhone
                  </button>
                  <button
                    onClick={() => setDeviceView('android')}
                    className={`text-sm font-medium ${
                      deviceView === 'android' ? 'text-pam-primary' : 'text-pam-gray-500'
                    }`}
                  >
                    Android
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-16 sm:py-20 bg-pam-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-pam-gray-900 mb-4">
              Why Parents Love PAM
            </h2>
            <p className="text-lg text-pam-gray-700 max-w-2xl mx-auto">
              Built by parents, for parents, with your needs at heart
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pam-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-pam-primary" />
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-2">Gentle & Supportive</h3>
              <p className="text-pam-gray-600">
                Empathetic messaging and "Me Time" reminders because we know parenting is tough
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pam-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map className="w-8 h-8 text-pam-primary" />
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-2">Australian-Specific</h3>
              <p className="text-pam-gray-600">
                Built for Australian parents with local resources, schedules, and government integration
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pam-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-pam-primary" />
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-2">Private & Secure</h3>
              <p className="text-pam-gray-600">
                Your family data is encrypted and never shared. You own and control everything
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-16 sm:py-20 bg-pam-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-pam-gray-900 mb-4">
              See PAM in 2 Minutes
            </h2>
            <p className="text-lg text-pam-gray-700">
              Watch how PAM simplifies your daily parenting routine
            </p>
          </div>

          <div className="relative aspect-video bg-pam-gray-100 rounded-2xl overflow-hidden shadow-lg">
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-20 h-20 bg-pam-primary rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <Play className="w-8 h-8 text-white ml-1" />
              </button>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/50 backdrop-blur rounded-lg p-4 text-white">
                <p className="text-sm">Quick Tour: From Sign Up to Daily Use</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-pam-primary to-pam-primary-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-pam-white mb-4">
            Ready to simplify parenting?
          </h2>
          <p className="text-lg text-pam-white/90 mb-8">
            Join thousands of Australian parents using PAM every day
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-pam-white text-pam-primary hover:bg-pam-gray-100 px-8 py-6 text-lg font-semibold">
                Start Your Free Trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-pam-white text-pam-white hover:bg-pam-white hover:text-pam-primary px-8 py-6 text-lg">
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="text-sm text-pam-white/70 mt-6">
            No credit card required • 14-day free trial of Premium
          </p>
        </div>
      </section>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </>
  )
}