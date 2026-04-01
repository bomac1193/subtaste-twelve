/**
 * @subtaste/core - Archetype Type Definitions
 *
 * THE TWELVE carry three registers of identity:
 * - Symbol: Mathematical operator (structural, functional meaning)
 * - Glyph: The spoken name (public, identity, what users claim)
 * - Seal: Operative phrase (revealed on request, proverbial)
 *
 * Internal designation keys (S-0, T-1, etc.) are preserved for
 * database compatibility. Symbol is the user-facing display form.
 */

export type Designation =
  | 'S-0' | 'T-1' | 'V-2' | 'L-3' | 'C-4' | 'N-5'
  | 'H-6' | 'P-7' | 'D-8' | 'F-9' | 'R-10' | 'Ø';

export type Symbol =
  | 'Θ' | 'Σ' | 'Δ' | 'Λ' | 'Ξ' | '∇'
  | 'Φ' | 'Ω' | 'Ψ' | 'Π' | 'Γ' | 'Ø';

export type Glyph =
  | 'KETH' | 'STRATA' | 'OMEN' | 'SILT' | 'CULL' | 'LIMN'
  | 'TOLL' | 'VAULT' | 'WICK' | 'ANVIL' | 'SCHISM' | 'VOID';

export type Seal =
  | 'The throne that does not announce'
  | 'Layer beneath layer beneath layer'
  | 'What arrives before itself'
  | 'What accumulates in darkness'
  | 'The necessary cut'
  | 'The edge that reveals'
  | 'The bell that cannot be unheard'
  | 'Writing over writing over writing'
  | 'The hollow channel'
  | 'Where pressure becomes form'
  | 'What breaks to reveal grain'
  | 'What receives by containing nothing';

/** @deprecated Use Seal instead */
export type Sigil = Seal;

export type CreativeMode =
  | 'Visionary' | 'Architectural' | 'Prophetic' | 'Developmental'
  | 'Editorial' | 'Integrative' | 'Advocacy' | 'Archival'
  | 'Channelling' | 'Manifestation' | 'Contrarian' | 'Receptive';

/**
 * PUBLIC - Safe to expose to clients
 * This is what users see after classification
 */
export interface ArchetypePublic {
  designation: Designation;
  symbol: Symbol;
  glyph: Glyph;
  seal: Seal;
  essence: string;
  creativeMode: CreativeMode;
  shadow: string;
  recogniseBy: string;
  /** @deprecated Use seal instead */
  sigil?: Seal;
}

/**
 * Archetype classification result for a user
 */
export interface ArchetypeClassification {
  primary: {
    designation: Designation;
    glyph: Glyph;
    confidence: number;
  };
  secondary: {
    designation: Designation;
    glyph: Glyph;
    confidence: number;
  } | null;
  distribution: Record<Designation, number>;
}

/**
 * Seal reveal status tracking
 */
export interface SealReveal {
  revealed: boolean;
  revealedAt: Date | null;
  seal: Seal | null;
}

/** @deprecated Use SealReveal instead */
export type SigilReveal = SealReveal;

/**
 * All 12 designations for iteration
 */
export const ALL_DESIGNATIONS: readonly Designation[] = [
  'S-0', 'T-1', 'V-2', 'L-3', 'C-4', 'N-5',
  'H-6', 'P-7', 'D-8', 'F-9', 'R-10', 'Ø'
] as const;

/**
 * All 12 symbols for iteration
 */
export const ALL_SYMBOLS: readonly Symbol[] = [
  'Θ', 'Σ', 'Δ', 'Λ', 'Ξ', '∇',
  'Φ', 'Ω', 'Ψ', 'Π', 'Γ', 'Ø'
] as const;

/**
 * Mapping from Glyph to Designation
 */
export const GLYPH_TO_DESIGNATION: Record<Glyph, Designation> = {
  'KETH': 'S-0',
  'STRATA': 'T-1',
  'OMEN': 'V-2',
  'SILT': 'L-3',
  'CULL': 'C-4',
  'LIMN': 'N-5',
  'TOLL': 'H-6',
  'VAULT': 'P-7',
  'WICK': 'D-8',
  'ANVIL': 'F-9',
  'SCHISM': 'R-10',
  'VOID': 'Ø'
} as const;

/**
 * Mapping from Designation to Glyph
 */
export const DESIGNATION_TO_GLYPH: Record<Designation, Glyph> = {
  'S-0': 'KETH',
  'T-1': 'STRATA',
  'V-2': 'OMEN',
  'L-3': 'SILT',
  'C-4': 'CULL',
  'N-5': 'LIMN',
  'H-6': 'TOLL',
  'P-7': 'VAULT',
  'D-8': 'WICK',
  'F-9': 'ANVIL',
  'R-10': 'SCHISM',
  'Ø': 'VOID'
} as const;

/**
 * Mapping from Designation to Symbol
 */
export const DESIGNATION_TO_SYMBOL: Record<Designation, Symbol> = {
  'S-0': 'Θ',
  'T-1': 'Σ',
  'V-2': 'Δ',
  'L-3': 'Λ',
  'C-4': 'Ξ',
  'N-5': '∇',
  'H-6': 'Φ',
  'P-7': 'Ω',
  'D-8': 'Ψ',
  'F-9': 'Π',
  'R-10': 'Γ',
  'Ø': 'Ø'
} as const;
