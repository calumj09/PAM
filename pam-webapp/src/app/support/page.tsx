'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { 
  Baby, Calendar, Brain, ChartBar, Users, FileText, 
  Smartphone, Shield, Clock, CheckCircle2, HelpCircle, 
  Search, MessageCircle, Mail, Phone, ChevronDown, 
  ChevronRight, BookOpen, Zap, Settings, Download,
  AlertCircle, Map, Mic, Camera, Bell, Heart
} from 'lucide-react'

// Note: Metadata is handled in a separate metadata export for Next.js 13+
// See metadata.ts for SEO configuration

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('getting-started')

  const supportCategories = [
    { id: 'getting-started', name: 'Getting Started', icon: Zap },
    { id: 'features', name: 'Features Guide', icon: BookOpen },
    { id: 'account', name: 'Account & Settings', icon: Settings },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: AlertCircle },
    { id: 'faq', name: 'FAQs', icon: HelpCircle },
  ]

  const faqs = [
    {
      id: 'free-vs-premium',
      question: 'What\'s the difference between Free and Premium?',
      answer: 'The free version includes all core features: smart checklists, baby tracker, local info hub, and basic calendar. Premium adds unlimited AI assistance, calendar sync with Google/Outlook, advanced analytics, document storage, photo timeline, and family sharing.'
    },
    {
      id: 'data-privacy',
      question: 'Is my family\'s data private and secure?',
      answer: 'Absolutely. We use bank-level encryption for all data. Your information is never shared with third parties. You own your data and can export or delete it anytime. We comply with Australian privacy laws and ACMA guidelines.'
    },
    {
      id: 'offline-access',
      question: 'Can I use PAM without internet?',
      answer: 'Yes! PAM works offline for all core features. Track activities, view checklists, and access saved information without internet. Data syncs automatically when you\'re back online.'
    },
    {
      id: 'multiple-children',
      question: 'Can I track multiple children?',
      answer: 'Free accounts support one child profile. Premium accounts can track unlimited children, including twins. Each child gets their own personalized timeline and tracking.'
    },
    {
      id: 'partner-sharing',
      question: 'Can my partner access our baby\'s information?',
      answer: 'Yes! Premium accounts include family sharing. Invite partners, grandparents, or caregivers to view and update information. Each person uses their own login for security.'
    },
    {
      id: 'australian-specific',
      question: 'Why is PAM specifically for Australian parents?',
      answer: 'PAM integrates Australian immunization schedules, Centrelink processes, Medicare requirements, and state-specific resources. We provide step-by-step guides for Australian government services that generic apps can\'t offer.'
    },
    {
      id: 'cancel-subscription',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel anytime from your account settings. You\'ll keep Premium features until the end of your billing period. Your data remains accessible on the free plan.'
    },
    {
      id: 'voice-commands',
      question: 'How do voice commands work?',
      answer: 'Simply tap the microphone icon and say commands like "log breastfeed 10 minutes" or "dirty nappy just now". PAM understands natural language and logs activities hands-free.'
    }
  ]

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-pam-white to-pam-gray-50 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-pam-gray-900 mb-6">
              How can we help?
            </h1>
            <p className="text-lg sm:text-xl text-pam-gray-700 mb-8">
              Find answers, guides, and support for using PAM
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pam-gray-500" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border border-pam-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pam-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-pam-white border-b border-pam-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            <Link href="#getting-started" className="group">
              <div className="text-center p-6 rounded-xl hover:bg-pam-gray-50 transition-colors">
                <Smartphone className="w-12 h-12 text-pam-primary mx-auto mb-3" />
                <h3 className="font-semibold text-pam-gray-900 group-hover:text-pam-primary">Getting Started</h3>
                <p className="text-sm text-pam-gray-600 mt-1">Set up your account</p>
              </div>
            </Link>

            <Link href="#features" className="group">
              <div className="text-center p-6 rounded-xl hover:bg-pam-gray-50 transition-colors">
                <Baby className="w-12 h-12 text-pam-primary mx-auto mb-3" />
                <h3 className="font-semibold text-pam-gray-900 group-hover:text-pam-primary">Using PAM</h3>
                <p className="text-sm text-pam-gray-600 mt-1">Feature guides</p>
              </div>
            </Link>

            <Link href="#troubleshooting" className="group">
              <div className="text-center p-6 rounded-xl hover:bg-pam-gray-50 transition-colors">
                <AlertCircle className="w-12 h-12 text-pam-primary mx-auto mb-3" />
                <h3 className="font-semibold text-pam-gray-900 group-hover:text-pam-primary">Troubleshooting</h3>
                <p className="text-sm text-pam-gray-600 mt-1">Fix common issues</p>
              </div>
            </Link>

            <Link href="#contact" className="group">
              <div className="text-center p-6 rounded-xl hover:bg-pam-gray-50 transition-colors">
                <MessageCircle className="w-12 h-12 text-pam-primary mx-auto mb-3" />
                <h3 className="font-semibold text-pam-gray-900 group-hover:text-pam-primary">Contact Us</h3>
                <p className="text-sm text-pam-gray-600 mt-1">Get in touch</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-20 bg-pam-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <nav className="sticky top-24 space-y-2">
                {supportCategories.map((category) => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeCategory === category.id
                          ? 'bg-pam-primary text-pam-white'
                          : 'text-pam-gray-700 hover:bg-pam-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{category.name}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {/* Getting Started */}
              {activeCategory === 'getting-started' && (
                <div id="getting-started" className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-pam-gray-900 mb-6">Getting Started with PAM</h2>
                    
                    <div className="space-y-6">
                      <div className="bg-pam-white rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-pam-gray-900 mb-4">1. Create Your Account</h3>
                        <ol className="space-y-3 text-pam-gray-700">
                          <li className="flex items-start">
                            <span className="font-semibold mr-2">a.</span>
                            <span>Visit pam.app and click "Get Started" or "Sign Up"</span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-semibold mr-2">b.</span>
                            <span>Enter your email or sign up with Google/Apple ID</span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-semibold mr-2">c.</span>
                            <span>Create a secure password (minimum 8 characters)</span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-semibold mr-2">d.</span>
                            <span>Verify your email address</span>
                          </li>
                        </ol>
                      </div>

                      <div className="bg-pam-white rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-pam-gray-900 mb-4">2. Add Your Baby</h3>
                        <ol className="space-y-3 text-pam-gray-700">
                          <li className="flex items-start">
                            <span className="font-semibold mr-2">a.</span>
                            <span>Enter your baby's name and date of birth</span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-semibold mr-2">b.</span>
                            <span>Select your Australian state/territory for local resources</span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-semibold mr-2">c.</span>
                            <span>Add optional details: gender, birth weight, feeding method</span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-semibold mr-2">d.</span>
                            <span>PAM automatically generates your personalized checklist</span>
                          </li>
                        </ol>
                      </div>

                      <div className="bg-pam-white rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-pam-gray-900 mb-4">3. Install PAM on Your Phone</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-pam-gray-900 mb-2">iPhone/iPad:</h4>
                            <ol className="space-y-2 text-pam-gray-700 ml-4">
                              <li>1. Open PAM in Safari (not Chrome)</li>
                              <li>2. Tap the Share button (square with arrow)</li>
                              <li>3. Scroll down and tap "Add to Home Screen"</li>
                              <li>4. Name it "PAM" and tap "Add"</li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-semibold text-pam-gray-900 mb-2">Android:</h4>
                            <ol className="space-y-2 text-pam-gray-700 ml-4">
                              <li>1. Open PAM in Chrome</li>
                              <li>2. Tap the menu (3 dots)</li>
                              <li>3. Select "Install app" or "Add to Home screen"</li>
                              <li>4. Follow the prompts</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Features Guide */}
              {activeCategory === 'features' && (
                <div id="features" className="space-y-8">
                  <h2 className="text-2xl font-bold text-pam-gray-900 mb-6">Feature Guides</h2>
                  
                  {/* Smart Checklists */}
                  <div className="bg-pam-white rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <CheckCircle2 className="w-6 h-6 text-pam-primary mr-3" />
                      <h3 className="text-xl font-semibold text-pam-gray-900">Smart Checklists</h3>
                    </div>
                    <p className="text-pam-gray-700 mb-4">
                      Automated reminders for immunizations, check-ups, and government registrations.
                    </p>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-pam-gray-900">How to use:</h4>
                      <ul className="space-y-2 text-pam-gray-700 ml-4">
                        <li>• Open the Timeline tab to see your personalized checklist</li>
                        <li>• Tasks are organized by week/month based on baby's age</li>
                        <li>• Tap any task to see details and helpful links</li>
                        <li>• Mark tasks complete by tapping the checkbox</li>
                        <li>• Set custom reminders by tapping the bell icon</li>
                        <li>• Upload related documents (like appointment letters)</li>
                      </ul>
                      <div className="mt-4 p-4 bg-pam-gray-50 rounded-lg">
                        <p className="text-sm text-pam-gray-600">
                          <strong>Tip:</strong> PAM automatically adjusts tasks based on your state's requirements and your baby's specific needs.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Baby Tracker */}
                  <div className="bg-pam-white rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <Baby className="w-6 h-6 text-pam-primary mr-3" />
                      <h3 className="text-xl font-semibold text-pam-gray-900">Baby Tracker</h3>
                    </div>
                    <p className="text-pam-gray-700 mb-4">
                      Log feeds, sleep, nappies and more with quick taps or voice commands.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-pam-gray-900 mb-2">Quick Logging:</h4>
                        <ul className="space-y-2 text-pam-gray-700 ml-4">
                          <li>• Tap the + button on any screen for quick entry</li>
                          <li>• Choose activity type: Feed, Sleep, Nappy, Health</li>
                          <li>• Add details like duration, amount, or notes</li>
                          <li>• View daily summaries in the Tracker tab</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-pam-gray-900 mb-2">Voice Commands:</h4>
                        <ul className="space-y-2 text-pam-gray-700 ml-4">
                          <li>• Tap the microphone icon</li>
                          <li>• Say commands naturally:</li>
                          <li className="ml-4">"Just fed for 15 minutes on the left"</li>
                          <li className="ml-4">"Dirty nappy just now"</li>
                          <li className="ml-4">"Started sleep 10 minutes ago"</li>
                          <li>• PAM understands and logs automatically</li>
                        </ul>
                      </div>

                      <div className="mt-4 p-4 bg-pam-gray-50 rounded-lg">
                        <p className="text-sm text-pam-gray-600">
                          <strong>Premium Feature:</strong> View detailed analytics and patterns to understand your baby's routines better.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Local Info Hub */}
                  <div className="bg-pam-white rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <Map className="w-6 h-6 text-pam-primary mr-3" />
                      <h3 className="text-xl font-semibold text-pam-gray-900">Local Admin Info Hub</h3>
                    </div>
                    <p className="text-pam-gray-700 mb-4">
                      Step-by-step guides for Australian government services and local resources.
                    </p>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-pam-gray-900">Available Resources:</h4>
                      <ul className="space-y-2 text-pam-gray-700 ml-4">
                        <li>• Birth registration guides for your state</li>
                        <li>• Medicare and Centrelink application walkthroughs</li>
                        <li>• Local maternal health nurse contacts</li>
                        <li>• Emergency services and after-hours clinics</li>
                        <li>• Playgroups and parent support services</li>
                        <li>• State-specific parenting programs</li>
                      </ul>
                      <div className="mt-4 p-4 bg-pam-gray-50 rounded-lg">
                        <p className="text-sm text-pam-gray-600">
                          <strong>Note:</strong> Information is tailored to your state/territory for accuracy.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Assistant */}
                  <div className="bg-pam-white rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <Brain className="w-6 h-6 text-pam-primary mr-3" />
                      <h3 className="text-xl font-semibold text-pam-gray-900">AI Parenting Assistant (Premium)</h3>
                    </div>
                    <p className="text-pam-gray-700 mb-4">
                      Get instant answers to parenting questions based on Australian guidelines.
                    </p>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-pam-gray-900">How to use:</h4>
                      <ul className="space-y-2 text-pam-gray-700 ml-4">
                        <li>• Tap the AI Helper tab</li>
                        <li>• Type or speak your question</li>
                        <li>• Get personalized answers based on your baby's age</li>
                        <li>• Upload photos of forms for help filling them out</li>
                        <li>• Save helpful responses for later reference</li>
                      </ul>
                      <h4 className="font-semibold text-pam-gray-900 mt-4">Example questions:</h4>
                      <ul className="space-y-2 text-pam-gray-700 ml-4 italic">
                        <li>"Is it normal for a 3-week-old to have 8 wet nappies?"</li>
                        <li>"How do I apply for Child Care Subsidy?"</li>
                        <li>"What solids can I introduce at 6 months?"</li>
                        <li>"When should I worry about a fever?"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Account & Settings */}
              {activeCategory === 'account' && (
                <div id="account" className="space-y-8">
                  <h2 className="text-2xl font-bold text-pam-gray-900 mb-6">Account & Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-pam-white rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-pam-gray-900 mb-4">Managing Your Account</h3>
                      <div className="space-y-4 text-pam-gray-700">
                        <div>
                          <h4 className="font-semibold mb-2">Update Profile:</h4>
                          <p>Go to Settings → Profile to update your name, email, or password.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Notification Preferences:</h4>
                          <p>Settings → Notifications to customize when and how PAM reminds you.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Manage Children:</h4>
                          <p>Settings → Children to add/edit child profiles (Premium for multiple).</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Privacy Settings:</h4>
                          <p>Control data sharing and export your information anytime.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-pam-white rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-pam-gray-900 mb-4">Subscription Management</h3>
                      <div className="space-y-4 text-pam-gray-700">
                        <div>
                          <h4 className="font-semibold mb-2">Upgrade to Premium:</h4>
                          <p>Tap any premium feature or go to Settings → Subscription.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Change Payment Method:</h4>
                          <p>Settings → Subscription → Payment Method.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Cancel Subscription:</h4>
                          <p>Settings → Subscription → Cancel. You keep access until period ends.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Billing History:</h4>
                          <p>View and download invoices from Settings → Subscription → Billing.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Troubleshooting */}
              {activeCategory === 'troubleshooting' && (
                <div id="troubleshooting" className="space-y-8">
                  <h2 className="text-2xl font-bold text-pam-gray-900 mb-6">Troubleshooting</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-pam-white rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-pam-gray-900 mb-4">Common Issues</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-pam-gray-900 mb-2">App won't load or is slow</h4>
                          <ul className="space-y-2 text-pam-gray-700 ml-4">
                            <li>• Check your internet connection</li>
                            <li>• Clear browser cache and cookies</li>
                            <li>• Try a different browser (Chrome/Safari recommended)</li>
                            <li>• Ensure you have the latest browser version</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-pam-gray-900 mb-2">Can't log in</h4>
                          <ul className="space-y-2 text-pam-gray-700 ml-4">
                            <li>• Check email spelling</li>
                            <li>• Use "Forgot Password" to reset</li>
                            <li>• Check spam folder for reset email</li>
                            <li>• Try logging in with Google/Apple if used for signup</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-pam-gray-900 mb-2">Data not syncing</h4>
                          <ul className="space-y-2 text-pam-gray-700 ml-4">
                            <li>• Ensure you're online</li>
                            <li>• Pull down to refresh on mobile</li>
                            <li>• Log out and back in</li>
                            <li>• Check if using same account on all devices</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-pam-gray-900 mb-2">Voice commands not working</h4>
                          <ul className="space-y-2 text-pam-gray-700 ml-4">
                            <li>• Allow microphone permissions in browser</li>
                            <li>• Speak clearly after tapping mic icon</li>
                            <li>• Check device microphone settings</li>
                            <li>• Try in a quieter environment</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-pam-gray-900 mb-2">Calendar not syncing</h4>
                          <ul className="space-y-2 text-pam-gray-700 ml-4">
                            <li>• Ensure you have Premium subscription</li>
                            <li>• Re-authorize calendar access in Settings</li>
                            <li>• Check calendar permissions</li>
                            <li>• Allow up to 15 minutes for initial sync</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-pam-white rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-pam-gray-900 mb-4">Still Need Help?</h3>
                      <p className="text-pam-gray-700 mb-4">
                        If you're still experiencing issues, please contact our support team with:
                      </p>
                      <ul className="space-y-2 text-pam-gray-700 ml-4">
                        <li>• Description of the issue</li>
                        <li>• Device type (iPhone, Android, Desktop)</li>
                        <li>• Browser used</li>
                        <li>• Screenshots if applicable</li>
                      </ul>
                      <div className="mt-6">
                        <Link href="#contact">
                          <Button className="bg-pam-primary hover:bg-pam-primary-dark text-pam-white">
                            Contact Support
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FAQs */}
              {activeCategory === 'faq' && (
                <div id="faq" className="space-y-8">
                  <h2 className="text-2xl font-bold text-pam-gray-900 mb-6">Frequently Asked Questions</h2>
                  
                  <div className="space-y-4">
                    {faqs.map((faq) => (
                      <div key={faq.id} className="bg-pam-white rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-pam-gray-50 transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-pam-gray-900 text-left pr-4">
                            {faq.question}
                          </h3>
                          {expandedFaq === faq.id ? (
                            <ChevronDown className="w-5 h-5 text-pam-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-pam-gray-500 flex-shrink-0" />
                          )}
                        </button>
                        {expandedFaq === faq.id && (
                          <div className="px-6 pb-4">
                            <p className="text-pam-gray-700">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-20 bg-pam-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-pam-gray-900 mb-4">
              Still need help?
            </h2>
            <p className="text-lg text-pam-gray-700">
              Our support team is here to help you succeed with PAM
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pam-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-pam-primary" />
              </div>
              <h3 className="font-semibold text-pam-gray-900 mb-2">Email Support</h3>
              <p className="text-pam-gray-600 mb-4">Get help via email</p>
              <a href="mailto:support@pam.app" className="text-pam-primary hover:text-pam-primary-dark font-medium">
                support@pam.app
              </a>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pam-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-pam-primary" />
              </div>
              <h3 className="font-semibold text-pam-gray-900 mb-2">Live Chat</h3>
              <p className="text-pam-gray-600 mb-4">Chat with our team</p>
              <p className="text-sm text-pam-gray-500">Mon-Fri 9am-5pm AEST</p>
              <Button className="mt-2 bg-pam-primary hover:bg-pam-primary-dark text-pam-white">
                Start Chat
              </Button>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pam-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-pam-primary" />
              </div>
              <h3 className="font-semibold text-pam-gray-900 mb-2">Community</h3>
              <p className="text-pam-gray-600 mb-4">Join our parent community</p>
              <a href="#" className="text-pam-primary hover:text-pam-primary-dark font-medium">
                Facebook Group
              </a>
            </div>
          </div>

          {/* Priority Support Notice */}
          <div className="mt-12 p-6 bg-pam-gray-50 rounded-xl text-center">
            <Shield className="w-8 h-8 text-pam-primary mx-auto mb-3" />
            <p className="text-pam-gray-700">
              <strong>Premium subscribers</strong> get priority email support and exclusive access to parenting webinars.
            </p>
            <Link href="/pricing" className="text-pam-primary hover:text-pam-primary-dark font-medium mt-2 inline-block">
              Learn about Premium →
            </Link>
          </div>
        </div>
      </section>

      {/* Help Videos Section */}
      <section className="py-16 sm:py-20 bg-pam-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-pam-gray-900 mb-4">
              Video Tutorials
            </h2>
            <p className="text-lg text-pam-gray-700">
              Watch quick videos to get the most out of PAM
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-pam-white rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-video bg-pam-gray-200 flex items-center justify-center">
                <Camera className="w-16 h-16 text-pam-gray-400" />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-pam-gray-900 mb-2">Getting Started with PAM</h3>
                <p className="text-sm text-pam-gray-600">3 min • Learn the basics</p>
              </div>
            </div>

            <div className="bg-pam-white rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-video bg-pam-gray-200 flex items-center justify-center">
                <Camera className="w-16 h-16 text-pam-gray-400" />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-pam-gray-900 mb-2">Using the Baby Tracker</h3>
                <p className="text-sm text-pam-gray-600">5 min • Track like a pro</p>
              </div>
            </div>

            <div className="bg-pam-white rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-video bg-pam-gray-200 flex items-center justify-center">
                <Camera className="w-16 h-16 text-pam-gray-400" />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-pam-gray-900 mb-2">Voice Commands Guide</h3>
                <p className="text-sm text-pam-gray-600">2 min • Hands-free tracking</p>
              </div>
            </div>

            <div className="bg-pam-white rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-video bg-pam-gray-200 flex items-center justify-center">
                <Camera className="w-16 h-16 text-pam-gray-400" />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-pam-gray-900 mb-2">Premium Features Tour</h3>
                <p className="text-sm text-pam-gray-600">4 min • Unlock full potential</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}