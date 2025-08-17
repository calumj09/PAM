// Australian Government Registration Tasks for New Parents

export interface GovernmentTask {
  id: string
  title: string
  description: string
  daysAfterBirth: number
  category: 'registration'
  priority: 'high' | 'medium' | 'low'
  estimatedTime: string
  requirements: string[]
  links: {
    [state: string]: string
  }
}

export const AUSTRALIAN_GOVERNMENT_TASKS: GovernmentTask[] = [
  {
    id: 'birth-certificate',
    title: 'Register Birth Certificate',
    description: 'Register your baby\'s birth and obtain birth certificate',
    daysAfterBirth: 60, // Must be done within 60 days
    category: 'registration',
    priority: 'high',
    estimatedTime: '15-30 minutes online',
    requirements: [
      'Hospital birth notification',
      'Parent identification',
      'Proof of address'
    ],
    links: {
      'NSW': 'https://www.nsw.gov.au/topics/births-and-certificates/register-a-birth',
      'VIC': 'https://www.bdm.vic.gov.au/births/register-a-birth',
      'QLD': 'https://www.qld.gov.au/law/births-deaths-marriages-and-divorces/births/registering-a-birth',
      'WA': 'https://www.wa.gov.au/service/community-services/births-deaths-and-marriages/register-birth',
      'SA': 'https://www.sa.gov.au/topics/family-and-community/births-and-certificates/register-a-birth',
      'TAS': 'https://www.justice.tas.gov.au/bdm/births/register_a_birth',
      'ACT': 'https://www.accesscanberra.act.gov.au/app/answers/detail/a_id/1314',
      'NT': 'https://nt.gov.au/law/bdm/births/register-a-birth'
    }
  },
  {
    id: 'medicare-card',
    title: 'Add Baby to Medicare',
    description: 'Add your baby to your Medicare card or apply for their own',
    daysAfterBirth: 28, // Recommended within 28 days
    category: 'registration',
    priority: 'high',
    estimatedTime: '10-15 minutes online',
    requirements: [
      'Birth certificate or hospital birth notification',
      'Medicare card',
      'Proof of identity'
    ],
    links: {
      'ALL': 'https://www.servicesaustralia.gov.au/how-to-enrol-and-get-started-with-medicare'
    }
  },
  {
    id: 'centrelink-baby-bonus',
    title: 'Apply for Family Tax Benefit',
    description: 'Apply for Family Tax Benefit and other Centrelink payments',
    daysAfterBirth: 1, // Can apply as soon as baby is born
    category: 'registration',
    priority: 'high',
    estimatedTime: '20-30 minutes online',
    requirements: [
      'Birth certificate or hospital birth notification',
      'Tax File Numbers for both parents',
      'Income details',
      'Bank details'
    ],
    links: {
      'ALL': 'https://www.servicesaustralia.gov.au/family-tax-benefit'
    }
  },
  {
    id: 'child-care-subsidy',
    title: 'Apply for Child Care Subsidy',
    description: 'Apply for Child Care Subsidy if planning to use childcare',
    daysAfterBirth: 30, // When ready to use childcare
    category: 'registration',
    priority: 'medium',
    estimatedTime: '15-20 minutes online',
    requirements: [
      'Customer Reference Number (CRN)',
      'Child\'s details',
      'Income estimate',
      'Childcare provider details'
    ],
    links: {
      'ALL': 'https://www.servicesaustralia.gov.au/child-care-subsidy'
    }
  },
  {
    id: 'tax-file-number',
    title: 'Apply for Child\'s Tax File Number',
    description: 'Apply for your child\'s Tax File Number for future financial needs',
    daysAfterBirth: 90, // Not urgent but useful for savings accounts
    category: 'registration',
    priority: 'low',
    estimatedTime: '10 minutes online',
    requirements: [
      'Birth certificate',
      'Parent identification',
      'Proof of address'
    ],
    links: {
      'ALL': 'https://www.ato.gov.au/individuals-and-families/tax-file-number/apply-for-a-tfn/babies-and-children-under-16'
    }
  },
  {
    id: 'passport',
    title: 'Apply for Child Passport',
    description: 'Apply for your child\'s first Australian passport if planning to travel',
    daysAfterBirth: 180, // When planning to travel
    category: 'registration',
    priority: 'low',
    estimatedTime: '30-45 minutes',
    requirements: [
      'Birth certificate',
      'Citizenship certificate (if applicable)',
      'Parent identification',
      'Passport photos',
      'Consent from both parents'
    ],
    links: {
      'ALL': 'https://www.passports.gov.au/getting-passport-how-it-works/documents-you-need/children'
    }
  }
]