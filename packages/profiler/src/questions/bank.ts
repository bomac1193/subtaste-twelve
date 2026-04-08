/**
 * @subtaste/profiler - Question Bank
 *
 * Assessment questions with archetype weight mappings.
 * Uses binary and Likert formats as specified.
 */

import type { Designation } from '@subtaste/core';

/**
 * Question types
 */
export type QuestionType = 'binary' | 'likert' | 'ranking';

/**
 * Base question interface
 */
export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  category: 'core' | 'music' | 'creative' | 'social';
  archetypeWeights: Partial<Record<Designation, number>>;
}

/**
 * Binary question (A vs B)
 */
export interface BinaryQuestion extends Question {
  type: 'binary';
  options: [string, string];
  optionWeights: [Partial<Record<Designation, number>>, Partial<Record<Designation, number>>];
}

/**
 * Likert scale question
 */
export interface LikertQuestion extends Question {
  type: 'likert';
  scale: 5 | 7;
  lowLabel: string;
  highLabel: string;
}

/**
 * Ranking question
 */
export interface RankingQuestion extends Question {
  type: 'ranking';
  items: string[];
  itemWeights: Partial<Record<Designation, number>>[];
}

/**
 * INITIAL SPARK - 3 questions for onboarding
 * ~30 seconds, sufficient for primary Glyph assignment
 */
export const INITIAL_QUESTIONS: BinaryQuestion[] = [
  {
    id: 'init-1-approach',
    type: 'binary',
    prompt: 'When you find something good, you...',
    category: 'social',
    options: ['Keep it close', 'Spread the word'],
    archetypeWeights: {},
    optionWeights: [
      // Keep it close
      {
        'Ø': 0.7,      // VOID - receptive
        'P-7': 0.5,    // VAULT - archival
        'D-8': 0.3,    // WICK - channelling
        'L-3': 0.3,    // SILT - patient
        'H-6': -0.5    // TOLL - advocacy (opposite)
      },
      // Spread the word
      {
        'H-6': 0.8,    // TOLL - advocacy
        'R-10': 0.4,   // SCHISM - contrarian sharing
        'F-9': 0.3,    // ANVIL - manifestation
        'Ø': -0.5,     // VOID (opposite)
        'P-7': -0.3    // VAULT (opposite)
      }
    ]
  },
  {
    id: 'init-2-timing',
    type: 'binary',
    prompt: 'Your taste tends to be...',
    category: 'core',
    options: ['Ahead of its time', 'Refined within tradition'],
    archetypeWeights: {},
    optionWeights: [
      // Ahead of its time
      {
        'V-2': 0.8,    // OMEN - prophetic
        'R-10': 0.5,   // SCHISM - contrarian
        'S-0': 0.4,    // KETH - standard-setting
        'D-8': 0.3,    // WICK - channelling
        'P-7': -0.4    // VAULT (opposite)
      },
      // Refined within tradition
      {
        'P-7': 0.7,    // VAULT - archival
        'L-3': 0.5,    // SILT - patient cultivation
        'T-1': 0.4,    // STRATA - architectural
        'V-2': -0.3    // OMEN (opposite)
      }
    ]
  },
  {
    id: 'init-3-creation',
    type: 'binary',
    prompt: 'When creating, you prefer to...',
    category: 'creative',
    options: ['Build the structure first', 'Discover through doing'],
    archetypeWeights: {},
    optionWeights: [
      // Build the structure first
      {
        'T-1': 0.8,    // STRATA - architectural
        'F-9': 0.5,    // ANVIL - manifestation
        'C-4': 0.4,    // CULL - editorial
        'S-0': 0.3,    // KETH - visionary
        'D-8': -0.4    // WICK (opposite)
      },
      // Discover through doing
      {
        'D-8': 0.7,    // WICK - channelling
        'N-5': 0.5,    // LIMN - integrative
        'Ø': 0.4,      // VOID - receptive
        'V-2': 0.3,    // OMEN - prophetic
        'T-1': -0.3    // STRATA (opposite)
      }
    ]
  }
];

