/**
 * @subtaste/sdk/react
 *
 * React hooks for THE TWELVE taste profiling.
 */

'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode
} from 'react';

import type { TasteGenomePublic, Glyph } from '@subtaste/core';
import type { StageId } from '@subtaste/profiler';
import {
  SubtasteClient,
  createClient,
  type SubtasteConfig,
  type BehaviouralSignal,
  type ProfilingProgress,
  type QuizQuestion,
  type QuizResult
} from '../client';

// =============================================================================
// CONTEXT
// =============================================================================

interface SubtasteContextValue {
  client: SubtasteClient;
  userId: string | null;
  genome: TasteGenomePublic | null;
  glyph: Glyph | null;
  progress: ProfilingProgress | null;
  loading: boolean;
  error: Error | null;
  /** Set the current user ID */
  setUserId: (userId: string | null) => void;
  /** Record a behavioural signal */
  recordSignal: (signal: BehaviouralSignal) => Promise<void>;
  /** Check if calibration is available */
  calibrationAvailable: boolean;
  /** Refresh genome and progress */
  refresh: () => Promise<void>;
}

const SubtasteContext = createContext<SubtasteContextValue | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

interface SubtasteProviderProps {
  children: ReactNode;
  config: SubtasteConfig;
  /** Initial user ID (optional) */
  userId?: string;
  /** Auto-fetch genome on userId change */
  autoFetch?: boolean;
}

