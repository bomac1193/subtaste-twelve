'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlyphReveal } from '@/components/profiling/GlyphReveal';
import { useDebug } from '@/contexts/DebugContext';
import {
  PANTHEON,
  type Glyph,
  type Sigil,
  type CreativeMode,
  type Designation
} from '@subtaste/core';

interface GenomeData {
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
    designation: Designation;
    confidence: number;
  };
  distribution?: Record<Designation, number>;
}

interface ProfilingProgress {
  signalCount: number;
  stagesCompleted: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const { isDebugMode, debugUserId } = useDebug();
  const [genome, setGenome] = useState<GenomeData | null>(null);
  const [progress, setProgress] = useState<ProfilingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const userId = typeof window !== 'undefined'
    ? (isDebugMode ? debugUserId : localStorage.getItem('subtaste_user_id'))
    : null;

  useEffect(() => {
    async function fetchData() {
      // Debug logging
      console.log('[Profile] Debug mode:', isDebugMode);
      console.log('[Profile] Debug user ID:', debugUserId);
      console.log('[Profile] Normal user ID:', localStorage.getItem('subtaste_user_id'));
      console.log('[Profile] Using user ID:', userId);

      if (!userId) {
        router.push('/quiz');
        return;
      }

      try {
        const [genomeRes, progressRes] = await Promise.all([
          fetch(`/api/v2/genome/${userId}/public`),
          fetch(`/api/v2/quiz?userId=${userId}`),
        ]);

        if (!genomeRes.ok) {
          throw new Error('Failed to fetch genome');
        }

        const genomeData = await genomeRes.json();
        const progressData = await progressRes.json();

        const designation = genomeData.archetype.primary.designation as Designation;
        const archetype = PANTHEON[designation];

        setGenome({
          glyph: archetype.glyph,
          designation,
          sigil: archetype.sigil,
          essence: archetype.essence,
          creativeMode: archetype.creativeMode as CreativeMode,
          shadow: archetype.shadow,
          recogniseBy: archetype.recogniseBy,
          confidence: genomeData.confidence,
          secondary: genomeData.archetype.secondary ? {
            glyph: genomeData.archetype.secondary.glyph,
            designation: genomeData.archetype.secondary.designation,
            confidence: genomeData.archetype.secondary.confidence,
          } : undefined,
          distribution: genomeData.archetype.distribution,
        });

        setProgress(progressData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId, router]);

  const handleSigilReveal = useCallback(async () => {
    if (!userId) return;
    try {
      await fetch(`/api/v2/genome/${userId}/sigil`, { method: 'POST' });
    } catch (err) {
      console.error('Sigil reveal error:', err);
    }
  }, [userId]);

  // Check if calibration is available
  const calibrationAvailable = progress && (
    (progress.signalCount >= 5 && !progress.stagesCompleted.includes('music')) ||
    (progress.stagesCompleted.includes('music') && !progress.stagesCompleted.includes('deep'))
  );

  const nextCalibrationStage = progress && !progress.stagesCompleted.includes('music')
    ? 'music'
    : 'deep';

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-8 h-8 border-2 border-bone-faint border-t-bone rounded-full animate-spin mx-auto" />
          <p className="text-bone-muted text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !genome) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="container-sm text-center">
          <p className="text-bone-muted mb-4">{error || 'Profile not found'}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => router.push('/quiz')}
          >
            Take the quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-void ${isDebugMode ? 'pt-12' : ''}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <GlyphReveal
          glyph={genome.glyph}
          sigil={genome.sigil}
          essence={genome.essence}
          creativeMode={genome.creativeMode}
          shadow={genome.shadow}
          recogniseBy={genome.recogniseBy}
          confidence={genome.confidence}
          secondary={genome.secondary}
          onSigilReveal={handleSigilReveal}
        />

        {/* Archetype Breakdown */}
        {genome.distribution && (
          <motion.div
            className="container-sm px-4 pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div className="archetype-card">
              <button
                type="button"
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full flex items-center justify-between text-left group"
              >
                <div>
                  <h3 className="text-sm font-display tracking-wider text-bone mb-1">
                    FORMAL CLASSIFICATION
                  </h3>
                  <p className="text-xs text-bone-faint">
                    View detailed archetype breakdown
                  </p>
                </div>
                <svg
                  className={`w-5 h-5 text-bone-faint transition-transform ${showBreakdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showBreakdown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 pt-6 border-t border-border-subtle space-y-6"
                >
                  {/* Primary & Secondary Summary */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-bone-faint mb-2">Primary Archetype</p>
                      <div className="flex items-center justify-between">
                        <span className="text-bone font-mono">{genome.glyph} {genome.designation}</span>
                        <span className="text-bone-muted text-sm">
                          {(genome.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-bone-faint mt-1 italic">{genome.creativeMode}</p>
                    </div>

                    {genome.secondary && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-bone-faint mb-2">Secondary Archetype</p>
                        <div className="flex items-center justify-between">
                          <span className="text-bone-muted font-mono">{genome.secondary.glyph} {genome.secondary.designation}</span>
                          <span className="text-bone-muted text-sm">
                            {(genome.secondary.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-xs text-bone-faint mt-1 italic">
                          {PANTHEON[genome.secondary.designation].creativeMode}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Full Distribution */}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-bone-faint mb-3">
                      Complete Archetype Distribution
                    </p>
                    <div className="space-y-2">
                      {Object.entries(genome.distribution)
                        .sort(([, a], [, b]) => b - a)
                        .map(([designation, weight]) => {
                          const archetype = PANTHEON[designation as Designation];
                          const percentage = (weight * 100).toFixed(1);
                          const isPrimary = designation === genome.designation;
                          const isSecondary = designation === genome.secondary?.designation;

                          return (
                            <div key={designation} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-mono ${
                                  isPrimary ? 'text-bone' :
                                  isSecondary ? 'text-bone-muted' :
                                  'text-bone-faint'
                                }`}>
                                  {archetype.glyph} {designation}
                                  {isPrimary && ' (Primary)'}
                                  {isSecondary && ' (Secondary)'}
                                </span>
                                <span className="text-xs text-bone-faint">{percentage}%</span>
                              </div>
                              <div className="h-1 bg-void-lighter rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    isPrimary ? 'bg-bone' :
                                    isSecondary ? 'bg-bone-muted' :
                                    'bg-bone-faint'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Signal Count Info */}
                  {progress && (
                    <div className="pt-4 border-t border-border-subtle">
                      <p className="text-xs text-bone-faint text-center">
                        Based on {progress.signalCount} signals • {progress.stagesCompleted.length}/3 stages completed
                      </p>
                      <p className="text-xs text-bone-faint text-center mt-1">
                        More signals = higher confidence and better understanding
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Calibration prompt */}
        {calibrationAvailable && (
          <motion.div
            className="container-sm px-4 pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <div className="archetype-card text-center">
              <p className="text-xs uppercase tracking-wider text-bone-faint mb-2">
                Calibration Available
              </p>
              <p className="text-bone-muted text-sm mb-4">
                {nextCalibrationStage === 'music'
                  ? 'Refine your profile with music-specific questions.'
                  : 'Unlock your full taste genome with deep calibration.'}
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => router.push(`/calibrate?stage=${nextCalibrationStage}`)}
              >
                {nextCalibrationStage === 'music' ? 'Music Calibration' : 'Deep Calibration'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Progress indicator */}
        {progress && (
          <div className="container-sm px-4 pb-8">
            <div className="text-center text-bone-faint text-xs">
              <p>
                Stages: {progress.stagesCompleted.length}/3 |{' '}
                Signals: {progress.signalCount}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="container-sm px-4 pb-16">
          <div className="flex flex-col gap-6">
            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => router.push('/advanced')}
              >
                Advanced Profile
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => router.push('/training')}
              >
                Training
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => router.push('/axes')}
              >
                Axes Calibration
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                className="btn-ghost text-bone-muted"
                onClick={() => router.push('/quiz')}
              >
                Retake quiz
              </button>
              <button
                type="button"
                className="btn-ghost text-bone-faint"
                onClick={() => router.push('/')}
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
