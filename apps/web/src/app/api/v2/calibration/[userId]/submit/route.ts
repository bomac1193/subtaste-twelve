/**
 * POST /api/v2/calibration/[userId]/submit - Submit calibration responses
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  updateGenomeWithSignals,
  toPublicGenome,
  PANTHEON,
  ALL_DESIGNATIONS,
  type Signal,
  type ExplicitSignal,
  type Designation,
} from '@subtaste/core';
import {
  MUSIC_CALIBRATION_QUESTIONS,
  DEEP_CALIBRATION_QUESTIONS,
  type LikertQuestion,
  type BinaryQuestion,
  type RankingQuestion,
} from '@subtaste/profiler';
import { getUser, setUser, completeStage } from '@/lib/storage-prisma';

type StageId = 'music' | 'deep';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  try {
    const body = await request.json();
    const { stage, responses } = body as {
      stage: StageId;
      responses: Array<{ questionId: string; response: number | number[] }>;
    };

    if (!stage || !['music', 'deep'].includes(stage)) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
    }

    if (!responses || responses.length === 0) {
      return NextResponse.json({ error: 'No responses provided' }, { status: 400 });
    }

    const user = await getUser(userId);

    if (!user || !user.genome) {
      return NextResponse.json({ error: 'User not found or no genome' }, { status: 404 });
    }

    // Check prerequisites
    if (stage === 'music' && user.signalCount < 5) {
      return NextResponse.json({ error: 'Insufficient signals for music calibration' }, { status: 400 });
    }

    if (stage === 'deep' && !user.stagesCompleted.includes('music')) {
      return NextResponse.json({ error: 'Music calibration required first' }, { status: 400 });
    }

    // Get questions for this stage
    const questions = stage === 'music'
      ? MUSIC_CALIBRATION_QUESTIONS
      : DEEP_CALIBRATION_QUESTIONS;

    // Skip sentinel weights (uniform low-confidence)
    const SKIP_WEIGHT = 0.025;
    const SKIP_WEIGHTS: Record<string, number> = Object.fromEntries(
      ALL_DESIGNATIONS.map(d => [d, SKIP_WEIGHT])
    );

    // Convert responses to signals
    const signals: Signal[] = responses.map((r) => {
      const question = questions.find(q => q.id === r.questionId);
      let weights: Record<string, number> = {};

      // Skip sentinel: -1 means user skipped this question
      if (r.response === -1) {
        weights = SKIP_WEIGHTS;
      } else if (question) {
        if (question.type === 'binary') {
          const bq = question as BinaryQuestion;
          weights = bq.optionWeights?.[r.response as 0 | 1] || {};
        } else if (question.type === 'likert') {
          const lq = question as LikertQuestion;
          // Likert weights are scaled by response value
          const scale = lq.scale || 5;
          const normalizedValue = (r.response as number) / scale;
          weights = Object.fromEntries(
            Object.entries(lq.archetypeWeights || {}).map(([k, v]) => [k, v * normalizedValue])
          );
        } else if (question.type === 'ranking') {
          // Ranking gives more weight to higher-ranked items
          const rq = question as RankingQuestion;
          const ranking = r.response as number[];
          ranking.forEach((itemIdx, rank) => {
            const itemWeights = rq.itemWeights?.[itemIdx] || {};
            const rankWeight = 1 - (rank / ranking.length);
            Object.entries(itemWeights).forEach(([k, v]) => {
              weights[k] = (weights[k] || 0) + v * rankWeight;
            });
          });
        }
      }

      return {
        type: 'explicit' as const,
        source: 'calibration' as const,
        timestamp: new Date(),
        data: {
          kind: 'choice',
          questionId: r.questionId,
          value: r.response,
          archetypeWeights: weights,
        } as ExplicitSignal,
      };
    });

    // Merge calibration signals into existing genome (preserves history, keywords, etc.)
    const updatedGenome = updateGenomeWithSignals(user.genome, signals);

    // Store and mark stage complete
    await setUser(userId, { genome: updatedGenome }, 'calibration');
    await completeStage(userId, stage);

    const publicGenome = toPublicGenome(updatedGenome);
    const designation = updatedGenome.archetype.primary.designation as Designation;
    const archetype = PANTHEON[designation];

    return NextResponse.json({
      success: true,
      genome: publicGenome,
      designation,
      glyph: archetype.glyph,
      confidence: updatedGenome.archetype.primary.confidence,
      stageCompleted: stage,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Calibration error:', message, error);
    return NextResponse.json(
      { error: `Failed to process calibration: ${message}` },
      { status: 500 }
    );
  }
}
