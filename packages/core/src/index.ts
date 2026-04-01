/**
 * @subtaste/core
 *
 * Unified taste genome infrastructure for the VIOLET SPHINX ecosystem.
 *
 * THE TWELVE carry three registers of identity:
 * - Symbol: Mathematical operator (Θ, Σ, Δ...) - structural, functional
 * - Glyph: The spoken name (Keth, Strata, Omen...) - public identity
 * - Seal: Operative phrase - proverbial, revealed on request
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Archetype types
  Designation,
  Symbol,
  Glyph,
  Seal,
  Sigil, // deprecated alias
  CreativeMode,
  ArchetypePublic,
  ArchetypeClassification,
  SealReveal,
  SigilReveal, // deprecated alias

  // Genome types
  OpennessFacets,
  MusicPreferences,
  Psychometrics,
  ContextProfile,
  Domain,
  TasteGenome,
  TasteGenomePublic,
  GenomeCreateInput,
  GenomeUpdateInput,
  HexagramReading,
  KeywordScores,
  Gamification,
  SubtasteContext,
  MotivationProfile,
  SocialRole,
  SocialProfile,
  PerceptualSensitivity,

  // Signal types
  SignalType,
  SignalSource,
  ExplicitKind,
  ImplicitKind,
  ExplicitSignal,
  ImplicitSignal,
  Signal,
  SignalEvent,
  SignalBatch
} from './types';

export {
  ALL_DESIGNATIONS,
  ALL_SYMBOLS,
  GLYPH_TO_DESIGNATION,
  DESIGNATION_TO_GLYPH,
  DESIGNATION_TO_SYMBOL,
  isExplicitSignal,
  isImplicitSignal,
  SIGNAL_WEIGHTS
} from './types';

// ============================================================================
// PANTHEON
// ============================================================================

export {
  PANTHEON,
  getArchetype,
  getArchetypeByGlyph,
  getArchetypeBySeal,
  getArchetypeBySigil, // deprecated alias
  toGlyph,
  toDesignation,
  toSymbol,
  toSeal,
  toSigil, // deprecated alias
  getAllDesignations,
  getAllGlyphs,
  ARCHETYPE_DESCRIPTIONS,
  getDescription,
  generateIdentityStatement
} from './pantheon';

export type {
  ArchetypeDefinition,
  ArchetypeDescription
} from './pantheon';

// ============================================================================
// ENGINE
// ============================================================================

export {
  classify,
  classifySignals,
  reclassify,
  getDefaultPsychometrics,
  applyTraitDeltas,
  extractTraitDeltas,
  calculatePsychometricSimilarity,
  calculateAllSimilarities,
  DEFAULT_SCORING_CONFIG,
  CONTEXT_WEIGHTS,
  mergeConfig,
  getContextConfig,
  // Motivation engine
  getDefaultMotivation,
  extractMotivationDeltas,
  applyMotivationDeltas,
  getPrimaryMotivation,
  // Social dynamics engine
  getDefaultSocial,
  extractSocialDeltas,
  applySocialDeltas,
  getDominantRole,
  // Perceptual sensitivity engine
  getDefaultSensitivity,
  updateSensitivityFromTraining,
  isSensitivityReliable
} from './engine';

export type {
  ClassificationInput,
  ClassificationResult,
  TraitDelta,
  ScoringConfig,
  TrainingSubmission
} from './engine';

// ============================================================================
// GENOME
// ============================================================================

export {
  generateGenomeId,
  createGenome,
  toPublicGenome,
  revealSigil,
  getPrimarySigil,
  incrementVersion,
  validateGenome,
  serializeGenome,
  deserializeGenome,
  encodeSignalsToGenome,
  updateGenomeWithSignals,
  mergeGenomes,
  calculateGenomeSimilarity,
  needsRecalibration,
  applyTemporalDecay,
  detectPreferenceDrift,
  calculateHistoricalConfidence,
  pruneSignalHistory,
  calculateTasteStability,
  evolveGenome,
  DEFAULT_EVOLUTION_CONFIG
} from './genome';

export type { EvolutionConfig } from './genome';

// ============================================================================
// CONTEXT
// ============================================================================

export {
  createContextProfile,
  getOrCreateContext,
  updateContext,
  getContextualDistribution,
  getContextualPrimary,
  detectContext,
  getActiveContexts
} from './context';

export type { StandardContext, ContextDetection } from './context';

// ============================================================================
// I-CHING
// ============================================================================

export {
  findHexagram,
  getHexagram,
  getAllHexagrams,
  deriveHexagramReading,
  toPublicHexagram
} from './iching';

export type { Hexagram } from './iching';

// ============================================================================
// KEYWORDS
// ============================================================================

// ============================================================================
// FRACTAL TOPOLOGY (Eglash)
// ============================================================================

export {
  FRACTAL_COORDINATES,
  computeCompatibility,
  analyzeTeam,
  distributionEntropy,
  profileSharpness,
  crossDomainCoherence,
  kuramotoOrderParameter
} from './engine/fractal-topology';

export type {
  FractalCoordinate,
  CompatibilityResult,
  TeamAnalysis
} from './engine/fractal-topology';

// ============================================================================
// KEYWORDS
// ============================================================================

export {
  categorizeKeywords,
  updateKeywordScores,
  getTopKeywords,
  getAttractedKeywords,
  getRepelledKeywords,
  mergeKeywordScores,
  getKeywordStats
} from './engine/keywords';