/**
 * MUSIC CALIBRATION - 3 questions triggered after 5 interactions
 * ~45 seconds, refines MUSIC dimensions
 */
export const MUSIC_CALIBRATION_QUESTIONS: (BinaryQuestion | LikertQuestion)[] = [
  {
    id: 'music-1-discovery',
    type: 'binary',
    prompt: 'A track you loved just got 50 million streams. You feel...',
    category: 'music',
    options: ['Validated, I knew it was good', 'Less interested, the magic fades'],
    archetypeWeights: {},
    optionWeights: [
      // Validated — calibration weights are intentionally low (nudge, not replace)
      {
        'H-6': 0.3,    // TOLL - advocacy
        'N-5': 0.2,    // LIMN - integrative
        'F-9': 0.15,   // ANVIL - manifestation
        'R-10': -0.2,  // SCHISM (opposite)
        'V-2': -0.1    // OMEN (opposite)
      },
      // Less interested
      {
        'V-2': 0.3,    // OMEN - prophetic
        'R-10': 0.25,  // SCHISM - contrarian
        'S-0': 0.2,    // KETH - standard-setting
        'H-6': -0.15,  // TOLL (opposite)
        'N-5': -0.1    // LIMN (opposite)
      }
    ]
  } as BinaryQuestion,
  {
    id: 'music-2-listening',
    type: 'binary',
    prompt: 'When an album drops, you...',
    category: 'music',
    options: ['Play it front to back, no skips', 'Jump to the tracks that grab you'],
    archetypeWeights: {},
    optionWeights: [
      // Front to back — calibration weights (gentle nudge)
      {
        'T-1': 0.3,    // STRATA - architectural
        'P-7': 0.25,   // VAULT - archival
        'L-3': 0.2,    // SILT - patient
        'Ø': 0.15,     // VOID - receptive
        'C-4': -0.15   // CULL (opposite)
      },
      // Jump to tracks
      {
        'C-4': 0.3,    // CULL - editorial
        'F-9': 0.2,    // ANVIL - decisive
        'D-8': 0.1,    // WICK - intuitive
        'P-7': -0.15,  // VAULT (opposite)
        'T-1': -0.1    // STRATA (opposite)
      }
    ]
  } as BinaryQuestion,
  {
    id: 'music-3-depth',
    type: 'binary',
    prompt: 'You would rather know...',
    category: 'music',
    options: ['Every song by 5 artists', 'One song each by 500 artists'],
    archetypeWeights: {},
    optionWeights: [
      // Deep (5 artists) — calibration weights (gentle nudge)
      {
        'P-7': 0.3,    // VAULT - archival depth
        'L-3': 0.25,   // SILT - patient cultivation
        'T-1': 0.2,    // STRATA - structural understanding
        'S-0': 0.1,    // KETH - mastery
        'H-6': -0.1    // TOLL (opposite)
      },
      // Wide (500 artists)
      {
        'V-2': 0.25,   // OMEN - scanning the horizon
        'N-5': 0.25,   // LIMN - integrative breadth
        'H-6': 0.2,    // TOLL - advocacy across range
        'D-8': 0.15,   // WICK - channelling many sources
        'P-7': -0.15   // VAULT (opposite)
      }
    ]
  } as BinaryQuestion
];

/**
 * DEEP CALIBRATION - On-demand extended assessment
 * ~2 minutes, unlocks confidence boost
 */
