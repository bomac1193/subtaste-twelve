/**
 * @subtaste/profiler - Motivation & Social Dynamics Question Bank
 *
 * 5 questions total: 3 motivation + 2 social dynamics
 * All binary choice format for fast completion (~60s)
 */

export interface MotivationQuestion {
  id: string;
  prompt: string;
  options: [string, string];
  weights: [MotivationWeights, MotivationWeights];
}

export interface MotivationWeights {
  // Motivation dimensions
  expression?: number;
  connection?: number;
  mastery?: number;
  discovery?: number;
  identity?: number;
  // Social dimensions
  tastemaker?: number;
  consumer?: number;
  contrarian?: number;
  bridger?: number;
}

/**
 * Motivation questions (3)
 * These capture the primary WHY behind creative taste
 */
export const MOTIVATION_QUESTIONS: MotivationQuestion[] = [
  {
    id: 'drive-1-create',
    prompt: 'When you create something, what matters most?',
    options: [
      'That it\'s exactly right',
      'That it reaches people'
    ],
    weights: [
      { mastery: 0.8, identity: 0.3 },
      { connection: 0.8, expression: 0.3 }
    ]
  },
  {
    id: 'drive-2-explore',
    prompt: 'What pulls you to explore new music, art, or ideas?',
    options: [
      'I want to find what no one else has found',
      'I want to understand how it all connects'
    ],
    weights: [
      { discovery: 0.8, identity: 0.4, contrarian: 0.3 },
      { mastery: 0.6, bridger: 0.4, discovery: 0.3 }
    ]
  },
  {
    id: 'drive-3-popular',
    prompt: 'When something you love becomes popular, you...',
    options: [
      'Feel validated — your taste was ahead',
      'Lose interest — move to what\'s next'
    ],
    weights: [
      { tastemaker: 0.7, identity: 0.4 },
      { contrarian: 0.8, discovery: 0.4 }
    ]
  }
];

/**
 * Social dynamics questions (2)
 * These capture HOW taste behaves in social contexts
 */
export const SOCIAL_QUESTIONS: MotivationQuestion[] = [
  {
    id: 'social-1-audience',
    prompt: 'Your creative work is...',
    options: [
      'For yourself first, audience second',
      'Incomplete without an audience'
    ],
    weights: [
      { expression: 0.7, contrarian: 0.3 },
      { connection: 0.7, tastemaker: 0.3 }
    ]
  },
  {
    id: 'social-2-group',
    prompt: 'In a group setting, your taste usually...',
    options: [
      'Sets the direction — people follow your picks',
      'Finds the bridge — you connect different worlds'
    ],
    weights: [
      { tastemaker: 0.8, identity: 0.2 },
      { bridger: 0.8, discovery: 0.2 }
    ]
  }
];

/**
 * All drive & dynamics questions in order
 */
export const ALL_DRIVE_QUESTIONS: MotivationQuestion[] = [
  ...MOTIVATION_QUESTIONS,
  ...SOCIAL_QUESTIONS
];
