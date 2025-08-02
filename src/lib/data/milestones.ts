// Australian Developmental Milestones (0-3 years)
// Source: Australian Government Department of Health

export interface MilestoneItem {
  id: string
  title: string
  description: string
  ageInMonths: number
  category: 'milestone'
  milestoneType: 'physical' | 'cognitive' | 'social' | 'communication'
  isOptional: boolean
}

export const AUSTRALIAN_DEVELOPMENTAL_MILESTONES: MilestoneItem[] = [
  // 2 months
  {
    id: '2m-smile',
    title: '2 Month Check: Social Smile',
    description: 'Baby should be smiling in response to your smile',
    ageInMonths: 2,
    category: 'milestone',
    milestoneType: 'social',
    isOptional: false
  },
  {
    id: '2m-head-control',
    title: '2 Month Check: Head Control',
    description: 'Baby can hold head up when on tummy for short periods',
    ageInMonths: 2,
    category: 'milestone',
    milestoneType: 'physical',
    isOptional: false
  },
  
  // 4 months
  {
    id: '4m-rolling',
    title: '4 Month Check: Rolling Over',
    description: 'Baby may start rolling from tummy to back',
    ageInMonths: 4,
    category: 'milestone',
    milestoneType: 'physical',
    isOptional: true
  },
  {
    id: '4m-laughing',
    title: '4 Month Check: Laughing',
    description: 'Baby laughs and shows joy during play',
    ageInMonths: 4,
    category: 'milestone',
    milestoneType: 'social',
    isOptional: false
  },
  
  // 6 months
  {
    id: '6m-sitting',
    title: '6 Month Check: Sitting with Support',
    description: 'Baby can sit with support and good head control',
    ageInMonths: 6,
    category: 'milestone',
    milestoneType: 'physical',
    isOptional: false
  },
  {
    id: '6m-solids',
    title: '6 Month Check: Ready for Solids',
    description: 'Baby shows signs of readiness for solid foods',
    ageInMonths: 6,
    category: 'milestone',
    milestoneType: 'physical',
    isOptional: false
  },
  
  // 9 months
  {
    id: '9m-crawling',
    title: '9 Month Check: Crawling',
    description: 'Baby crawls or moves around to explore',
    ageInMonths: 9,
    category: 'milestone',
    milestoneType: 'physical',
    isOptional: true
  },
  {
    id: '9m-babbling',
    title: '9 Month Check: Babbling',
    description: 'Baby babbles with different sounds like "ba-ba", "da-da"',
    ageInMonths: 9,
    category: 'milestone',
    milestoneType: 'communication',
    isOptional: false
  },
  
  // 12 months
  {
    id: '12m-walking',
    title: '12 Month Check: First Steps',
    description: 'Baby may take first independent steps',
    ageInMonths: 12,
    category: 'milestone',
    milestoneType: 'physical',
    isOptional: true
  },
  {
    id: '12m-first-words',
    title: '12 Month Check: First Words',
    description: 'Baby says first meaningful words like "parent", "dada"',
    ageInMonths: 12,
    category: 'milestone',
    milestoneType: 'communication',
    isOptional: false
  },
  
  // 18 months
  {
    id: '18m-walking-steady',
    title: '18 Month Check: Steady Walking',
    description: 'Child walks steadily without support',
    ageInMonths: 18,
    category: 'milestone',
    milestoneType: 'physical',
    isOptional: false
  },
  {
    id: '18m-vocabulary',
    title: '18 Month Check: Growing Vocabulary',
    description: 'Child uses 10-20 words regularly',
    ageInMonths: 18,
    category: 'milestone',
    milestoneType: 'communication',
    isOptional: false
  },
  
  // 2 years
  {
    id: '24m-running',
    title: '2 Year Check: Running and Jumping',
    description: 'Child can run and may attempt jumping',
    ageInMonths: 24,
    category: 'milestone',
    milestoneType: 'physical',
    isOptional: false
  },
  {
    id: '24m-sentences',
    title: '2 Year Check: Two-Word Sentences',
    description: 'Child combines words into simple sentences',
    ageInMonths: 24,
    category: 'milestone',
    milestoneType: 'communication',
    isOptional: false
  },
  
  // 3 years
  {
    id: '36m-toilet-training',
    title: '3 Year Check: Toilet Training',
    description: 'Child shows readiness for toilet training',
    ageInMonths: 36,
    category: 'milestone',
    milestoneType: 'physical',
    isOptional: true
  },
  {
    id: '36m-conversations',
    title: '3 Year Check: Simple Conversations',
    description: 'Child can have simple back-and-forth conversations',
    ageInMonths: 36,
    category: 'milestone',
    milestoneType: 'communication',
    isOptional: false
  }
]