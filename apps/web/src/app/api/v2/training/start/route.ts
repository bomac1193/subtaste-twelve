/**
 * POST /api/v2/training/start - Start a training session
 */

import { NextRequest, NextResponse } from 'next/server';
import { createTrainingSession } from '@subtaste/profiler';
import { createUser, getUser } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId: existingUserId, cardCount = 15 } = body;

    // Create or use existing user
    let userId = existingUserId;
    if (!userId) {
      userId = createUser();
    } else {
      // Verify user exists
      const user = getUser(userId);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }

    // Generate training session
    const cards = createTrainingSession(cardCount);

    if (cards.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate training cards' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userId,
      cards: cards.map(card => ({
        id: card.id,
        topic: card.topic,
        options: card.options.map(opt => ({
          id: opt.id,
          text: opt.text
          // Note: archetypeHint is kept server-side only
        }))
      }))
    });
  } catch (error) {
    console.error('Training start error:', error);
    return NextResponse.json(
      { error: 'Failed to start training session' },
      { status: 500 }
    );
  }
}
