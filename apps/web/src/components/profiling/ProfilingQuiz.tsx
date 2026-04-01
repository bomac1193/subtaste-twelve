'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BinaryChoice } from './BinaryChoice';
import { LikertScale } from './LikertScale';
import { ProgressIndicator } from './ProgressIndicator';
import { QuestionPrompt } from './QuestionPrompt';
import type { Glyph } from '@subtaste/core';

/**
 * Question types from @subtaste/profiler
 */
type QuestionType = 'binary' | 'likert' | 'ranking';

interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  subtext?: string;
  options?: [string, string];
  scale?: 5 | 7;
  lowLabel?: string;
  highLabel?: string;
}

interface ProfilingQuizProps {
  questions: Question[];
  stageName: string;
  stageDescription?: string;
  onComplete: (responses: Array<{ questionId: string; response: number }>) => void;
  onCancel?: () => void;
}

const CHECKPOINT_KEY = 'subtaste_quiz_checkpoint';
const CHECKPOINT_MAX_AGE = 60 * 60 * 1000; // 1 hour

/**
 * Profiling Quiz Component
 *
 * Orchestrates the profiling flow with progressive questions.
 * Supports skip, mid-quiz checkpointing, and resume.
 * Gothic cold futuristic aesthetic. No emojis. No gamification.
 */
export function ProfilingQuiz({
  questions,
  stageName,
  stageDescription,
  onComplete,
  onCancel,
}: ProfilingQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Array<{ questionId: string; response: number }>>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [resumed, setResumed] = useState(false);

  // Restore checkpoint on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECKPOINT_KEY);
      if (!raw) return;

      const checkpoint = JSON.parse(raw);
      if (
        checkpoint.stageName === stageName &&
        checkpoint.currentIndex > 0 &&
        Date.now() - checkpoint.savedAt < CHECKPOINT_MAX_AGE
      ) {
        setCurrentIndex(checkpoint.currentIndex);
        setResponses(checkpoint.responses);
        setResumed(true);
        setTimeout(() => setResumed(false), 2000);
      } else {
        localStorage.removeItem(CHECKPOINT_KEY);
      }
    } catch {
      localStorage.removeItem(CHECKPOINT_KEY);
    }
  }, [stageName]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const saveCheckpoint = useCallback((newResponses: Array<{ questionId: string; response: number }>, nextIndex: number) => {
    try {
      localStorage.setItem(CHECKPOINT_KEY, JSON.stringify({
        stageName,
        currentIndex: nextIndex,
        responses: newResponses,
        savedAt: Date.now(),
      }));
    } catch {
      // localStorage full or unavailable
    }
  }, [stageName]);

  const handleResponse = useCallback((response: number) => {
    if (isTransitioning) return;

    const questionResponse = {
      questionId: currentQuestion.id,
      response,
    };

    const newResponses = [...responses, questionResponse];
    setResponses(newResponses);

    if (isLastQuestion) {
      // Clear checkpoint on completion
      localStorage.removeItem(CHECKPOINT_KEY);
      onComplete(newResponses);
    } else {
      // Save checkpoint for resume
      saveCheckpoint(newResponses, currentIndex + 1);

      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsTransitioning(false);
      }, 300);
    }
  }, [currentQuestion, isLastQuestion, isTransitioning, onComplete, responses, currentIndex, saveCheckpoint]);

  const handleSkip = useCallback(() => {
    // -1 = skip sentinel. The API treats this as a low-confidence uniform signal.
    handleResponse(-1);
  }, [handleResponse]);

  return (
    <div className="container-sm page-padding">
      {/* Stage header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-sm capitalize tracking-wider text-bone-muted mb-2">
          {stageName}
        </h1>
        {stageDescription && (
          <p className="text-bone-faint text-sm">{stageDescription}</p>
        )}
        {resumed && (
          <motion.p
            className="text-bone-faint text-xs mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Resuming where you left off
          </motion.p>
        )}
      </motion.div>

      {/* Progress */}
      <div className="flex justify-center mb-12">
        <ProgressIndicator
          total={questions.length}
          current={currentIndex}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <QuestionPrompt
            prompt={currentQuestion.prompt}
            subtext={currentQuestion.subtext}
          />

          {/* Answer UI based on question type */}
          {currentQuestion.type === 'binary' && currentQuestion.options && (
            <BinaryChoice
              options={currentQuestion.options}
              selected={null}
              onSelect={(index) => handleResponse(index)}
              disabled={isTransitioning}
            />
          )}

          {currentQuestion.type === 'likert' && currentQuestion.scale && (
            <LikertScale
              scale={currentQuestion.scale}
              lowLabel={currentQuestion.lowLabel || 'Strongly disagree'}
              highLabel={currentQuestion.highLabel || 'Strongly agree'}
              selected={null}
              onSelect={(value) => handleResponse(value)}
              disabled={isTransitioning}
            />
          )}

          {/* Skip button */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isTransitioning}
              className="text-bone-faint text-xs uppercase tracking-wider hover:text-bone-muted transition-colors disabled:opacity-50"
            >
              Skip
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Cancel option */}
      {onCancel && (
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <button
            type="button"
            className="btn-ghost text-bone-faint"
            onClick={onCancel}
          >
            Cancel
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default ProfilingQuiz;
