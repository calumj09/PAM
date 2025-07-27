import { PWAInstallPrompt } from '@/components/features/pwa-install-prompt'
import { OfflineIndicator } from '@/components/features/offline-indicator'
import { PWAProvider } from '@/components/features/pwa-provider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PWAProvider>
      <div className="min-h-screen bg-gray-50">
        <OfflineIndicator />
        {children}
        <PWAInstallPrompt />
      </div>
    </PWAProvider>
  )
}