'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TrainingCard } from '@/components/profiling/TrainingCard';

type TrainingState = 'intro' | 'training' | 'processing' | 'complete';

interface TrainingOption {
  id: string;
  text: string;
}

interface Card {
  id: string;
  topic: string;
  options: TrainingOption[];
}

interface TrainingSession {
  cards: Card[];
  userId?: string;
}

interface TrainingSubmission {
  cardId: string;
  bestId: string;
  worstId: string;
}

export default function TrainingPage() {
  const router = useRouter();
  const [state, setState] = useState<TrainingState>('intro');
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submissions, setSubmissions] = useState<TrainingSubmission[]>([]);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [totalXP, setTotalXP] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const MINIMUM_CARDS = 15;

  const handleStart = useCallback(async () => {
    setState('processing');
    setError(null);

    try {
      // Get or create userId
      let userId = localStorage.getItem('subtaste_user_id');

      // Start training session
      const response = await fetch('/api/v2/training/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          cardCount: MINIMUM_CARDS
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start training session');
      }

      setSession(data);
      if (data.userId) {
        localStorage.setItem('subtaste_user_id', data.userId);
      }
      setState('training');
    } catch (err) {
      console.error('Training start error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setState('intro');
    }
  }, []);

  const handleCardSubmit = useCallback(async (bestId: string, worstId: string) => {
    if (!session) return;

    const currentCard = session.cards[currentIndex];
    if (!currentCard) return;

    setState('processing');
    setError(null);

    try {
      // Submit the training response
      const userId = localStorage.getItem('subtaste_user_id');
      const submission: TrainingSubmission = {
        cardId: currentCard.id,
        bestId,
        worstId,
      };

      const response = await fetch('/api/v2/training/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          cardId: currentCard.id,
          bestId,
          worstId,
          topic: currentCard.topic,
          completedTopics: Array.from(completedTopics),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit training response');
      }

      // Update state
      setSubmissions([...submissions, submission]);
      setCompletedTopics(new Set([...completedTopics, currentCard.topic]));
      setTotalXP(totalXP + data.xp);

      // Move to next card or complete
      if (currentIndex + 1 < session.cards.length) {
        setCurrentIndex(currentIndex + 1);
        setState('training');
      } else {
        setState('complete');
      }
    } catch (err) {
      console.error('Training submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setState('training');
    }
  }, [session, currentIndex, submissions, completedTopics, totalXP]);

  const handleContinue = useCallback(() => {
    router.push('/profile');
  }, [router]);

  const currentCard = session?.cards[currentIndex];
  const progress = session ? ((currentIndex + 1) / session.cards.length) * 100 : 0;
  const isLastCard = session && currentIndex === session.cards.length - 1;

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
                TASTE TRAINING
              </h1>
              <p className="text-bone-muted mb-2">
                {MINIMUM_CARDS} creative preference cards.
              </p>
              <p className="text-bone-faint text-sm mb-12 max-w-md mx-auto">
                For each card, select your most and least preferred approaches.
                Your choices will refine your taste profile and extract keyword patterns.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStart}
              >
                Begin Training
              </button>

              <p className="text-bone-faint text-xs mt-8">~2 minutes</p>
            </motion.div>
          </motion.div>
        )}

        {state === 'training' && currentCard && (
          <motion.div
            key={`training-${currentIndex}`}
            className="container-sm page-padding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs text-bone-faint mb-2">
                <span>Card {currentIndex + 1} of {session.cards.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1 bg-void-lighter rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-bone-faint"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* XP Display */}
            {totalXP > 0 && (
              <motion.div
                className="text-center mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="text-state-success text-sm font-mono">
                  +{totalXP} XP
                </span>
              </motion.div>
            )}

            {/* Training Card */}
            <TrainingCard
              card={currentCard}
              onSubmit={handleCardSubmit}
              disabled={state === 'processing'}
            />

            {error && (
              <p className="text-state-error text-sm text-center mt-4">{error}</p>
            )}

            {/* Cancel Option */}
            <div className="text-center mt-8">
              <button
                type="button"
                className="text-bone-faint text-xs hover:text-bone-muted transition-colors"
                onClick={() => router.push('/')}
              >
                Exit Training
              </button>
            </div>
          </motion.div>
        )}

        {state === 'processing' && !currentCard && (
          <motion.div
            key="processing"
            className="container-sm page-padding text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="space-y-4">
              <div className="w-8 h-8 border-2 border-bone-faint border-t-bone rounded-full animate-spin mx-auto" />
              <p className="text-bone-muted text-sm">Processing...</p>
            </div>
          </motion.div>
        )}

        {state === 'complete' && (
          <motion.div
            key="complete"
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
              <div className="text-6xl mb-4">✓</div>

              <h2 className="font-display text-2xl md:text-3xl text-bone mb-2">
                Training Complete
              </h2>

              <div className="space-y-2 text-bone-muted">
                <p>
                  Completed {submissions.length} cards
                </p>
                <p className="text-state-success font-mono text-lg">
                  +{totalXP} XP Earned
                </p>
                <p className="text-sm text-bone-faint">
                  {completedTopics.size} unique topics explored
                </p>
              </div>

              <div className="pt-8">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleContinue}
                >
                  View Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
