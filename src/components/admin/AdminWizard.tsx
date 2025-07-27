'use client'

import { useState } from 'react'
import { 
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  ExternalLink,
  Phone,
  CloudUpload
} from 'lucide-react'
import { DocumentUpload } from '@/components/documents/DocumentUpload'

interface WizardStep {
  id: string
  title: string
  description: string
  requirements?: string[]
  tips?: string[]
  links?: { title: string; url: string; type: 'website' | 'phone' | 'pdf' }[]
  completed: boolean
  canComplete: boolean
  documentCategory?: string
  showDocumentUpload?: boolean
}

interface AdminWizardProps {
  task: {
    id: string
    title: string
    description: string
    urgency: 'high' | 'medium' | 'low'
    timeframe: string
    state?: string
  }
  onClose: () => void
  onComplete: (taskId: string) => void
}

export function AdminWizard({ task, onClose, onComplete }: AdminWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  // Generate wizard steps based on task
  const getWizardSteps = (): WizardStep[] => {
    switch (task.id) {
      case 'birth-registration':
        return [
          {
            id: 'gather-documents',
            title: 'Gather Required Documents',
            description: 'Collect all necessary paperwork before starting the registration process.',
            requirements: [
              'Hospital discharge summary or birth notification',
              'Parent identification (driver\'s license or passport)',
              'Proof of relationship (marriage certificate if applicable)',
              'Birth details form (from hospital)'
            ],
            tips: [
              'Contact the hospital if you haven\'t received the birth notification',
              'Both parents may need to provide ID if not married',
              'Keep photocopies of all documents for your records'
            ],
            completed: completedSteps.includes('gather-documents'),
            canComplete: true,
            showDocumentUpload: true,
            documentCategory: 'hospital-discharge'
          },
          {
            id: 'choose-registration-method',
            title: 'Choose Registration Method',
            description: 'Decide how you want to register - online, by post, or in person.',
            tips: [
              'Online is fastest and most convenient',
              'In-person registration may be required for some circumstances',
              'By post takes 2-3 weeks longer to process'
            ],
            links: [
              { title: 'NSW Online Registration', url: 'https://www.nsw.gov.au/births-deaths-marriages/births', type: 'website' },
              { title: 'Registry Office Locations', url: 'https://www.nsw.gov.au/births-deaths-marriages/locations', type: 'website' }
            ],
            completed: completedSteps.includes('choose-registration-method'),
            canComplete: true
          },
          {
            id: 'complete-application',
            title: 'Complete Registration Application',
            description: 'Fill out the birth registration form with accurate information.',
            requirements: [
              'Baby\'s full name as you want it on the birth certificate',
              'Birth date, time, and place',
              'Parent details (full names, birthdates, birthplaces)',
              'Witness information (if required)'
            ],
            tips: [
              'Double-check spelling of names - changes are costly later',
              'Choose names carefully as they\'ll appear on official documents',
              'You can register up to 12 months after birth without penalty'
            ],
            completed: completedSteps.includes('complete-application'),
            canComplete: true
          },
          {
            id: 'submit-and-pay',
            title: 'Submit Application and Pay Fee',
            description: 'Submit your completed application with required documents and fee.',
            requirements: [
              'Completed registration form',
              'All required documents',
              'Registration fee (usually $60-80 depending on state)'
            ],
            tips: [
              'Keep receipt/confirmation number for tracking',
              'Payment methods vary by state (card, bank transfer, etc.)',
              'Some concessions available for eligible families'
            ],
            links: [
              { title: 'Check Application Status', url: 'https://www.nsw.gov.au/births-deaths-marriages/track-application', type: 'website' },
              { title: 'Registry Office', url: 'tel:131882', type: 'phone' }
            ],
            completed: completedSteps.includes('submit-and-pay'),
            canComplete: true
          },
          {
            id: 'receive-certificate',
            title: 'Receive Birth Certificate',
            description: 'Wait for processing and receive your baby\'s birth certificate.',
            tips: [
              'Processing time: 10-15 business days for online applications',
              'Certificate will be posted to your registered address',
              'Contact registry if not received within expected timeframe',
              'Keep certificate safe - you\'ll need it for many other services'
            ],
            links: [
              { title: 'Track Application', url: 'https://www.nsw.gov.au/births-deaths-marriages/track-application', type: 'website' }
            ],
            completed: completedSteps.includes('receive-certificate'),
            canComplete: false, // Can't mark as complete until actually received
            showDocumentUpload: true,
            documentCategory: 'birth-certificate'
          }
        ]

      case 'medicare-enrollment':
        return [
          {
            id: 'gather-medicare-docs',
            title: 'Prepare Documents',
            description: 'Gather the documents needed to enrol your baby in Medicare.',
            requirements: [
              'Birth certificate or hospital discharge summary',
              'Your Medicare card',
              'Proof of Australian citizenship or permanent residency',
              'Your photo identification'
            ],
            tips: [
              'Hospital discharge summary can be used before birth certificate arrives',
              'Both parents should be present if enrolling together',
              'Bring originals - photocopies won\'t be accepted'
            ],
            completed: completedSteps.includes('gather-medicare-docs'),
            canComplete: true
          },
          {
            id: 'contact-medicare',
            title: 'Contact Medicare',
            description: 'Call Medicare or visit a service centre to start the enrollment.',
            links: [
              { title: 'Call Medicare', url: 'tel:132011', type: 'phone' },
              { title: 'Find Service Centre', url: 'https://www.servicesaustralia.gov.au/find-service-centre', type: 'website' }
            ],
            tips: [
              'Call early in the day for shorter wait times',
              'Have all documents ready before calling',
              'Ask about adding baby to existing card vs. new card',
              'Request express processing if you need the card urgently'
            ],
            completed: completedSteps.includes('contact-medicare'),
            canComplete: true
          },
          {
            id: 'provide-details',
            title: 'Provide Baby\'s Details',
            description: 'Give Medicare all the required information about your baby.',
            requirements: [
              'Baby\'s full legal name (as on birth certificate)',
              'Date and place of birth',
              'Your Medicare card number',
              'Relationship to baby'
            ],
            tips: [
              'Ensure name spelling matches birth certificate exactly',
              'You can choose to add baby to existing card or create new card',
              'New card takes 10-14 days to arrive by post'
            ],
            completed: completedSteps.includes('provide-details'),
            canComplete: true
          },
          {
            id: 'receive-medicare-card',
            title: 'Receive Updated Medicare Card',
            description: 'Wait for your new/updated Medicare card to arrive by post.',
            tips: [
              'Card should arrive within 10-14 business days',
              'Temporary Medicare number provided immediately',
              'Update address if you\'ve moved recently',
              'Contact Medicare if card doesn\'t arrive within 3 weeks'
            ],
            links: [
              { title: 'Medicare Enquiries', url: 'tel:132011', type: 'phone' }
            ],
            completed: completedSteps.includes('receive-medicare-card'),
            canComplete: false,
            showDocumentUpload: true,
            documentCategory: 'medicare-card'
          }
        ]

      case 'family-tax-benefit':
        return [
          {
            id: 'check-eligibility',
            title: 'Check Your Eligibility',
            description: 'Ensure you meet the requirements for Family Tax Benefit.',
            requirements: [
              'Australian resident for tax purposes',
              'Care for a child under 16 (or 16-19 in full-time study)',
              'Meet income test requirements',
              'Child must be Australian resident'
            ],
            tips: [
              'Income test limits change annually',
              'Both parents\' income counts if partnered',
              'Some benefits available even with higher incomes'
            ],
            links: [
              { title: 'Eligibility Details', url: 'https://www.servicesaustralia.gov.au/family-tax-benefit', type: 'website' }
            ],
            completed: completedSteps.includes('check-eligibility'),
            canComplete: true
          },
          {
            id: 'gather-ftb-documents',
            title: 'Gather Required Documents',
            description: 'Collect all documentation needed for your FTB claim.',
            requirements: [
              'Birth certificate',
              'Tax File Numbers (both parents if partnered)',
              'Bank account details',
              'Income details from last financial year',
              'Rent receipts or mortgage details (if claiming Rent Assistance)'
            ],
            completed: completedSteps.includes('gather-ftb-documents'),
            canComplete: true
          },
          {
            id: 'submit-ftb-claim',
            title: 'Submit Your Claim',
            description: 'Apply for Family Tax Benefit online or by phone.',
            links: [
              { title: 'Apply Online', url: 'https://my.gov.au', type: 'website' },
              { title: 'Centrelink', url: 'tel:136150', type: 'phone' }
            ],
            tips: [
              'Apply as soon as possible after birth',
              'Online applications are processed faster',
              'You can claim up to 52 weeks backdated'
            ],
            completed: completedSteps.includes('submit-ftb-claim'),
            canComplete: true
          }
        ]

      default:
        return [
          {
            id: 'general-step',
            title: 'Complete This Task',
            description: 'Follow the general guidelines for this administrative task.',
            completed: completedSteps.includes('general-step'),
            canComplete: true
          }
        ]
    }
  }

  const steps = getWizardSteps()
  const currentStepData = steps[currentStep]

  const toggleStepCompletion = (stepId: string) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    )
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isLastStep = currentStep === steps.length - 1
  const allStepsCompleted = steps.filter(step => step.canComplete).every(step => step.completed)

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-50 to-orange-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(task.urgency)}`}>
                {task.urgency} priority
              </span>
            </div>
          </div>
          
          <h2 className="text-lg font-semibold text-gray-900 mb-1">{task.title}</h2>
          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
          
          {/* Progress */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>⏰ {task.timeframe}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-full transition-all ${
              currentStepData.completed ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {currentStepData.completed ? (
                <CheckCircle className="w-6 h-6 text-green-600 fill-current" />
              ) : (
                <Clock className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{currentStepData.title}</h3>
              <p className="text-sm text-gray-600">{currentStepData.description}</p>
            </div>
          </div>

          {/* Requirements */}
          {currentStepData.requirements && currentStepData.requirements.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                What you'll need:
              </h4>
              <ul className="space-y-2">
                {currentStepData.requirements.map((req, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tips */}
          {currentStepData.tips && currentStepData.tips.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Helpful tips:
              </h4>
              <ul className="space-y-2">
                {currentStepData.tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    💡 {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Links */}
          {currentStepData.links && currentStepData.links.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Quick links:</h4>
              <div className="space-y-2">
                {currentStepData.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target={link.type === 'website' ? '_blank' : undefined}
                    rel={link.type === 'website' ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {link.type === 'phone' ? (
                      <Phone className="w-4 h-4 text-green-600" />
                    ) : (
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="text-sm font-medium text-gray-900">{link.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Document Upload */}
          {currentStepData.showDocumentUpload && currentStepData.documentCategory && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <CloudUpload className="w-4 h-4" />
                Upload Documents (Optional)
              </h4>
              <DocumentUpload
                category={currentStepData.documentCategory}
                maxFiles={3}
                onUploadComplete={() => {
                  // Optional: Auto-mark step as complete when documents uploaded
                }}
              />
            </div>
          )}

          {/* Mark Complete */}
          {currentStepData.canComplete && (
            <div className="mb-4">
              <button
                onClick={() => toggleStepCompletion(currentStepData.id)}
                className={`w-full p-3 rounded-xl border-2 transition-all ${
                  currentStepData.completed
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {currentStepData.completed ? 'Step completed!' : 'Mark this step as complete'}
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {!isLastStep ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => onComplete(task.id)}
                  disabled={!allStepsCompleted}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete Task
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}