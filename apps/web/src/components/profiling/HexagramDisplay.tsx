'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HexagramDisplayProps {
  hexagram: {
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
  movingLines?: number[];
  compact?: boolean;
}

/**
 * Hexagram Display Component
 *
 * Displays I Ching hexagram with lines, judgment, and transformation info.
 * Lines are numbered 1-6 from bottom to top (traditional I Ching convention).
 */
export function HexagramDisplay({
  hexagram,
  transforming,
  movingLines = [],
  compact = false,
}: HexagramDisplayProps) {
  return (
    <div className={cn('space-y-6', compact && 'space-y-4')}>
      {/* Chinese Character & Name */}
      <div className="text-center space-y-2">
        <div className={cn(
          'font-display text-bone',
          compact ? 'text-4xl' : 'text-6xl'
        )}>
          {hexagram.chinese}
        </div>
        <div className="space-y-1">
          <p className={cn(
            'text-bone',
            compact ? 'text-base' : 'text-lg'
          )}>
            {hexagram.number}. {hexagram.name}
          </p>
          {transforming && (
            <p className={cn(
              'text-bone-muted',
              compact ? 'text-xs' : 'text-sm'
            )}>
              → Transforming to {transforming.number}. {transforming.name}
            </p>
          )}
        </div>
      </div>

      {/* Hexagram Lines (6 lines, bottom to top) */}
      <div className="flex flex-col items-center gap-1">
        {[...hexagram.lines].reverse().map((isYang, idx) => {
          const lineNumber = 6 - idx;
          const isMoving = movingLines.includes(lineNumber);

          return (
            <motion.div
              key={lineNumber}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: compact ? 0 : idx * 0.1,
                duration: 0.3
              }}
            >
              {/* Line number */}
              <span className="text-bone-faint text-xs w-4 text-right">
                {lineNumber}
              </span>

              {/* Line visualization */}
              <div className="flex gap-1">
                {isYang ? (
                  // Yang line (solid)
                  <div
                    className={cn(
                      'rounded-full transition-colors',
                      compact ? 'w-12 h-1' : 'w-16 h-1.5',
                      isMoving ? 'bg-state-success' : 'bg-bone'
                    )}
                  />
                ) : (
                  // Yin line (broken)
                  <>
                    <div
                      className={cn(
                        'rounded-full transition-colors',
                        compact ? 'w-5 h-1' : 'w-7 h-1.5',
                        isMoving ? 'bg-state-warning' : 'bg-bone'
                      )}
                    />
                    <div
                      className={cn(
                        'rounded-full transition-colors',
                        compact ? 'w-5 h-1' : 'w-7 h-1.5',
                        isMoving ? 'bg-state-warning' : 'bg-bone'
                      )}
                    />
                  </>
                )}
              </div>

              {/* Moving line indicator */}
              {isMoving && !compact && (
                <span className="text-bone-faint text-xs">•</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Judgment Text */}
      {!compact && (
        <div className="max-w-lg mx-auto p-6 border border-bone-faint/20 rounded bg-void-lighter/20">
          <p className="text-bone-muted text-sm leading-relaxed">
            {hexagram.judgment}
          </p>
        </div>
      )}

      {/* Moving Lines Info */}
      {movingLines.length > 0 && (
        <div className="text-center">
          <p className={cn(
            'text-bone-faint',
            compact ? 'text-[10px]' : 'text-xs'
          )}>
            {movingLines.length} moving line{movingLines.length > 1 ? 's' : ''}
            {!compact && ' — transformation in progress'}
          </p>
        </div>
      )}
    </div>
  );
}

export default HexagramDisplay;
