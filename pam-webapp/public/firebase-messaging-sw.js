// Firebase Messaging Service Worker for PAM

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: 'your-api-key-will-be-set-dynamically',
  authDomain: 'your-auth-domain',
  projectId: 'your-project-id',
  storageBucket: 'your-storage-bucket',  
  messagingSenderId: 'your-sender-id',
  appId: 'your-app-id'
})

// Initialize Firebase messaging
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload)

  const notificationTitle = payload.notification?.title || 'PAM Reminder'
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new reminder',
    icon: '/icons/pwa-192x192.png',
    badge: '/icons/pwa-96x96.png',
    tag: 'pam-notification',
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-icon.png'
      }
    ]
  }

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)

  event.notification.close()

  if (event.action === 'view') {
    // Open the app to the relevant page
    const urlToOpen = event.notification.data?.url || '/dashboard/checklist'
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes(urlToOpen) && 'focus' in client) {
              return client.focus()
            }
          }
          
          // Open new window/tab
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen)
          }
        })
    )
  } else if (event.action === 'dismiss') {
    // Just close the notification (already handled above)
    console.log('Notification dismissed')
  } else {
    // Default action - open the app
    const urlToOpen = '/dashboard/checklist'
    
    event.waitUntil(
      clients.openWindow(urlToOpen)
    )
  }
})

// Optional: Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event)
  
  // You could track notification dismissals here
  // analytics.track('notification_dismissed', { ... })
})