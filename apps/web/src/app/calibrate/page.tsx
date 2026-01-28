'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfilingQuiz } from '@/components/profiling/ProfilingQuiz';
import { GlyphReveal } from '@/components/profiling/GlyphReveal';
import {
  PANTHEON,
  type Glyph,
  type Sigil,
  type CreativeMode,
  type Designation
} from '@subtaste/core';
import {
  MUSIC_CALIBRATION_QUESTIONS,
  DEEP_CALIBRATION_QUESTIONS,
  type LikertQuestion,
  type BinaryQuestion,
  type RankingQuestion
} from '@subtaste/profiler';

type CalibrationState = 'intro' | 'calibrating' | 'processing' | 'complete';

interface GenomeResult {
  glyph: Glyph;
  designation: Designation;
  sigil: Sigil;
  essence: string;
  creativeMode: CreativeMode;
  shadow: string;
  recogniseBy: string;
  confidence: number;
  secondary?: {
    glyph: Glyph;
    confidence: number;
  };
}

function CalibrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stage = searchParams.get('stage') as 'music' | 'deep' || 'music';

  const [state, setState] = useState<CalibrationState>('intro');
  const [result, setResult] = useState<GenomeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userId = typeof window !== 'undefined'
    ? localStorage.getItem('subtaste_user_id')
    : null;

  useEffect(() => {
    if (!userId) {
      router.push('/quiz');
    }
  }, [userId, router]);

  // Get questions for the current stage
  const rawQuestions = stage === 'music'
    ? MUSIC_CALIBRATION_QUESTIONS
    : DEEP_CALIBRATION_QUESTIONS;

  const questions = rawQuestions.map((q) => {
    if (q.type === 'likert') {
      const likert = q as LikertQuestion;
      return {
        id: likert.id,
        type: 'likert' as const,
        prompt: likert.prompt,
        scale: likert.scale,
        lowLabel: likert.lowLabel,
        highLabel: likert.highLabel,
      };
    } else if (q.type === 'binary') {
      const binary = q as BinaryQuestion;
      return {
        id: binary.id,
        type: 'binary' as const,
        prompt: binary.prompt,
        options: binary.options,
      };
    } else {
      const ranking = q as RankingQuestion;
      return {
        id: ranking.id,
        type: 'ranking' as const,
        prompt: ranking.prompt,
        items: ranking.items,
      };
    }
  });

  const stageInfo = {
    music: {
      name: 'Music Calibration',
      description: 'Refine your profile with music-specific preferences.',
      duration: '~45 seconds',
    },
    deep: {
      name: 'Deep Calibration',
      description: 'Unlock your full taste genome.',
      duration: '~2 minutes',
    },
  };

  const handleStart = useCallback(() => {
    setState('calibrating');
  }, []);

  const handleComplete = useCallback(async (
    responses: Array<{ questionId: string; response: number }>
  ) => {
    setState('processing');
    setError(null);

    try {
      const response = await fetch(`/api/v2/calibration/${userId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, responses }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process calibration');
      }

      const archetype = PANTHEON[data.designation as Designation];

      setResult({
        glyph: archetype.glyph,
        designation: data.designation,
        sigil: archetype.sigil,
        essence: archetype.essence,
        creativeMode: archetype.creativeMode as CreativeMode,
        shadow: archetype.shadow,
        recogniseBy: archetype.recogniseBy,
        confidence: data.confidence,
        secondary: data.genome?.archetype?.secondary ? {
          glyph: data.genome.archetype.secondary.glyph,
          confidence: data.genome.archetype.secondary.confidence,
        } : undefined,
      });

      setState('complete');
    } catch (err) {
      console.error('Calibration error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setState('calibrating');
    }
  }, [userId, stage]);

  const handleSigilReveal = useCallback(async () => {
    if (!userId) return;
    try {
      await fetch(`/api/v2/genome/${userId}/sigil`, { method: 'POST' });
    } catch (err) {
      console.error('Sigil reveal error:', err);
    }
  }, [userId]);

  const handleContinue = useCallback(() => {
    router.push('/profile');
  }, [router]);

  return (
    <div className="min-h-screen bg-void">
      <AnimatePresence mode="wait">
        {state === 'intro' && (
          <motion.div
            key="intro"
            className="container-sm page-padding text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <p className="text-xs uppercase tracking-wider text-bone-faint mb-4">
                Stage {stage === 'music' ? '2' : '3'} of 3
              </p>

              <h1 className="font-display text-2xl md:text-3xl text-bone mb-4 tracking-tight">
                {stageInfo[stage].name}
              </h1>

              <p className="text-bone-muted text-sm mb-12 max-w-md mx-auto">
                {stageInfo[stage].description}
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStart}
              >
                Continue
              </button>

              <p className="text-bone-faint text-xs mt-8">{stageInfo[stage].duration}</p>

              <button
                type="button"
                className="btn-ghost text-bone-faint mt-4"
                onClick={() => router.push('/profile')}
              >
                Skip for now
              </button>
            </motion.div>
          </motion.div>
        )}

        {state === 'calibrating' && (
          <motion.div
            key="calibrating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProfilingQuiz
              questions={questions}
              stageName={stageInfo[stage].name}
              onComplete={handleComplete}
              onCancel={() => router.push('/profile')}
            />
            {error && (
              <div className="container-sm px-4 mt-4">
                <p className="text-state-error text-sm text-center">{error}</p>
              </div>
            )}
          </motion.div>
        )}

        {state === 'processing' && (
          <motion.div
            key="processing"
            className="container-sm page-padding text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="space-y-4">
              <div className="w-8 h-8 border-2 border-bone-faint border-t-bone rounded-full animate-spin mx-auto" />
              <p className="text-bone-muted text-sm">Recalibrating...</p>
            </div>
          </motion.div>
        )}

        {state === 'complete' && result && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="container-sm page-padding text-center mb-8">
              <motion.p
                className="text-bone-muted text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Calibration complete. Profile updated.
              </motion.p>
            </div>

            <GlyphReveal
              glyph={result.glyph}
              sigil={result.sigil}
              essence={result.essence}
              creativeMode={result.creativeMode}
              shadow={result.shadow}
              recogniseBy={result.recogniseBy}
              confidence={result.confidence}
              secondary={result.secondary}
              onSigilReveal={handleSigilReveal}
              onContinue={handleContinue}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CalibratePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-bone-faint border-t-bone rounded-full animate-spin" />
      </div>
    }>
      <CalibrationContent />
    </Suspense>
  );
}
