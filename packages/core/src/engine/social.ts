/**
 * @subtaste/core - Social Dynamics Engine
 *
 * Profiles HOW taste behaves around others.
 * Populated via 2 explicit questions + primarily behavioral inference.
 *
 * Four social roles:
 * - Tastemaker: sets direction, others follow your picks
 * - Consumer: absorbs culture, doesn't push
 * - Contrarian: defines self against mainstream
 * - Bridger: cross-pollinates between scenes
 */

import type { SocialProfile, SocialRole, Signal } from '../types';
import { isImplicitSignal, isExplicitSignal } from '../types';

/**
 * Default social profile (equal distribution)
 */
export function getDefaultSocial(): SocialProfile {
  return {
    role: 'consumer',
    tastemaker: 0.25,
    consumer: 0.25,
    contrarian: 0.25,
    bridger: 0.25
  };
}

/**
 * Extract social dynamics deltas from signals
 * Infers social role from behavioral patterns
 */
export function extractSocialDeltas(signals: Signal[]): Partial<Omit<SocialProfile, 'role'>> {
  const deltas = {
    tastemaker: 0,
    consumer: 0,
    contrarian: 0,
    bridger: 0
  };

  // Track signal diversity for bridger detection
  const sources = new Set<string>();
  const contexts = new Set<string>();

  for (const signal of signals) {
    sources.add(signal.source);

    if (isImplicitSignal(signal.data)) {
      const kind = signal.data.kind;
      const context = signal.data.context;
      if (context) contexts.add(context);

      const meta = signal.data.metadata || {};

      switch (kind) {
        case 'share':
          deltas.tastemaker += 0.1; // pushing content outward
          if (meta.crossGenre || contexts.size > 2) {
            deltas.bridger += 0.1; // sharing across contexts
          }
          break;

        case 'save':
          if (meta.isObscure) {
            deltas.contrarian += 0.05;
            deltas.tastemaker += 0.05; // saving obscure = curation signal
          } else {
            deltas.consumer += 0.1; // saving popular = absorption
          }
          break;

        case 'click':
          deltas.consumer += 0.03; // passive engagement
          break;

        case 'skip':
          // Skipping is neutral — could be any role filtering
          break;

        case 'dwell':
          // Long engagement = deep consumption
          if (signal.data.duration && signal.data.duration > 180000) {
            deltas.consumer += 0.05;
          }
          break;
      }
    }

    // Explicit signals with block action → contrarian signal
    if (isExplicitSignal(signal.data)) {
      if (signal.data.kind === 'block') {
        deltas.contrarian += 0.05; // active rejection = taste boundary
      }
    }
  }

  // Source diversity → bridger boost
  if (sources.size >= 3) {
    deltas.bridger += 0.05 * Math.min(sources.size - 2, 3);
  }

  return deltas;
}

/**
 * Apply social deltas to a profile and recalculate dominant role
 */
export function applySocialDeltas(
  base: SocialProfile,
  deltas: Partial<Omit<SocialProfile, 'role'>>
): SocialProfile {
  const updated = {
    tastemaker: clamp(base.tastemaker + (deltas.tastemaker || 0), 0, 1),
    consumer: clamp(base.consumer + (deltas.consumer || 0), 0, 1),
    contrarian: clamp(base.contrarian + (deltas.contrarian || 0), 0, 1),
    bridger: clamp(base.bridger + (deltas.bridger || 0), 0, 1)
  };

  return {
    ...updated,
    role: getDominantRole(updated)
  };
}

/**
 * Get the dominant social role
 */
export function getDominantRole(
  scores: Pick<SocialProfile, 'tastemaker' | 'consumer' | 'contrarian' | 'bridger'>
): SocialRole {
  const entries: [SocialRole, number][] = [
    ['tastemaker', scores.tastemaker],
    ['consumer', scores.consumer],
    ['contrarian', scores.contrarian],
    ['bridger', scores.bridger]
  ];

  entries.sort((a, b) => b[1] - a[1]);
  return entries[0]![0];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
