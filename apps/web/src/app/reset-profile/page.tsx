'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDebug } from '@/contexts/DebugContext';

export default function ResetProfilePage() {
  const router = useRouter();
  const { isDebugMode, debugUserId, exitDebug } = useDebug();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset your profile? This will delete all your signals, archetype data, and training progress. This cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the userId to reset
      const userId = isDebugMode && debugUserId
        ? debugUserId
        : localStorage.getItem('subtaste_user_id');

      if (!userId) {
        setError('No profile found to reset');
        setLoading(false);
        return;
      }

      // Call reset API
      const response = await fetch('/api/v2/profile/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset profile');
      }

      // Clear localStorage
      if (isDebugMode) {
        localStorage.removeItem('subtaste_debug_user_id');
        exitDebug();
      } else {
        localStorage.removeItem('subtaste_user_id');
      }

      setSuccess(true);

      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      console.error('Reset error:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset profile');
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-void flex items-center justify-center ${isDebugMode ? 'pt-12' : ''}`}>
      <div className="container-sm px-4">
        <div className="archetype-card text-center space-y-6">
          <div>
            <h1 className="font-display text-2xl text-bone mb-2">
              RESET PROFILE
            </h1>
            <p className="text-bone-muted text-sm">
              {isDebugMode
                ? 'Reset your debug profile and start fresh'
                : 'Reset your profile and start fresh'}
            </p>
            {isDebugMode && (
              <div className="mt-3">
                <span className="inline-block px-3 py-1 bg-state-warning/20 text-state-warning text-xs font-mono rounded-full border border-state-warning/40">
                  🐛 Debug Mode Active
                </span>
              </div>
            )}
          </div>

          {!success && !loading && (
            <div className="space-y-4">
              <div className="p-4 rounded border border-state-error/30 bg-state-error/5">
                <p className="text-state-error text-sm font-medium mb-2">
                  ⚠️ WARNING: This action cannot be undone
                </p>
                <p className="text-bone-muted text-xs">
                  Resetting will permanently delete:
                </p>
                <ul className="text-bone-faint text-xs mt-2 space-y-1 text-left list-disc list-inside">
                  <li>Your archetype classification</li>
                  <li>All training signals and responses</li>
                  <li>Stage completion progress</li>
                  <li>Calibration data</li>
                  <li>All preference keywords</li>
                </ul>
              </div>

              {error && (
                <div className="p-3 rounded border border-state-error/50 bg-state-error/10">
                  <p className="text-state-error text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn bg-state-error/20 text-state-error border-state-error/40 hover:bg-state-error/30"
                >
                  Reset Profile
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              <div className="w-8 h-8 border-2 border-bone-faint border-t-bone rounded-full animate-spin mx-auto" />
              <p className="text-bone-muted text-sm">Resetting profile...</p>
            </div>
          )}

          {success && (
            <div className="space-y-4">
              <div className="text-4xl">✓</div>
              <div>
                <p className="text-bone text-lg font-medium mb-1">
                  Profile Reset Complete
                </p>
                <p className="text-bone-muted text-sm">
                  Redirecting to home...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
