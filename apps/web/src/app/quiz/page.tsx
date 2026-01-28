'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  INITIAL_QUESTIONS,
  type BinaryQuestion
} from '@subtaste/profiler';

type QuizState = 'intro' | 'quiz' | 'processing' | 'reveal';

interface GenomeResult {
  userId: string;
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

export default function QuizPage() {
  const router = useRouter();
  const [state, setState] = useState<QuizState>('intro');
  const [result, setResult] = useState<GenomeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    responses: Array<{ questionId: string; response: number }>
  ) => {
    setState('processing');
    setError(null);

    try {
      const response = await fetch('/api/v2/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
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

      localStorage.setItem('subtaste_user_id', data.userId);
      setState('reveal');
    } catch (err) {
      console.error('Quiz error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setState('quiz');
    }
  }, []);

  const handleSigilReveal = useCallback(async () => {
    if (!result) return;
    try {
      await fetch(`/api/v2/genome/${result.userId}/sigil`, { method: 'POST' });
    } catch (err) {
      console.error('Sigil reveal error:', err);
    }
  }, [result]);

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
              <h1 className="font-display text-3xl md:text-4xl text-bone mb-4 tracking-tight">
                THE TWELVE
              </h1>
              <p className="text-bone-muted mb-2">Three questions.</p>
              <p className="text-bone-faint text-sm mb-12">
                Discover which archetype shapes your creative taste.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStart}
              >
                Begin
              </button>

              <p className="text-bone-faint text-xs mt-8">~30 seconds</p>
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
