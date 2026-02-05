'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TrainingOption {
  id: string;
  text: string;
}

interface TrainingCardProps {
  card: {
    id: string;
    topic: string;
    options: TrainingOption[];
  };
  onSubmit: (bestId: string, worstId: string) => void;
  disabled?: boolean;
}

type SelectionMode = 'best' | 'worst' | null;

/**
 * Training Card Component
 *
 * 4-option card where user selects best and worst preferences.
 * Gothic cold futuristic aesthetic matching existing components.
 */
export function TrainingCard({
  card,
  onSubmit,
  disabled = false,
}: TrainingCardProps) {
  const [bestId, setBestId] = useState<string | null>(null);
  const [worstId, setWorstId] = useState<string | null>(null);
  const [mode, setMode] = useState<SelectionMode>('best');

  const handleOptionClick = (optionId: string) => {
    if (disabled) return;

    // If this option is already selected as best or worst, deselect it
    if (optionId === bestId) {
      setBestId(null);
      setMode('best');
      return;
    }
    if (optionId === worstId) {
      setWorstId(null);
      setMode('worst');
      return;
    }

    // Select based on current mode
    if (mode === 'best' && optionId !== worstId) {
      setBestId(optionId);
      setMode('worst'); // Auto-switch to worst selection
    } else if (mode === 'worst' && optionId !== bestId) {
      setWorstId(optionId);
    }
  };

  const handleSubmit = () => {
    if (bestId && worstId && !disabled) {
      onSubmit(bestId, worstId);
    }
  };

  const canSubmit = bestId !== null && worstId !== null && !disabled;

  return (
    <div className="space-y-6">
      {/* Topic Header */}
      <div className="text-center space-y-2">
        <p className="text-bone-muted text-sm uppercase tracking-wider">
          {card.topic.replace(/-/g, ' ')}
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-bone-faint">
          <span className={cn(
            'transition-colors',
            mode === 'best' && 'text-state-success'
          )}>
            {bestId ? '✓ Best selected' : 'Select best'}
          </span>
          <span className="text-bone-faint/30">|</span>
          <span className={cn(
            'transition-colors',
            mode === 'worst' && 'text-state-warning'
          )}>
            {worstId ? '✓ Worst selected' : 'Select worst'}
          </span>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-3">
        {card.options.map((option, index) => {
          const isBest = option.id === bestId;
          const isWorst = option.id === worstId;
          const isSelected = isBest || isWorst;

          return (
            <motion.button
              key={option.id}
              type="button"
              className={cn(
                'relative p-4 rounded border text-left',
                'transition-all duration-300',
                'hover:scale-[1.01] active:scale-[0.99]',
                !isSelected && 'border-bone-faint/20 bg-void-lighter/30 hover:border-bone-faint/40',
                isBest && 'border-state-success bg-state-success/5',
                isWorst && 'border-state-warning bg-state-warning/5',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => handleOptionClick(option.id)}
              disabled={disabled}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Selection Badge */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    className={cn(
                      'absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider',
                      isBest && 'bg-state-success text-black',
                      isWorst && 'bg-state-warning text-black'
                    )}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isBest ? 'Best' : 'Worst'}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Option Text */}
              <p className={cn(
                'text-sm leading-relaxed transition-colors',
                !isSelected && 'text-bone-muted',
                isSelected && 'text-bone'
              )}>
                {option.text}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <motion.button
          type="button"
          className={cn(
            'btn',
            canSubmit ? 'btn-primary' : 'btn-secondary opacity-40 cursor-not-allowed'
          )}
          onClick={handleSubmit}
          disabled={!canSubmit}
          whileHover={canSubmit ? { scale: 1.02 } : {}}
          whileTap={canSubmit ? { scale: 0.98 } : {}}
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
}

export default TrainingCard;
