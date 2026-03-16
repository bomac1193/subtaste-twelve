/**
 * @subtaste/core - TasteGenome Type Definitions
 *
 * The TasteGenome is the complete taste profile for a user.
 * It contains public, semi-private, and engine-only layers.
 */

import type { Designation, Glyph, Sigil, ArchetypeClassification } from './archetype';
import type { SignalEvent } from './signals';

/**
 * Big Five Openness sub-facets
 * These are the strongest predictors of creative preferences
 */
export interface OpennessFacets {
  fantasy: number;      // Imagination and daydreaming
  aesthetics: number;   // Appreciation of art and beauty
  feelings: number;     // Receptiveness to inner feelings
  actions: number;      // Willingness to try new activities
  ideas: number;        // Intellectual curiosity
  values: number;       // Readiness to re-examine values
}

/**
 * MUSIC model dimensions
 * Music preference dimensions from research
 */
export interface MusicPreferences {
  mellow: number;        // Slow, quiet, romantic
  unpretentious: number; // Percussive, conventional
  sophisticated: number; // Complex, instrumental
  intense: number;       // Distorted, loud, aggressive
  contemporary: number;  // Rhythmic, electronic, urban
}

/**
 * Psychometric profile - hidden engine layer
 */
export interface Psychometrics {
  openness: OpennessFacets;
  intellect: number;
  musicPreferences: MusicPreferences;
}

/**
 * Context-specific profile (Spotify-style vectors)
 */
export interface ContextProfile {
  id: string;
  label: 'Creating' | 'Consuming' | 'Curating' | string;
  archetypeShift: Partial<Record<Designation, number>>;
  lastActive: Date;
}

/**
 * Domain for cross-modal scoring
 */
export type Domain = 'music' | 'visual' | 'textual' | 'spatial';

/**
 * I-Ching hexagram information
 */
export interface HexagramReading {
  present: {
    number: number;
    name: string;
    chinese: string;
    judgment: string;
  };
  transforming?: {
    number: number;
    name: string;
    chinese: string;
    judgment: string;
  };
  movingLines: number[];
}

/**
 * Keyword scores for visual and content categories
 */
export interface KeywordScores {
  visual: Record<string, { score: number; count: number }>;
  content: Record<string, { score: number; count: number }>;
}

/**
 * Gamification tracking
 */
export interface Gamification {
  xp: number;
  tier: number;
  achievements: string[];
  streak: number;
  totalTrainings: number;
}

/**
 * Subtaste context enrichment from Boveda
 */
export interface SubtasteContext {
  phase: 'genesis' | 'vision' | 'refinement' | 'manifestation' | 'flow';
  wuXingElement: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  growthTarget: Designation;
  stressTarget: Designation;
}

/**
 * Motivation profile — WHY someone creates/consumes
 * Populated via 3 explicit questions + behavioral inference from signals
 */
export interface MotivationProfile {
  expression: number;    // 0-1: creating to get something OUT
  connection: number;    // 0-1: creating to REACH others
  mastery: number;       // 0-1: technical excellence drive
  discovery: number;     // 0-1: finding/exploring new things
  identity: number;      // 0-1: defining self through taste
}

/**
 * Social taste dynamics — HOW taste behaves around others
 * Populated via 2 explicit questions + primarily behavioral inference
 */
export type SocialRole = 'tastemaker' | 'consumer' | 'contrarian' | 'bridger';

export interface SocialProfile {
  role: SocialRole;
  tastemaker: number;    // 0-1: sets direction others follow
  consumer: number;      // 0-1: absorbs culture
  contrarian: number;    // 0-1: defines self against mainstream
  bridger: number;       // 0-1: cross-pollinates between scenes
}

/**
 * Perceptual sensitivity — HOW MUCH someone notices
 * Purely behavioral — measured from training card responses, never asked
 */
export interface PerceptualSensitivity {
  overall: number;        // 0-1: composite sensitivity score
  consistency: number;    // 0-1: consistent choices across similar stimuli
  discrimination: number; // 0-1: distinguishes subtle differences
  responseSpeed: number;  // 0-1: normalized speed consistency (not raw speed)
  sampleSize: number;     // training cards that contributed to this score
}

/**
 * Full TasteGenome structure
 */
export interface TasteGenome {
  // Identity
  id: string;
  userId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;

  // PUBLIC LAYER - visible to user
  archetype: ArchetypeClassification;

  // SIGIL LAYER - revealed on request
  formal: {
    primarySigil: Sigil;
    secondarySigil: Sigil | null;
    revealed: boolean;
    revealedAt: Date | null;
  };

  // HIDDEN LAYER - powers the engine, never exposed to client
  _engine: {
    psychometrics: Psychometrics;
    sephiroticBalance: Record<string, number>;
    orishaResonance: {
      primary: string;
      shadow: string;
    };
  };

  // BEHAVIOURAL LAYER - evolves over time
  behaviour: {
    contexts: Record<string, ContextProfile>;
    signalHistory: SignalEvent[];
    confidence: number;
    lastCalibration: Date;
  };

  // CROSS-MODAL
  crossModal: {
    tasteTypicality: number;
    domainStrengths: Record<Domain, number>;
  };

  // PERSONALITY AXES (from Boveda)
  axes?: {
    orderChaos: number;          // 0-1
    mercyRuthlessness: number;   // 0-1
    introvertExtrovert: number;  // 0-1
    faithDoubt: number;          // 0-1
  };

  // I-CHING HEXAGRAM READING
  iching?: HexagramReading;

  // KEYWORD LEARNING (from Slayt)
  keywords?: KeywordScores;

  // GAMIFICATION
  gamification?: Gamification;

  // SUBTASTE CONTEXT (from Boveda enrichment)
  subtasteContext?: SubtasteContext;

  // MOTIVATION - why they create/consume
  motivation?: MotivationProfile;

  // SOCIAL DYNAMICS - how taste behaves around others
  socialDynamics?: SocialProfile;

  // PERCEPTUAL SENSITIVITY - how much they notice (behavioral only)
  perceptualSensitivity?: PerceptualSensitivity;
}

/**
 * Public-safe genome representation
 * This is what gets sent to the client
 */
export interface TasteGenomePublic {
  id: string;
  userId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  archetype: ArchetypeClassification;
  formal: {
    primarySigil: Sigil | null;
    secondarySigil: Sigil | null;
    revealed: boolean;
  };
  confidence: number;
  tasteTypicality: number;
  keywords?: KeywordScores;
  gamification?: GamificationState;
  behaviour?: BehaviourProfile;
  motivation?: MotivationProfile;
  socialDynamics?: SocialProfile;
  perceptualSensitivity?: { overall: number };
}

/**
 * Genome creation input
 */
export interface GenomeCreateInput {
  userId: string;
  signals: SignalEvent[];
}

/**
 * Genome update input
 */
export interface GenomeUpdateInput {
  genomeId: string;
  signals: SignalEvent[];
  recalculate?: boolean;
}
