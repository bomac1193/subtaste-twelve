'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDebug } from '@/contexts/DebugContext';

export default function DebugInfoPage() {
  const router = useRouter();
  const { isDebugMode, debugUserId, exitDebug } = useDebug();
  const [info, setInfo] = useState<any>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInfo({
        isDebugMode,
        debugUserId,
        normalUserId: localStorage.getItem('subtaste_user_id'),
        debugUserIdInStorage: localStorage.getItem('subtaste_debug_user_id'),
        debugModeFlag: localStorage.getItem('subtaste_debug_mode'),
      });
    }
  }, [isDebugMode, debugUserId]);

  const handleClearDebugProfile = () => {
    if (confirm('Clear debug profile? This will delete the debug user ID.')) {
      localStorage.removeItem('subtaste_debug_user_id');
      window.location.reload();
    }
  };

  const handleClearNormalProfile = () => {
    if (confirm('Clear normal profile? This will delete the normal user ID.')) {
      localStorage.removeItem('subtaste_user_id');
      window.location.reload();
    }
  };

  const handleClearBoth = () => {
    if (confirm('Clear BOTH profiles? This will delete all local data.')) {
      localStorage.removeItem('subtaste_user_id');
      localStorage.removeItem('subtaste_debug_user_id');
      localStorage.removeItem('subtaste_debug_mode');
      exitDebug();
      window.location.reload();
    }
  };

  return (
    <div className={`min-h-screen bg-void p-8 ${isDebugMode ? 'pt-16' : ''}`}>
      <div className="container-sm">
        <div className="archetype-card">
          <h1 className="font-display text-2xl text-bone mb-6">Debug Information</h1>

          <div className="space-y-4 mb-8">
            <div className="p-4 bg-void-lighter rounded border border-bone-faint/20">
              <h2 className="text-bone text-sm font-mono mb-3">Current State</h2>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-bone-faint">Debug Mode Active:</span>
                  <span className={info.isDebugMode ? 'text-state-success' : 'text-state-error'}>
                    {info.isDebugMode ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bone-faint">Debug User ID (Context):</span>
                  <span className="text-bone-muted">{info.debugUserId || 'null'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bone-faint">Debug User ID (Storage):</span>
                  <span className="text-bone-muted">{info.debugUserIdInStorage || 'null'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bone-faint">Normal User ID:</span>
                  <span className="text-bone-muted">{info.normalUserId || 'null'}</span>
                </div>
              </div>
            </div>

            {info.normalUserId === info.debugUserIdInStorage && info.normalUserId && (
              <div className="p-4 bg-state-error/10 rounded border border-state-error/30">
                <p className="text-state-error text-sm font-medium mb-2">⚠️ Issue Detected</p>
                <p className="text-bone-muted text-xs">
                  Your normal and debug profiles have the same user ID. This means they're pointing to the same profile.
                  Use the button below to clear the debug profile and create a fresh one.
                </p>
              </div>
            )}

            {!info.normalUserId && !info.debugUserIdInStorage && (
              <div className="p-4 bg-bone-faint/10 rounded border border-bone-faint/20">
                <p className="text-bone-muted text-xs">
                  No profiles found. Start by taking the quiz to create your profile.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleClearDebugProfile}
              className="btn btn-secondary w-full"
              disabled={!info.debugUserIdInStorage}
            >
              Clear Debug Profile Only
            </button>

            <button
              type="button"
              onClick={handleClearNormalProfile}
              className="btn btn-secondary w-full"
              disabled={!info.normalUserId}
            >
              Clear Normal Profile Only
            </button>

            <button
              type="button"
              onClick={handleClearBoth}
              className="btn bg-state-error/20 text-state-error border-state-error/40 hover:bg-state-error/30 w-full"
            >
              Clear Both Profiles
            </button>

            <button
              type="button"
              onClick={() => router.push('/')}
              className="btn-ghost text-bone-faint w-full"
            >
              Back to Home
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-bone-faint/20">
            <p className="text-bone-faint text-xs text-center">
              This page helps diagnose profile separation issues. After clearing a profile,
              you'll need to retake the quiz to create a new one.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
