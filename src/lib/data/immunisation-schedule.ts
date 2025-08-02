// Australian National Immunisation Program Schedule (0-3 years)
// Source: https://www.health.gov.au/our-work/national-immunisation-program

export interface ImmunisationScheduleItem {
  id: string
  title: string
  description: string
  ageInWeeks: number
  category: 'immunisation'
  vaccines: string[]
  isRequired: boolean
}

export const AUSTRALIAN_IMMUNISATION_SCHEDULE: ImmunisationScheduleItem[] = [
  {
    id: 'birth-hepb',
    title: 'Birth Immunisations',
    description: 'Hepatitis B vaccine - first dose',
    ageInWeeks: 0, // At birth
    category: 'immunisation',
    vaccines: ['Hepatitis B'],
    isRequired: true
  },
  {
    id: '6-weeks',
    title: '6 Week Immunisations',
    description: 'First round of routine immunisations',
    ageInWeeks: 6,
    category: 'immunisation',
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
    title: '4 Month Immunisations',
    description: 'Second round of routine immunisations',
    ageInWeeks: 16,
    category: 'immunisation',
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
    title: '6 Month Immunisations',
    description: 'Third round of routine immunisations',
    ageInWeeks: 24,
    category: 'immunisation',
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
    title: '12 Month Immunisations',
    description: 'Fourth round including MMR vaccine',
    ageInWeeks: 52,
    category: 'immunisation',
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
    title: '18 Month Immunisations',
    description: 'Fifth round of routine immunisations',
    ageInWeeks: 78,
    category: 'immunisation',
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
    category: 'immunisation',
    vaccines: ['Influenza'],
    isRequired: false
  }
]