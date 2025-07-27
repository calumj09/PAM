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
    emoji: '🤱',
    encouragement: 'You\'re doing amazing! Every feed is building your bond together.'
  },
  {
    id: 'newborn-sleep',
    weekNumber: 2,
    monthsOld: 0,
    title: 'Sleep Patterns',
    description: 'Sleep cycles are still developing - lots of short sleeps are normal',
    type: 'physical',
    emoji: '😴',
    encouragement: 'Rest when baby rests. Your sleep matters too, mama.'
  },

  // Week 3-4
  {
    id: 'first-smiles',
    weekNumber: 4,
    monthsOld: 1,
    title: 'First Smiles',
    description: 'Those first social smiles might start appearing soon!',
    type: 'social',
    emoji: '😊',
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
    emoji: '💪',
    encouragement: 'Every little movement is progress. Celebrate these small wins!'
  },
  {
    id: 'maternal-health-checkup',
    weekNumber: 6,
    monthsOld: 1.5,
    title: 'Your 6-Week Check',
    description: 'Time for your postnatal check-up with your GP',
    type: 'care',
    emoji: '🩺',
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
    emoji: '🗣️',
    encouragement: 'Talk back to those sweet sounds - you\'re having your first conversations!'
  },
  {
    id: 'following-objects',
    weekNumber: 10,
    monthsOld: 2.5,
    title: 'Following Objects',
    description: 'Baby can track moving objects with their eyes',
    type: 'cognitive',
    emoji: '👀',
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
    emoji: '🙌',
    encouragement: 'Watching them discover their own body is pure magic.'
  },
  {
    id: 'rolling-attempts',
    weekNumber: 16,
    monthsOld: 4,
    title: 'Rolling Practice',
    description: 'Baby might start attempting to roll from back to side',
    type: 'physical',
    emoji: '🔄',
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
    emoji: '🪑',
    encouragement: 'Look at that strong little person growing before your eyes!'
  },
  {
    id: 'solid-foods-ready',
    weekNumber: 24,
    monthsOld: 6,
    title: 'Ready for Solids',
    description: 'Baby might be showing signs of readiness for first foods',
    type: 'development',
    emoji: '🥄',
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
    emoji: '🐛',
    encouragement: 'Every scoot and wiggle is preparing them for big adventures.'
  },
  {
    id: 'babbling',
    weekNumber: 32,
    monthsOld: 8,
    title: 'Babbling Begins',
    description: 'Repetitive babbling like "ba-ba-ba" or "da-da-da" starts',
    type: 'cognitive',
    emoji: '💬',
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
    emoji: '🚼',
    encouragement: 'Time to baby-proof! Your little explorer is on the move.'
  },
  {
    id: 'separation-anxiety',
    weekNumber: 40,
    monthsOld: 10,
    title: 'Separation Awareness',
    description: 'Baby might show signs of separation anxiety - this is normal development',
    type: 'social',
    emoji: '🤗',
    encouragement: 'Clingy phases show how much they love you. It\'s a sign of healthy attachment.'
  },
  {
    id: 'first-birthday',
    weekNumber: 52,
    monthsOld: 12,
    title: 'One Year Old!',
    description: 'What an incredible year of growth and development!',
    type: 'development',
    emoji: '🎂',
    encouragement: 'You\'ve both grown so much this year. Celebrate this amazing milestone!'
  }
];

export const getMilestoneForWeek = (weekNumber: number): MilestoneBubble | null => {
  return milestoneBubbles.find(milestone => milestone.weekNumber === weekNumber) || null;
};

export const getUpcomingMilestones = (currentWeek: number, lookAheadWeeks: number = 4): MilestoneBubble[] => {
  return milestoneBubbles.filter(milestone => 
    milestone.weekNumber > currentWeek && 
    milestone.weekNumber <= currentWeek + lookAheadWeeks
  );
};