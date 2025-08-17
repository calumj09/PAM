import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Heart, Users, Award, Target } from 'lucide-react'
import type { Metadata } from 'next'
import { aboutMetadata } from '../metadata'

export const metadata: Metadata = aboutMetadata

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-pam-white to-pam-gray-50 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-pam-gray-900 mb-6">
              About PAM
            </h1>
            <p className="text-lg sm:text-xl text-pam-gray-700">
              We're on a mission to make parenting easier for Australian families by providing 
              the right tools and information at the right time.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 sm:py-20 bg-pam-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-pam-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-pam-gray-700">
                <p>
                  PAM was born from a simple observation: new parents in Australia were overwhelmed 
                  with information, appointments, and administrative tasks during the most precious 
                  and exhausting time of their lives.
                </p>
                <p>
                  As parents ourselves, we experienced firsthand the challenge of keeping track of 
                  immunizations, Centrelink registrations, developmental milestones, and the endless 
                  stream of appointments—all while running on minimal sleep.
                </p>
                <p>
                  We created PAM (Parent Admin Manager) to be the companion we wished we had: 
                  a smart, simple app that takes the mental load off parents by organizing everything 
                  in one place and sending timely reminders for what matters most.
                </p>
                <p>
                  Today, PAM helps thousands of Australian families navigate the first 1000 days 
                  with confidence, ensuring they never miss important milestones while having more 
                  time to enjoy the moments that matter.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-pam-gray-100 to-pam-gray-200 rounded-2xl">
                {/* Placeholder for team/story image */}
                <div className="w-full h-full flex items-center justify-center">
                  <Heart className="w-32 h-32 text-pam-primary/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-20 bg-pam-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-pam-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-pam-gray-700 max-w-2xl mx-auto">
              Everything we do is guided by these core principles
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pam-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-pam-primary" />
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-2">Parent-First</h3>
              <p className="text-pam-gray-600">
                Every feature is designed with exhausted parents in mind—simple, clear, and helpful.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pam-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-pam-primary" />
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-2">Privacy & Security</h3>
              <p className="text-pam-gray-600">
                Your family's data is precious. We protect it with bank-level security and never share it.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pam-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-pam-primary" />
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-2">Evidence-Based</h3>
              <p className="text-pam-gray-600">
                All our content and recommendations are based on Australian health guidelines and research.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pam-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-pam-primary" />
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900 mb-2">Inclusive</h3>
              <p className="text-pam-gray-600">
                PAM is designed for all families—single parents, same-sex couples, and diverse households.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 sm:py-20 bg-pam-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-pam-gray-900 mb-4">
              Meet the Team
            </h2>
            <p className="text-lg text-pam-gray-700 max-w-2xl mx-auto">
              We're a small team of parents and technologists passionate about making family life easier
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Team Member 1 */}
            <div className="text-center">
              <div className="w-32 h-32 bg-pam-gray-200 rounded-full mx-auto mb-4">
                {/* Placeholder for team member photo */}
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900">Sarah Chen</h3>
              <p className="text-pam-primary font-medium">Co-Founder & CEO</p>
              <p className="text-sm text-pam-gray-600 mt-2">
                Mother of two, former pediatric nurse
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="text-center">
              <div className="w-32 h-32 bg-pam-gray-200 rounded-full mx-auto mb-4">
                {/* Placeholder for team member photo */}
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900">Michael Roberts</h3>
              <p className="text-pam-primary font-medium">Co-Founder & CTO</p>
              <p className="text-sm text-pam-gray-600 mt-2">
                Dad of three, software engineer
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="text-center">
              <div className="w-32 h-32 bg-pam-gray-200 rounded-full mx-auto mb-4">
                {/* Placeholder for team member photo */}
              </div>
              <h3 className="text-xl font-semibold text-pam-gray-900">Dr. Lisa Wong</h3>
              <p className="text-pam-primary font-medium">Medical Advisor</p>
              <p className="text-sm text-pam-gray-600 mt-2">
                Pediatrician, child health advocate
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-16 sm:py-20 bg-pam-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-pam-gray-900 mb-4">
              Recognition
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <Award className="w-16 h-16 text-pam-primary mx-auto mb-4" />
              <h3 className="font-semibold text-pam-gray-900">Best Family App 2024</h3>
              <p className="text-sm text-pam-gray-600 mt-1">Australian App Awards</p>
            </div>

            <div className="text-center">
              <Award className="w-16 h-16 text-pam-primary mx-auto mb-4" />
              <h3 className="font-semibold text-pam-gray-900">Parent's Choice</h3>
              <p className="text-sm text-pam-gray-600 mt-1">Raising Children Network</p>
            </div>

            <div className="text-center">
              <Award className="w-16 h-16 text-pam-primary mx-auto mb-4" />
              <h3 className="font-semibold text-pam-gray-900">Innovation Award</h3>
              <p className="text-sm text-pam-gray-600 mt-1">HealthTech Australia</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-pam-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-pam-white mb-4">
            Join thousands of Australian families
          </h2>
          <p className="text-lg text-pam-white/90 mb-8">
            Start your journey with PAM today and experience parenting with confidence.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="bg-pam-white text-pam-primary hover:bg-pam-gray-100 px-8 py-6 text-lg font-semibold">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}