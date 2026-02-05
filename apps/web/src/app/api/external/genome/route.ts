/**
 * GET /api/external/genome - Get taste genome with API key authentication
 *
 * This endpoint is designed for external integrations (Slayt, Tessera, etc.)
 * Requires API key authentication via Authorization header or X-API-Key
 *
 * Usage:
 *   curl -H "Authorization: Bearer sub_live_xxxxx" https://your-domain/api/external/genome
 *   curl -H "X-API-Key: sub_live_xxxxx" https://your-domain/api/external/genome
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractApiKey, verifyApiKey } from '@/lib/api-auth';
import { getUser } from '@/lib/storage-prisma';
import { toPublicGenome } from '@subtaste/core';

export async function GET(request: NextRequest) {
  try {
    // Extract API key from headers
    const apiKey = extractApiKey(request.headers);

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'API key required',
          message: 'Include API key in Authorization header (Bearer token) or X-API-Key header'
        },
        { status: 401 }
      );
    }

    // Verify API key
    const authResult = await verifyApiKey(apiKey);

    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user genome
    const user = await getUser(authResult.userId);

    if (!user || !user.genome) {
      return NextResponse.json(
        { error: 'Genome not found' },
        { status: 404 }
      );
    }

    // Convert to public format (hides sensitive data)
    const publicGenome = toPublicGenome(user.genome);

    return NextResponse.json({
      success: true,
      userId: authResult.userId,
      genome: publicGenome,
      metadata: {
        signalCount: user.signalCount,
        stagesCompleted: user.stagesCompleted,
        sigilRevealed: user.sigilRevealed
      }
    });
  } catch (error) {
    console.error('External genome API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
