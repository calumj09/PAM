'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DemoDashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString())

  // Demo data
  const mTimeNudges = [
    "Remember to stay hydrated today 💧",
    "You're doing an amazing job, mama ✨", 
    "Take 10 minutes for yourself when you can 🧘‍♀️",
    "Rest when baby rests - you deserve it 💤",
    "Ask for help when you need it - you're not alone 🤗"
  ]

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon" 
    return "Good evening"
  }

  const todayNudge = mTimeNudges[Math.floor(Math.random() * mTimeNudges.length)]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">PAM</h1>
                <p className="text-xs text-gray-500">Demo Mode</p>
              </div>
            </div>
            <div className="text-xs text-gray-400">{currentTime}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{getGreeting()}, Sarah!</h2>
          <p className="text-gray-600">Here's what's happening today</p>
        </div>

        {/* Me Time Nudge */}
        <div className="bg-gradient-to-r from-pink-100 to-orange-100 rounded-2xl p-4 border border-pink-200">
          <h3 className="font-semibold text-gray-900 mb-2">💝 Me Time Reminder</h3>
          <p className="text-gray-700 text-sm">{todayNudge}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-red-600">7</div>
            <div className="text-sm text-gray-600">Weeks old</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-sm text-gray-600">Tasks completed</div>
          </div>
        </div>

        {/* Today's Timeline */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">📅 Today's Timeline</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Birth registration completed</p>
                <p className="text-xs text-gray-500">Required within 60 days of birth</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">8-week health check due</p>
                <p className="text-xs text-gray-500">Book with GP or maternal health nurse</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">2-month immunizations</p>
                <p className="text-xs text-gray-500">Coming up in 3 weeks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Navigation */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">🚀 PAM Features (Demo)</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <div className="text-lg mb-1">📋</div>
              <div className="text-sm font-medium text-gray-900">Timeline</div>
              <div className="text-xs text-gray-500">Track milestones</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-lg mb-1">📊</div>
              <div className="text-sm font-medium text-gray-900">Growth</div>
              <div className="text-xs text-gray-500">Track development</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-lg mb-1">ℹ️</div>
              <div className="text-sm font-medium text-gray-900">Resources</div>
              <div className="text-xs text-gray-500">Australian info</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <div className="text-lg mb-1">📱</div>
              <div className="text-sm font-medium text-gray-900">Baby Tracker</div>
              <div className="text-xs text-gray-500">Coming soon</div>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2">🎯 Demo Success!</h3>
          <p className="text-sm text-blue-800 mb-3">
            You're now seeing PAM working perfectly! This is the exact experience your users will have after we fix the authentication issue.
          </p>
          <div className="space-y-2">
            <Link href="/simple-test" className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg text-sm font-medium">
              🔧 Debug Authentication Issue
            </Link>
            <Link href="/login" className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-lg text-sm font-medium">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}