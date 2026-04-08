'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RankingQuestionProps {
  items: string[];
  onSelect: (ranking: number[]) => void;
  disabled?: boolean;
}

/**
 * Ranking Question Component
 *
 * Tap items in order of preference (1st = most natural, last = least).
 * When all items are ranked, submits automatically.
 * Tap a ranked item to undo from that point.
 */
export function RankingQuestion({
  items,
  onSelect,
  disabled = false,
}: RankingQuestionProps) {
  // ranking[i] = rank position (0-indexed) or -1 if unranked
  const [order, setOrder] = useState<number[]>([]);

  const handleTap = (index: number) => {
    if (disabled) return;

    const existingPos = order.indexOf(index);
    if (existingPos !== -1) {
      // Undo: remove this item and everything ranked after it
      setOrder(order.slice(0, existingPos));
      return;
    }

    const newOrder = [...order, index];
    setOrder(newOrder);

    // All items ranked — submit
    if (newOrder.length === items.length) {
      onSelect(newOrder);
    }
  };

  const getRank = (index: number): number | null => {
    const pos = order.indexOf(index);
    return pos !== -1 ? pos + 1 : null;
  };

  return (
    <div className="space-y-2">
      <p className="text-bone-faint text-xs text-center mb-4 tracking-wide">
        Tap in order: most natural first
      </p>
      {items.map((item, index) => {
        const rank = getRank(index);
        const isRanked = rank !== null;

        return (
          <motion.button
            key={index}
            type="button"
            className={cn(
              'ranking__option',
              isRanked && 'ranking__option--ranked'
            )}
            onClick={() => handleTap(index)}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.01 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <span className="ranking__rank">
              {isRanked ? rank : '\u00B7'}
            </span>
            <span className="ranking__text">{item}</span>
          </motion.button>
        );
      })}
      {order.length > 0 && order.length < items.length && (
        <motion.p
          className="text-bone-faint text-xs text-center mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {items.length - order.length} remaining
        </motion.p>
      )}
    </div>
  );
}

export default RankingQuestion;
