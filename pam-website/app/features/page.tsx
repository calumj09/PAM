import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { 
  CheckCircle2, Calendar, Brain, ChartBar, Shield, Users, 
  Baby, Bell, FileText, Map, Mic, Cloud, Smartphone, Clock,
  Heart, Activity, Camera, Download
} from 'lucide-react'
import type { Metadata } from 'next'
import { featuresMetadata } from '../metadata'

export const metadata: Metadata = featuresMetadata

export default function FeaturesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-pam-white to-pam-gray-50 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-pam-gray-900 mb-6">
              Everything you need for the first 1000 days
            </h1>
            <p className="text-lg sm:text-xl text-pam-gray-700">
              PAM brings together all the tools Australian parents need in one beautiful, 
              easy-to-use app that works offline and syncs across all your devices.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-16 sm:py-20 bg-pam-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-pam-gray-900 mb-4">
              Core Features
            </h2>
            <p className="text-lg text-pam-gray-700 max-w-2xl mx-auto">
              Essential tools that every parent needs, completely free
            </p>
          </div>

          <div className="space-y-16">
            {/* Smart Checklists */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-pam-primary/10 rounded-xl flex items-center justify-center mr-4">
                    <CheckCircle2 className="w-6 h-6 text-pam-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-pam-gray-900">Smart Checklists</h3>
                </div>
                <p className="text-pam-gray-700 mb-6">
                  Never miss an important milestone or appointment again. PAM automatically generates 
                  personalized checklists based on your child's age and your location in Australia.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-pam-success mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-pam-gray-700">Immunization schedules with reminders</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-pam-success mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-pam-gray-700">Government registrations (Medicare, Centrelink, childcare)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-pam-success mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-pam-gray-700">Health check-ups and developmental assessments</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-pam-success mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-pam-gray-700">State-specific requirements and programs</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] bg-gradient-to-br from-pam-gray-100 to-pam-gray-200 rounded-2xl shadow-lg">
                  {/* Placeholder for feature screenshot */}
                  <div className="w-full h-full flex items-center justify-center">
                    <CheckCircle2 className="w-32 h-32 text-pam-primary/20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Baby Tracker */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="aspect-[4/3] bg-gradient-to-br from-pam-gray-100 to-pam-gray-200 rounded-2xl shadow-lg">
                  {/* Placeholder for feature screenshot */}
                  <div className="w-full h-full flex items-center justify-center">
                    <Baby className="w-32 h-32 text-pam-primary/20" />
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-pam-primary/10 rounded-xl flex items-center justify-center mr-4">
                    <Baby className="w-6 h-6 text-pam-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-pam-gray-900">Baby Tracker</h3>
                </div>
                <p className="text-pam-gray-700 mb-6">
                  Track everything important about your baby's day with just a tap or voice command. 
                  See patterns emerge and share real-time updates with your partner.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Clock className="w-5 h-5 text-pam-success mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-pam-gray-700">Quick logging for feeds, sleep, and nappies</span>
                  </li>
                  <li className="flex items-start">
                    <Mic className="w-5 h-5 text-pam-success mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-pam-gray-700">Voice commands for hands-free tracking</span>
                  </li>
                  <li className="flex items-start">
                    <Activity className="w-5 h-5 text-pam-success mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-pam-gray-700">Pattern insights and trend analysis</span>
                  </li>
                  <li className="flex items-start">
                    <Users className="w-5 h-5 text-pam-success mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-pam-gray-700">Real-time sync with family members</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Local Info Hub */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-pam-primary/10 rounded-xl flex items-center justify-center mr-4">
                    <Map className="w-6 h-6 text-pam-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-pam-gray-900">Local Admin Info Hub</h3>
                </div>
                <p className="text-pam-gray-700 mb-6">
                  Access all the local information you need based on your state and postcode. 
                  From maternal health services to playgroups, everything is organized in one place.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Heart className="w-5 h-5 text-pam-success mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-pam-gray-700">Maternal & child health nurse contacts</span>
                  </li>
                  <li className="flex items-start">
                    <Bell className="w-5 h-5 text-pam-success mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-pam-gray-700">Emergency services and after-hours clinics</span>
                  </li>
                  <li className="flex items-start">
                    <Users className="w-5 h-5 text-pam-success mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-pam-gray-700">Local playgroups and parent services</span>
                  </li>
                  <li className="flex items-start">
                    <FileText className="w-5 h-5 text-pam-success mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-pam-gray-700">State-specific resources and programs</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] bg-gradient-to-br from-pam-gray-100 to-pam-gray-200 rounded-2xl shadow-lg">
                  {/* Placeholder for feature screenshot */}
                  <div className="w-full h-full flex items-center justify-center">
                    <Map className="w-32 h-32 text-pam-primary/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="py-16 sm:py-20 bg-pam-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-pam-gray-900 mb-4">
              Premium Features
            </h2>
            <p className="text-lg text-pam-gray-700 max-w-2xl mx-auto">
              Unlock advanced tools to make parenting even easier
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Calendar Sync */}
            <div className="bg-pam-white rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-pam-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-pam-primary" />
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-3">Calendar Integration</h3>
              <p className="text-pam-gray-600 mb-4">
                Sync with Google Calendar or Outlook to keep all appointments in one place.
              </p>
              <ul className="space-y-2 text-sm text-pam-gray-600">
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-pam-success mt-0.5 mr-2 flex-shrink-0" />
                  <span>Two-way sync with major calendars</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-pam-success mt-0.5 mr-2 flex-shrink-0" />
                  <span>Automatic appointment reminders</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-pam-success mt-0.5 mr-2 flex-shrink-0" />
                  <span>Share events with family</span>
                </li>
              </ul>
            </div>

            {/* AI Assistant */}
            <div className="bg-pam-white rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-pam-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-pam-primary" />
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-3">AI Parenting Assistant</h3>
              <p className="text-pam-gray-600 mb-4">
                Get instant answers to parenting questions from our AI trained on Australian guidelines.
              </p>
              <ul className="space-y-2 text-sm text-pam-gray-600">
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-pam-success mt-0.5 mr-2 flex-shrink-0" />
                  <span>24/7 instant support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-pam-success mt-0.5 mr-2 flex-shrink-0" />
                  <span>Based on official health advice</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-pam-success mt-0.5 mr-2 flex-shrink-0" />
                  <span>Personalized to your child</span>
                </li>
              </ul>
            </div>

            {/* Analytics */}
            <div className="bg-pam-white rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-pam-primary/10 rounded-xl flex items-center justify-center mb-6">
                <ChartBar className="w-6 h-6 text-pam-primary" />
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-3">Advanced Analytics</h3>
              <p className="text-pam-gray-600 mb-4">
                Deep insights into your child's patterns with beautiful visualizations and reports.
              </p>
              <ul className="space-y-2 text-sm text-pam-gray-600">
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-pam-success mt-0.5 mr-2 flex-shrink-0" />
                  <span>Sleep & feeding patterns</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-pam-success mt-0.5 mr-2 flex-shrink-0" />
                  <span>Growth tracking with WHO charts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-pam-success mt-0.5 mr-2 flex-shrink-0" />
                  <span>Export reports for doctors</span>
                </li>
              </ul>
            </div>

            {/* Document Storage */}
            <div className="bg-pam-white rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-pam-primary/10 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-pam-primary" />
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-3">Document Vault</h3>
              <p className="text-pam-gray-600 mb-4">
                Securely store important documents like birth certificates and immunization records.
              </p>
              <ul className="space-y-2 text-sm text-pam-gray-600">
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-pam-success mt-0.5 mr-2 flex-shrink-0" />
                  <span>Bank-level encryption</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-pam-success mt-0.5 mr-2 flex-shrink-0" />
                  <span>Quick access when needed</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-pam-success mt-0.5 mr-2 flex-shrink-0" />
                  <span>Share with healthcare providers</span>
                </li>
              </ul>
            </div>

            {/* Photo Timeline */}
            <div className="bg-pam-white rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-pam-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Camera className="w-6 h-6 text-pam-primary" />
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-3">Photo Timeline</h3>
              <p className="text-pam-gray-600 mb-4">
                Create a beautiful visual timeline of your child's growth with milestone photos.
              </p>
              <ul className="space-y-2 text-sm text-pam-gray-600">
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-pam-success mt-0.5 mr-2 flex-shrink-0" />
                  <span>Automatic milestone prompts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-pam-success mt-0.5 mr-2 flex-shrink-0" />
                  <span>Private family sharing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-pam-success mt-0.5 mr-2 flex-shrink-0" />
                  <span>Create photo books</span>
                </li>
              </ul>
            </div>

            {/* Priority Support */}
            <div className="bg-pam-white rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-pam-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-pam-primary" />
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-3">Priority Support</h3>
              <p className="text-pam-gray-600 mb-4">
                Get help when you need it with priority customer support and exclusive resources.
              </p>
              <ul className="space-y-2 text-sm text-pam-gray-600">
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-pam-success mt-0.5 mr-2 flex-shrink-0" />
                  <span>Priority email support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-pam-success mt-0.5 mr-2 flex-shrink-0" />
                  <span>Exclusive webinars</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-pam-success mt-0.5 mr-2 flex-shrink-0" />
                  <span>Early access to new features</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* App Features Section */}
      <section className="py-16 sm:py-20 bg-pam-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-pam-gray-900 mb-4">
              Built for Real Parents
            </h2>
            <p className="text-lg text-pam-gray-700 max-w-2xl mx-auto">
              Every detail designed with exhausted parents in mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pam-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-pam-primary" />
              </div>
              <h3 className="font-semibold text-pam-gray-900 mb-2">Works Offline</h3>
              <p className="text-sm text-pam-gray-600">
                Access everything even without internet. Syncs when you're back online.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pam-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cloud className="w-8 h-8 text-pam-primary" />
              </div>
              <h3 className="font-semibold text-pam-gray-900 mb-2">Auto Backup</h3>
              <p className="text-sm text-pam-gray-600">
                Your data is automatically backed up and synced across all devices.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pam-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-pam-primary" />
              </div>
              <h3 className="font-semibold text-pam-gray-900 mb-2">Privacy First</h3>
              <p className="text-sm text-pam-gray-600">
                Your family data is encrypted and never shared with third parties.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pam-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-pam-primary" />
              </div>
              <h3 className="font-semibold text-pam-gray-900 mb-2">Install on Home Screen</h3>
              <p className="text-sm text-pam-gray-600">
                Works like a native app on iOS and Android. No app store needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-pam-primary to-pam-primary-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-pam-white mb-4">
            Ready to experience PAM?
          </h2>
          <p className="text-lg text-pam-white/90 mb-8">
            Join thousands of Australian parents who've simplified their parenting journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-pam-white text-pam-primary hover:bg-pam-gray-100 px-8 py-6 text-lg font-semibold">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-pam-white text-pam-white hover:bg-pam-white hover:text-pam-primary px-8 py-6 text-lg">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}