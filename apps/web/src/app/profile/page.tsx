'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlyphReveal } from '@/components/profiling/GlyphReveal';
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
    confidence: number;
  };
}

interface ProfilingProgress {
  signalCount: number;
  stagesCompleted: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [genome, setGenome] = useState<GenomeData | null>(null);
  const [progress, setProgress] = useState<ProfilingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = typeof window !== 'undefined'
    ? localStorage.getItem('subtaste_user_id')
    : null;

  useEffect(() => {
    async function fetchData() {
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
            confidence: genomeData.archetype.secondary.confidence,
          } : undefined,
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
    <div className="min-h-screen bg-void">
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              className="btn btn-secondary"
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
      </motion.div>
    </div>
  );
}
