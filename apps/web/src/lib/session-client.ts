/**
 * Client-side session utilities
 * Provides easy access to NextAuth session on client
 */

'use client';

import { useSession } from 'next-auth/react';

/**
 * Hook to get current user ID from session
 */
export function useUserId(): string | null {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return null;
  }

  return session?.user?.id || null;
}

/**
 * Hook to check if user is authenticated
 */
export function useAuth() {
  const { data: session, status } = useSession();

  return {
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    userId: session?.user?.id || null,
    user: session?.user || null
  };
}
