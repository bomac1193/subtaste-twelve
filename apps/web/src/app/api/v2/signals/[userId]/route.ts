/**
 * POST /api/v2/signals/[userId] - Record behavioral signals
 * GET /api/v2/signals/[userId] - Get signal count
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  reclassify,
  createGenome,
  toPublicGenome,
  type Signal,
  type ImplicitSignal,
} from '@subtaste/core';
import { getUser, setUser, incrementSignals } from '@/lib/storage';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  try {
    const body = await request.json();
    const { signals } = body as { signals: Array<{ type: string; action: string; itemId?: string; context?: string }> };

    if (!signals || signals.length === 0) {
      return NextResponse.json({ error: 'No signals provided' }, { status: 400 });
    }

    const user = getUser(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
        depth: undefined,
      } as ImplicitSignal,
    }));

    // Increment signal count
    const newCount = incrementSignals(userId, signals.length);

    // If genome exists, reclassify
    if (user.genome) {
      const result = reclassify({
        existingGenome: user.genome,
        newSignals: processedSignals,
      });

      const updatedGenome = createGenome({
        userId,
        classification: {
          primary: {
            designation: result.classification.primary.designation,
            confidence: result.classification.primary.confidence,
          },
          secondary: result.classification.secondary ? {
            designation: result.classification.secondary.designation,
            confidence: result.classification.secondary.confidence,
          } : null,
          distribution: result.classification.distribution,
        },
        psychometrics: result.psychometrics,
        sephiroticBalance: result.sephiroticBalance,
        orishaResonance: result.orishaResonance,
      });

      setUser(userId, { genome: updatedGenome });
    }

    return NextResponse.json({
      success: true,
      signalCount: newCount,
      calibrationAvailable: newCount >= 5 && !user.stagesCompleted.includes('music'),
    });
  } catch (error) {
    console.error('Signal recording error:', error);
    return NextResponse.json(
      { error: 'Failed to record signals' },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const user = getUser(userId);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    signalCount: user.signalCount,
    calibrationAvailable: user.signalCount >= 5 && !user.stagesCompleted.includes('music'),
  });
}
