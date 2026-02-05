/**
 * POST /api/v2/training/submit - Submit a training card response
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  TRAINING_PROMPTS,
  generateTrainingSignals,
  calculateTrainingXP,
  type TrainingCard,
  type TrainingSubmission
} from '@subtaste/profiler';
import {
  updateKeywordScores,
  updateGenomeWithSignals,
  type Signal,
  type Designation
} from '@subtaste/core';
import { getUser, setUser, incrementSignals } from '@/lib/storage-prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      cardId,
      bestId,
      worstId,
      topic,
      completedTopics = []
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    if (!bestId || !worstId) {
      return NextResponse.json(
        { error: 'Both best and worst selections required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await getUser(userId);
    if (!user || !user.genome) {
      return NextResponse.json(
        { error: 'User not found or profile not initialized' },
        { status: 404 }
      );
    }

    // Reconstruct the card options from the training prompts
    const bestPrompt = TRAINING_PROMPTS.find(p => p.id === bestId);
    const worstPrompt = TRAINING_PROMPTS.find(p => p.id === worstId);

    if (!bestPrompt || !worstPrompt) {
      return NextResponse.json(
        { error: 'Invalid option IDs' },
        { status: 400 }
      );
    }

    // Create minimal card structure for signal generation
    const card: TrainingCard = {
      id: cardId,
      topic: topic || bestPrompt.topic,
      prompt: '',
      options: [
        {
          id: bestId,
          text: bestPrompt.prompt,
          archetypeHint: bestPrompt.archetypeHint
        },
        {
          id: worstId,
          text: worstPrompt.prompt,
          archetypeHint: worstPrompt.archetypeHint
        }
      ]
    };

    const submission: TrainingSubmission = {
      cardId,
      bestId,
      worstId
    };

    // Generate signals from the submission
    const trainingSignals = generateTrainingSignals(card, submission);

    // Convert to Signal format with timestamps
    const signals: Signal[] = trainingSignals.map(sig => ({
      type: 'explicit' as const,
      source: 'training' as const,
      timestamp: new Date(),
      data: sig
    }));

    // Update genome with new signals
    const updatedGenome = updateGenomeWithSignals(user.genome, signals);

    // Extract and update keywords from both best and worst text
    let currentKeywords = updatedGenome.keywords || { visual: {}, content: {} };

    // Best option - positive keywords
    currentKeywords = updateKeywordScores(
      currentKeywords,
      bestPrompt.prompt,
      1.6, // Same weight as training signal
      'positive'
    );

    // Worst option - negative keywords
    currentKeywords = updateKeywordScores(
      currentKeywords,
      worstPrompt.prompt,
      1.6,
      'negative'
    );

    updatedGenome.keywords = currentKeywords;

    // Calculate XP
    const completedSet = new Set(completedTopics);
    const xp = calculateTrainingXP(completedSet, topic);

    // Update gamification
    const currentXP = updatedGenome.gamification?.xp || 0;
    const currentTier = updatedGenome.gamification?.tier || 'novice';

    updatedGenome.gamification = {
      xp: currentXP + xp,
      tier: currentTier, // TODO: tier progression logic
      achievements: updatedGenome.gamification?.achievements || [],
      streak: {
        current: updatedGenome.gamification?.streak?.current || 0,
        longest: updatedGenome.gamification?.streak?.longest || 0,
        lastActiveDate: new Date().toISOString()
      }
    };

    // Store updated genome
    await setUser(userId, { genome: updatedGenome });
    await incrementSignals(userId, signals.length);

    return NextResponse.json({
      success: true,
      xp,
      totalXP: updatedGenome.gamification.xp,
      keywordsExtracted: {
        visual: Object.keys(currentKeywords.visual).length,
        content: Object.keys(currentKeywords.content).length
      }
    });
  } catch (error) {
    console.error('Training submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process training submission' },
      { status: 500 }
    );
  }
}
