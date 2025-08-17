// Optional Admin Checklist data extracted from Excel file
// Users can browse and select these tasks to add to their timeline

export interface OptionalAdminTask {
  id: string
  category: string
  title: string
  suggestedTiming: string
  type: 'Checklist' | 'Optional Checklist' | 'Reminder' | 'Tracker'
  notes?: string
  link?: string
}

export const optionalAdminChecklist: OptionalAdminTask[] = [
  // Health & Medical
  {
    id: 'private-health-insurance',
    category: 'Health & Medical',
    title: 'Add baby to private health insurance',
    suggestedTiming: 'Within 30 days of birth',
    type: 'Optional Checklist',
    notes: 'Call your health fund to add baby to your policy'
  },
  {
    id: 'baby-chiropractor',
    category: 'Health & Medical', 
    title: 'Book baby chiropractor',
    suggestedTiming: '6-8 weeks',
    type: 'Optional Checklist',
    notes: 'Craniosacral therapy can help with feeding and sleeping issues'
  },
  {
    id: 'osteopath-visit',
    category: 'Health & Medical',
    title: 'Visit osteopath for birth trauma',
    suggestedTiming: '2-6 weeks',
    type: 'Optional Checklist',
    notes: 'Can help with reflux, colic, and feeding difficulties'
  },
  {
    id: 'dentist-checkup',
    category: 'Health & Medical',
    title: 'Book first dentist visit',
    suggestedTiming: '6 months or first tooth',
    type: 'Optional Checklist',
    notes: 'Early dental health assessment and advice'
  },
  {
    id: 'paediatrician-visit',
    category: 'Health & Medical',
    title: 'Book paediatrician visit',
    suggestedTiming: '6-8 weeks',
    type: 'Optional Checklist',
    notes: 'For ongoing specialist care if needed'
  },

  // Feeding & Sleep
  {
    id: 'lactation-consultant',
    category: 'Feeding & Sleep',
    title: 'Book a lactation consultant',
    suggestedTiming: 'Within first 2 weeks',
    type: 'Optional Checklist',
    notes: 'Professional breastfeeding support if needed'
  },
  {
    id: 'milk-supply-tracker',
    category: 'Feeding & Sleep',
    title: 'Track milk supply',
    suggestedTiming: 'First 6 weeks',
    type: 'Tracker',
    notes: 'Monitor feeding patterns and milk production'
  },
  {
    id: 'sleep-consultant',
    category: 'Feeding & Sleep',
    title: 'Consider sleep consultant',
    suggestedTiming: '4-6 months',
    type: 'Optional Checklist',
    notes: 'Professional help with sleep training if needed'
  },
  {
    id: 'feeding-schedule',
    category: 'Feeding & Sleep',
    title: 'Establish feeding routine',
    suggestedTiming: '2-4 weeks',
    type: 'Reminder',
    notes: 'Work towards consistent feeding times'
  },
  {
    id: 'solid-food-prep',
    category: 'Feeding & Sleep',
    title: 'Prepare for solid foods',
    suggestedTiming: '5-6 months',
    type: 'Checklist',
    notes: 'High chair, bibs, first foods, baby-led weaning resources'
  },

  // Development & Learning
  {
    id: 'baby-massage-class',
    category: 'Development & Learning',
    title: 'Attend baby massage class',
    suggestedTiming: '6-12 weeks',
    type: 'Optional Checklist',
    notes: 'Bonding and developmental benefits'
  },
  {
    id: 'swimming-lessons',
    category: 'Development & Learning',
    title: 'Book baby swimming lessons',
    suggestedTiming: '3-6 months',
    type: 'Optional Checklist',
    notes: 'Water safety and development'
  },
  {
    id: 'reading-routine',
    category: 'Development & Learning',
    title: 'Start daily reading routine',
    suggestedTiming: 'From birth',
    type: 'Reminder',
    notes: 'Language development and bonding'
  },
  {
    id: 'tummy-time-schedule',
    category: 'Development & Learning',
    title: 'Establish tummy time routine',
    suggestedTiming: 'From 2 weeks',
    type: 'Reminder',
    notes: 'Start with 2-3 minutes, increase gradually'
  },
  {
    id: 'music-class',
    category: 'Development & Learning',
    title: 'Join baby music class',
    suggestedTiming: '3-6 months',
    type: 'Optional Checklist',
    notes: 'Sensory development and social interaction'
  },

  // Documentation & Memories
  {
    id: 'baby-book',
    category: 'Documentation & Memories',
    title: 'Start baby book/journal',
    suggestedTiming: 'From birth',
    type: 'Optional Checklist',
    notes: 'Record milestones, firsts, and memories'
  },
  {
    id: 'monthly-photos',
    category: 'Documentation & Memories',
    title: 'Take monthly milestone photos',
    suggestedTiming: 'Monthly',
    type: 'Reminder',
    notes: 'Document growth and development'
  },
  {
    id: 'handprint-footprint',
    category: 'Documentation & Memories',
    title: 'Create handprint/footprint keepsakes',
    suggestedTiming: '1 month, 6 months, 1 year',
    type: 'Optional Checklist',
    notes: 'Precious memories as baby grows'
  },
  {
    id: 'video-diary',
    category: 'Documentation & Memories',
    title: 'Record video diary',
    suggestedTiming: 'Weekly/Monthly',
    type: 'Optional Checklist',
    notes: 'Capture baby\'s development and your journey'
  },

  // Safety & Preparation
  {
    id: 'car-seat-check',
    category: 'Safety & Preparation',
    title: 'Car seat safety check',
    suggestedTiming: 'Before hospital discharge',
    type: 'Checklist',
    notes: 'Professional installation check at service centre'
  },
  {
    id: 'baby-proofing',
    category: 'Safety & Preparation',
    title: 'Baby-proof the house',
    suggestedTiming: '4-6 months',
    type: 'Checklist',
    notes: 'Before baby becomes mobile'
  },
  {
    id: 'first-aid-course',
    category: 'Safety & Preparation',
    title: 'Complete baby first aid course',
    suggestedTiming: 'Before birth or first 3 months',
    type: 'Optional Checklist',
    notes: 'Essential safety knowledge for parents'
  },
  {
    id: 'emergency-contacts',
    category: 'Safety & Preparation',
    title: 'Create emergency contact list',
    suggestedTiming: 'First week',
    type: 'Checklist',
    notes: 'Doctor, hospital, poison control, family'
  },
  {
    id: 'baby-monitor-setup',
    category: 'Safety & Preparation',
    title: 'Set up baby monitor',
    suggestedTiming: 'Before 3 months',
    type: 'Optional Checklist',
    notes: 'For peace of mind during sleep'
  },

  // Financial & Insurance
  {
    id: 'baby-savings-account',
    category: 'Financial & Insurance',
    title: 'Open baby savings account',
    suggestedTiming: 'First 3 months',
    type: 'Optional Checklist',
    notes: 'Start saving for baby\'s future'
  },
  {
    id: 'education-fund',
    category: 'Financial & Insurance',
    title: 'Consider education fund/investment',
    suggestedTiming: 'First year',
    type: 'Optional Checklist',
    notes: 'Long-term education savings plan'
  },
  {
    id: 'life-insurance-review',
    category: 'Financial & Insurance',
    title: 'Review life insurance coverage',
    suggestedTiming: 'First 3 months',
    type: 'Optional Checklist',
    notes: 'Ensure adequate family protection'
  },
  {
    id: 'will-update',
    category: 'Financial & Insurance',
    title: 'Update will and beneficiaries',
    suggestedTiming: 'First 6 months',
    type: 'Checklist',
    notes: 'Include baby in estate planning'
  },

  // Support Network
  {
    id: 'mothers-group',
    category: 'Support Network',
    title: 'Join local mothers group',
    suggestedTiming: '6-12 weeks',
    type: 'Optional Checklist',
    notes: 'Connect with other new parents'
  },
  {
    id: 'playgroup-research',
    category: 'Support Network',
    title: 'Research local playgroups',
    suggestedTiming: '6-12 months',
    type: 'Optional Checklist',
    notes: 'Social development for baby and support for you'
  },
  {
    id: 'babysitter-network',
    category: 'Support Network',
    title: 'Build babysitter network',
    suggestedTiming: '3-6 months',
    type: 'Optional Checklist',
    notes: 'Reliable childcare for date nights and emergencies'
  },
  {
    id: 'grandparent-support',
    category: 'Support Network',
    title: 'Establish grandparent routines',
    suggestedTiming: 'First 3 months',
    type: 'Optional Checklist',
    notes: 'Regular visits and support arrangements'
  },

  // Lifestyle & Wellbeing
  {
    id: 'postnatal-exercise',
    category: 'Lifestyle & Wellbeing',
    title: 'Start postnatal exercise program',
    suggestedTiming: '6-8 weeks',
    type: 'Optional Checklist',
    notes: 'Get medical clearance first'
  },
  {
    id: 'mental-health-check',
    category: 'Lifestyle & Wellbeing',
    title: 'Mental health check-in',
    suggestedTiming: '6 weeks, 3 months, 6 months',
    type: 'Reminder',
    notes: 'Monitor postnatal depression and anxiety'
  },
  {
    id: 'couple-time',
    category: 'Lifestyle & Wellbeing',
    title: 'Schedule regular couple time',
    suggestedTiming: 'From 3 months',
    type: 'Reminder',
    notes: 'Maintain relationship during transition'
  },
  {
    id: 'self-care-routine',
    category: 'Lifestyle & Wellbeing',
    title: 'Establish self-care routine',
    suggestedTiming: 'Ongoing',
    type: 'Reminder',
    notes: 'Your wellbeing matters too'
  },

  // Return to Work
  {
    id: 'childcare-research',
    category: 'Return to Work',
    title: 'Research childcare options',
    suggestedTiming: '3-6 months before return',
    type: 'Checklist',
    notes: 'Childcare centres, family daycare, nannies'
  },
  {
    id: 'childcare-waitlists',
    category: 'Return to Work',
    title: 'Join childcare waitlists',
    suggestedTiming: 'During pregnancy or early infancy',
    type: 'Checklist',
    notes: 'Popular centres have long waiting lists'
  },
  {
    id: 'work-transition-plan',
    category: 'Return to Work',
    title: 'Plan return to work transition',
    suggestedTiming: '1-2 months before return',
    type: 'Checklist',
    notes: 'Gradual introduction to childcare, pumping schedule'
  },
  {
    id: 'breastfeeding-work-prep',
    category: 'Return to Work',
    title: 'Prepare for breastfeeding at work',
    suggestedTiming: '1 month before return',
    type: 'Optional Checklist',
    notes: 'Pump, storage bags, workplace facilities'
  },

  // Legal & Documentation
  {
    id: 'name-change-consideration',
    category: 'Legal & Documentation',
    title: 'Consider name change (if applicable)',
    suggestedTiming: 'Within first year',
    type: 'Optional Checklist',
    notes: 'Legal name change process if desired'
  },
  {
    id: 'custody-arrangements',
    category: 'Legal & Documentation',
    title: 'Document custody arrangements',
    suggestedTiming: 'If applicable',
    type: 'Optional Checklist',
    notes: 'Legal documentation for separated parents'
  },
  {
    id: 'emergency-care-authorisation',
    category: 'Legal & Documentation',
    title: 'Complete emergency care authorisation',
    suggestedTiming: 'Before leaving baby with others',
    type: 'Optional Checklist',
    notes: 'Medical consent for caregivers'
  }
]

// Group tasks by category for easy browsing
export const optionalAdminCategories = [
  'Health & Medical',
  'Feeding & Sleep', 
  'Development & Learning',
  'Documentation & Memories',
  'Safety & Preparation',
  'Financial & Insurance',
  'Support Network',
  'Lifestyle & Wellbeing',
  'Return to Work',
  'Legal & Documentation'
] as const

export type OptionalAdminCategory = typeof optionalAdminCategories[number]

// Helper function to get tasks by category
export function getTasksByCategory(category: OptionalAdminCategory): OptionalAdminTask[] {
  return optionalAdminChecklist.filter(task => task.category === category)
}

// Helper function to get all unique categories
export function getAllCategories(): OptionalAdminCategory[] {
  return optionalAdminCategories
}