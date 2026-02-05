'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AxesSliderProps {
  axis: string;
  prompt: string;
  lowLabel: string;
  highLabel: string;
  lowDescription?: string;
  highDescription?: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

/**
 * Axes Slider Component
 *
 * Continuous slider for personality axis calibration (0-1 range).
 * Shows contextual descriptions based on current position.
 */
export function AxesSlider({
  axis,
  prompt,
  lowLabel,
  highLabel,
  lowDescription,
  highDescription,
  value,
  onChange,
  disabled = false,
}: AxesSliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const percentage = value * 100;
  const isLow = value < 0.4;
  const isHigh = value > 0.6;
  const isNeutral = !isLow && !isHigh;

  const currentDescription = isLow
    ? lowDescription
    : isHigh
    ? highDescription
    : 'Balanced perspective between both approaches.';

  return (
    <motion.div
      className="space-y-4 p-6 rounded border border-bone-faint/20 bg-void-lighter/20"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Prompt */}
      <div className="text-center space-y-2">
        <h3 className="text-bone text-sm font-medium">{prompt}</h3>
        <p className="text-bone-faint text-xs uppercase tracking-wider">
          {axis.replace(/([A-Z])/g, ' $1').trim()}
        </p>
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs">
        <span
          className={cn(
            'transition-colors',
            isLow ? 'text-bone font-medium' : 'text-bone-faint'
          )}
        >
          {lowLabel}
        </span>
        <span
          className={cn(
            'transition-colors',
            isHigh ? 'text-bone font-medium' : 'text-bone-faint'
          )}
        >
          {highLabel}
        </span>
      </div>

      {/* Slider */}
      <div className="relative py-2">
        {/* Track */}
        <div className="h-2 bg-void-lighter rounded-full relative overflow-hidden">
          {/* Fill */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-bone-faint/40"
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Thumb */}
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={percentage}
          onChange={(e) => onChange(parseInt(e.target.value) / 100)}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          disabled={disabled}
          className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          style={{ margin: 0, padding: 0 }}
        />

        {/* Visual Thumb */}
        <motion.div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full pointer-events-none',
            'border-2 transition-colors',
            isDragging
              ? 'border-bone bg-bone/20 scale-110'
              : 'border-bone-faint bg-void'
          )}
          initial={false}
          animate={{ left: `calc(${percentage}% - 12px)` }}
          transition={{ duration: 0.1 }}
        />

        {/* Center marker */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-4 bg-bone-faint/20 pointer-events-none"
        />
      </div>

      {/* Value indicator */}
      <div className="text-center">
        <span className="text-bone-muted font-mono text-xs">
          {value.toFixed(2)}
        </span>
      </div>

      {/* Description */}
      {currentDescription && (
        <motion.p
          className="text-bone-faint text-xs text-center leading-relaxed"
          key={currentDescription}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {currentDescription}
        </motion.p>
      )}
    </motion.div>
  );
}

export default AxesSlider;
