/**
 * POST /api/v2/quiz - Submit initial quiz
 * GET /api/v2/quiz?userId=xxx - Get progress
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  classify,
  createGenome,
  toPublicGenome,
  PANTHEON,
  type Signal,
  type ExplicitSignal,
  type Designation
} from '@subtaste/core';
import { INITIAL_QUESTIONS, type BinaryQuestion } from '@subtaste/profiler';
import { createUser, setUser, getUser, completeStage } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId: existingUserId, responses } = body;

    if (!responses || responses.length === 0) {
      return NextResponse.json({ error: 'No responses provided' }, { status: 400 });
    }

    // Create or use existing user
    const userId = existingUserId || createUser();

    // Convert responses to signals
    const signals: Signal[] = responses.map((r: { questionId: string; response: number }) => {
      const question = INITIAL_QUESTIONS.find(q => q.id === r.questionId) as BinaryQuestion | undefined;
      const weights = question?.optionWeights?.[r.response as 0 | 1] || {};

      return {
        type: 'explicit' as const,
        source: 'quiz' as const,
        timestamp: new Date(),
        data: {
          kind: 'choice',
          questionId: r.questionId,
          value: r.response,
          archetypeWeights: weights,
        } as ExplicitSignal,
      };
    });

    // Classify
    const result = classify({ signals });

    // Create genome
    const genome = createGenome({
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

    // Store
    setUser(userId, { genome });
    completeStage(userId, 'initial');

    const publicGenome = toPublicGenome(genome);

    return NextResponse.json({
      success: true,
      userId,
      genome: publicGenome,
      glyph: result.classification.primary.glyph,
      designation: result.classification.primary.designation,
      confidence: result.classification.primary.confidence,
    });
  } catch (error) {
    console.error('Quiz error:', error);
    return NextResponse.json(
      { error: 'Failed to process quiz' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const user = getUser(userId);

  if (!user) {
    return NextResponse.json({
      hasStarted: false,
      currentStage: null,
      stagesCompleted: [],
      signalCount: 0,
    });
  }

  return NextResponse.json({
    hasStarted: user.stagesCompleted.length > 0,
    currentStage: null,
    stagesCompleted: user.stagesCompleted,
    signalCount: user.signalCount,
  });
}
