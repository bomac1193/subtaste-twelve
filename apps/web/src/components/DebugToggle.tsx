'use client';

import { useDebug } from '@/contexts/DebugContext';
import { motion, AnimatePresence } from 'framer-motion';

export function DebugToggle() {
  const { isDebugMode, toggleDebug, exitDebug } = useDebug();

  return (
    <>
      {/* Debug Mode Banner */}
      <AnimatePresence>
        {isDebugMode && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 bg-state-warning/20 border-b border-state-warning/40 backdrop-blur-sm"
          >
            <div className="container-sm py-2 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-state-warning text-sm font-mono">🐛 DEBUG MODE</span>
                <span className="text-bone-faint text-xs">Testing with mock profile</span>
              </div>
              <button
                onClick={exitDebug}
                className="text-bone-faint hover:text-bone-muted text-xs transition-colors px-2 py-1 rounded hover:bg-state-warning/10"
              >
                Exit Debug
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Debug Toggle Button */}
      <motion.button
        onClick={toggleDebug}
        className={`fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg transition-all ${
          isDebugMode
            ? 'bg-state-warning/30 text-state-warning border-2 border-state-warning/60 hover:bg-state-warning/40'
            : 'bg-void-lighter text-bone-faint hover:text-bone-muted hover:bg-void-lighter/80 border-2 border-border-subtle hover:border-bone-faint'
        }`}
        title={isDebugMode ? 'Exit debug mode' : 'Enable debug mode (test with mock profile)'}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <path d="m8 2 1.88 1.88" />
          <path d="M14.12 3.88 16 2" />
          <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
          <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
          <path d="M12 20v-9" />
          <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
          <path d="M6 13H2" />
          <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
          <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
          <path d="M22 13h-4" />
          <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
        </svg>

        {/* Active indicator */}
        {isDebugMode && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-state-warning rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          />
        )}
      </motion.button>
    </>
  );
}
