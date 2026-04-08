/**
 * POST /api/v2/quiz - Submit initial quiz
 * GET /api/v2/quiz?userId=xxx - Get progress
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  classify,
  createGenome,
  updateGenomeWithSignals,
  toPublicGenome,
  PANTHEON,
  ALL_DESIGNATIONS,
  type Signal,
  type ExplicitSignal,
  type Designation
} from '@subtaste/core';
import { INITIAL_QUESTIONS, type BinaryQuestion } from '@subtaste/profiler';
import { createUser, setUser, getUser, completeStage } from '@/lib/storage-prisma';

// Uniform low-confidence weights for skipped questions
// 0.3 total spread across 12 archetypes = 0.025 each
const SKIP_WEIGHT = 0.025;
const SKIP_WEIGHTS: Partial<Record<Designation, number>> = Object.fromEntries(
  ALL_DESIGNATIONS.map(d => [d, SKIP_WEIGHT])
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId: existingUserId, responses } = body;

    if (!responses || responses.length === 0) {
      return NextResponse.json({ error: 'No responses provided' }, { status: 400 });
    }

    // Create or use existing user
    const userId = existingUserId || await createUser();

    // Convert responses to signals
    const signals: Signal[] = responses.map((r: { questionId: string; response: number }) => {
      const question = INITIAL_QUESTIONS.find(q => q.id === r.questionId) as BinaryQuestion | undefined;

      // Skip sentinel: -1 means user skipped this question
      // Treat as low-confidence uniform signal (indecision = data)
      const isSkipped = r.response === -1;
      const weights = isSkipped
        ? SKIP_WEIGHTS
        : (question?.optionWeights?.[r.response as 0 | 1] || {});

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

    // Check if returning user has an existing genome
    const existingUser = existingUserId ? await getUser(existingUserId) : null;
    const existingGenome = existingUser?.genome;

    let genome;

    if (existingGenome && existingGenome.archetype) {
      // Returning user: merge quiz signals into existing genome
      // This preserves prior distribution from training signals
      console.log('[Quiz] Merging into existing genome for user:', userId);
      console.log('[Quiz] Existing signal history:', existingGenome.behaviour?.signalHistory?.length || 0);
      genome = updateGenomeWithSignals(existingGenome, signals);
    } else {
      // New user: create fresh genome
      const result = classify({ signals });
      console.log('[Quiz] New genome - confidence:', result.classification.primary.confidence);
      genome = createGenome({
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
    }

    // Store
    await setUser(userId, { genome }, 'quiz');
    await completeStage(userId, 'initial');

    const publicGenome = toPublicGenome(genome);
    const primaryDesignation = genome.archetype.primary.designation;
    const primaryConfidence = genome.archetype.primary.confidence;

    return NextResponse.json({
      success: true,
      userId,
      genome: publicGenome,
      glyph: PANTHEON[primaryDesignation]?.glyph,
      designation: primaryDesignation,
      confidence: primaryConfidence,
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

  const user = await getUser(userId);

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
