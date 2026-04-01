/**
 * @subtaste/core - Type Exports
 */

// Archetype types
export type {
  Designation,
  Symbol,
  Glyph,
  Seal,
  Sigil, // deprecated alias for Seal
  CreativeMode,
  ArchetypePublic,
  ArchetypeClassification,
  SealReveal,
  SigilReveal // deprecated alias for SealReveal
} from './archetype';

export {
  ALL_DESIGNATIONS,
  ALL_SYMBOLS,
  GLYPH_TO_DESIGNATION,
  DESIGNATION_TO_GLYPH,
  DESIGNATION_TO_SYMBOL
} from './archetype';

// Genome types
export type {
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
  PerceptualSensitivity
} from './genome';

// Signal types
export type {
  SignalType,
  SignalSource,
  ExplicitKind,
  ImplicitKind,
  ExplicitSignal,
  ImplicitSignal,
  Signal,
  SignalEvent,
  SignalBatch
} from './signals';

export {
  isExplicitSignal,
  isImplicitSignal,
  SIGNAL_WEIGHTS
} from './signals';
