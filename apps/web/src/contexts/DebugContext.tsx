'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DebugContextType {
  isDebugMode: boolean;
  debugUserId: string | null;
  toggleDebug: () => void;
  setDebugUserId: (userId: string | null) => void;
  exitDebug: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: ReactNode }) {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [debugUserId, setDebugUserIdState] = useState<string | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const debugState = localStorage.getItem('subtaste_debug_mode');
    const storedDebugUserId = localStorage.getItem('subtaste_debug_user_id');

    if (debugState === 'true') {
      setIsDebugMode(true);
      setDebugUserIdState(storedDebugUserId);
    }
  }, []);

  // Sync to localStorage when state changes
  useEffect(() => {
    if (isDebugMode) {
      localStorage.setItem('subtaste_debug_mode', 'true');
    } else {
      localStorage.removeItem('subtaste_debug_mode');
    }
  }, [isDebugMode]);

  const toggleDebug = () => {
    setIsDebugMode(prev => !prev);
    // Don't clear debug user ID - keep it persistent so debug profile is saved
  };

  const setDebugUserId = (userId: string | null) => {
    setDebugUserIdState(userId);
    if (userId) {
      localStorage.setItem('subtaste_debug_user_id', userId);
    } else {
      localStorage.removeItem('subtaste_debug_user_id');
    }
  };

  const exitDebug = () => {
    setIsDebugMode(false);
    setDebugUserIdState(null);
    localStorage.removeItem('subtaste_debug_mode');
    localStorage.removeItem('subtaste_debug_user_id');
  };

  return (
    <DebugContext.Provider
      value={{
        isDebugMode,
        debugUserId,
        toggleDebug,
        setDebugUserId,
        exitDebug,
      }}
    >
      {children}
    </DebugContext.Provider>
  );
}

export function useDebug() {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
}
