'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { 
  ArrowDownTrayIcon as DownloadIcon, 
  XMarkIcon,
  DevicePhoneMobileIcon as SmartphoneIcon,
  ShareIcon
} from '@heroicons/react/24/outline'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after a delay to avoid being too aggressive
      setTimeout(() => {
        setShowPrompt(true)
      }, 30000) // 30 seconds after page load
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      console.log('PAM has been installed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSInstructions(true)
        return
      }
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    // Clear the saved prompt since it can only be used once
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    
    // Don't show again for 7 days
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }

  const shouldShowPrompt = () => {
    if (isInstalled || !showPrompt) return false
    
    // Check if user dismissed recently
    const lastDismissed = localStorage.getItem('pwa-prompt-dismissed')
    if (lastDismissed) {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      if (parseInt(lastDismissed) > sevenDaysAgo) {
        return false
      }
    }
    
    return true
  }

  const IOSInstructions = () => (
    <Card className="fixed bottom-20 left-4 right-4 z-50 border-2 border-blue-200 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <SmartphoneIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Install PAM</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>To install PAM on your iPhone:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Tap the <ShareIcon className="w-4 h-4 inline mx-1" /> share button</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to install PAM</li>
              </ol>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowIOSInstructions(false)}
                className="flex-1"
              >
                Got it
              </Button>
            </div>
          </div>
          <button 
            onClick={() => setShowIOSInstructions(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </CardContent>
    </Card>
  )

  if (isInstalled) {
    return null
  }

  if (showIOSInstructions) {
    return <IOSInstructions />
  }

  if (!shouldShowPrompt()) {
    return null
  }

  return (
    <Card className="fixed bottom-20 left-4 right-4 z-50 border-2 border-pam-pink shadow-lg bg-gradient-to-r from-pam-cream to-white">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-pam-red rounded-xl flex items-center justify-center flex-shrink-0">
            <DownloadIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Install PAM</h3>
            <p className="text-sm text-gray-600 mb-3">
              Get quick access to your parenting checklist and tools. Install PAM on your home screen!
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleInstallClick}
                className="bg-pam-red hover:bg-pam-red/90 text-white flex-1"
                size="sm"
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Install
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDismiss}
                className="text-gray-600"
              >
                Not now
              </Button>
            </div>
          </div>
          <button 
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}