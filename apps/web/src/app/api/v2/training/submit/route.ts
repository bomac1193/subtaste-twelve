/**
 * POST /api/v2/training/submit - Submit a training card response
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  TRAINING_PROMPTS,
  generateTrainingSignals,
  generateRevisionSignals,
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
      completedTopics = [],
      isRevision = false,
      originalBestId,
      originalWorstId
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

    // For revisions, also look up original prompts
    const origBestPrompt = isRevision ? TRAINING_PROMPTS.find(p => p.id === originalBestId) : null;
    const origWorstPrompt = isRevision ? TRAINING_PROMPTS.find(p => p.id === originalWorstId) : null;

    if (isRevision && (!origBestPrompt || !origWorstPrompt)) {
      return NextResponse.json(
        { error: 'Invalid original option IDs for revision' },
        { status: 400 }
      );
    }

    // Build card with all options needed for signal generation
    const optionIds = new Set([bestId, worstId, originalBestId, originalWorstId].filter(Boolean));
    const cardOptions = [...optionIds].map(id => {
      const prompt = TRAINING_PROMPTS.find(p => p.id === id)!;
      return { id: prompt.id, text: prompt.prompt, archetypeHint: prompt.archetypeHint };
    });

    const card: TrainingCard = {
      id: cardId,
      topic: topic || bestPrompt.topic,
      prompt: '',
      options: cardOptions
    };

    const submission: TrainingSubmission = {
      cardId,
      bestId,
      worstId
    };

    // Generate signals — revision produces 4 (2 cancel + 2 new), normal produces 2
    const trainingSignals = isRevision
      ? generateRevisionSignals(card, submission, {
          bestId: originalBestId,
          worstId: originalWorstId
        })
      : generateTrainingSignals(card, submission);

    // Convert to Signal format with timestamps
    const signals: Signal[] = trainingSignals.map(sig => ({
      type: 'explicit' as const,
      source: 'training' as const,
      timestamp: new Date(),
      data: sig
    }));

    // Update genome with new signals
    const updatedGenome = updateGenomeWithSignals(user.genome, signals);

    // Debug: Log confidence value
    console.log('[Training] Updated genome confidence:', updatedGenome.behaviour?.confidence);
    console.log('[Training] Primary archetype confidence:', updatedGenome.archetype?.primary?.confidence);

    // Extract and update keywords
    let currentKeywords = updatedGenome.keywords || { visual: {}, content: {} };

    if (isRevision && origBestPrompt && origWorstPrompt) {
      // Cancel original keywords (inverse polarity, half weight)
      currentKeywords = updateKeywordScores(currentKeywords, origBestPrompt.prompt, 0.8, 'negative');
      currentKeywords = updateKeywordScores(currentKeywords, origWorstPrompt.prompt, 0.8, 'positive');
    }

    // New keywords at full weight
    currentKeywords = updateKeywordScores(currentKeywords, bestPrompt.prompt, 1.6, 'positive');
    currentKeywords = updateKeywordScores(currentKeywords, worstPrompt.prompt, 1.6, 'negative');

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
      },
      isRevision,
      signalsApplied: trainingSignals.length
    });
  } catch (error) {
    console.error('Training submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process training submission' },
      { status: 500 }
    );
  }
}
