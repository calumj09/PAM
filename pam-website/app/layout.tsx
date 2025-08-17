import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import Script from 'next/script'
import { organizationSchema, mobileAppSchema } from './structured-data'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="app-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mobileAppSchema) }}
      />
      <div className="min-h-screen bg-pam-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-pam-white/95 backdrop-blur-md z-50 border-b border-pam-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl sm:text-3xl font-bold text-pam-primary tracking-wider">PAM</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-pam-gray-700 hover:text-pam-primary transition-colors">
                Features
              </Link>
              <Link href="/demo" className="text-pam-gray-700 hover:text-pam-primary transition-colors">
                Demo
              </Link>
              <Link href="/pricing" className="text-pam-gray-700 hover:text-pam-primary transition-colors">
                Pricing
              </Link>
              <Link href="/about" className="text-pam-gray-700 hover:text-pam-primary transition-colors">
                About
              </Link>
              <Link href="/support" className="text-pam-gray-700 hover:text-pam-primary transition-colors">
                Support
              </Link>
              <Link href="/login" className="text-pam-gray-700 hover:text-pam-primary transition-colors">
                Login
              </Link>
              <Link href="/signup">
                <Button className="bg-pam-primary hover:bg-pam-primary-dark text-pam-white">
                  Get Started
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-pam-gray-700" aria-label="Menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 sm:pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-pam-gray-50 border-t border-pam-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <span className="text-2xl font-bold text-pam-primary tracking-wider">PAM</span>
              <p className="mt-2 text-sm text-pam-gray-600">
                Your trusted parenting companion for the first 1000 days.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-pam-gray-900 mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-sm text-pam-gray-600 hover:text-pam-primary">Features</Link></li>
                <li><Link href="/demo" className="text-sm text-pam-gray-600 hover:text-pam-primary">Demo</Link></li>
                <li><Link href="/pricing" className="text-sm text-pam-gray-600 hover:text-pam-primary">Pricing</Link></li>
                <li><Link href="/download" className="text-sm text-pam-gray-600 hover:text-pam-primary">Download</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-pam-gray-900 mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm text-pam-gray-600 hover:text-pam-primary">About Us</Link></li>
                <li><Link href="/story" className="text-sm text-pam-gray-600 hover:text-pam-primary">Our Story</Link></li>
                <li><Link href="/contact" className="text-sm text-pam-gray-600 hover:text-pam-primary">Contact</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-pam-gray-900 mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/support" className="text-sm text-pam-gray-600 hover:text-pam-primary">Help Center</Link></li>
                <li><Link href="/support#faq" className="text-sm text-pam-gray-600 hover:text-pam-primary">FAQs</Link></li>
                <li><Link href="/support#contact" className="text-sm text-pam-gray-600 hover:text-pam-primary">Contact Support</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-pam-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-sm text-pam-gray-600 hover:text-pam-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-pam-gray-600 hover:text-pam-primary">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-pam-gray-200">
            <p className="text-center text-sm text-pam-gray-600">
              © {new Date().getFullYear()} PAM. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}