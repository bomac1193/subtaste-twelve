'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlyphReveal } from '@/components/profiling/GlyphReveal';
import { useDebug } from '@/contexts/DebugContext';
import {
  PANTHEON,
  DESIGNATION_TO_SYMBOL,
  profileSharpness,
  distributionEntropy,
  type Glyph,
  type Seal,
  type CreativeMode,
  type Designation
} from '@subtaste/core';

interface GenomeData {
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
    designation: Designation;
    confidence: number;
  };
  distribution?: Record<Designation, number>;
}

interface ProfilingProgress {
  signalCount: number;
  stagesCompleted: string[];
}

function titleCase(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const { isDebugMode, debugUserId } = useDebug();
  const [genome, setGenome] = useState<GenomeData | null>(null);
  const [progress, setProgress] = useState<ProfilingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [oriCallback, setOriCallback] = useState<string | null>(null);

  const userId = typeof window !== 'undefined'
    ? (isDebugMode ? debugUserId : localStorage.getItem('subtaste_user_id'))
    : null;

  // Check for Ori/Nommo callback URL (stored by quiz page)
  useEffect(() => {
    try {
      const cb = sessionStorage.getItem('subtaste_callback');
      if (cb) setOriCallback(cb);
    } catch {
      // sessionStorage not available
    }
  }, []);

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
          seal: archetype.seal,
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
          sigil={genome.seal}
          essence={genome.essence}
          creativeMode={genome.creativeMode}
          shadow={genome.shadow}
          recogniseBy={genome.recogniseBy}
          confidence={genome.confidence}
          secondary={genome.secondary}
          onSigilReveal={handleSigilReveal}
        />

        {/* Genome Analysis */}
        {genome.distribution && (() => {
          const sorted = Object.entries(genome.distribution)
            .sort(([, a], [, b]) => b - a);
          const dominantDesignation = sorted[0]?.[0] as Designation;
          const subdominantDesignation = sorted[1]?.[0] as Designation;
          const dominant = PANTHEON[dominantDesignation];
          const subdominant = PANTHEON[subdominantDesignation];

          // Shadow = the archetype you collapse toward under stress (designed relationship)
          const shadowDesignation = dominant.stressTarget as Designation;
          const shadow = PANTHEON[shadowDesignation];

          return (
            <motion.div
              className="container-sm px-4 pb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <div className="space-y-4">
                {/* Profile Sharpness - entropy-based actionable banner */}
                {genome.distribution && (() => {
                  const sharpness = profileSharpness(genome.distribution);
                  if (sharpness === 'crystallized') return null;
                  const entropy = distributionEntropy(genome.distribution);
                  const sharpnessPercent = Math.round((1 - entropy) * 100);
                  const labels: Record<string, { label: string; hint: string }> = {
                    forming: { label: 'Profile forming', hint: 'More attunement will reveal clearer archetype separation.' },
                    emerging: { label: 'Profile emerging', hint: 'Patterns are appearing. Continue to sharpen your classification.' },
                    defined: { label: 'Profile defined', hint: 'Clear archetype identified. Further attunement refines the edges.' },
                  };
                  const { label, hint } = labels[sharpness];
                  return (
                    <div className="px-5 py-4 rounded border border-bone-faint/10 bg-void-elevated/60 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-xs text-bone-faint tracking-wider">{label}</p>
                          <div className="flex-1 h-1 bg-void-subtle rounded-full overflow-hidden">
                            <div className="h-full bg-bone-faint/40 rounded-full transition-all duration-1000" style={{ width: `${sharpnessPercent}%` }} />
                          </div>
                          <p className="text-[10px] text-bone-faint font-mono">{sharpnessPercent}%</p>
                        </div>
                        <p className="text-bone-faint text-[10px] leading-relaxed">{hint}</p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary text-[10px] px-3 py-1.5 shrink-0"
                        onClick={() => router.push('/training')}
                      >
                        Continue
                      </button>
                    </div>
                  );
                })()}

                {/* Dominant */}
                <div className="archetype-card">
                  <p className="text-xs capitalize tracking-wider text-bone-faint mb-6">Dominant</p>

                  {/* Classification Header */}
                  <div className="text-center mb-6">
                    <h3 className="font-display text-3xl text-bone mb-2">{titleCase(dominant.glyph)}</h3>
                    <p className="text-bone-faint font-mono text-sm tracking-wider mb-1">{dominant.symbol}</p>
                    <p className="text-bone-muted text-sm italic">{dominant.creativeMode}</p>
                    <p className="text-bone-faint/40 text-xs font-mono mt-2">
                      {((sorted[0]?.[1] ?? 0) * 100).toFixed(1)}%
                    </p>
                  </div>

                  {/* Body */}
                  <div className="pt-5 border-t border-border-subtle/50 space-y-3">
                    <p className="text-bone-muted text-sm leading-relaxed">{dominant.essence}</p>
                    <p className="text-bone-faint text-xs leading-relaxed">
                      Your primary mode of creative taste. This archetype shapes how you instinctively
                      select, curate, and judge creative work.
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border-subtle/50">
                    <p className="text-xs text-bone-faint">
                      <span className="capitalize tracking-wider">Recognised by:</span>{' '}
                      <span className="text-bone-muted">{dominant.recogniseBy}</span>
                    </p>
                  </div>

                  {/* Growth & Stress Directions */}
                  {(dominant.growthTarget || dominant.stressTarget) && (
                    <div className="mt-3 pt-3 border-t border-border-subtle flex gap-6">
                      {dominant.growthTarget && (() => {
                        const growth = PANTHEON[dominant.growthTarget!];
                        return (
                          <div className="flex-1">
                            <p className="text-[10px] tracking-wider text-bone-faint/50 mb-1">Growth Direction</p>
                            <p className="text-bone-muted text-xs">
                              {titleCase(growth.glyph)} <span className="font-mono text-bone-faint">{PANTHEON[dominant.growthTarget!].symbol}</span>
                            </p>
                            <p className="text-bone-faint text-[10px] mt-0.5 leading-relaxed">
                              Lean into {growth.creativeMode.toLowerCase()} thinking to evolve.
                            </p>
                          </div>
                        );
                      })()}
                      {dominant.stressTarget && (() => {
                        const stress = PANTHEON[dominant.stressTarget!];
                        return (
                          <div className="flex-1">
                            <p className="text-[10px] tracking-wider text-bone-faint/50 mb-1">Under Stress</p>
                            <p className="text-bone-muted/60 text-xs">
                              {titleCase(stress.glyph)} <span className="font-mono text-bone-faint">{PANTHEON[dominant.stressTarget!].symbol}</span>
                            </p>
                            <p className="text-bone-faint text-[10px] mt-0.5 leading-relaxed">
                              May collapse into {stress.creativeMode.toLowerCase()} patterns.
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Subdominant */}
                <div className="archetype-card opacity-80">
                  <p className="text-xs capitalize tracking-wider text-bone-faint mb-6">Subdominant</p>

                  {/* Classification Header */}
                  <div className="text-center mb-6">
                    <h3 className="font-display text-2xl text-bone-muted mb-2">{titleCase(subdominant.glyph)}</h3>
                    <p className="text-bone-faint font-mono text-sm tracking-wider mb-1">{subdominant.symbol}</p>
                    <p className="text-bone-faint text-sm italic">{subdominant.creativeMode}</p>
                    <p className="text-bone-faint/40 text-xs font-mono mt-2">
                      {((sorted[1]?.[1] ?? 0) * 100).toFixed(1)}%
                    </p>
                  </div>

                  {/* Body */}
                  <div className="pt-5 border-t border-border-subtle/50 space-y-3">
                    <p className="text-bone-faint text-sm leading-relaxed">{subdominant.essence}</p>
                    <p className="text-bone-faint text-xs leading-relaxed">
                      This modulates how your primary archetype expresses. It colours your decisions
                      when the dominant mode has no strong preference.
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border-subtle/50">
                    <p className="text-xs text-bone-faint">
                      <span className="capitalize tracking-wider">Recognised by:</span>{' '}
                      <span className="text-bone-muted/70">{subdominant.recogniseBy}</span>
                    </p>
                  </div>
                </div>

                {/* Shadow */}
                <div className="archetype-card opacity-60">
                  <p className="text-xs capitalize tracking-wider text-bone-faint mb-6">Shadow</p>

                  {/* Classification Header */}
                  <div className="text-center mb-6">
                    <h3 className="font-display text-2xl text-bone-faint mb-2">{titleCase(shadow.glyph)}</h3>
                    <p className="text-bone-faint/60 font-mono text-sm tracking-wider mb-1">{shadow.symbol}</p>
                    <p className="text-bone-faint text-sm italic">{shadow.creativeMode}</p>
                  </div>

                  {/* Body */}
                  <div className="pt-5 border-t border-border-subtle/50 space-y-3">
                    <p className="text-bone-faint text-sm leading-relaxed">{shadow.essence}</p>
                    <p className="text-bone-faint text-xs leading-relaxed">
                      Under pressure, your dominant archetype collapses toward {titleCase(shadow.glyph)}.
                      {` This manifests as over-relying on ${shadow.creativeMode.toLowerCase()} patterns at the expense of your natural strengths.`}
                    </p>
                    <p className="text-bone-faint text-xs leading-relaxed">
                      Awareness of this tendency is the antidote. When you notice yourself defaulting to
                      {` ${shadow.creativeMode.toLowerCase()} reflexes`}, pause and re-engage your dominant mode.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* Formal Classification (Detailed Distribution) */}
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
                    Formal Classification
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
                  {/* Full Distribution */}
                  <div>
                    <p className="text-xs capitalize tracking-wider text-bone-faint mb-4">
                      Complete Archetype Distribution
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(genome.distribution)
                        .sort(([, a], [, b]) => b - a)
                        .map(([designation, weight]) => {
                          const archetype = PANTHEON[designation as Designation];
                          const percentage = (weight * 100).toFixed(1);
                          const isPrimary = designation === genome.designation;
                          const isSecondary = designation === genome.secondary?.designation;

                          return (
                            <div
                              key={designation}
                              className={`rounded border px-3 py-3 text-center transition-all duration-500 cursor-default ${
                                isPrimary
                                  ? 'border-bone/30 bg-bone/5 hover:border-bone/50 hover:bg-bone/8'
                                  : isSecondary
                                    ? 'border-bone-faint/20 bg-bone/[0.02] hover:border-bone-faint/35 hover:bg-bone/[0.04]'
                                    : 'border-border-subtle/50 bg-void-lighter/20 hover:border-border-subtle hover:bg-void-lighter/40'
                              }`}
                            >
                              <p className={`font-display text-sm mb-0.5 ${
                                isPrimary ? 'text-bone' : isSecondary ? 'text-bone-muted' : 'text-bone-faint'
                              }`}>
                                {titleCase(archetype.glyph)}
                              </p>
                              <p className={`font-mono text-[10px] tracking-wider mb-1.5 ${
                                isPrimary ? 'text-bone-muted' : 'text-bone-faint/60'
                              }`}>
                                {archetype.symbol}
                              </p>
                              <p className="text-bone-faint text-[10px] italic mb-2">
                                {archetype.creativeMode}
                              </p>
                              <p className={`font-mono text-xs ${
                                isPrimary ? 'text-bone' : isSecondary ? 'text-bone-muted' : 'text-bone-faint'
                              }`}>
                                {percentage}%
                              </p>
                              <p className="text-bone-faint/30 text-[8px] tracking-wider mt-0.5">
                                Affinity
                              </p>
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
                        {genome.distribution && (() => {
                          const sharpness = profileSharpness(genome.distribution);
                          return (
                            <span className="ml-1">
                              • Classification: <span className="capitalize">{sharpness}</span>
                            </span>
                          );
                        })()}
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
              <p className="text-xs capitalize tracking-wider text-bone-faint mb-2">
                Next attunement available
              </p>
              <p className="text-bone-muted text-sm mb-4">
                {nextCalibrationStage === 'music'
                  ? 'Sharpen your classification with sonic preference mapping.'
                  : 'Deepen your genome with cross-domain attunement.'}
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => router.push(`/calibrate?stage=${nextCalibrationStage}`)}
              >
                {nextCalibrationStage === 'music' ? 'Sonic Attunement' : 'Deep Attunement'}
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
                Attunement
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => router.push('/axes')}
              >
                Axes Calibration
              </button>
            </div>

            {/* Return to Ori (if launched from Nommo) */}
            {oriCallback && userId && (
              <div className="flex justify-center">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    try {
                      const url = new URL(decodeURIComponent(oriCallback));
                      url.searchParams.set('subtaste_user_id', userId);
                      sessionStorage.removeItem('subtaste_callback');
                      window.location.href = url.toString();
                    } catch {
                      router.push('/');
                    }
                  }}
                >
                  Return to Ori
                </button>
              </div>
            )}

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
