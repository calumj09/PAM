'use client'

import { useState, useEffect } from 'react'
import { 
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowIndicator(true)
      // Hide the "back online" message after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowIndicator(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Only show indicator when offline or when coming back online
  if (!showIndicator && isOnline) {
    return null
  }

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 mx-auto max-w-md transition-all duration-300 ${
      showIndicator ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className={`rounded-xl shadow-lg p-3 flex items-center gap-3 ${
        isOnline 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-amber-50 border border-amber-200'
      }`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isOnline ? 'bg-green-100' : 'bg-amber-100'
        }`}>
          {isOnline ? (
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
          ) : (
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
          )}
        </div>
        
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            isOnline ? 'text-green-800' : 'text-amber-800'
          }`}>
            {isOnline ? 'Back online!' : 'You\'re offline'}
          </p>
          <p className={`text-xs ${
            isOnline ? 'text-green-600' : 'text-amber-600'
          }`}>
            {isOnline 
              ? 'All features are available again'
              : 'Some features may be limited. Your data will sync when connection returns.'
            }
          </p>
        </div>

        {!isOnline && (
          <WifiIcon className="w-5 h-5 text-amber-600" />
        )}
      </div>
    </div>
  )
}