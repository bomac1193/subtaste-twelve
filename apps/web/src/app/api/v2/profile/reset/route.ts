/**
 * POST /api/v2/profile/reset - Reset user profile
 * Clears genome, signals, stages, and sigil for a fresh start
 */

import { NextRequest, NextResponse } from 'next/server';
import { resetUserProfile } from '@/lib/storage-prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const success = await resetUserProfile(userId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to reset profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile reset successfully',
      userId
    });
  } catch (error) {
    console.error('Profile reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
