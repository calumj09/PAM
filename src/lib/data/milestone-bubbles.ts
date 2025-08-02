// "What to expect" milestone bubbles for weekly timeline
// Based on Australian early childhood development milestones

export interface MilestoneBubble {
  id: string;
  weekNumber: number;
  monthsOld: number;
  title: string;
  description: string;
  type: 'development' | 'physical' | 'social' | 'cognitive' | 'care';
  emoji: string;
  encouragement: string; // Gentle, supportive message for mums
}

export const milestoneBubbles: MilestoneBubble[] = [
  // Newborn - Week 1-2
  {
    id: 'newborn-feeding',
    weekNumber: 1,
    monthsOld: 0,
    title: 'Feeding & Bonding',
    description: 'Baby is learning to feed and beginning to bond with you',
    type: 'care',
    emoji: '',
    encouragement: 'You\'re doing amazing! Every feed is building your bond together.'
  },
  {
    id: 'newborn-sleep',
    weekNumber: 2,
    monthsOld: 0,
    title: 'Sleep Patterns',
    description: 'Sleep cycles are still developing - lots of short sleeps are normal',
    type: 'physical',
    emoji: '',
    encouragement: 'Rest when baby rests. Your sleep matters too.'
  },

  // Week 3-4
  {
    id: 'first-smiles',
    weekNumber: 4,
    monthsOld: 1,
    title: 'First Smiles',
    description: 'Those first social smiles might start appearing soon!',
    type: 'social',
    emoji: '',
    encouragement: 'Those precious first smiles are worth all the sleepless nights.'
  },

  // 6-8 weeks
  {
    id: 'head-control',
    weekNumber: 6,
    monthsOld: 1.5,
    title: 'Head Control',
    description: 'Baby is starting to lift their head during tummy time',
    type: 'physical',
    emoji: '',
    encouragement: 'Every little movement is progress. Celebrate these small wins!'
  },
  {
    id: 'maternal-health-checkup',
    weekNumber: 6,
    monthsOld: 1.5,
    title: 'Your 6-Week Check',
    description: 'Time for your postnatal check-up with your GP',
    type: 'care',
    emoji: '',
    encouragement: 'Taking care of yourself is taking care of your baby too.'
  },

  // 2-3 months
  {
    id: 'cooing-sounds',
    weekNumber: 8,
    monthsOld: 2,
    title: 'Cooing & Gurgling',
    description: 'Baby might start making cute cooing and gurgling sounds',
    type: 'cognitive',
    emoji: '',
    encouragement: 'Talk back to those sweet sounds - you\'re having your first conversations!'
  },
  {
    id: 'following-objects',
    weekNumber: 10,
    monthsOld: 2.5,
    title: 'Following Objects',
    description: 'Baby can track moving objects with their eyes',
    type: 'cognitive',
    emoji: '',
    encouragement: 'Those little eyes are taking in your whole world.'
  },

  // 3-4 months
  {
    id: 'hand-discovery',
    weekNumber: 12,
    monthsOld: 3,
    title: 'Hand Discovery',
    description: 'Baby discovers their hands and might start bringing them together',
    type: 'physical',
    emoji: '',
    encouragement: 'Watching them discover their own body is pure magic.'
  },
  {
    id: 'rolling-attempts',
    weekNumber: 16,
    monthsOld: 4,
    title: 'Rolling Practice',
    description: 'Baby might start attempting to roll from back to side',
    type: 'physical',
    emoji: '',
    encouragement: 'Every wobble and attempt is building those important muscles.'
  },

  // 4-6 months
  {
    id: 'sitting-support',
    weekNumber: 20,
    monthsOld: 5,
    title: 'Sitting with Support',
    description: 'Baby can sit upright when supported and hold their head steady',
    type: 'physical',
    emoji: '',
    encouragement: 'Look at that strong little person growing before your eyes!'
  },
  {
    id: 'solid-foods-ready',
    weekNumber: 24,
    monthsOld: 6,
    title: 'Ready for Solids',
    description: 'Baby might be showing signs of readiness for first foods',
    type: 'development',
    emoji: '',
    encouragement: 'Starting solids is exciting and messy - embrace the adventure!'
  },

  // 6-9 months
  {
    id: 'crawling-preparation',
    weekNumber: 28,
    monthsOld: 7,
    title: 'Pre-Crawling Moves',
    description: 'Baby might be rocking on hands and knees or shuffling',
    type: 'physical',
    emoji: '',
    encouragement: 'Every scoot and wiggle is preparing them for big adventures.'
  },
  {
    id: 'babbling',
    weekNumber: 32,
    monthsOld: 8,
    title: 'Babbling Begins',
    description: 'Repetitive babbling like "ba-ba-ba" or "da-da-da" starts',
    type: 'cognitive',
    emoji: '',
    encouragement: 'Those babbles are the building blocks of their first words!'
  },

  // 9-12 months
  {
    id: 'crawling-mobile',
    weekNumber: 36,
    monthsOld: 9,
    title: 'Getting Mobile',
    description: 'Baby might be crawling, bottom shuffling, or cruising',
    type: 'physical',
    emoji: '',
    encouragement: 'Time to baby-proof! Your little explorer is on the move.'
  },
  {
    id: 'separation-anxiety',
    weekNumber: 40,
    monthsOld: 10,
    title: 'Separation Awareness',
    description: 'Baby might show signs of separation anxiety - this is normal development',
    type: 'social',
    emoji: '',
    encouragement: 'Clingy phases show how much they love you. It\'s a sign of healthy attachment.'
  },
  {
    id: 'first-birthday',
    weekNumber: 52,
    monthsOld: 12,
    title: 'One Year Old!',
    description: 'What an incredible year of growth and development!',
    type: 'development',
    emoji: '',
    encouragement: 'You\'ve both grown so much this year. Celebrate this amazing milestone!'
  },

  // Toddler milestones (13-24 months)
  {
    id: 'first-words',
    weekNumber: 56,
    monthsOld: 13,
    title: 'First Words',
    description: 'Meaningful words like "parent", "dada", or favourite objects might emerge',
    type: 'cognitive',
    emoji: '',
    encouragement: 'Every word is a celebration! They\'re finding their voice.'
  },
  {
    id: 'walking-steps',
    weekNumber: 60,
    monthsOld: 14,
    title: 'First Steps',
    description: 'Independent walking might start - every child walks when they\'re ready',
    type: 'physical',
    emoji: '',
    encouragement: 'Those wobbly first steps are the beginning of a lifetime of adventures!'
  },
  {
    id: 'pointing-communicating',
    weekNumber: 64,
    monthsOld: 15,
    title: 'Pointing & Gesturing',
    description: 'Pointing to show you things they want or find interesting',
    type: 'social',
    emoji: '',
    encouragement: 'They\'re sharing their world with you - what a special connection!'
  },
  {
    id: 'pretend-play',
    weekNumber: 72,
    monthsOld: 18,
    title: 'Pretend Play',
    description: 'Imaginative play like feeding dolls or talking on toy phones',
    type: 'cognitive',
    emoji: '',
    encouragement: 'Their imagination is blossoming - nurture that creativity!'
  },
  {
    id: 'running-climbing',
    weekNumber: 80,
    monthsOld: 20,
    title: 'Running & Climbing',
    description: 'More confident movement - running, climbing, exploring',
    type: 'physical',
    emoji: '',
    encouragement: 'Your little athlete is discovering what their body can do!'
  },
  {
    id: 'two-word-phrases',
    weekNumber: 88,
    monthsOld: 22,
    title: 'Two-Word Phrases',
    description: 'Combining words like "more milk" or "daddy go"',
    type: 'cognitive',
    emoji: '',
    encouragement: 'They\'re building the foundation for conversations with you!'
  },
  {
    id: 'second-birthday',
    weekNumber: 104,
    monthsOld: 24,
    title: 'Two Years Old!',
    description: 'Your toddler has grown so much - celebrating two amazing years!',
    type: 'development',
    emoji: '',
    encouragement: 'Two years of love, growth, and precious memories. You\'re doing amazing!'
  },

  // Older toddler milestones (2-3 years)
  {
    id: 'potty-training',
    weekNumber: 120,
    monthsOld: 30,
    title: 'Potty Training Readiness',
    description: 'Signs of readiness for toilet training might appear',
    type: 'development',
    emoji: '',
    encouragement: 'Every child is ready in their own time. No pressure, just follow their lead!'
  },
  {
    id: 'playing-with-others',
    weekNumber: 130,
    monthsOld: 32,
    title: 'Social Play',
    description: 'Beginning to play alongside other children and share',
    type: 'social',
    emoji: '',
    encouragement: 'Watching them make friends is one of parenting\'s greatest joys!'
  },
  {
    id: 'independence-growing',
    weekNumber: 140,
    monthsOld: 34,
    title: 'Growing Independence',
    description: 'Wanting to do things "by myself" - a sign of healthy development',
    type: 'development',
    emoji: '',
    encouragement: 'Their independence is growing, but they\'ll always need your love and guidance!'
  },
  {
    id: 'third-birthday',
    weekNumber: 156,
    monthsOld: 36,
    title: 'Three Years Old!',
    description: 'Your little one has become such a unique person with their own personality!',
    type: 'development',
    emoji: '',
    encouragement: 'Three years of watching them grow into who they\'re meant to be. What a privilege!'
  }
];

export const getMilestoneForWeek = (weekNumber: number): MilestoneBubble | null => {
  // First try exact match
  const exactMatch = milestoneBubbles.find(milestone => milestone.weekNumber === weekNumber);
  if (exactMatch) return exactMatch;
  
  // If no exact match, try to find a milestone within ±2 weeks
  const nearbyMilestone = milestoneBubbles.find(milestone => 
    Math.abs(milestone.weekNumber - weekNumber) <= 2 && milestone.weekNumber <= weekNumber
  );
  
  return nearbyMilestone || null;
};

export const getUpcomingMilestones = (currentWeek: number, lookAheadWeeks: number = 4): MilestoneBubble[] => {
  return milestoneBubbles.filter(milestone => 
    milestone.weekNumber > currentWeek && 
    milestone.weekNumber <= currentWeek + lookAheadWeeks
  );
};

export const getRecentMilestones = (currentWeek: number, lookBackWeeks: number = 4): MilestoneBubble[] => {
  return milestoneBubbles.filter(milestone => 
    milestone.weekNumber < currentWeek && 
    milestone.weekNumber >= currentWeek - lookBackWeeks
  );
};