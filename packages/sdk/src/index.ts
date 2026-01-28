/**
 * @subtaste/sdk
 *
 * SDK for integrating THE TWELVE taste profiling into your apps.
 *
 * @example Basic usage
 * ```typescript
 * import { createClient } from '@subtaste/sdk';
 *
 * const subtaste = createClient({
 *   apiUrl: 'https://subtaste.yourdomain.com'
 * });
 *
 * // Get user's glyph
 * const glyph = await subtaste.getGlyph(userId);
 *
 * // Record behavioural signals
 * await subtaste.recordSignal(userId, {
 *   type: 'save',
 *   itemId: 'track-123'
 * });
 *
 * // Check calibration availability
 * const { available, stage } = await subtaste.isCalibrationAvailable(userId);
 * ```
 *
 * @example React integration
 * ```tsx
 * import { SubtasteProvider, useGlyph, useSignals } from '@subtaste/sdk/react';
 *
 * function App() {
 *   return (
 *     <SubtasteProvider config={{ apiUrl: 'https://subtaste.yourdomain.com' }}>
 *       <MyApp />
 *     </SubtasteProvider>
 *   );
 * }
 *
 * function TrackCard({ track }) {
 *   const glyph = useGlyph();
 *   const { recordSave, recordSkip } = useSignals();
 *
 *   return (
 *     <div>
 *       <p>Your glyph: {glyph}</p>
 *       <button onClick={() => recordSave(track.id)}>Save</button>
 *       <button onClick={() => recordSkip(track.id)}>Skip</button>
 *     </div>
 *   );
 * }
 * ```
 */

// Client
export {
  SubtasteClient,
  SubtasteError,
  createClient,
  type SubtasteConfig,
  type ProfilingProgress,
  type QuizQuestion,
  type QuizSubmission,
  type QuizResult,
  type BehaviouralSignal
} from './client';

// Re-export core types for convenience
export type {
  Designation,
  Glyph,
  Sigil,
  CreativeMode,
  TasteGenomePublic,
  ArchetypeClassification
} from '@subtaste/core';

// Re-export profiler types
export type { StageId, ProfilingStage } from '@subtaste/profiler';
