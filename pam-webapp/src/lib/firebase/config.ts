// Firebase Configuration for Push Notifications

import { initializeApp, FirebaseApp } from 'firebase/app'
import { getMessaging, Messaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

let app: FirebaseApp | null = null
let messaging: Messaging | null = null

// Initialize Firebase app
export const initializeFirebase = (): FirebaseApp => {
  if (!app) {
    app = initializeApp(firebaseConfig)
  }
  return app
}

// Initialize Firebase messaging (client-side only)
export const initializeMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === 'undefined') {
    return null // Server-side, return null
  }

  try {
    const supported = await isSupported()
    if (!supported) {
      console.warn('Firebase messaging is not supported in this browser')
      return null
    }

    if (!messaging) {
      const app = initializeFirebase()
      messaging = getMessaging(app)
    }
    
    return messaging
  } catch (error) {
    console.error('Error initializing Firebase messaging:', error)
    return null
  }
}

// Check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  )
}