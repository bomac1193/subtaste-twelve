'use client';

import { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfilingQuiz } from '@/components/profiling/ProfilingQuiz';
import { GlyphReveal } from '@/components/profiling/GlyphReveal';
import { useDebug } from '@/contexts/DebugContext';
import {
  PANTHEON,
  type Glyph,
  type Seal,
  type CreativeMode,
  type Designation
} from '@subtaste/core';
import {
  INITIAL_QUESTIONS,
  type BinaryQuestion
} from '@subtaste/profiler';

type QuizState = 'intro' | 'quiz' | 'processing' | 'reveal';

interface GenomeResult {
  userId: string;
  glyph: Glyph;
  designation: Designation;
  seal: Seal;
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

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDebugMode, setDebugUserId } = useDebug();
  const [state, setState] = useState<QuizState>('intro');
  const [result, setResult] = useState<GenomeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = searchParams.get('callback');

  const questions = INITIAL_QUESTIONS.map((q: BinaryQuestion) => ({
    id: q.id,
    type: 'binary' as const,
    prompt: q.prompt,
    options: q.options,
  }));

  const handleStart = useCallback(() => {
    setState('quiz');
  }, []);

  const handleComplete = useCallback(async (
    responses: Array<{ questionId: string; response: number | number[] }>
  ) => {
    setState('processing');
    setError(null);

    try {
      // Pass existing userId if available so we don't create duplicates
      const existingUserId = isDebugMode
        ? localStorage.getItem('subtaste_debug_user_id')
        : localStorage.getItem('subtaste_user_id');

      const response = await fetch('/api/v2/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          userId: existingUserId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process quiz');
      }

      const archetype = PANTHEON[data.designation as Designation];

      setResult({
        userId: data.userId,
        glyph: archetype.glyph,
        designation: data.designation,
        seal: archetype.seal,
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

      // Save to appropriate storage based on debug mode
      if (isDebugMode) {
        localStorage.setItem('subtaste_debug_user_id', data.userId);
        setDebugUserId(data.userId);
      } else {
        localStorage.setItem('subtaste_user_id', data.userId);
      }
      setState('reveal');
    } catch (err) {
      console.error('Quiz error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setState('quiz');
    }
  }, [isDebugMode, setDebugUserId]);

  const handleSigilReveal = useCallback(async () => {
    if (!result) return;
    try {
      await fetch(`/api/v2/genome/${result.userId}/sigil`, { method: 'POST' });
    } catch (err) {
      console.error('Sigil reveal error:', err);
    }
  }, [result]);

  const handleContinue = useCallback(() => {
    // Always go to profile first (training, calibration, breakdown)
    // If launched from Ori/Nommo, store callback so profile can show "Return to Ori"
    if (callbackUrl) {
      try {
        sessionStorage.setItem('subtaste_callback', callbackUrl);
      } catch {
        // sessionStorage not available
      }
    }
    router.push('/profile');
  }, [router, callbackUrl]);

  return (
    <div className={`min-h-screen bg-void ${isDebugMode ? 'pt-12' : ''}`}>
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
              <h1 className="font-display text-3xl md:text-4xl text-bone mb-4">
                Subtaste
              </h1>
              {isDebugMode && (
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-state-warning/20 text-state-warning text-xs font-mono rounded-full border border-state-warning/40">
                    Debug Mode - Creating Test Profile
                  </span>
                </div>
              )}
              <p className="text-bone-muted mb-2">Three questions.</p>
              <p className="text-bone-faint text-sm mb-12">
                Discover which archetype shapes your creative taste.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStart}
              >
                {isDebugMode ? 'Begin Debug Quiz' : 'Begin'}
              </button>

              <p className="text-bone-faint text-xs mt-8">30 seconds</p>
            </motion.div>
          </motion.div>
        )}

        {state === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProfilingQuiz
              questions={questions}
              stageName="Initial Spark"
              stageDescription="Three questions to discover your primary Glyph."
              onComplete={handleComplete}
              onCancel={() => router.push('/')}
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
              <p className="text-bone-muted text-sm">Classifying...</p>
            </div>
          </motion.div>
        )}

        {state === 'reveal' && result && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <GlyphReveal
              glyph={result.glyph}
              sigil={result.seal}
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

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-bone-faint border-t-bone rounded-full animate-spin" />
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
