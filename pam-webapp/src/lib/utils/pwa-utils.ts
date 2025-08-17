// PWA utilities for offline support and background sync

export interface OfflineData {
  id: string
  type: 'checklist_completion' | 'baby_tracking' | 'profile_update'
  data: Record<string, unknown>
  timestamp: number
  synced: boolean
}

export class OfflineManager {
  private dbName = 'pam-offline-db'
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object store for offline data
        if (!db.objectStoreNames.contains('offline-actions')) {
          const store = db.createObjectStore('offline-actions', { keyPath: 'id' })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('synced', 'synced', { unique: false })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  async storeOfflineAction(data: Omit<OfflineData, 'id' | 'timestamp' | 'synced'>): Promise<string> {
    if (!this.db) await this.init()

    const id = crypto.randomUUID()
    const offlineData: OfflineData = {
      id,
      timestamp: Date.now(),
      synced: false,
      ...data
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline-actions'], 'readwrite')
      const store = transaction.objectStore('offline-actions')
      const request = store.add(offlineData)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(id)
    })
  }

  async getUnsynced(): Promise<OfflineData[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline-actions'], 'readonly')
      const store = transaction.objectStore('offline-actions')
      const index = store.index('synced')
      const request = index.getAll(false)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async markSynced(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline-actions'], 'readwrite')
      const store = transaction.objectStore('offline-actions')
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const data = getRequest.result
        if (data) {
          data.synced = true
          const putRequest = store.put(data)
          putRequest.onerror = () => reject(putRequest.error)
          putRequest.onsuccess = () => resolve()
        } else {
          resolve()
        }
      }

      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async clearSynced(): Promise<void> {
    if (!this.db) await this.init()

    const synced = await this.getSynced()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline-actions'], 'readwrite')
      const store = transaction.objectStore('offline-actions')
      
      let completed = 0
      const total = synced.length

      if (total === 0) {
        resolve()
        return
      }

      synced.forEach(item => {
        const request = store.delete(item.id)
        request.onsuccess = () => {
          completed++
          if (completed === total) resolve()
        }
        request.onerror = () => reject(request.error)
      })
    })
  }

  private async getSynced(): Promise<OfflineData[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline-actions'], 'readonly')
      const store = transaction.objectStore('offline-actions')
      const index = store.index('synced')
      const request = index.getAll(true)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }
}

// Global instance
export const offlineManager = new OfflineManager()

// PWA installation utilities
export const isPWAInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as { standalone?: boolean }).standalone === true
}

export const isIOSDevice = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export const isAndroidDevice = (): boolean => {
  return /Android/.test(navigator.userAgent)
}

// Service worker registration
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered successfully:', registration)
      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return null
    }
  }
  return null
}

// Background sync utilities
export const scheduleBackgroundSync = async (tag: string): Promise<void> => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register(tag)
      console.log('Background sync registered:', tag)
    } catch (error) {
      console.error('Background sync registration failed:', error)
    }
  }
}

// Check if device is online
export const isOnline = (): boolean => {
  return navigator.onLine
}

// Cache management
export const clearAppCache = async (): Promise<void> => {
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    )
    console.log('App cache cleared')
  }
}

// Check for app updates
export const checkForUpdates = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      await registration.update()
      return registration.waiting !== null
    }
  }
  return false
}