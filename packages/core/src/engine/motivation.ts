/**
 * @subtaste/core - Motivation Engine
 *
 * Profiles WHY someone creates/consumes.
 * Populated via explicit questions (3) + behavioral inference from signals.
 *
 * Five motivation dimensions:
 * - Expression: creating to get something OUT
 * - Connection: creating to REACH others
 * - Mastery: technical excellence drive
 * - Discovery: finding/exploring new things
 * - Identity: defining self through taste
 */

import type {
  Designation,
  MotivationProfile,
  Signal
} from '../types';
import { isExplicitSignal, isImplicitSignal } from '../types';

/**
 * Archetype-to-motivation mapping
 * When signals weight toward certain archetypes, those archetypes
 * imply certain motivations
 */
const ARCHETYPE_MOTIVATION_MAP: Record<Designation, Partial<MotivationProfile>> = {
  // Genesis archetypes → expression
  'F-9': { expression: 0.7, mastery: 0.3 },
  'R-10': { expression: 0.6, identity: 0.4 },

  // Vision archetypes → identity
  'S-0': { identity: 0.7, mastery: 0.3 },
  'V-2': { identity: 0.5, discovery: 0.5 },

  // Refinement archetypes → mastery
  'T-1': { mastery: 0.8, identity: 0.2 },
  'C-4': { mastery: 0.6, identity: 0.4 },

  // Manifestation archetypes → connection
  'L-3': { connection: 0.5, mastery: 0.3, identity: 0.2 },
  'H-6': { connection: 0.7, expression: 0.3 },

  // Flow archetypes → discovery
  'N-5': { discovery: 0.6, connection: 0.4 },
  'D-8': { discovery: 0.7, expression: 0.3 },
  'P-7': { discovery: 0.5, mastery: 0.3, identity: 0.2 },
  'Ø': { discovery: 0.6, identity: 0.4 }
};

/**
 * Default motivation profile (neutral starting point)
 */
export function getDefaultMotivation(): MotivationProfile {
  return {
    expression: 0.5,
    connection: 0.5,
    mastery: 0.5,
    discovery: 0.5,
    identity: 0.5
  };
}

/**
 * Extract motivation deltas from signals
 * Infers motivation from both implicit behavior and explicit archetype weights
 */
export function extractMotivationDeltas(signals: Signal[]): Partial<MotivationProfile> {
  const deltas: MotivationProfile = {
    expression: 0,
    connection: 0,
    mastery: 0,
    discovery: 0,
    identity: 0
  };

  for (const signal of signals) {
    // Implicit behavioral signals → motivation inference
    if (isImplicitSignal(signal.data)) {
      const kind = signal.data.kind;

      switch (kind) {
        case 'share':
          deltas.connection += 0.1;
          deltas.expression += 0.05;
          break;
        case 'save':
          deltas.identity += 0.1;
          deltas.discovery += 0.05;
          break;
        case 'repeat':
          deltas.mastery += 0.1;
          break;
        case 'skip':
          deltas.discovery += 0.05; // filtering = searching
          break;
        case 'click':
          deltas.discovery += 0.03;
          break;
        case 'dwell':
          deltas.mastery += 0.05;
          deltas.identity += 0.03;
          break;
      }
    }

    // Explicit signals with archetype weights → motivation mapping
    if (isExplicitSignal(signal.data) && signal.data.archetypeWeights) {
      for (const [designation, weight] of Object.entries(signal.data.archetypeWeights)) {
        const mapping = ARCHETYPE_MOTIVATION_MAP[designation as Designation];
        if (!mapping || weight <= 0) continue;

        const scale = weight * 0.05; // Small increments
        for (const [dim, strength] of Object.entries(mapping)) {
          deltas[dim as keyof MotivationProfile] += strength * scale;
        }
      }
    }
  }

  return deltas;
}

/**
 * Apply motivation deltas to a profile
 */
export function applyMotivationDeltas(
  base: MotivationProfile,
  deltas: Partial<MotivationProfile>
): MotivationProfile {
  return {
    expression: clamp(base.expression + (deltas.expression || 0), 0, 1),
    connection: clamp(base.connection + (deltas.connection || 0), 0, 1),
    mastery: clamp(base.mastery + (deltas.mastery || 0), 0, 1),
    discovery: clamp(base.discovery + (deltas.discovery || 0), 0, 1),
    identity: clamp(base.identity + (deltas.identity || 0), 0, 1)
  };
}

/**
 * Get the dominant motivation dimension
 */
export function getPrimaryMotivation(profile: MotivationProfile): keyof MotivationProfile {
  let maxKey: keyof MotivationProfile = 'expression';
  let maxVal = -1;

  for (const [key, val] of Object.entries(profile)) {
    if (val > maxVal) {
      maxVal = val;
      maxKey = key as keyof MotivationProfile;
    }
  }

  return maxKey;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
