/**
 * POST /api/external/signals - Submit behavioral signals via API key
 *
 * This endpoint allows external applications to submit behavioral signals
 * Requires API key with 'write' permission
 *
 * Usage:
 *   curl -X POST -H "Authorization: Bearer sub_live_xxxxx" \
 *     -H "Content-Type: application/json" \
 *     -d '{"signals": [{"type": "save", "itemId": "song_123"}]}' \
 *     https://your-domain/api/external/signals
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractApiKey, verifyApiKey, hasPermission } from '@/lib/api-auth';
import { getUser, setUser, incrementSignals } from '@/lib/storage-prisma';
import {
  reclassify,
  createGenome,
  type Signal,
  type ImplicitSignal
} from '@subtaste/core';

export async function POST(request: NextRequest) {
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

    if (!authResult.authenticated || !authResult.userId || !authResult.permissions) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check write permission
    if (!hasPermission(authResult.permissions, 'write')) {
      return NextResponse.json(
        { error: 'Write permission required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { signals } = body as {
      signals: Array<{
        type: string;
        action: string;
        itemId?: string;
        context?: string;
      }>;
    };

    if (!signals || signals.length === 0) {
      return NextResponse.json(
        { error: 'No signals provided' },
        { status: 400 }
      );
    }

    // Get user
    const user = await getUser(authResult.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Convert to Signal format
    const processedSignals: Signal[] = signals.map((s) => ({
      type: 'implicit' as const,
      source: 'behaviour' as const,
      timestamp: new Date(),
      data: {
        kind: s.action as 'save' | 'skip' | 'share' | 'listen' | 'dwell' | 'scroll' | 'replay',
        itemId: s.itemId || 'unknown',
        context: s.context,
        duration: undefined,
        depth: undefined
      } as ImplicitSignal
    }));

    // Increment signal count
    const newCount = await incrementSignals(authResult.userId, signals.length);

    // If genome exists, reclassify
    if (user.genome) {
      const result = reclassify({
        existingGenome: user.genome,
        newSignals: processedSignals
      });

      const updatedGenome = createGenome({
        userId: authResult.userId,
        classification: {
          primary: {
            designation: result.classification.primary.designation,
            confidence: result.classification.primary.confidence
          },
          secondary: result.classification.secondary
            ? {
                designation: result.classification.secondary.designation,
                confidence: result.classification.secondary.confidence
              }
            : null,
          distribution: result.classification.distribution
        },
        psychometrics: result.psychometrics,
        sephiroticBalance: result.sephiroticBalance,
        orishaResonance: result.orishaResonance
      });

      await setUser(authResult.userId, { genome: updatedGenome });
    }

    return NextResponse.json({
      success: true,
      signalCount: newCount,
      processed: signals.length
    });
  } catch (error) {
    console.error('External signals API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
