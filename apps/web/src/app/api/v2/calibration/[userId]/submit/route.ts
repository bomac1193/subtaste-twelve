/**
 * POST /api/v2/calibration/[userId]/submit - Submit calibration responses
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  reclassify,
  createGenome,
  toPublicGenome,
  PANTHEON,
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
import { getUser, setUser, completeStage } from '@/lib/storage';

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

    const user = getUser(userId);

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

    // Convert responses to signals
    const signals: Signal[] = responses.map((r) => {
      const question = questions.find(q => q.id === r.questionId);
      let weights: Record<string, number> = {};

      if (question) {
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
            const item = rq.items[itemIdx];
            const itemWeights = item?.archetypeWeights || {};
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

    // Reclassify with new signals
    const result = reclassify({
      existingGenome: user.genome,
      newSignals: signals,
    });

    // Create updated genome
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

    // Store and mark stage complete
    setUser(userId, { genome: updatedGenome });
    completeStage(userId, stage);

    const publicGenome = toPublicGenome(updatedGenome);
    const archetype = PANTHEON[result.classification.primary.designation as Designation];

    return NextResponse.json({
      success: true,
      genome: publicGenome,
      designation: result.classification.primary.designation,
      glyph: archetype.glyph,
      confidence: result.classification.primary.confidence,
      stageCompleted: stage,
    });
  } catch (error) {
    console.error('Calibration error:', error);
    return NextResponse.json(
      { error: 'Failed to process calibration' },
      { status: 500 }
    );
  }
}
