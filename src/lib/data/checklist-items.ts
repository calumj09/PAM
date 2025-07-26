// Australian Immunization Schedule and Key Milestones for 0-3 years
// Source: Australian Government Department of Health

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'immunization' | 'registration' | 'milestone' | 'checkup';
  dueAtMonths: number; // Age in months when this is due
  notifyDaysBefore: number[]; // Days before due date to notify
  links?: {
    title: string;
    url: string;
  }[];
}

export const australianChecklistItems: ChecklistItem[] = [
  // Birth Registrations
  {
    id: 'birth-certificate',
    title: 'Apply for Birth Certificate',
    description: 'Register your baby\'s birth with Births, Deaths and Marriages in your state/territory',
    category: 'registration',
    dueAtMonths: 0.5, // Within 2 weeks
    notifyDaysBefore: [7, 1],
    links: [{
      title: 'Find your state registry',
      url: 'https://www.australia.gov.au/information-and-services/family-and-community/births-deaths-and-marriages'
    }]
  },
  {
    id: 'medicare-enrollment',
    title: 'Enroll in Medicare',
    description: 'Register your baby for Medicare to access healthcare benefits',
    category: 'registration',
    dueAtMonths: 0.25, // Within 1 week
    notifyDaysBefore: [3, 1],
    links: [{
      title: 'Medicare enrollment',
      url: 'https://www.servicesaustralia.gov.au/enrol-newborn-child-medicare'
    }]
  },
  {
    id: 'centrelink-registration',
    title: 'Register with Centrelink',
    description: 'Apply for Family Tax Benefit and other parenting payments',
    category: 'registration',
    dueAtMonths: 1,
    notifyDaysBefore: [14, 7],
    links: [{
      title: 'Centrelink parenting payments',
      url: 'https://www.servicesaustralia.gov.au/parenting-payment'
    }]
  },
  {
    id: 'child-care-subsidy',
    title: 'Apply for Child Care Subsidy',
    description: 'If planning to use childcare, apply for subsidy to reduce costs',
    category: 'registration',
    dueAtMonths: 3,
    notifyDaysBefore: [30, 14],
    links: [{
      title: 'Child Care Subsidy',
      url: 'https://www.servicesaustralia.gov.au/child-care-subsidy'
    }]
  },

  // Immunizations - Birth
  {
    id: 'imm-birth-hepb',
    title: 'Hepatitis B (birth dose)',
    description: 'First dose of Hepatitis B vaccine, usually given in hospital',
    category: 'immunization',
    dueAtMonths: 0,
    notifyDaysBefore: [1],
  },

  // Immunizations - 2 months
  {
    id: 'imm-2m-dtpa',
    title: '2 Month Immunizations',
    description: 'DTPa-hepB-IPV-Hib (6-in-1), Pneumococcal, Rotavirus',
    category: 'immunization',
    dueAtMonths: 2,
    notifyDaysBefore: [14, 7, 1],
  },

  // Immunizations - 4 months
  {
    id: 'imm-4m-dtpa',
    title: '4 Month Immunizations',
    description: 'DTPa-hepB-IPV-Hib (6-in-1), Pneumococcal, Rotavirus',
    category: 'immunization',
    dueAtMonths: 4,
    notifyDaysBefore: [14, 7, 1],
  },

  // Immunizations - 6 months
  {
    id: 'imm-6m-dtpa',
    title: '6 Month Immunizations',
    description: 'DTPa-hepB-IPV-Hib (6-in-1), Pneumococcal (Aboriginal and Torres Strait Islander children)',
    category: 'immunization',
    dueAtMonths: 6,
    notifyDaysBefore: [14, 7, 1],
  },

  // Immunizations - 12 months
  {
    id: 'imm-12m-mmr',
    title: '12 Month Immunizations',
    description: 'MMR, Meningococcal ACWY, Pneumococcal',
    category: 'immunization',
    dueAtMonths: 12,
    notifyDaysBefore: [30, 14, 7, 1],
  },

  // Immunizations - 18 months
  {
    id: 'imm-18m-mmrv',
    title: '18 Month Immunizations',
    description: 'MMRV (MMR + Varicella), DTPa, Hib, Hepatitis A (Aboriginal and Torres Strait Islander children)',
    category: 'immunization',
    dueAtMonths: 18,
    notifyDaysBefore: [30, 14, 7, 1],
  },

  // Health Checkups
  {
    id: 'checkup-1-4-weeks',
    title: '1-4 Week Health Check',
    description: 'First health check with GP or child health nurse',
    category: 'checkup',
    dueAtMonths: 0.5,
    notifyDaysBefore: [7, 3],
  },
  {
    id: 'checkup-6-8-weeks',
    title: '6-8 Week Health Check',
    description: 'Comprehensive health and development check',
    category: 'checkup',
    dueAtMonths: 2,
    notifyDaysBefore: [14, 7],
  },
  {
    id: 'checkup-6-months',
    title: '6 Month Health Check',
    description: 'Development assessment and growth check',
    category: 'checkup',
    dueAtMonths: 6,
    notifyDaysBefore: [14, 7],
  },
  {
    id: 'checkup-12-months',
    title: '12 Month Health Check',
    description: 'Comprehensive health, hearing, and development check',
    category: 'checkup',
    dueAtMonths: 12,
    notifyDaysBefore: [30, 14],
  },
  {
    id: 'checkup-18-months',
    title: '18 Month Health Check',
    description: 'Development, behavior, and growth assessment',
    category: 'checkup',
    dueAtMonths: 18,
    notifyDaysBefore: [30, 14],
  },
  {
    id: 'checkup-2-years',
    title: '2 Year Health Check',
    description: 'Comprehensive health and development review',
    category: 'checkup',
    dueAtMonths: 24,
    notifyDaysBefore: [30, 14],
  },
  {
    id: 'checkup-3-years',
    title: '3 Year Health Check',
    description: 'Pre-school health and development assessment',
    category: 'checkup',
    dueAtMonths: 36,
    notifyDaysBefore: [30, 14],
  },

  // Key Milestones
  {
    id: 'milestone-smile',
    title: 'First Social Smile',
    description: 'Most babies start smiling socially around 6-8 weeks',
    category: 'milestone',
    dueAtMonths: 2,
    notifyDaysBefore: [7],
  },
  {
    id: 'milestone-rollover',
    title: 'Rolling Over',
    description: 'Most babies can roll from tummy to back by 4-6 months',
    category: 'milestone',
    dueAtMonths: 5,
    notifyDaysBefore: [14],
  },
  {
    id: 'milestone-sitting',
    title: 'Sitting Without Support',
    description: 'Most babies sit without support by 6-8 months',
    category: 'milestone',
    dueAtMonths: 7,
    notifyDaysBefore: [14],
  },
  {
    id: 'milestone-crawling',
    title: 'Crawling',
    description: 'Most babies start crawling between 7-10 months',
    category: 'milestone',
    dueAtMonths: 9,
    notifyDaysBefore: [14],
  },
  {
    id: 'milestone-first-words',
    title: 'First Words',
    description: 'Most babies say their first words around 12 months',
    category: 'milestone',
    dueAtMonths: 12,
    notifyDaysBefore: [30],
  },
  {
    id: 'milestone-walking',
    title: 'First Steps',
    description: 'Most babies take their first steps between 12-15 months',
    category: 'milestone',
    dueAtMonths: 13,
    notifyDaysBefore: [30],
  },
];

// Helper function to get checklist items for a child based on their age
export function getChecklistForChild(birthDate: Date): ChecklistItem[] {
  const now = new Date();
  const ageInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + 
                      (now.getMonth() - birthDate.getMonth());
  
  // Return items that are relevant for the child's age (not too far in the past)
  return australianChecklistItems.filter(item => {
    // Show items up to 3 months in the past and all future items
    return item.dueAtMonths >= ageInMonths - 3;
  });
}

// Helper to calculate due date for a checklist item
export function calculateDueDate(birthDate: Date, item: ChecklistItem): Date {
  const dueDate = new Date(birthDate);
  dueDate.setMonth(dueDate.getMonth() + item.dueAtMonths);
  return dueDate;
}