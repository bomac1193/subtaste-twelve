'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HexagramDisplay } from '@/components/profiling/HexagramDisplay';
import { PANTHEON, type Designation } from '@subtaste/core';
import { cn } from '@/lib/utils';

interface TasteGenome {
  userId: string;
  archetype: {
    primary: {
      designation: Designation;
      confidence: number;
    };
  };
  axes?: {
    orderChaos: number;
    mercyRuthlessness: number;
    introvertExtrovert: number;
    faithDoubt: number;
  };
  iching?: {
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
  };
  keywords?: {
    visual: Record<string, { score: number; count: number }>;
    content: Record<string, { score: number; count: number }>;
  };
  gamification?: {
    xp: number;
    tier: string;
  };
}

export default function AdvancedPage() {
  const router = useRouter();
  const [genome, setGenome] = useState<TasteGenome | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenome = async () => {
      try {
        const userId = localStorage.getItem('subtaste_user_id');

        if (!userId) {
          router.push('/');
          return;
        }

        const response = await fetch(`/api/v2/genome/${userId}/public`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load profile');
        }

        setGenome(data.genome);
      } catch (err) {
        console.error('Load error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchGenome();
  }, [router]);

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
        <div className="text-center space-y-4">
          <p className="text-state-error">{error || 'Profile not found'}</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.push('/profile')}
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  const archetype = PANTHEON[genome.archetype.primary.designation];
  const hasAxes = !!genome.axes;
  const hasKeywords = !!genome.keywords;
  const hasGamification = !!genome.gamification;

  // Get top keywords
  const getTopKeywords = (
    category: Record<string, { score: number; count: number }>,
    limit: number = 10
  ) => {
    return Object.entries(category)
      .map(([keyword, { score, count }]) => ({ keyword, score, count }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  };

  const topVisual = hasKeywords
    ? getTopKeywords(genome.keywords!.visual, 8)
    : [];
  const topContent = hasKeywords
    ? getTopKeywords(genome.keywords!.content, 8)
    : [];

  return (
    <div className="min-h-screen bg-void">
      <div className="container-lg page-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="font-display text-3xl md:text-4xl text-bone tracking-tight">
              ADVANCED PROFILE
            </h1>
            <p className="text-bone-muted">
              Deep insights into your creative genome
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Archetype Details */}
            <motion.section
              className="p-6 rounded border border-bone-faint/20 bg-void-lighter/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-bone text-lg font-display mb-4">
                Archetype Profile
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-bone-faint text-xs mb-1">Primary</p>
                  <p className="text-bone text-2xl font-display">
                    {archetype.glyph}
                  </p>
                  <p className="text-bone-muted text-sm">{archetype.sigil}</p>
                </div>

                {archetype.phase && (
                  <div>
                    <p className="text-bone-faint text-xs mb-1">Phase</p>
                    <p className="text-bone capitalize">{archetype.phase}</p>
                  </div>
                )}

                {archetype.wuXingElement && (
                  <div>
                    <p className="text-bone-faint text-xs mb-1">Wu Xing Element</p>
                    <p className="text-bone capitalize">
                      {archetype.wuXingElement}
                    </p>
                  </div>
                )}

                {archetype.growthTarget && (
                  <div>
                    <p className="text-bone-faint text-xs mb-1">Growth Path</p>
                    <p className="text-bone-muted text-sm">
                      → {PANTHEON[archetype.growthTarget]?.glyph || archetype.growthTarget}
                    </p>
                  </div>
                )}

                {archetype.stressTarget && archetype.stressTarget !== 'Ø' && (
                  <div>
                    <p className="text-bone-faint text-xs mb-1">Under Stress</p>
                    <p className="text-bone-muted text-sm">
                      → {PANTHEON[archetype.stressTarget]?.glyph || archetype.stressTarget}
                    </p>
                  </div>
                )}
              </div>
            </motion.section>

            {/* I Ching Hexagram */}
            {hasAxes && genome.iching && (
              <motion.section
                className="p-6 rounded border border-bone-faint/20 bg-void-lighter/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-bone text-lg font-display mb-4">
                  I Ching Reading
                </h2>
                <HexagramDisplay
                  hexagram={genome.iching.present}
                  transforming={genome.iching.transforming}
                  movingLines={genome.iching.movingLines}
                  compact
                />
              </motion.section>
            )}

            {!hasAxes && (
              <motion.section
                className="p-6 rounded border border-bone-faint/20 bg-void-lighter/20 flex items-center justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-center space-y-4">
                  <p className="text-bone-muted text-sm">
                    Complete axes calibration to reveal your hexagram
                  </p>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => router.push('/axes')}
                  >
                    Calibrate Axes
                  </button>
                </div>
              </motion.section>
            )}

            {/* Keywords - Visual */}
            {hasKeywords && topVisual.length > 0 && (
              <motion.section
                className="p-6 rounded border border-bone-faint/20 bg-void-lighter/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-bone text-lg font-display mb-4">
                  Visual Preferences
                </h2>
                <div className="flex flex-wrap gap-2">
                  {topVisual.map(({ keyword, score }) => (
                    <div
                      key={keyword}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-mono',
                        score > 0
                          ? 'bg-state-success/10 text-state-success border border-state-success/20'
                          : 'bg-state-error/10 text-state-error border border-state-error/20'
                      )}
                    >
                      {keyword}
                      <span className="ml-1 text-[10px] opacity-60">
                        {score > 0 ? '+' : ''}
                        {score.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Keywords - Content */}
            {hasKeywords && topContent.length > 0 && (
              <motion.section
                className="p-6 rounded border border-bone-faint/20 bg-void-lighter/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-bone text-lg font-display mb-4">
                  Content Preferences
                </h2>
                <div className="flex flex-wrap gap-2">
                  {topContent.map(({ keyword, score }) => (
                    <div
                      key={keyword}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-mono',
                        score > 0
                          ? 'bg-state-success/10 text-state-success border border-state-success/20'
                          : 'bg-state-error/10 text-state-error border border-state-error/20'
                      )}
                    >
                      {keyword}
                      <span className="ml-1 text-[10px] opacity-60">
                        {score > 0 ? '+' : ''}
                        {score.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Gamification Stats */}
            {hasGamification && (
              <motion.section
                className="p-6 rounded border border-bone-faint/20 bg-void-lighter/20 lg:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-bone text-lg font-display mb-4">
                  Progress
                </h2>
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-bone-faint text-xs mb-1">Total XP</p>
                    <p className="text-bone text-3xl font-mono">
                      {genome.gamification!.xp}
                    </p>
                  </div>
                  <div>
                    <p className="text-bone-faint text-xs mb-1">Tier</p>
                    <p className="text-bone text-lg capitalize">
                      {genome.gamification!.tier}
                    </p>
                  </div>
                </div>
              </motion.section>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.push('/profile')}
            >
              Back to Profile
            </button>
            {!hasAxes && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => router.push('/axes')}
              >
                Calibrate Axes
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
