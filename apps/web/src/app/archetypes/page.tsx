'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PANTHEON } from '@subtaste/core';
import type { Designation } from '@subtaste/core';

export default function ArchetypesPage() {
  const router = useRouter();
  const [selectedArchetype, setSelectedArchetype] = useState<Designation | null>(null);

  // Get all archetypes in order
  const archetypes = [
    PANTHEON['S-0'],
    PANTHEON['T-1'],
    PANTHEON['V-2'],
    PANTHEON['L-3'],
    PANTHEON['C-4'],
    PANTHEON['N-5'],
    PANTHEON['H-6'],
    PANTHEON['P-7'],
    PANTHEON['D-8'],
    PANTHEON['F-9'],
    PANTHEON['R-10'],
    PANTHEON['Ø']
  ];

  const selected = selectedArchetype ? PANTHEON[selectedArchetype] : null;

  // Calculate position for each archetype on the circle
  const getCirclePosition = (index: number, total: number) => {
    const angle = (index * 360) / total - 90; // Start from top
    const radius = 45; // percentage
    const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
    const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
    return { x, y };
  };

  return (
    <div className="min-h-screen bg-void">
      <div className="container-xl page-padding">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-display text-3xl md:text-4xl text-bone mb-3">
            The Twelve
          </h1>
          <p className="text-bone-faint text-sm">
            Twelve archetypal patterns of creative taste
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Circle Visualization */}
          <div className="relative aspect-square w-full max-w-2xl mx-auto">
            <motion.div
              className="relative w-full h-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Center circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-border-subtle bg-void-lighter/50 flex items-center justify-center">
                  <p className="text-xs text-bone-faint text-center px-4">
                    Select an archetype
                  </p>
                </div>
              </div>

              {/* Archetype nodes */}
              {archetypes.map((archetype, index) => {
                const { x, y } = getCirclePosition(index, archetypes.length);
                const isSelected = selectedArchetype === archetype.designation;

                return (
                  <motion.button
                    key={archetype.designation}
                    className={`absolute w-24 h-24 -ml-12 -mt-12 rounded-full border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-bone bg-void-lighter scale-110 z-20'
                        : 'border-border-subtle bg-void hover:border-bone-faint hover:bg-void-lighter hover:scale-105'
                    }`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    onClick={() => setSelectedArchetype(archetype.designation)}
                  >
                    <div className="flex flex-col items-center justify-center h-full px-2">
                      <span className={`font-display text-sm mb-1 transition-colors ${
                        isSelected ? 'text-bone' : 'text-bone-muted'
                      }`}>
                        {archetype.glyph}
                      </span>
                      <span className={`text-[10px] font-mono transition-colors ${
                        isSelected ? 'text-bone-muted' : 'text-bone-faint'
                      }`}>
                        {archetype.designation}
                      </span>
                    </div>
                  </motion.button>
                );
              })}

              {/* Connecting lines (optional decorative element) */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
                style={{ transform: 'translate(0, 0)' }}
              >
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-border-subtle"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="16%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-border-subtle"
                />
              </svg>
            </motion.div>
          </div>

          {/* Details Panel */}
          <div className="flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.designation}
                  className="border border-border-subtle rounded-lg p-6 bg-void-lighter/30"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Header */}
                  <div className="flex items-baseline justify-between mb-4">
                    <div className="flex items-baseline gap-3">
                      <h2 className="font-display text-3xl text-bone">
                        {selected.glyph}
                      </h2>
                      <span className="text-bone-faint text-sm font-mono">
                        {selected.designation}
                      </span>
                    </div>
                    <span className="text-bone-muted text-sm italic">
                      {selected.sigil}
                    </span>
                  </div>

                  {/* Creative Mode */}
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-void border border-border-subtle text-bone-muted">
                      {selected.creativeMode}
                    </span>
                  </div>

                  {/* Essence */}
                  <p className="text-bone-muted mb-6 italic text-lg">
                    {selected.essence}
                  </p>

                  {/* Recognition */}
                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-wider text-bone-faint mb-2">
                      Recognise By
                    </p>
                    <p className="text-bone-muted text-sm leading-relaxed">
                      {selected.recogniseBy}
                    </p>
                  </div>

                  {/* Shadow */}
                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-wider text-bone-faint mb-2">
                      Shadow
                    </p>
                    <p className="text-bone-muted/70 text-sm leading-relaxed">
                      {selected.shadow}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="flex gap-6 pt-5 border-t border-border-subtle/50">
                    <div>
                      <p className="text-bone-faint/50 text-[10px] tracking-wider mb-1">Phase</p>
                      <p className="text-bone-muted text-xs leading-none capitalize">{selected.phase || '—'}</p>
                    </div>
                    <div>
                      <p className="text-bone-faint/50 text-[10px] tracking-wider mb-1">Element</p>
                      <p className="text-bone-muted text-xs leading-none capitalize">{selected.wuXingElement || '—'}</p>
                    </div>
                    <div className={selected.growthTarget ? 'cursor-pointer' : ''} onClick={() => selected.growthTarget && setSelectedArchetype(selected.growthTarget!)}>
                      <p className="text-bone-faint/50 text-[10px] tracking-wider mb-1">Growth</p>
                      <p className="text-bone-muted text-xs leading-none">{selected.growthTarget ? PANTHEON[selected.growthTarget]?.glyph ?? selected.growthTarget : '—'}</p>
                    </div>
                    <div className={selected.stressTarget && selected.stressTarget !== 'Ø' ? 'cursor-pointer' : ''} onClick={() => selected.stressTarget && selected.stressTarget !== 'Ø' && setSelectedArchetype(selected.stressTarget!)}>
                      <p className="text-bone-faint/50 text-[10px] tracking-wider mb-1">Stress</p>
                      <p className="text-bone-muted text-xs leading-none">{selected.stressTarget && selected.stressTarget !== 'Ø' ? PANTHEON[selected.stressTarget]?.glyph ?? selected.stressTarget : '—'}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  className="border border-border-subtle rounded-lg p-12 bg-void-lighter/30 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-bone-faint text-sm">
                    Click an archetype to view details
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer CTA */}
        <motion.div
          className="text-center mt-16 pt-12 border-t border-border-subtle max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <p className="text-bone-muted mb-6">
            Ready to discover your archetype?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => router.push('/quiz')}
            >
              Take the Quiz
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.push('/training')}
            >
              Start Training
            </button>
          </div>
          <button
            type="button"
            className="btn-ghost text-bone-faint mt-6"
            onClick={() => router.push('/')}
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
