/**
 * API key authentication middleware
 * Validates API keys for external access
 */

import { prisma } from './prisma';
import { compare } from 'bcryptjs';

export interface ApiAuthResult {
  authenticated: boolean;
  userId?: string;
  permissions?: string[];
  error?: string;
}

/**
 * Verify an API key and return the associated user
 */
export async function verifyApiKey(apiKey: string): Promise<ApiAuthResult> {
  try {
    // Validate key format
    if (!apiKey || !apiKey.startsWith('sub_live_')) {
      return {
        authenticated: false,
        error: 'Invalid API key format'
      };
    }

    // Get all API keys from database
    // We need to check against all hashed keys since we don't know which user
    const allKeys = await prisma.apiKey.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    // Check each key
    for (const dbKey of allKeys) {
      // Check if expired
      if (dbKey.expiresAt && dbKey.expiresAt < new Date()) {
        continue;
      }

      // Compare hashed key
      const isValid = await compare(apiKey, dbKey.key);

      if (isValid) {
        // Update last used timestamp
        await prisma.apiKey.update({
          where: { id: dbKey.id },
          data: { lastUsedAt: new Date() }
        });

        return {
          authenticated: true,
          userId: dbKey.userId,
          permissions: dbKey.permissions
        };
      }
    }

    return {
      authenticated: false,
      error: 'Invalid API key'
    };
  } catch (error) {
    console.error('API key verification error:', error);
    return {
      authenticated: false,
      error: 'Internal authentication error'
    };
  }
}

/**
 * Extract API key from request headers
 */
export function extractApiKey(headers: Headers): string | null {
  // Check Authorization header (Bearer token)
  const authHeader = headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check X-API-Key header
  const apiKeyHeader = headers.get('x-api-key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  return null;
}

/**
 * Check if user has specific permission
 */
export function hasPermission(
  permissions: string[],
  required: 'read' | 'write'
): boolean {
  return permissions.includes(required);
}
