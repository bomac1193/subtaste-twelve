/**
 * @subtaste/core/engine - Classification Engine Exports
 */

// Main classifier
export {
  classify,
  classifySignals,
  reclassify
} from './classifier';

export type {
  ClassificationInput,
  ClassificationResult
} from './classifier';

// Psychometrics
export {
  getDefaultPsychometrics,
  applyTraitDeltas,
  extractTraitDeltas,
  calculatePsychometricSimilarity,
  calculateAllSimilarities
} from './psychometrics';

export type { TraitDelta } from './psychometrics';

// Weights configuration
export {
  DEFAULT_SCORING_CONFIG,
  CONTEXT_WEIGHTS,
  mergeConfig,
  getContextConfig
} from './weights';

export type { ScoringConfig } from './weights';

// Motivation engine
export {
  getDefaultMotivation,
  extractMotivationDeltas,
  applyMotivationDeltas,
  getPrimaryMotivation
} from './motivation';

// Social dynamics engine
export {
  getDefaultSocial,
  extractSocialDeltas,
  applySocialDeltas,
  getDominantRole
} from './social';

// Perceptual sensitivity engine
export {
  getDefaultSensitivity,
  updateSensitivityFromTraining,
  isSensitivityReliable
} from './sensitivity';

export type { TrainingSubmission } from './sensitivity';
