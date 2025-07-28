'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminWizard } from '@/components/admin/AdminWizard'
import { 
  optionalAdminChecklist, 
  optionalAdminCategories, 
  getTasksByCategory,
  OptionalAdminTask,
  OptionalAdminCategory 
} from '@/lib/data/optional-admin-checklist'
import { 
  DocumentTextIcon,
  HeartIcon,
  CurrencyDollarIcon,
  BeakerIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  UserGroupIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlusIcon,
  SparklesIcon,
  FolderOpenIcon
} from '@heroicons/react/24/outline'

interface Child {
  id: string
  name: string
  date_of_birth: string
  baby_type: string
  state_territory: string
}

interface AdminTask {
  id: string
  category: string
  title: string
  description: string
  urgency: 'high' | 'medium' | 'low'
  timeframe: string
  requirements: string[]
  steps?: string[]
  links?: { [state: string]: string }
  completed: boolean
  dueDate?: Date
}

export default function AdminPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWizardTask, setSelectedWizardTask] = useState<AdminTask | null>(null)
  const [showOptionalTasks, setShowOptionalTasks] = useState(false)
  const [selectedOptionalCategory, setSelectedOptionalCategory] = useState<OptionalAdminCategory | null>(null)
  const [selectedOptionalTasks, setSelectedOptionalTasks] = useState<string[]>([])
  
  const supabase = createClient()

  useEffect(() => {
    loadChildren()
  }, [])

  const loadChildren = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('date_of_birth', { ascending: false })

      if (error) throw error
      setChildren(data || [])
      if (data && data.length > 0) {
        setSelectedChild(data[0])
      }
    } catch (error) {
      console.error('Error loading children:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const adminCategories = [
    {
      id: 'registrations',
      title: 'Registrations',
      subtitle: 'Birth certificate, forms & documents',
      icon: DocumentTextIcon,
      color: 'bg-blue-50 border-blue-200 text-blue-600',
      urgency: 'high',
      description: 'Essential registrations for your baby'
    },
    {
      id: 'health-medicare',
      title: 'Health & Medicare',
      subtitle: 'Medicare, My Health Record',
      icon: HeartIcon,
      color: 'bg-red-50 border-red-200 text-red-600',
      urgency: 'high',
      description: 'Health system setup & registrations'
    },
    {
      id: 'centrelink-payments',
      title: 'Centrelink & Payments',
      subtitle: 'Family Tax Benefit, Parental Leave',
      icon: CurrencyDollarIcon,
      color: 'bg-green-50 border-green-200 text-green-600',
      urgency: 'medium',
      description: 'Government financial support'
    },
    {
      id: 'immunisations',
      title: 'Immunisations',
      subtitle: 'Schedule & state-specific info',
      icon: BeakerIcon,
      color: 'bg-purple-50 border-purple-200 text-purple-600',
      urgency: 'high',
      description: 'Vaccination schedule & bookings'
    },
    {
      id: 'childcare-school',
      title: 'Childcare & School Readiness',
      subtitle: 'Child Care Subsidy, daycare prep',
      icon: BuildingOfficeIcon,
      color: 'bg-orange-50 border-orange-200 text-orange-600',
      urgency: 'low',
      description: 'Future childcare planning'
    },
    {
      id: 'travel-identity',
      title: 'Travel & Identity',
      subtitle: 'Passport applications',
      icon: IdentificationIcon,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-600',
      urgency: 'low',
      description: 'Travel documents & identity'
    },
    {
      id: 'support-services',
      title: 'Parenting Support & Extras',
      subtitle: 'PANDA, Beyond Blue, MHN contacts',
      icon: UserGroupIcon,
      color: 'bg-pink-50 border-pink-200 text-pink-600',
      urgency: 'medium',
      description: 'Mental health & parenting support'
    }
  ]

  const getTasksForCategory = (categoryId: string): AdminTask[] => {
    if (!selectedChild) return []

    const birthDate = new Date(selectedChild.date_of_birth)
    const babyAgeWeeks = Math.floor((new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7))
    const state = selectedChild.state_territory || 'NSW'

    switch (categoryId) {
      case 'registrations':
        return [
          {
            id: 'birth-registration',
            category: 'registrations',
            title: 'Register Birth',
            description: 'Register your baby\'s birth to get a birth certificate',
            urgency: 'high',
            timeframe: 'Within 60 days of birth',
            requirements: ['Hospital discharge summary', 'Parent identification', 'Relationship evidence'],
            dueDate: new Date(birthDate.getTime() + 60 * 24 * 60 * 60 * 1000),
            completed: completedTasks.includes('birth-registration'),
            links: {
              'NSW': 'https://www.nsw.gov.au/births-deaths-marriages/births',
              'VIC': 'https://www.bdm.vic.gov.au/births',
              'QLD': 'https://www.qld.gov.au/law/births-deaths-marriages-and-divorces/births',
              'WA': 'https://www.wa.gov.au/service/community-services/birth-death-and-marriage-registration/register-birth',
              'SA': 'https://www.cbs.sa.gov.au/births-deaths-marriages/births',
              'TAS': 'https://www.justice.tas.gov.au/bdm/births',
              'ACT': 'https://www.accesscanberra.act.gov.au/births',
              'NT': 'https://nt.gov.au/law/bdm/births'
            },
            steps: [
              'Gather required documents (hospital discharge summary, parent ID)',
              'Complete birth registration form online or at registry office',
              'Submit form with required documents',
              'Pay registration fee',
              'Receive birth certificate (usually within 10-15 business days)'
            ]
          },
          {
            id: 'birth-certificate',
            category: 'registrations',
            title: 'Birth Certificate',
            description: 'Official birth certificate for government services',
            urgency: 'high',
            timeframe: 'After birth registration',
            requirements: ['Completed birth registration'],
            completed: completedTasks.includes('birth-certificate')
          }
        ]

      case 'health-medicare':
        return [
          {
            id: 'medicare-enrollment',
            category: 'health-medicare',
            title: 'Enrol Baby in Medicare',
            description: 'Add your baby to your Medicare card or create new card',
            urgency: 'high',
            timeframe: 'As soon as possible',
            requirements: ['Birth certificate or hospital discharge summary', 'Parent Medicare card'],
            completed: completedTasks.includes('medicare-enrollment'),
            steps: [
              'Call Medicare on 132 011 or visit a service centre',
              'Provide birth certificate or hospital discharge summary',
              'Provide your Medicare card details',
              'Choose to add baby to existing card or create new card',
              'Receive updated Medicare card by post'
            ],
            links: {
              'ALL': 'https://www.servicesaustralia.gov.au/how-to-enrol-child-in-medicare'
            }
          },
          {
            id: 'my-health-record',
            category: 'health-medicare',
            title: 'My Health Record',
            description: 'Digital health record for your baby',
            urgency: 'medium',
            timeframe: 'Within first few months',
            requirements: ['Medicare number'],
            completed: completedTasks.includes('my-health-record'),
            links: {
              'ALL': 'https://www.myhealthrecord.gov.au/'
            }
          }
        ]

      case 'centrelink-payments':
        return [
          {
            id: 'family-tax-benefit',
            category: 'centrelink-payments',
            title: 'Family Tax Benefit',
            description: 'Fortnightly payment to help with costs of raising children',
            urgency: 'medium',
            timeframe: 'As soon as possible after birth',
            requirements: ['Birth certificate', 'Income details', 'Bank account details'],
            completed: completedTasks.includes('family-tax-benefit'),
            links: {
              'ALL': 'https://www.servicesaustralia.gov.au/family-tax-benefit'
            }
          },
          {
            id: 'parental-leave-pay',
            category: 'centrelink-payments',
            title: 'Parental Leave Pay',
            description: 'Up to 18 weeks of government-funded parental leave',
            urgency: 'high',
            timeframe: 'Claim within 52 weeks of birth',
            requirements: ['Work test requirements', 'Income test', 'Birth certificate'],
            completed: completedTasks.includes('parental-leave-pay'),
            links: {
              'ALL': 'https://www.servicesaustralia.gov.au/parental-leave-pay'
            }
          }
        ]

      case 'immunisations':
        return [
          {
            id: 'immunisation-schedule',
            category: 'immunisations',
            title: 'National Immunisation Schedule',
            description: 'Track your baby\'s vaccination schedule',
            urgency: 'high',
            timeframe: 'Ongoing from 2 months',
            requirements: ['Medicare card', 'GP or immunisation provider'],
            completed: completedTasks.includes('immunisation-schedule'),
            links: {
              'ALL': 'https://www.health.gov.au/health-topics/immunisation/immunisation-data/national-immunisation-program-schedule'
            }
          }
        ]

      case 'childcare-school':
        return [
          {
            id: 'child-care-subsidy',
            category: 'childcare-school',
            title: 'Child Care Subsidy',
            description: 'Government assistance for childcare costs',
            urgency: 'medium',
            timeframe: 'Before starting childcare',
            requirements: ['Customer Reference Number (CRN)', 'Income estimate', 'Childcare provider details'],
            completed: completedTasks.includes('child-care-subsidy'),
            links: {
              'ALL': 'https://www.servicesaustralia.gov.au/child-care-subsidy'
            },
            steps: [
              'Create myGov account if you don\'t have one',
              'Link Centrelink to your myGov account',
              'Complete Child Care Subsidy application',
              'Provide income estimate and family details',
              'Choose your childcare provider',
              'Submit application and wait for approval'
            ]
          },
          {
            id: 'kindergarten-prep',
            category: 'childcare-school',
            title: 'Kindergarten Preparation',
            description: 'Prepare for kindergarten enrollment (3-4 years)',
            urgency: 'low',
            timeframe: 'Year before starting kinder',
            requirements: ['Birth certificate', 'Immunisation records', 'Proof of address'],
            completed: completedTasks.includes('kindergarten-prep'),
            links: {
              'NSW': 'https://education.nsw.gov.au/public-schools/going-to-a-public-school/enrolment',
              'VIC': 'https://www.vic.gov.au/kindergarten-enrolment',
              'QLD': 'https://qed.qld.gov.au/about-us/publications/strategies/publications/kindergarten-learning-guideline',
              'WA': 'https://www.education.wa.edu.au/kindergarten',
              'SA': 'https://www.education.sa.gov.au/supporting-students/supporting-school-age-children/kindy',
              'TAS': 'https://publicschoolstas.education.tas.gov.au/about-us/our-schools/kindergarten/',
              'ACT': 'https://www.education.act.gov.au/school_education/enrolling_in_an_act_public_school',
              'NT': 'https://education.nt.gov.au/students-and-families/enrolments'
            }
          }
        ]

      case 'travel-identity':
        return [
          {
            id: 'child-passport',
            category: 'travel-identity',
            title: 'Child Passport Application',
            description: 'Australian passport for international travel',
            urgency: 'low',
            timeframe: 'When planning to travel internationally',
            requirements: ['Birth certificate', 'Passport photos', 'Parent identification', 'Consent from both parents'],
            completed: completedTasks.includes('child-passport'),
            links: {
              'ALL': 'https://www.passports.gov.au/getting-passport-how-it-works/documents-you-need/children'
            },
            steps: [
              'Gather required documents (birth certificate, parent ID)',
              'Get passport-compliant photos taken',
              'Complete passport application form (PC8 for children)',
              'Ensure both parents consent (if applicable)',
              'Submit application at Australia Post or passport office',
              'Pay application fee',
              'Wait for processing (usually 3 weeks standard, 2 business days priority)'
            ]
          },
          {
            id: 'tax-file-number',
            category: 'travel-identity',
            title: 'Tax File Number for Child',
            description: 'TFN for future financial accounts and investments',
            urgency: 'low',
            timeframe: 'When needed for bank accounts or investments',
            requirements: ['Birth certificate', 'Parent identification', 'Proof of address'],
            completed: completedTasks.includes('tax-file-number'),
            links: {
              'ALL': 'https://www.ato.gov.au/individuals-and-families/tax-file-number/apply-for-a-tfn/babies-and-children-under-16'
            }
          }
        ]

      case 'support-services':
        return [
          {
            id: 'panda-support',
            category: 'support-services',
            title: 'PANDA Support',
            description: 'Perinatal Anxiety & Depression Australia support',
            urgency: 'medium',
            timeframe: 'When needed',
            requirements: ['None - confidential support available'],
            completed: false,
            links: {
              'ALL': 'https://www.panda.org.au/'
            }
          },
          {
            id: 'beyond-blue',
            category: 'support-services',
            title: 'Beyond Blue Support',
            description: 'Mental health support and resources for parents',
            urgency: 'medium',
            timeframe: 'When needed',
            requirements: ['None - free confidential support'],
            completed: false,
            links: {
              'ALL': 'https://www.beyondblue.org.au/'
            }
          },
          {
            id: 'maternal-health-nurse',
            category: 'support-services',
            title: 'Maternal & Child Health Nurse',
            description: 'Find your local maternal health nurse for regular checkups',
            urgency: 'high',
            timeframe: 'First few weeks after birth',
            requirements: ['None - free service in Australia'],
            completed: completedTasks.includes('maternal-health-nurse'),
            links: {
              'NSW': 'https://www.health.nsw.gov.au/kidsfamilies/MCFhealth/Pages/child-family-health.aspx',
              'VIC': 'https://www.vic.gov.au/maternal-and-child-health-services',
              'QLD': 'https://www.health.qld.gov.au/services/community-child-health',
              'WA': 'https://www.healthywa.wa.gov.au/Articles/A_E/Child-health-services',
              'SA': 'https://www.sahealth.sa.gov.au/wps/wcm/connect/public+content/sa+health+internet/services/community+health+services/maternal+neonatal+and+child+health+services',
              'TAS': 'https://www.health.tas.gov.au/health-topics/child-health-and-development/child-health-and-parenting-service-chaps',
              'ACT': 'https://www.health.act.gov.au/services-and-programs/women-youth-and-children/child-and-family-centres',
              'NT': 'https://nt.gov.au/wellbeing/health-services/child-health'
            }
          },
          {
            id: 'playgroups-australia',
            category: 'support-services',
            title: 'Local Playgroups',
            description: 'Connect with other families through Playgroups Australia',
            urgency: 'low',
            timeframe: 'When baby is mobile (6+ months)',
            requirements: ['None - open to all families'],
            completed: false,
            links: {
              'ALL': 'https://www.playgroupaustralia.org.au/'
            }
          }
        ]

      default:
        return []
    }
  }

  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const openWizard = (task: AdminTask) => {
    setSelectedWizardTask(task)
  }

  const closeWizard = () => {
    setSelectedWizardTask(null)
  }

  const completeWizardTask = (taskId: string) => {
    setCompletedTasks(prev => [...prev, taskId])
    setSelectedWizardTask(null)
  }

  const toggleOptionalTaskSelection = (taskId: string) => {
    setSelectedOptionalTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const addSelectedOptionalTasks = async () => {
    if (!selectedChild || selectedOptionalTasks.length === 0) return
    
    // TODO: Add selected optional tasks to the child's timeline/checklist
    // For now, we'll just add them to completed tasks to show the concept
    setCompletedTasks(prev => [...prev, ...selectedOptionalTasks])
    setSelectedOptionalTasks([])
    setShowOptionalTasks(false)
    
    // Here you would typically save to database:
    // await supabase.from('checklist_items').insert(selectedTasks.map(taskId => ({
    //   child_id: selectedChild.id,
    //   title: optionalAdminChecklist.find(t => t.id === taskId)?.title,
    //   // ... other fields
    // })))
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const calculateProgress = () => {
    if (!selectedChild) return 0
    const allTasks = adminCategories.flatMap(cat => getTasksForCategory(cat.id))
    const completed = allTasks.filter(task => task.completed).length
    return allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-8 h-8 bg-red-200 rounded-lg mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin tasks...</p>
        </div>
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-xl font-semibold text-gray-900">Admin</h1>
            <p className="text-sm text-gray-600 mt-1">Australian government admin made simple</p>
          </div>
        </div>
        
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-sm text-center py-12 px-6">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin help ready when you are</h3>
            <p className="text-gray-600 mb-6">
              Add your baby's profile to get personalised step-by-step guides for Australian government processes.
            </p>
            <a href="/dashboard/children" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
              <PlusIcon className="w-5 h-5" />
              Add Your Baby
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Admin</h1>
          <p className="text-sm text-gray-600 mt-1">
            Australian government admin for {selectedChild?.name}
          </p>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Admin progress</span>
              <span>{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-4">
        {/* Child Selector */}
        {children.length > 1 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Select Child:</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedChild?.id === child.id
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {child.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Me Time Nudge */}
        <div className="bg-gradient-to-r from-pink-100 to-orange-100 rounded-2xl p-4 border border-pink-200">
          <h3 className="font-semibold text-gray-900 mb-2">💝 Admin made simple</h3>
          <p className="text-sm text-gray-700">
            We've organised all the government admin you need to do into simple steps. Take it one task at a time - you've got this! ✨
          </p>
        </div>

        {/* Optional Tasks Section */}
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <SparklesIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Optional Tasks</h3>
                <p className="text-sm text-gray-600">Browse extra tasks you might want to add</p>
              </div>
            </div>
            <button
              onClick={() => setShowOptionalTasks(!showOptionalTasks)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {showOptionalTasks ? 'Close' : 'Browse Tasks'}
            </button>
          </div>
          
          {showOptionalTasks && (
            <div className="mt-4 space-y-4">
              {/* Category Selection */}
              <div className="grid grid-cols-2 gap-2">
                {optionalAdminCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedOptionalCategory(
                      selectedOptionalCategory === category ? null : category
                    )}
                    className={`p-3 rounded-xl text-sm font-medium transition-colors text-left ${
                      selectedOptionalCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <FolderOpenIcon className="w-4 h-4 mb-1" />
                    {category}
                  </button>
                ))}
              </div>
              
              {/* Selected Category Tasks */}
              {selectedOptionalCategory && (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">{selectedOptionalCategory}</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {getTasksByCategory(selectedOptionalCategory).map((task) => (
                      <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectedOptionalTasks.includes(task.id)}
                          onChange={() => toggleOptionalTaskSelection(task.id)}
                          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">{task.title}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            📅 {task.suggestedTiming} • {task.type}
                          </div>
                          {task.notes && (
                            <div className="text-xs text-gray-500 mt-1">{task.notes}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add Selected Tasks Button */}
              {selectedOptionalTasks.length > 0 && (
                <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200">
                  <div>
                    <span className="font-medium text-gray-900">
                      {selectedOptionalTasks.length} task{selectedOptionalTasks.length !== 1 ? 's' : ''} selected
                    </span>
                    <p className="text-sm text-gray-600">These will be added to your timeline</p>
                  </div>
                  <button
                    onClick={addSelectedOptionalTasks}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Add to Timeline
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin Categories */}
        <div className="space-y-3">
          {adminCategories.map((category) => {
            const tasks = getTasksForCategory(category.id)
            const completedTasks = tasks.filter(task => task.completed).length
            const Icon = category.icon
            
            return (
              <div key={category.id} className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden ${category.color.includes('border') ? category.color : ''}`}>
                <button
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${category.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{category.title}</h3>
                        <p className="text-sm text-gray-600">{category.subtitle}</p>
                        {tasks.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {completedTasks}/{tasks.length} completed
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {category.urgency === 'high' && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                          Urgent
                        </span>
                      )}
                      <ChevronRightIcon className={`w-5 h-5 text-gray-400 transition-transform ${
                        selectedCategory === category.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </div>
                </button>

                {/* Category Tasks */}
                {selectedCategory === category.id && (
                  <div className="border-t border-gray-100 p-4 space-y-3">
                    {tasks.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No urgent tasks in this category right now. Check back as {selectedChild?.name} grows!
                      </p>
                    ) : (
                      tasks.map((task) => (
                        <div key={task.id} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{task.title}</h4>
                                <span className={`px-2 py-1 text-xs rounded-full border ${getUrgencyColor(task.urgency)}`}>
                                  {task.urgency}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                              <p className="text-xs text-gray-500">⏰ {task.timeframe}</p>
                            </div>
                            
                            <button
                              onClick={() => toggleTaskCompletion(task.id)}
                              className={`p-2 rounded-full transition-colors ${
                                task.completed 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Requirements */}
                          {task.requirements.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-xs font-medium text-gray-700 mb-2">📋 What you'll need:</h5>
                              <ul className="space-y-1">
                                {task.requirements.map((req, idx) => (
                                  <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Steps */}
                          {task.steps && (
                            <div className="mb-3">
                              <h5 className="text-xs font-medium text-gray-700 mb-2">📝 Steps:</h5>
                              <ol className="space-y-1">
                                {task.steps.map((step, idx) => (
                                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                    <span className="w-4 h-4 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                                      {idx + 1}
                                    </span>
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="pt-3 border-t border-gray-100">
                            <div className="flex gap-2 mb-3">
                              <button
                                onClick={() => openWizard(task)}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 transition-colors"
                              >
                                <DocumentTextIcon className="w-4 h-4" />
                                Start Step-by-Step Guide
                              </button>
                            </div>
                            
                            {/* Links */}
                            {task.links && (
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(task.links).map(([state, url]) => {
                                  const linkText = state === 'ALL' ? 'Official Website' : `${state} Link`
                                  return (
                                    <a
                                      key={state}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100 transition-colors"
                                    >
                                      <ExclamationTriangleIcon className="w-3 h-3" />
                                      {linkText}
                                    </a>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Help Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Need help?</h3>
              <p className="text-sm text-gray-600 mt-1">
                These guides are based on Australian government requirements. Always check official websites for the most current information, and don't hesitate to call the relevant departments if you need assistance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Wizard Modal */}
      {selectedWizardTask && (
        <AdminWizard
          task={{
            ...selectedWizardTask,
            state: selectedChild?.state_territory
          }}
          onClose={closeWizard}
          onComplete={completeWizardTask}
        />
      )}
    </div>
  )
}