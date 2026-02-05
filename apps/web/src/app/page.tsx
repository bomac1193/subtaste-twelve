'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('subtaste_user_id');
    setHasProfile(!!userId);
  }, []);

  if (hasProfile === null) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-bone-faint border-t-bone rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void">
      <div className="container-sm page-padding text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-4xl md:text-5xl text-bone mb-6 tracking-tight">
            subtaste
          </h1>

          <p className="text-bone-muted mb-2">
            Taste genome profiling for the creative economy.
          </p>

          <p className="text-bone-faint text-sm mb-12 max-w-md mx-auto">
            Discover which of THE TWELVE archetypes shapes your creative taste.
            Begin with training or take the three-question quiz. Deeper calibration unlocks over time.
          </p>

          <div className="space-y-4">
            {hasProfile ? (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => router.push('/profile')}
                >
                  View Profile
                </button>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
                <div>
                  <button
                    type="button"
                    className="btn-ghost text-bone-faint"
                    onClick={() => router.push('/quiz')}
                  >
                    Retake Quiz
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => router.push('/training')}
                >
                  Start with Training
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => router.push('/quiz')}
                >
                  Take the Quiz
                </button>
                <p className="text-bone-faint text-xs mt-2">
                  Training builds your taste profile through preference cards.
                  Quiz provides quick classification.
                </p>
              </div>
            )}
          </div>

          {/* The Twelve preview */}
          <motion.div
            className="mt-20 pt-12 border-t border-border-subtle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <p className="text-xs uppercase tracking-widest text-bone-faint mb-6">
              The Twelve
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-bone-muted text-sm">
              <span>KETH</span>
              <span className="text-bone-faint">·</span>
              <span>STRATA</span>
              <span className="text-bone-faint">·</span>
              <span>OMEN</span>
              <span className="text-bone-faint">·</span>
              <span>SILT</span>
              <span className="text-bone-faint">·</span>
              <span>CULL</span>
              <span className="text-bone-faint">·</span>
              <span>LIMN</span>
              <span className="text-bone-faint">·</span>
              <span>TOLL</span>
              <span className="text-bone-faint">·</span>
              <span>VAULT</span>
              <span className="text-bone-faint">·</span>
              <span>WICK</span>
              <span className="text-bone-faint">·</span>
              <span>ANVIL</span>
              <span className="text-bone-faint">·</span>
              <span>SCHISM</span>
              <span className="text-bone-faint">·</span>
              <span>VOID</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
