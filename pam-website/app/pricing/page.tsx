import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, X } from 'lucide-react'
import type { Metadata } from 'next'
import { pricingMetadata } from '../metadata'

export const metadata: Metadata = pricingMetadata

export default function PricingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-pam-white to-pam-gray-50 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-pam-gray-900 mb-6">
              Simple, transparent pricing
            </h1>
            <p className="text-lg sm:text-xl text-pam-gray-700">
              Start with our free plan and upgrade when you need more features. 
              No hidden fees, cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="py-16 sm:py-20 bg-pam-white -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-pam-white border-2 border-pam-gray-200 rounded-2xl p-8 relative">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-pam-gray-900 mb-2">Free</h3>
                <p className="text-pam-gray-600">Perfect for getting started</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-pam-gray-900">$0</span>
                  <span className="text-pam-gray-600">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-pam-success mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-pam-gray-700">Smart checklists for 1 child</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-pam-success mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-pam-gray-700">Basic baby tracker</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-pam-success mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-pam-gray-700">Local admin info hub</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-pam-success mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-pam-gray-700">Milestone tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-pam-success mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-pam-gray-700">Works offline</span>
                </li>
                <li className="flex items-start">
                  <X className="w-5 h-5 text-pam-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-pam-gray-500">Calendar sync</span>
                </li>
                <li className="flex items-start">
                  <X className="w-5 h-5 text-pam-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-pam-gray-500">AI assistant</span>
                </li>
                <li className="flex items-start">
                  <X className="w-5 h-5 text-pam-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-pam-gray-500">Advanced analytics</span>
                </li>
              </ul>

              <Link href="/signup" className="block">
                <Button variant="outline" size="lg" className="w-full border-pam-primary text-pam-primary hover:bg-pam-primary hover:text-pam-white">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-pam-primary to-pam-primary-dark text-pam-white rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-pam-success text-pam-white px-4 py-1 rounded-full text-sm font-semibold">
                  MOST POPULAR
                </span>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-pam-white mb-2">Premium</h3>
                <p className="text-pam-white/80">Everything you need for stress-free parenting</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-pam-white">$9.99</span>
                  <span className="text-pam-white/80">/month</span>
                </div>
                <p className="text-sm text-pam-white/60 mt-2">or $99/year (save 17%)</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-pam-white mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-pam-white">Everything in Free plan</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-pam-white mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-pam-white">Unlimited children</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-pam-white mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-pam-white">Calendar sync (Google & Outlook)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-pam-white mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-pam-white">AI parenting assistant</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-pam-white mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-pam-white">Advanced analytics & insights</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-pam-white mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-pam-white">Document vault (10GB)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-pam-white mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-pam-white">Photo timeline</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-pam-white mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-pam-white">Priority support</span>
                </li>
              </ul>

              <Link href="/signup?plan=premium" className="block">
                <Button size="lg" className="w-full bg-pam-white text-pam-primary hover:bg-pam-gray-100">
                  Start 14-Day Free Trial
                </Button>
              </Link>
            </div>
          </div>

          {/* Money Back Guarantee */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center justify-center space-x-2 text-pam-gray-600">
              <Shield className="w-5 h-5" />
              <span className="text-sm">30-day money-back guarantee • No credit card required for trial</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 bg-pam-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-pam-gray-900 text-center mb-12">
            Frequently asked questions
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-pam-gray-900 mb-2">
                Can I try PAM Premium before paying?
              </h3>
              <p className="text-pam-gray-700">
                Yes! We offer a 14-day free trial of PAM Premium. No credit card required. 
                You can cancel anytime during the trial without being charged.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-pam-gray-900 mb-2">
                Can I switch between plans?
              </h3>
              <p className="text-pam-gray-700">
                Absolutely. You can upgrade to Premium anytime from your account settings. 
                If you downgrade, you'll keep Premium features until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-pam-gray-900 mb-2">
                What happens to my data if I cancel?
              </h3>
              <p className="text-pam-gray-700">
                Your data is always yours. If you cancel Premium, you'll still have access to 
                all your data through the free plan. Premium features will be disabled but your 
                core tracking data remains accessible.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-pam-gray-900 mb-2">
                Is my payment information secure?
              </h3>
              <p className="text-pam-gray-700">
                Yes. We use Stripe for payment processing, which is PCI-compliant and used by 
                millions of businesses worldwide. We never store your credit card details on our servers.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-pam-gray-900 mb-2">
                Can I share my Premium account with my partner?
              </h3>
              <p className="text-pam-gray-700">
                Yes! Premium accounts include family sharing. You can invite your partner or 
                other caregivers to access your account with their own login credentials.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-pam-gray-900 mb-2">
                Do you offer discounts for multiple children?
              </h3>
              <p className="text-pam-gray-700">
                Premium includes unlimited children at no extra cost. The free plan supports 
                one child, but Premium lets you track as many children as you need for the same price.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-pam-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-pam-white mb-4">
            Start your parenting journey with PAM
          </h2>
          <p className="text-lg text-pam-white/90 mb-8">
            Join thousands of parents who trust PAM to help them through the first 1000 days
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-pam-white text-pam-primary hover:bg-pam-gray-100 px-8 py-6 text-lg font-semibold">
                Start Free
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-pam-white text-pam-white hover:bg-pam-white hover:text-pam-primary px-8 py-6 text-lg">
                Compare Features
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function Shield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}