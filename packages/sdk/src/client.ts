/**
 * @subtaste/sdk - Client
 *
 * Easy integration client for THE TWELVE taste profiling.
 * Use this to connect your apps to the subtaste system.
 */

import type {
  TasteGenomePublic,
  Glyph,
  Designation,
  Signal
} from '@subtaste/core';

import type { StageId, ProfilingStage } from '@subtaste/profiler';

// =============================================================================
// TYPES
// =============================================================================

export interface SubtasteConfig {
  /** Base URL of the subtaste API */
  apiUrl: string;
  /** Optional API key for authenticated requests */
  apiKey?: string;
  /** Custom fetch implementation (for SSR) */
  fetch?: typeof fetch;
}

export interface ProfilingProgress {
  hasStarted: boolean;
  currentStage: StageId | null;
  stagesCompleted: StageId[];
  signalCount: number;
  nextStage?: ProfilingStage;
}

export interface QuizQuestion {
  id: string;
  type: 'binary' | 'likert' | 'ranking';
  prompt: string;
  options?: [string, string];
  scale?: 5 | 7;
  lowLabel?: string;
  highLabel?: string;
  items?: string[];
}

export interface QuizSubmission {
  responses: Array<{
    questionId: string;
    response: number | number[];
  }>;
}

export interface QuizResult {
  userId: string;
  genome: TasteGenomePublic;
  glyph: Glyph;
  designation: Designation;
  confidence: number;
}

export interface BehaviouralSignal {
  type: 'save' | 'skip' | 'share' | 'play' | 'like' | 'dislike';
  itemId: string;
  /** Optional: duration in ms for play signals */
  duration?: number;
  /** Optional: context like 'feed', 'search', 'playlist' */
  context?: string;
  /** Optional: custom metadata */
  metadata?: Record<string, unknown>;
}

// =============================================================================
// CLIENT
// =============================================================================

export class SubtasteClient {
  private config: SubtasteConfig;
  private fetchFn: typeof fetch;

  constructor(config: SubtasteConfig) {
    this.config = config;
    this.fetchFn = config.fetch || globalThis.fetch;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.apiUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await this.fetchFn(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new SubtasteError(
        error.message || `Request failed: ${response.status}`,
        response.status,
        error
      );
    }

    return response.json();
  }

  // ===========================================================================
  // GENOME
  // ===========================================================================

  /**
   * Get a user's public genome
   */
  async getGenome(userId: string): Promise<TasteGenomePublic | null> {
    try {
      return await this.request<TasteGenomePublic>(
        `/api/v2/genome/${userId}/public`
      );
    } catch (error) {
      if (error instanceof SubtasteError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get a user's glyph (shorthand)
   */
  async getGlyph(userId: string): Promise<Glyph | null> {
    const genome = await this.getGenome(userId);
    return genome?.archetype.primary.glyph || null;
  }

  // ===========================================================================
  // PROFILING
  // ===========================================================================

  /**
   * Get profiling progress for a user
   */
  async getProgress(userId: string): Promise<ProfilingProgress> {
    return this.request<ProfilingProgress>(`/api/v2/quiz?userId=${userId}`);
  }

  /**
   * Get questions for a profiling stage
   */
  async getQuestions(stage: StageId = 'initial'): Promise<QuizQuestion[]> {
    return this.request<QuizQuestion[]>(`/api/v2/quiz/questions?stage=${stage}`);
  }

  /**
   * Submit quiz responses
   */
  async submitQuiz(
    submission: QuizSubmission,
    userId?: string
  ): Promise<QuizResult> {
    return this.request<QuizResult>('/api/v2/quiz', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        ...submission,
      }),
    });
  }

  /**
   * Reveal the user's sigil
   */
  async revealSigil(userId: string): Promise<{ sigil: string }> {
    return this.request<{ sigil: string }>(
      `/api/v2/genome/${userId}/sigil`,
      { method: 'POST' }
    );
  }

  // ===========================================================================
  // SIGNALS
  // ===========================================================================

  /**
   * Record behavioural signals
   *
   * Call this when users interact with content in your app:
   * - save: User saved/bookmarked content
   * - skip: User skipped content
   * - share: User shared content
   * - play: User played content (include duration)
   * - like/dislike: Explicit preference
   */
  async recordSignals(
    userId: string,
    signals: BehaviouralSignal[]
  ): Promise<{ recorded: number; calibrationAvailable: boolean }> {
    return this.request<{ recorded: number; calibrationAvailable: boolean }>(
      `/api/v2/signals/${userId}`,
      {
        method: 'POST',
        body: JSON.stringify({ signals }),
      }
    );
  }

  /**
   * Record a single signal (convenience method)
   */
  async recordSignal(
    userId: string,
    signal: BehaviouralSignal
  ): Promise<{ recorded: number; calibrationAvailable: boolean }> {
    return this.recordSignals(userId, [signal]);
  }

  // ===========================================================================
  // CALIBRATION
  // ===========================================================================

  /**
   * Check if calibration is available for a user
   */
  async isCalibrationAvailable(userId: string): Promise<{
    available: boolean;
    stage?: StageId;
    reason?: string;
  }> {
    const progress = await this.getProgress(userId);

    if (!progress.hasStarted) {
      return { available: false, reason: 'User has not completed initial profiling' };
    }

    if (progress.signalCount >= 5 && !progress.stagesCompleted.includes('music')) {
      return { available: true, stage: 'music' };
    }

    if (
      progress.stagesCompleted.includes('music') &&
      !progress.stagesCompleted.includes('deep')
    ) {
      return { available: true, stage: 'deep' };
    }

    return { available: false, reason: 'All calibration stages complete' };
  }

  /**
   * Start a calibration session
   */
  async startCalibration(
    userId: string,
    stage: StageId
  ): Promise<{ sessionId: string; questions: QuizQuestion[] }> {
    return this.request<{ sessionId: string; questions: QuizQuestion[] }>(
      `/api/v2/calibration/${userId}/start`,
      {
        method: 'POST',
        body: JSON.stringify({ stage }),
      }
    );
  }

  /**
   * Submit calibration responses
   */
  async submitCalibration(
    userId: string,
    sessionId: string,
    responses: Array<{ questionId: string; response: number }>
  ): Promise<QuizResult> {
    return this.request<QuizResult>(
      `/api/v2/calibration/${userId}/submit`,
      {
        method: 'POST',
        body: JSON.stringify({ sessionId, responses }),
      }
    );
  }
}

// =============================================================================
// ERROR
// =============================================================================

export class SubtasteError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'SubtasteError';
  }
}

// =============================================================================
// FACTORY
// =============================================================================

/**
 * Create a subtaste client
 *
 * @example
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
 * // Record signals
 * await subtaste.recordSignal(userId, {
 *   type: 'save',
 *   itemId: 'track-123'
 * });
 * ```
 */
export function createClient(config: SubtasteConfig): SubtasteClient {
  return new SubtasteClient(config);
}

export default createClient;
