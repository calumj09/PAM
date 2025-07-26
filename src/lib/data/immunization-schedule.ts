// Australian National Immunisation Program Schedule (0-3 years)
// Source: https://www.health.gov.au/our-work/national-immunisation-program

export interface ImmunizationScheduleItem {
  id: string
  title: string
  description: string
  ageInWeeks: number
  category: 'immunization'
  vaccines: string[]
  isRequired: boolean
}

export const AUSTRALIAN_IMMUNIZATION_SCHEDULE: ImmunizationScheduleItem[] = [
  {
    id: 'birth-hepb',
    title: 'Birth Immunizations',
    description: 'Hepatitis B vaccine - first dose',
    ageInWeeks: 0, // At birth
    category: 'immunization',
    vaccines: ['Hepatitis B'],
    isRequired: true
  },
  {
    id: '6-weeks',
    title: '6 Week Immunizations',
    description: 'First round of routine immunizations',
    ageInWeeks: 6,
    category: 'immunization',
    vaccines: [
      'Diphtheria, tetanus, pertussis (whooping cough)',
      'Haemophilus influenzae type b (Hib)',
      'Hepatitis B',
      'Poliomyelitis (polio)',
      'Pneumococcal',
      'Rotavirus'
    ],
    isRequired: true
  },
  {
    id: '4-months',
    title: '4 Month Immunizations',
    description: 'Second round of routine immunizations',
    ageInWeeks: 16,
    category: 'immunization',
    vaccines: [
      'Diphtheria, tetanus, pertussis (whooping cough)',
      'Haemophilus influenzae type b (Hib)',
      'Hepatitis B',
      'Poliomyelitis (polio)',
      'Pneumococcal',
      'Rotavirus'
    ],
    isRequired: true
  },
  {
    id: '6-months',
    title: '6 Month Immunizations',
    description: 'Third round of routine immunizations',
    ageInWeeks: 24,
    category: 'immunization',
    vaccines: [
      'Diphtheria, tetanus, pertussis (whooping cough)',
      'Haemophilus influenzae type b (Hib)',
      'Hepatitis B',
      'Poliomyelitis (polio)',
      'Pneumococcal'
    ],
    isRequired: true
  },
  {
    id: '12-months',
    title: '12 Month Immunizations',
    description: 'Fourth round including MMR vaccine',
    ageInWeeks: 52,
    category: 'immunization',
    vaccines: [
      'Haemophilus influenzae type b (Hib)',
      'Measles, mumps, rubella (MMR)',
      'Meningococcal ACWY',
      'Pneumococcal'
    ],
    isRequired: true
  },
  {
    id: '18-months',
    title: '18 Month Immunizations',
    description: 'Fifth round of routine immunizations',
    ageInWeeks: 78,
    category: 'immunization',
    vaccines: [
      'Diphtheria, tetanus, pertussis (whooping cough)',
      'Haemophilus influenzae type b (Hib)',
      'Measles, mumps, rubella (MMR)',
      'Varicella (chickenpox)'
    ],
    isRequired: true
  },
  {
    id: '2-years-flu',
    title: 'Annual Influenza Vaccine (2+ years)',
    description: 'Annual influenza vaccination recommended',
    ageInWeeks: 104, // 2 years
    category: 'immunization',
    vaccines: ['Influenza'],
    isRequired: false
  }
]