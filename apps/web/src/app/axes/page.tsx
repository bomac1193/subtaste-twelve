'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AxesSlider } from '@/components/profiling/AxesSlider';
import { AXES_QUESTIONS } from '@subtaste/profiler';

type AxesState = 'intro' | 'calibration' | 'processing' | 'reveal';

interface AxesValues {
  orderChaos: number;
  mercyRuthlessness: number;
  introvertExtrovert: number;
  faithDoubt: number;
}

interface HexagramResult {
  present: {
    number: number;
    name: string;
    chinese: string;
    judgment: string;
    lines: boolean[];
  };
  transforming?: {
    number: number;
    name: string;
    chinese: string;
  };
  movingLines: number[];
}

export default function AxesPage() {
  const router = useRouter();
  const [state, setState] = useState<AxesState>('intro');
  const [values, setValues] = useState<AxesValues>({
    orderChaos: 0.5,
    mercyRuthlessness: 0.5,
    introvertExtrovert: 0.5,
    faithDoubt: 0.5,
  });
  const [hexagram, setHexagram] = useState<HexagramResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = useCallback(() => {
    setState('calibration');
  }, []);

  const handleValueChange = useCallback(
    (axis: keyof AxesValues, value: number) => {
      setValues((prev) => ({ ...prev, [axis]: value }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    setState('processing');
    setError(null);

    try {
      const userId = localStorage.getItem('subtaste_user_id');

      if (!userId) {
        throw new Error('Please complete the initial quiz first');
      }

      const response = await fetch('/api/v2/axes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, axes: values }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process axes calibration');
      }

      setHexagram(data.hexagram);
      setState('reveal');
    } catch (err) {
      console.error('Axes submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setState('calibration');
    }
  }, [values]);

  const handleContinue = useCallback(() => {
    router.push('/advanced');
  }, [router]);

  const allQuestionsAnswered = true; // Always true since sliders have default values

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
                AXES CALIBRATION
              </h1>
              <p className="text-bone-muted mb-2">Four personality dimensions.</p>
              <p className="text-bone-faint text-sm mb-12 max-w-md mx-auto">
                Calibrate your creative personality across four axes.
                Your responses will derive your I Ching hexagram reading.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStart}
              >
                Begin Calibration
              </button>

              <p className="text-bone-faint text-xs mt-8">~1 minute</p>
            </motion.div>
          </motion.div>
        )}

        {state === 'calibration' && (
          <motion.div
            key="calibration"
            className="container-sm page-padding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl text-bone mb-2">
                  Calibrate Your Axes
                </h2>
                <p className="text-bone-faint text-sm">
                  Adjust each slider to reflect your creative tendencies
                </p>
              </div>

              {/* Sliders */}
              <div className="space-y-6">
                {AXES_QUESTIONS.map((question) => (
                  <AxesSlider
                    key={question.id}
                    axis={question.axis}
                    prompt={question.prompt}
                    lowLabel={question.lowLabel}
                    highLabel={question.highLabel}
                    lowDescription={question.lowDescription}
                    highDescription={question.highDescription}
                    value={values[question.axis]}
                    onChange={(value) => handleValueChange(question.axis, value)}
                    disabled={state === 'processing'}
                  />
                ))}
              </div>

              {error && (
                <p className="text-state-error text-sm text-center mt-4">
                  {error}
                </p>
              )}

              {/* Submit Button */}
              <div className="flex justify-center gap-4 pt-8">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => router.push('/profile')}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={cn(
                    'btn',
                    allQuestionsAnswered
                      ? 'btn-primary'
                      : 'btn-secondary opacity-40 cursor-not-allowed'
                  )}
                  onClick={handleSubmit}
                  disabled={!allQuestionsAnswered || state === 'processing'}
                >
                  Derive Hexagram
                </button>
              </div>
            </div>
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
              <p className="text-bone-muted text-sm">Deriving hexagram...</p>
            </div>
          </motion.div>
        )}

        {state === 'reveal' && hexagram && (
          <motion.div
            key="reveal"
            className="container-sm page-padding text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="space-y-6"
            >
              <h2 className="font-display text-2xl md:text-3xl text-bone mb-2">
                Your Hexagram
              </h2>

              {/* Hexagram Display */}
              <div className="space-y-4">
                <div className="text-6xl font-display text-bone">
                  {hexagram.present.chinese}
                </div>

                <div className="space-y-1">
                  <p className="text-bone text-lg">
                    {hexagram.present.number}. {hexagram.present.name}
                  </p>
                  {hexagram.transforming && (
                    <p className="text-bone-muted text-sm">
                      → Transforming to {hexagram.transforming.number}.{' '}
                      {hexagram.transforming.name}
                    </p>
                  )}
                </div>

                {/* Hexagram Lines */}
                <div className="flex flex-col items-center gap-1 my-6">
                  {[...hexagram.present.lines].reverse().map((isYang, idx) => {
                    const lineNumber = 6 - idx;
                    const isMoving = hexagram.movingLines.includes(lineNumber);

                    return (
                      <motion.div
                        key={lineNumber}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.3 }}
                      >
                        <span className="text-bone-faint text-xs w-4">
                          {lineNumber}
                        </span>
                        <div className="flex gap-1">
                          {isYang ? (
                            <div
                              className={cn(
                                'w-16 h-1.5 rounded-full',
                                isMoving ? 'bg-state-success' : 'bg-bone'
                              )}
                            />
                          ) : (
                            <>
                              <div
                                className={cn(
                                  'w-7 h-1.5 rounded-full',
                                  isMoving ? 'bg-state-warning' : 'bg-bone'
                                )}
                              />
                              <div
                                className={cn(
                                  'w-7 h-1.5 rounded-full',
                                  isMoving ? 'bg-state-warning' : 'bg-bone'
                                )}
                              />
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Judgment */}
                <div className="max-w-lg mx-auto p-6 border border-bone-faint/20 rounded bg-void-lighter/20">
                  <p className="text-bone-muted text-sm leading-relaxed">
                    {hexagram.present.judgment}
                  </p>
                </div>

                {hexagram.movingLines.length > 0 && (
                  <p className="text-bone-faint text-xs">
                    {hexagram.movingLines.length} moving line
                    {hexagram.movingLines.length > 1 ? 's' : ''} detected —
                    transformation in progress
                  </p>
                )}
              </div>

              <div className="pt-8">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleContinue}
                >
                  View Advanced Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
