'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TrainingCard } from '@/components/profiling/TrainingCard';
import { useDebug } from '@/contexts/DebugContext';

const CHECKPOINT_KEY = 'subtaste_training_checkpoint';

type TrainingState = 'loading' | 'intro' | 'already-attuned' | 'training' | 'processing' | 'complete';

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

interface SubmissionRecord {
  bestId: string;
  worstId: string;
}

interface TrainingCheckpoint {
  session: TrainingSession;
  currentIndex: number;
  submissions: TrainingSubmission[];
  submissionHistory: Record<number, SubmissionRecord>;
  completedTopics: string[];
  signalCount: number;
  savedAt: string;
}

function saveCheckpoint(data: TrainingCheckpoint) {
  try {
    localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

function loadCheckpoint(): TrainingCheckpoint | null {
  try {
    const raw = localStorage.getItem(CHECKPOINT_KEY);
    if (!raw) return null;
    const checkpoint = JSON.parse(raw) as TrainingCheckpoint;
    // Expire checkpoints older than 24 hours
    const savedAt = new Date(checkpoint.savedAt).getTime();
    if (Date.now() - savedAt > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(CHECKPOINT_KEY);
      return null;
    }
    // Migrate old checkpoints without submissionHistory
    if (!checkpoint.submissionHistory) {
      checkpoint.submissionHistory = {};
    }
    return checkpoint;
  } catch {
    return null;
  }
}

function clearCheckpoint() {
  localStorage.removeItem(CHECKPOINT_KEY);
}

export default function TrainingPage() {
  const router = useRouter();
  const { isDebugMode, debugUserId, setDebugUserId, exitDebug } = useDebug();
  const [state, setState] = useState<TrainingState>('loading');
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submissions, setSubmissions] = useState<TrainingSubmission[]>([]);
  const [submissionHistory, setSubmissionHistory] = useState<Record<number, SubmissionRecord>>({});
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [signalCount, setSignalCount] = useState(0);
  const [existingSignalCount, setExistingSignalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasCheckpoint, setHasCheckpoint] = useState(false);
  const [checkpointProgress, setCheckpointProgress] = useState(0);

  // Check for existing checkpoint + trained state on mount
  useEffect(() => {
    const checkpoint = loadCheckpoint();
    if (checkpoint && checkpoint.session && checkpoint.currentIndex < checkpoint.session.cards.length) {
      setHasCheckpoint(true);
      setCheckpointProgress(checkpoint.currentIndex);
    }

    // Check if user already has signals (i.e. has trained before)
    const userIdKey = isDebugMode ? 'subtaste_debug_user_id' : 'subtaste_user_id';
    const userId = localStorage.getItem(userIdKey);
    if (userId) {
      fetch(`/api/v2/signals/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.signalCount && data.signalCount > 0) {
            setExistingSignalCount(data.signalCount);
            // If no checkpoint in progress, show already-attuned state
            if (!checkpoint || !checkpoint.session || checkpoint.currentIndex >= checkpoint.session.cards.length) {
              setState('already-attuned');
              return;
            }
          }
          setState('intro');
        })
        .catch(() => {
          setState('intro');
        });
    } else {
      setState('intro');
    }
  }, [isDebugMode]);

  const resumeFromCheckpoint = useCallback(() => {
    const checkpoint = loadCheckpoint();
    if (!checkpoint) return;
    setSession(checkpoint.session);
    setCurrentIndex(checkpoint.currentIndex);
    setSubmissions(checkpoint.submissions);
    setSubmissionHistory(checkpoint.submissionHistory || {});
    setCompletedTopics(new Set(checkpoint.completedTopics));
    setSignalCount(checkpoint.signalCount);
    setState('training');
    setHasCheckpoint(false);
  }, []);

  const handleStart = useCallback(async () => {
    setState('processing');
    setError(null);
    clearCheckpoint();
    setHasCheckpoint(false);

    try {
      const userIdKey = isDebugMode ? 'subtaste_debug_user_id' : 'subtaste_user_id';
      let userId = localStorage.getItem(userIdKey);

      const response = await fetch('/api/v2/training/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start session');
      }

      setSession(data);
      setCurrentIndex(0);
      setSubmissions([]);
      setSubmissionHistory({});
      setCompletedTopics(new Set());
      setSignalCount(0);

      if (data.userId) {
        localStorage.setItem(userIdKey, data.userId);
        if (isDebugMode) {
          setDebugUserId(data.userId);
        }
      }

      // Save initial checkpoint
      saveCheckpoint({
        session: data,
        currentIndex: 0,
        submissions: [],
        submissionHistory: {},
        completedTopics: [],
        signalCount: 0,
        savedAt: new Date().toISOString(),
      });

      setState('training');
    } catch (err) {
      console.error('Session start error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setState('intro');
    }
  }, [isDebugMode, setDebugUserId]);

  const handleCardSubmit = useCallback(async (bestId: string, worstId: string) => {
    if (!session) return;

    const currentCard = session.cards[currentIndex];
    if (!currentCard) return;

    // Check if this is a revision (going back to a previously answered card)
    const previousSubmission = submissionHistory[currentIndex];
    const isRevision = !!previousSubmission;

    // If revisiting but selections unchanged, just advance without resubmitting
    if (isRevision && previousSubmission.bestId === bestId && previousSubmission.worstId === worstId) {
      const newIndex = currentIndex + 1;
      if (newIndex < session.cards.length) {
        setCurrentIndex(newIndex);
      } else {
        clearCheckpoint();
        setState('complete');
      }
      return;
    }

    setState('processing');
    setError(null);

    try {
      const userIdKey = isDebugMode ? 'subtaste_debug_user_id' : 'subtaste_user_id';
      const userId = localStorage.getItem(userIdKey);
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
          // Revision fields
          isRevision,
          originalBestId: isRevision ? previousSubmission.bestId : undefined,
          originalWorstId: isRevision ? previousSubmission.worstId : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit response');
      }

      // Update submission history for this card index
      const newHistory = {
        ...submissionHistory,
        [currentIndex]: { bestId, worstId }
      };

      // Update state
      const newSubmissions = isRevision ? submissions : [...submissions, submission];
      const newTopics = new Set([...completedTopics, currentCard.topic]);
      // Revisions still show +2 to user (the API handles 4 signals internally)
      const newSignalCount = signalCount + 2;
      const newIndex = currentIndex + 1;

      setSubmissions(newSubmissions);
      setSubmissionHistory(newHistory);
      setCompletedTopics(newTopics);
      setSignalCount(newSignalCount);

      // Move to next card or complete
      if (newIndex < session.cards.length) {
        setCurrentIndex(newIndex);
        setState('training');

        // Save checkpoint
        saveCheckpoint({
          session,
          currentIndex: newIndex,
          submissions: newSubmissions,
          submissionHistory: newHistory,
          completedTopics: Array.from(newTopics),
          signalCount: newSignalCount,
          savedAt: new Date().toISOString(),
        });
      } else {
        clearCheckpoint();
        setState('complete');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setState('training');
    }
  }, [session, currentIndex, submissions, submissionHistory, completedTopics, signalCount, isDebugMode]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setState('training');
    }
  }, [currentIndex]);

  const handleContinue = useCallback(async () => {
    clearCheckpoint();
    router.push('/profile');
  }, [router]);

  const currentCard = session?.cards[currentIndex];
  const progress = session ? ((currentIndex) / session.cards.length) * 100 : 0;

  // Get previous selections for current card (if revisiting)
  const currentSubmission = submissionHistory[currentIndex];

  return (
    <div className={`min-h-screen bg-void ${isDebugMode ? 'pt-12' : ''}`}>
      <AnimatePresence mode="wait">
        {state === 'loading' && (
          <motion.div
            key="loading"
            className="container-sm page-padding text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-bone-faint border-t-bone rounded-full animate-spin" />
            </div>
          </motion.div>
        )}

        {state === 'already-attuned' && (
          <motion.div
            key="already-attuned"
            className="container-sm page-padding text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="min-h-[60vh] flex flex-col items-center justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <h1 className="font-display text-3xl md:text-4xl text-bone mb-4">
                Already Attuned
              </h1>
              <p className="text-bone-muted mb-2">
                Your nommo has absorbed {existingSignalCount} signals.
              </p>
              <p className="text-bone-faint text-sm mb-12 max-w-md mx-auto">
                You can deepen your attunement with another session, or view your current profile.
              </p>

              <div className="space-y-3">
                {hasCheckpoint && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={resumeFromCheckpoint}
                  >
                    Continue Session ({checkpointProgress} cards in)
                  </button>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleStart}
                  >
                    Deepen Attunement
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => router.push('/profile')}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

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
                Taste Attunement
              </h1>
              {isDebugMode && (
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-state-warning/20 text-state-warning text-xs font-mono rounded-full border border-state-warning/40">
                    Testing Mode
                  </span>
                </div>
              )}
              <p className="text-bone-muted mb-2">
                20-25 creative preference cards.
              </p>
              <p className="text-bone-faint text-sm mb-12 max-w-md mx-auto">
                For each card, select the approach closest to you and the one furthest from you.
                Each choice deepens your nommo.
              </p>

              <div className="space-y-3">
                {hasCheckpoint && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={resumeFromCheckpoint}
                  >
                    Continue Session ({checkpointProgress} cards in)
                  </button>
                )}
                <button
                  type="button"
                  className={hasCheckpoint ? 'btn btn-secondary' : 'btn btn-primary'}
                  onClick={handleStart}
                >
                  {hasCheckpoint ? 'Start Fresh' : isDebugMode ? 'Start Debug Session' : 'Begin Attunement'}
                </button>
              </div>

              <p className="text-bone-faint text-xs mt-8">2 minutes</p>
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
                <span>Card {currentIndex + 1} of {session!.cards.length}</span>
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

            {/* Signal absorption indicator */}
            {signalCount > 0 && (
              <motion.div
                className="text-center mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="text-bone-faint text-xs font-mono">
                  {signalCount} signals absorbed
                </span>
              </motion.div>
            )}

            {/* Training Card — pass previous selections if revisiting */}
            <TrainingCard
              card={currentCard}
              onSubmit={handleCardSubmit}
              disabled={(state as string) === 'processing'}
              initialBestId={currentSubmission?.bestId}
              initialWorstId={currentSubmission?.worstId}
              showBack={currentIndex > 0}
              onBack={handleBack}
            />

            {error && (
              <p className="text-state-error text-sm text-center mt-4">{error}</p>
            )}

            {/* Save & Exit */}
            <div className="text-center mt-8">
              <button
                type="button"
                className="text-bone-faint text-xs hover:text-bone-muted transition-colors"
                disabled={(state as string) === 'processing'}
                onClick={() => {
                  if (session) {
                    saveCheckpoint({
                      session,
                      currentIndex,
                      submissions,
                      submissionHistory,
                      completedTopics: Array.from(completedTopics),
                      signalCount,
                      savedAt: new Date().toISOString(),
                    });
                  }
                  router.push('/');
                }}
              >
                Save & Exit
              </button>
            </div>
          </motion.div>
        )}

        {(state as string) === 'processing' && !currentCard && (
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
            className="container-sm page-padding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="min-h-[80vh] flex items-center justify-center">
              <motion.div
                className="relative text-center max-w-lg mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Radial glow behind content */}
                <div className="absolute inset-0 -z-10">
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, rgba(212,175,55,0.02) 40%, transparent 70%)',
                    }}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>

                {/* Pulse ring */}
                <motion.div
                  className="w-24 h-24 mx-auto mb-8 rounded-full border border-bone-faint/20 flex items-center justify-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <motion.div
                    className="w-16 h-16 rounded-full border border-bone-faint/30 flex items-center justify-center"
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(232,228,221,0)',
                        '0 0 0 12px rgba(232,228,221,0.04)',
                        '0 0 0 0 rgba(232,228,221,0)',
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <motion.div
                      className="w-3 h-3 rounded-full bg-bone/60"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </motion.div>
                </motion.div>

                <motion.h2
                  className="font-display text-3xl md:text-4xl text-bone mb-3"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  Attunement Complete
                </motion.h2>

                {isDebugMode && (
                  <motion.div
                    className="mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <span className="inline-block px-3 py-1 bg-state-warning/20 text-state-warning text-xs font-mono rounded-full border border-state-warning/40">
                      Debug Session Complete
                    </span>
                  </motion.div>
                )}

                <motion.div
                  className="space-y-2 mb-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                >
                  <p className="text-bone text-lg">
                    Your nommo absorbed <span className="font-mono text-bone-muted">{signalCount}</span> new signals
                  </p>
                  <p className="text-sm text-bone-faint">
                    {completedTopics.size} topics explored across {submissions.length} cards
                  </p>
                  <motion.p
                    className="text-xs text-bone-faint/50 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    Your profile has been saved and will persist across sessions.
                  </motion.p>
                </motion.div>

                {/* Signal bar visualization */}
                <motion.div
                  className="w-full max-w-xs mx-auto mb-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <div className="h-1 bg-void-lighter rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-bone/40"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 1.4, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </motion.div>

                {isDebugMode && (
                  <motion.div
                    className="mb-8 pt-4 border-t border-border-subtle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6 }}
                  >
                    <p className="text-xs text-bone-faint mb-2">Debug Info:</p>
                    <p className="text-xs font-mono text-bone-muted">
                      Signals Generated: {signalCount}
                    </p>
                    <p className="text-xs font-mono text-bone-muted">
                      Test User ID: {localStorage.getItem('subtaste_debug_user_id')?.substring(0, 12)}...
                    </p>
                  </motion.div>
                )}

                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8, duration: 0.8 }}
                >
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleContinue}
                  >
                    {isDebugMode ? 'View Debug Profile' : 'View Profile'}
                  </button>
                  {isDebugMode && (
                    <div>
                      <button
                        type="button"
                        className="btn-ghost text-bone-faint text-sm"
                        onClick={() => {
                          exitDebug();
                          clearCheckpoint();
                          setState('intro');
                          setSession(null);
                          setCurrentIndex(0);
                          setSubmissions([]);
                          setSubmissionHistory({});
                          setCompletedTopics(new Set());
                          setSignalCount(0);
                        }}
                      >
                        Reset & Exit Debug Mode
                      </button>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
