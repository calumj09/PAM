import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, Calendar, Brain, ChartBar, Shield, Smartphone, Users, Baby } from 'lucide-react'
import type { Metadata } from 'next'
import { homepageMetadata } from './metadata'
import MarketingLayout from './marketing-layout'

export const metadata: Metadata = homepageMetadata

export default function LandingPage() {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-pam-white to-pam-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-pam-gray-900 tracking-tight">
              Parenting made simple
              <span className="block text-pam-primary mt-2">for the first 1000 days</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-pam-gray-700 max-w-3xl mx-auto">
              PAM is your trusted companion through pregnancy and early parenthood. 
              Track milestones, manage appointments, and never miss what matters most.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-pam-primary hover:bg-pam-primary-dark text-pam-white px-8 py-6 text-lg">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-pam-primary text-pam-primary hover:bg-pam-primary hover:text-pam-white px-8 py-6 text-lg">
                  See Live Demo
                </Button>
              </Link>
            </div>
            
            {/* App Store Badges */}
            <div className="mt-8 flex justify-center space-x-4">
              <Link href="#" className="inline-block">
                <img src="/app-store-badge.svg" alt="Download on App Store" className="h-12" />
              </Link>
              <Link href="#" className="inline-block">
                <img src="/google-play-badge.svg" alt="Get it on Google Play" className="h-12" />
              </Link>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="relative mx-auto max-w-md sm:max-w-lg md:max-w-xl">
              <div className="aspect-[9/16] bg-gradient-to-br from-pam-gray-100 to-pam-gray-200 rounded-3xl shadow-2xl overflow-hidden">
                {/* Placeholder for app screenshot */}
                <div className="w-full h-full flex items-center justify-center text-pam-gray-500">
                  <Smartphone className="w-32 h-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-pam-white py-12 border-y border-pam-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-pam-primary">10,000+</div>
              <div className="text-sm text-pam-gray-600 mt-1">Australian Parents</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pam-primary">4.8/5</div>
              <div className="text-sm text-pam-gray-600 mt-1">App Store Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pam-primary">50+</div>
              <div className="text-sm text-pam-gray-600 mt-1">Expert Resources</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pam-primary">24/7</div>
              <div className="text-sm text-pam-gray-600 mt-1">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-24 bg-pam-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-pam-gray-900">
              Everything you need in one app
            </h2>
            <p className="mt-4 text-lg text-pam-gray-700 max-w-2xl mx-auto">
              From pregnancy through to preschool, PAM helps you stay organized and informed every step of the way.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-pam-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pam-primary/10 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6 text-pam-primary" />
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-3">Smart Checklists</h3>
              <p className="text-pam-gray-600">
                Automated reminders for immunizations, check-ups, and government registrations based on your child's age.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-pam-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pam-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Baby className="w-6 h-6 text-pam-primary" />
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-3">Baby Tracker</h3>
              <p className="text-pam-gray-600">
                Log feeds, sleep, nappies and more with voice commands. Track patterns and share with your partner.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-pam-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pam-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-pam-primary" />
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-3">Calendar Sync</h3>
              <p className="text-pam-gray-600">
                Sync with Google or Outlook calendars. Never miss an appointment or milestone again.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-pam-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pam-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-pam-primary" />
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-3">AI Assistant</h3>
              <p className="text-pam-gray-600">
                Get instant answers to parenting questions with our AI chatbot trained on Australian guidelines.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-pam-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pam-primary/10 rounded-xl flex items-center justify-center mb-6">
                <ChartBar className="w-6 h-6 text-pam-primary" />
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-3">Growth Tracking</h3>
              <p className="text-pam-gray-600">
                Monitor your child's growth with WHO charts. Get alerts if measurements need attention.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-pam-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pam-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-pam-primary" />
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-3">Family Sharing</h3>
              <p className="text-pam-gray-600">
                Share access with partners and caregivers. Keep everyone on the same page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-24 bg-pam-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-pam-gray-900">
              Get started in minutes
            </h2>
            <p className="mt-4 text-lg text-pam-gray-700 max-w-2xl mx-auto">
              Join thousands of Australian parents who trust PAM to help them through parenthood.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-pam-primary rounded-full flex items-center justify-center text-pam-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-3">Sign Up Free</h3>
              <p className="text-pam-gray-600">
                Create your account in seconds. No credit card required for the free trial.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pam-primary rounded-full flex items-center justify-center text-pam-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-3">Add Your Child</h3>
              <p className="text-pam-gray-600">
                Enter your child's details and PAM will create a personalized checklist just for you.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pam-primary rounded-full flex items-center justify-center text-pam-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-3">Stay On Track</h3>
              <p className="text-pam-gray-600">
                Get timely reminders and track everything important in your parenting journey.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/signup">
              <Button size="lg" className="bg-pam-primary hover:bg-pam-primary-dark text-pam-white px-8 py-6 text-lg">
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 bg-gradient-to-r from-pam-primary to-pam-primary-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-pam-white mb-4">
            Ready to simplify your parenting journey?
          </h2>
          <p className="text-lg text-pam-white/90 mb-8">
            Join PAM today and never miss a milestone, appointment, or precious moment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-pam-white text-pam-primary hover:bg-pam-gray-100 px-8 py-6 text-lg font-semibold">
                Get Started Free
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-pam-white text-pam-white hover:bg-pam-white hover:text-pam-primary px-8 py-6 text-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}