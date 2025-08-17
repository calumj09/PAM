import { PWAInstallPrompt } from '@/components/features/pwa-install-prompt'
import { OfflineIndicator } from '@/components/features/offline-indicator'
import { PWAProvider } from '@/components/features/pwa-provider'
import { AIChatbotWithContext } from '@/components/ai/AIChatbotWithContext'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PWAProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <OfflineIndicator />
        {children}
        <Navigation />
        <PWAInstallPrompt />
        <AIChatbotWithContext />
      </div>
    </PWAProvider>
  )
}