'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/session-client';
import { PANTHEON } from '@subtaste/core';
import type { Designation } from '@subtaste/core';

const ARCHETYPE_ORDER: Designation[] = [
  'S-0', 'T-1', 'V-2', 'L-3', 'C-4', 'N-5',
  'H-6', 'P-7', 'D-8', 'F-9', 'R-10', 'Ø',
];

const CX = 200;
const CY = 200;
const RADIUS = 155;

function getPos(index: number, total: number) {
  const angle = (index * 360) / total - 90; // start from 12 o'clock
  const rad = (angle * Math.PI) / 180;
  return { x: CX + RADIUS * Math.cos(rad), y: CY + RADIUS * Math.sin(rad) };
}

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [selected, setSelected] = useState<Designation | null>(null);

  const selectedArchetype = selected ? PANTHEON[selected] : null;

  const positions = useMemo(
    () => ARCHETYPE_ORDER.map((_, i) => getPos(i, ARCHETYPE_ORDER.length)),
    []
  );

  const handleSelect = (d: Designation) => {
    setSelected((prev) => (prev === d ? null : d));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-bone-faint border-t-bone rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.02)_0%,transparent_70%)]" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 md:py-16">
        {/* Header */}
        <motion.div
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-4xl md:text-5xl text-bone">
            The Twelve
          </h1>
        </motion.div>

        {/* Operative Map + Detail — side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* The Map */}
          <motion.div
            className="relative w-full max-w-[480px] mx-auto lg:mx-0 lg:ml-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg
              viewBox="0 0 400 400"
              className="w-full h-auto"
              style={{ maxHeight: '65vh' }}
            >
              {/* Single outer ring */}
              <circle
                cx={CX} cy={CY} r={RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.4"
                className="text-bone-faint/8"
              />

              {/* Cross-hairs — very faint */}
              <line x1={CX} y1={CY - RADIUS + 20} x2={CX} y2={CY + RADIUS - 20} stroke="currentColor" strokeWidth="0.3" className="text-bone-faint/5" />
              <line x1={CX - RADIUS + 20} y1={CY} x2={CX + RADIUS - 20} y2={CY} stroke="currentColor" strokeWidth="0.3" className="text-bone-faint/5" />

              {/* Center dot */}
              <circle cx={CX} cy={CY} r="1.5" className="fill-bone-faint/15" />

              {/* Archetype nodes */}
              {ARCHETYPE_ORDER.map((d, i) => {
                const pos = positions[i];
                const a = PANTHEON[d];
                const isActive = selected === d;

                return (
                  <g
                    key={d}
                    className="cursor-pointer"
                    onClick={() => handleSelect(d)}
                  >
                    {/* Hit area */}
                    <circle
                      cx={pos.x} cy={pos.y} r="20"
                      fill="transparent"
                    />

                    {/* Node dot */}
                    <circle
                      cx={pos.x} cy={pos.y}
                      r={isActive ? 3.5 : 2}
                      className={`transition-all duration-500 ${isActive ? 'fill-bone' : 'fill-bone-faint/30'}`}
                    />

                    {/* Designation code */}
                    <text
                      x={pos.x}
                      y={pos.y + (pos.y < CY ? -14 : 18)}
                      textAnchor="middle"
                      className={`text-[8px] font-mono select-none transition-colors duration-300 ${
                        isActive ? 'fill-bone' : 'fill-bone-faint/25'
                      }`}
                      style={{ letterSpacing: '0.08em' }}
                    >
                      {d}
                    </text>

                    {/* Glyph name */}
                    <text
                      x={pos.x}
                      y={pos.y + (pos.y < CY ? -24 : 28)}
                      textAnchor="middle"
                      className={`text-[9px] select-none transition-colors duration-300 ${
                        isActive
                          ? 'fill-bone'
                          : selected
                            ? 'fill-bone-faint/10'
                            : 'fill-bone-faint/30'
                      }`}
                      style={{ fontFamily: 'var(--font-canela), Georgia, serif' }}
                    >
                      {a.glyph}
                    </text>
                  </g>
                );
              })}
            </svg>
          </motion.div>

          {/* Right panel: CTA + Detail */}
          <div className="flex flex-col items-center lg:items-start lg:pt-8">
            {/* CTA — minimal text links */}
            <motion.div
              className="mb-10 lg:text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 1 }}
            >
              {isAuthenticated ? (
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => router.push('/profile')}
                    className="text-bone text-xs tracking-[0.25em] uppercase hover:text-bone/70 transition-colors duration-500"
                  >
                    Enter
                  </button>
                  <span className="text-bone-faint/15">|</span>
                  <button
                    type="button"
                    onClick={() => router.push('/training')}
                    className="text-bone-faint/40 text-[10px] tracking-[0.2em] uppercase hover:text-bone-faint/70 transition-colors duration-500"
                  >
                    Attunement
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/axes')}
                    className="text-bone-faint/40 text-[10px] tracking-[0.2em] uppercase hover:text-bone-faint/70 transition-colors duration-500"
                  >
                    Calibration
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => router.push('/auth/signup')}
                    className="text-bone text-xs tracking-[0.25em] uppercase hover:text-bone/70 transition-colors duration-500"
                  >
                    Begin
                  </button>
                  <span className="text-bone-faint/15">|</span>
                  <button
                    type="button"
                    onClick={() => router.push('/auth/signin')}
                    className="text-bone-faint/40 text-[10px] tracking-[0.2em] uppercase hover:text-bone-faint/70 transition-colors duration-500"
                  >
                    Sign in
                  </button>
                </div>
              )}
            </motion.div>

            {/* Detail panel — appears on archetype select */}
            <AnimatePresence mode="wait">
              {selectedArchetype ? (
                <motion.div
                  key={selected}
                  className="w-full"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="border-t border-bone-faint/10 pt-6 space-y-4">
                    {/* Name + designation */}
                    <div className="flex items-baseline justify-between">
                      <h2 className="font-display text-2xl text-bone">
                        {selectedArchetype.glyph}
                      </h2>
                      <span className="text-bone-faint/30 text-[10px] tracking-[0.2em] font-mono uppercase">
                        {selectedArchetype.designation}
                      </span>
                    </div>

                    {/* Sigil */}
                    <p className="text-bone-faint/50 text-xs tracking-[0.15em] italic">
                      {selectedArchetype.sigil}
                    </p>

                    {/* Essence */}
                    <p className="text-bone-muted text-sm leading-relaxed">
                      {selectedArchetype.essence}
                    </p>

                    {/* Creative mode */}
                    <p className="text-bone-faint/40 text-[11px] tracking-wide">
                      {selectedArchetype.creativeMode}
                    </p>

                    {/* Recognition */}
                    <div>
                      <p className="text-bone-faint/30 text-[10px] tracking-[0.2em] uppercase mb-1.5">
                        Recognised by
                      </p>
                      <p className="text-bone-muted/70 text-xs leading-relaxed">
                        {selectedArchetype.recogniseBy}
                      </p>
                    </div>

                    {/* Shadow */}
                    <div>
                      <p className="text-bone-faint/30 text-[10px] tracking-[0.2em] uppercase mb-1.5">
                        Shadow
                      </p>
                      <p className="text-bone-muted/50 text-xs leading-relaxed">
                        {selectedArchetype.shadow}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="flex gap-6 pt-3 border-t border-bone-faint/5">
                      <div>
                        <p className="text-bone-faint/20 text-[9px] tracking-[0.1em] mb-1">Phase</p>
                        <p className="text-bone-faint/45 text-[11px] leading-none capitalize">{selectedArchetype.phase || '-'}</p>
                      </div>
                      <div>
                        <p className="text-bone-faint/20 text-[9px] tracking-[0.1em] mb-1">Element</p>
                        <p className="text-bone-faint/45 text-[11px] leading-none capitalize">{selectedArchetype.wuXingElement || '-'}</p>
                      </div>
                      {selectedArchetype.growthTarget && (
                        <div onClick={() => handleSelect(selectedArchetype.growthTarget!)} className="cursor-pointer">
                          <p className="text-bone-faint/20 text-[9px] tracking-[0.1em] mb-1">Growth</p>
                          <p className="text-bone-faint/45 text-[11px] leading-none hover:text-bone transition-colors duration-300">
                            {PANTHEON[selectedArchetype.growthTarget]?.glyph ?? selectedArchetype.growthTarget}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.p
                  key="hint"
                  className="text-bone-faint/20 text-[10px] tracking-[0.15em] mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 2.5, duration: 1 }}
                >
                  Select a node to read its dossier
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