export function SubtasteProvider({
  children,
  config,
  userId: initialUserId,
  autoFetch = true,
}: SubtasteProviderProps) {
  const client = useMemo(() => createClient(config), [config]);

  const [userId, setUserId] = useState<string | null>(initialUserId || null);
  const [genome, setGenome] = useState<TasteGenomePublic | null>(null);
  const [progress, setProgress] = useState<ProfilingProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const glyph = genome?.archetype.primary.glyph || null;

  const calibrationAvailable = useMemo(() => {
    if (!progress) return false;
    if (!progress.hasStarted) return false;
    if (progress.signalCount >= 5 && !progress.stagesCompleted.includes('music')) {
      return true;
    }
    if (
      progress.stagesCompleted.includes('music') &&
      !progress.stagesCompleted.includes('deep')
    ) {
      return true;
    }
    return false;
  }, [progress]);

  const refresh = useCallback(async () => {
    if (!userId) {
      setGenome(null);
      setProgress(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [genomeData, progressData] = await Promise.all([
        client.getGenome(userId),
        client.getProgress(userId),
      ]);

      setGenome(genomeData);
      setProgress(progressData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [client, userId]);

  const recordSignal = useCallback(
    async (signal: BehaviouralSignal) => {
      if (!userId) return;

      try {
        const result = await client.recordSignal(userId, signal);

        // If calibration became available, refresh progress
        if (result.calibrationAvailable) {
          const newProgress = await client.getProgress(userId);
          setProgress(newProgress);
        }
      } catch (err) {
        console.error('Failed to record signal:', err);
      }
    },
    [client, userId]
  );

  // Auto-fetch on userId change
  useEffect(() => {
    if (autoFetch && userId) {
      refresh();
    }
  }, [autoFetch, userId, refresh]);

  const value: SubtasteContextValue = {
    client,
    userId,
    genome,
    glyph,
    progress,
    loading,
    error,
    setUserId,
    recordSignal,
    calibrationAvailable,
    refresh,
  };

  return (
    <SubtasteContext.Provider value={value}>
      {children}
    </SubtasteContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Access the subtaste context
 */
export function useSubtaste(): SubtasteContextValue {
  const context = useContext(SubtasteContext);
  if (!context) {
    throw new Error('useSubtaste must be used within a SubtasteProvider');
  }
  return context;
}

/**
 * Get the current user's glyph
 */
export function useGlyph(): Glyph | null {
  const { glyph } = useSubtaste();
  return glyph;
}

/**
 * Get the current user's genome
 */
export function useGenome(): TasteGenomePublic | null {
  const { genome } = useSubtaste();
  return genome;
}

/**
 * Hook for recording behavioural signals
 *
 * @example
 * ```tsx
 * const { recordSave, recordSkip, recordShare } = useSignals();
 *
 * <button onClick={() => recordSave('track-123')}>Save</button>
 * ```
 */
export function useSignals() {
  const { recordSignal, userId } = useSubtaste();

  const recordSave = useCallback(
    (itemId: string, metadata?: Record<string, unknown>) => {
      return recordSignal({ type: 'save', itemId, metadata });
    },
    [recordSignal]
  );

  const recordSkip = useCallback(
    (itemId: string, metadata?: Record<string, unknown>) => {
      return recordSignal({ type: 'skip', itemId, metadata });
    },
    [recordSignal]
  );

  const recordShare = useCallback(
    (itemId: string, metadata?: Record<string, unknown>) => {
      return recordSignal({ type: 'share', itemId, metadata });
    },
    [recordSignal]
  );

  const recordPlay = useCallback(
    (itemId: string, duration?: number, metadata?: Record<string, unknown>) => {
      return recordSignal({ type: 'play', itemId, duration, metadata });
    },
    [recordSignal]
  );

  const recordLike = useCallback(
    (itemId: string, metadata?: Record<string, unknown>) => {
      return recordSignal({ type: 'like', itemId, metadata });
    },
    [recordSignal]
  );

  const recordDislike = useCallback(
    (itemId: string, metadata?: Record<string, unknown>) => {
      return recordSignal({ type: 'dislike', itemId, metadata });
    },
    [recordSignal]
  );

  return {
    recordSave,
    recordSkip,
    recordShare,
    recordPlay,
    recordLike,
    recordDislike,
    recordSignal,
  };
}

/**
 * Hook for calibration flow
 *
 * @example
 * ```tsx
 * const { available, stage, startCalibration, questions, submit } = useCalibration();
 *
 * if (available) {
 *   return <CalibrationPrompt onStart={startCalibration} />;
 * }
 * ```
 */
export function useCalibration() {
  const { client, userId, calibrationAvailable, progress, refresh } = useSubtaste();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const stage: StageId | null = useMemo(() => {
    if (!progress?.hasStarted) return null;
    if (progress.signalCount >= 5 && !progress.stagesCompleted.includes('music')) {
      return 'music';
    }
    if (
      progress.stagesCompleted.includes('music') &&
      !progress.stagesCompleted.includes('deep')
    ) {
      return 'deep';
    }
    return null;
  }, [progress]);

  const startCalibration = useCallback(async () => {
    if (!userId || !stage) return;

    setLoading(true);
    setError(null);

    try {
      const result = await client.startCalibration(userId, stage);
      setSessionId(result.sessionId);
      setQuestions(result.questions);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [client, userId, stage]);

  const submit = useCallback(
    async (responses: Array<{ questionId: string; response: number }>) => {
      if (!userId || !sessionId) return null;

      setLoading(true);
      setError(null);

      try {
        const result = await client.submitCalibration(userId, sessionId, responses);

        // Refresh genome and progress
        await refresh();

        // Reset state
        setSessionId(null);
        setQuestions(null);

        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [client, userId, sessionId, refresh]
  );

  const cancel = useCallback(() => {
    setSessionId(null);
    setQuestions(null);
    setError(null);
  }, []);

  return {
    available: calibrationAvailable,
    stage,
    sessionId,
    questions,
    loading,
    error,
    startCalibration,
    submit,
    cancel,
  };
}

/**
 * Hook for the initial profiling quiz
 */
export function useProfilingQuiz() {
  const { client, setUserId, refresh } = useSubtaste();

  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const qs = await client.getQuestions('initial');
      setQuestions(qs);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [client]);

  const submit = useCallback(
    async (responses: Array<{ questionId: string; response: number }>) => {
      setLoading(true);
      setError(null);

      try {
        const quizResult = await client.submitQuiz({ responses });
        setResult(quizResult);
        setUserId(quizResult.userId);
        await refresh();
        return quizResult;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [client, setUserId, refresh]
  );

  return {
    questions,
    loading,
    error,
    result,
    loadQuestions,
    submit,
  };
}
