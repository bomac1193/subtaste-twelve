/**
 * @subtaste/core/pantheon - THE TWELVE
 *
 * Public exports for the Pantheon.
 * Note: internal.ts is NOT exported here - import directly for server-side use only.
 */

// Public definitions
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
  getAllGlyphs
} from './definitions';

export type { ArchetypeDefinition } from './definitions';

// User-facing descriptions
export {
  ARCHETYPE_DESCRIPTIONS,
  getDescription,
  generateIdentityStatement
} from './descriptions';

export type { ArchetypeDescription } from './descriptions';
