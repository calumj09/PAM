'use client'

import { useEffect } from 'react'
import { registerServiceWorker, offlineManager } from '@/lib/utils/pwa-utils'

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PWA features
    const initPWA = async () => {
      try {
        // Initialize offline manager
        await offlineManager.init()
        console.log('Offline manager initialized')

        // Register service worker in production
        if (process.env.NODE_ENV === 'production') {
          await registerServiceWorker()
        }

        // Handle app update
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            // Reload the page to get the latest version
            window.location.reload()
          })
        }
      } catch (error) {
        console.error('PWA initialization failed:', error)
      }
    }

    initPWA()
  }, [])

  return <>{children}</>
}