export const DEEP_CALIBRATION_QUESTIONS: (BinaryQuestion | LikertQuestion | RankingQuestion)[] = [
  {
    id: 'deep-1-role',
    type: 'ranking',
    prompt: 'Rank these roles by how naturally they fit you:',
    category: 'creative',
    items: [
      'The one who sets the standard',
      'The one who finds it first',
      'The one who shares it loudest',
      'The one who builds the collection',
      'The one who makes it real'
    ],
    archetypeWeights: {},
    itemWeights: [
      { 'S-0': 0.9 },   // sets standard → KETH
      { 'V-2': 0.9 },   // finds first → OMEN
      { 'H-6': 0.9 },   // shares loudest → TOLL
      { 'P-7': 0.9 },   // builds collection → VAULT
      { 'F-9': 0.9 }    // makes real → ANVIL
    ]
  } as RankingQuestion,
  {
    id: 'deep-2-curation',
    type: 'likert',
    prompt: 'When curating a playlist, less is more.',
    category: 'creative',
    scale: 5,
    lowLabel: 'Strongly disagree',
    highLabel: 'Strongly agree',
    archetypeWeights: {
      'C-4': 0.8,    // CULL - editorial
      'S-0': 0.5,    // KETH - standard-setting
      'P-7': -0.5,   // VAULT (opposite)
      'N-5': -0.3    // LIMN (opposite)
    }
  } as LikertQuestion,
  {
    id: 'deep-3-influence',
    type: 'binary',
    prompt: 'You would rather...',
    category: 'social',
    options: ['Shape culture quietly from the margins', 'Lead movements from the centre'],
    archetypeWeights: {},
    optionWeights: [
      // Margins
      {
        'D-8': 0.7,    // WICK
        'Ø': 0.6,      // VOID
        'L-3': 0.5,    // SILT
        'V-2': 0.4,    // OMEN
        'H-6': -0.5    // TOLL (opposite)
      },
      // Centre
      {
        'S-0': 0.7,    // KETH
        'H-6': 0.6,    // TOLL
        'F-9': 0.5,    // ANVIL
        'Ø': -0.5      // VOID (opposite)
      }
    ]
  } as BinaryQuestion,
  {
    id: 'deep-4-disagreement',
    type: 'likert',
    prompt: 'I enjoy having unpopular opinions about art.',
    category: 'core',
    scale: 5,
    lowLabel: 'Strongly disagree',
    highLabel: 'Strongly agree',
    archetypeWeights: {
      'R-10': 0.9,   // SCHISM
      'S-0': 0.5,    // KETH
      'C-4': 0.4,    // CULL
      'N-5': -0.5,   // LIMN (opposite)
      'L-3': -0.3    // SILT (opposite)
    }
  } as LikertQuestion,
  {
    id: 'deep-5-process',
    type: 'binary',
    prompt: 'The process of discovering matters more than what you find.',
    category: 'core',
    options: ['Agree', 'Disagree'],
    archetypeWeights: {},
    optionWeights: [
      // Agree (process)
      {
        'D-8': 0.7,    // WICK
        'V-2': 0.5,    // OMEN
        'Ø': 0.5,      // VOID
        'F-9': -0.4    // ANVIL (opposite)
      },
      // Disagree (outcome)
      {
        'F-9': 0.7,    // ANVIL
        'C-4': 0.5,    // CULL
        'S-0': 0.4,    // KETH
        'D-8': -0.3    // WICK (opposite)
      }
    ]
  } as BinaryQuestion
];

/**
 * Get all questions for a stage
 */
export function getQuestionsForStage(stage: 'initial' | 'music' | 'deep'): Question[] {
  switch (stage) {
    case 'initial':
      return INITIAL_QUESTIONS;
    case 'music':
      return MUSIC_CALIBRATION_QUESTIONS;
    case 'deep':
      return DEEP_CALIBRATION_QUESTIONS;
    default:
      return [];
  }
}

/**
 * Get a question by ID
 */
export function getQuestionById(id: string): Question | undefined {
  const allQuestions = [
    ...INITIAL_QUESTIONS,
    ...MUSIC_CALIBRATION_QUESTIONS,
    ...DEEP_CALIBRATION_QUESTIONS
  ];

  return allQuestions.find(q => q.id === id);
}
