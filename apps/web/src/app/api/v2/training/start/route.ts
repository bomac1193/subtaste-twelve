/**
 * POST /api/v2/training/start - Start a training session
 */

import { NextRequest, NextResponse } from 'next/server';
import { createTrainingSession } from '@subtaste/profiler';
import { createUser, getUser } from '@/lib/storage-prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Random card count between 20-25 if not specified
    const defaultCardCount = 20 + Math.floor(Math.random() * 6);
    const { userId: existingUserId, cardCount = defaultCardCount } = body;

    // Create or use existing user
    let userId = existingUserId;
    if (!userId) {
      userId = await createUser();
    } else {
      // Verify user exists
      const user = await getUser(userId);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }

    // Generate training session
    console.log('Creating training session with cardCount:', cardCount);
    const cards = createTrainingSession(cardCount);
    console.log('Generated cards:', cards?.length || 0, 'cards');

    if (!cards || cards.length === 0) {
      console.error('createTrainingSession returned empty or null:', cards);
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
