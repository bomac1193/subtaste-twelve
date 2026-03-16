/**
 * @subtaste/core - Perceptual Sensitivity Engine
 *
 * Measures HOW MUCH someone notices.
 * Purely behavioral — inferred from training card responses.
 * No questions asked; sensitivity is measured, not self-reported.
 *
 * Three sub-dimensions:
 * - Consistency: same choices across similar stimuli
 * - Discrimination: distinguishing subtle differences
 * - Response speed consistency: deliberate vs impulsive evaluation
 *
 * Formula: overall = (consistency * 0.5) + (discrimination * 0.4) + (speedConsistency * 0.1)
 */

import type { PerceptualSensitivity } from '../types';

/**
 * Training submission data needed for sensitivity scoring
 */
export interface TrainingSubmission {
  cardId: string;
  bestOptionId: string;
  worstOptionId: string;
  bestArchetypeHint: string;
  worstArchetypeHint: string;
  optionArchetypeHints: string[];  // All 4 option hints on this card
  responseTimeMs: number;          // Time from card shown to submission
  timestamp: Date;
}

/**
 * Default sensitivity profile (no data yet)
 */
export function getDefaultSensitivity(): PerceptualSensitivity {
  return {
    overall: 0,
    consistency: 0,
    discrimination: 0,
    responseSpeed: 0,
    sampleSize: 0
  };
}

/**
 * Update perceptual sensitivity from a batch of training submissions
 *
 * Call this after each training session with the session's submissions.
 * Accumulates data across sessions via the sampleSize field.
 */
export function updateSensitivityFromTraining(
  current: PerceptualSensitivity,
  submissions: TrainingSubmission[]
): PerceptualSensitivity {
  if (submissions.length === 0) return current;

  const newSampleSize = current.sampleSize + submissions.length;

  // --- CONSISTENCY ---
  // Do they pick the same archetype hints when presented multiple times?
  // Group submissions by chosen archetype hint, check if choices cluster
  const hintChoiceCounts: Record<string, number> = {};
  for (const sub of submissions) {
    hintChoiceCounts[sub.bestArchetypeHint] = (hintChoiceCounts[sub.bestArchetypeHint] || 0) + 1;
  }
  // Higher concentration of choices in fewer archetypes = higher consistency
  const choiceValues = Object.values(hintChoiceCounts);
  const maxChoiceCount = Math.max(...choiceValues);
  const batchConsistency = submissions.length > 1
    ? maxChoiceCount / submissions.length
    : 0.5; // Not enough data for single card

  // --- DISCRIMINATION ---
  // When a card has similar archetype hints, do they still differentiate best/worst?
  let discriminationSum = 0;
  let discriminationCount = 0;
  for (const sub of submissions) {
    const hints = sub.optionArchetypeHints;
    const uniqueHints = new Set(hints).size;
    const similarity = 1 - (uniqueHints - 1) / Math.max(hints.length - 1, 1);

    // If options were similar (high similarity) and user still chose distinct best/worst
    if (similarity > 0.3) {
      const didDiscriminate = sub.bestArchetypeHint !== sub.worstArchetypeHint ? 1 : 0;
      // Weight by how similar the options were — discriminating among similar is harder
      discriminationSum += didDiscriminate * (0.5 + similarity * 0.5);
      discriminationCount++;
    }
  }
  const batchDiscrimination = discriminationCount > 0
    ? discriminationSum / discriminationCount
    : 0.5;

  // --- RESPONSE SPEED CONSISTENCY ---
  // Not "faster = better" — CONSISTENT speed indicates deliberate evaluation
  const times = submissions.map(s => s.responseTimeMs);
  const batchSpeedConsistency = times.length > 1
    ? 1 - normalizedStdDev(times)
    : 0.5;

  // --- MERGE with existing (weighted by sample size) ---
  const oldWeight = current.sampleSize / newSampleSize;
  const newWeight = submissions.length / newSampleSize;

  const consistency = current.sampleSize > 0
    ? current.consistency * oldWeight + batchConsistency * newWeight
    : batchConsistency;

  const discrimination = current.sampleSize > 0
    ? current.discrimination * oldWeight + batchDiscrimination * newWeight
    : batchDiscrimination;

  const responseSpeed = current.sampleSize > 0
    ? current.responseSpeed * oldWeight + batchSpeedConsistency * newWeight
    : batchSpeedConsistency;

  // Overall composite
  const overall = (consistency * 0.5) + (discrimination * 0.4) + (responseSpeed * 0.1);

  return {
    overall: clamp(overall, 0, 1),
    consistency: clamp(consistency, 0, 1),
    discrimination: clamp(discrimination, 0, 1),
    responseSpeed: clamp(responseSpeed, 0, 1),
    sampleSize: newSampleSize
  };
}

/**
 * Whether the sensitivity score is reliable (enough training data)
 */
export function isSensitivityReliable(sensitivity: PerceptualSensitivity): boolean {
  return sensitivity.sampleSize >= 10;
}

/**
 * Normalized standard deviation (0-1 range)
 * Returns 0 for perfectly consistent, approaches 1 for high variance
 */
function normalizedStdDev(values: number[]): number {
  if (values.length < 2) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;

  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Normalize by mean (coefficient of variation), capped at 1
  return Math.min(stdDev / mean, 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
