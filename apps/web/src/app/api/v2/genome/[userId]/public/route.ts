/**
 * GET /api/v2/genome/[userId]/public - Get public genome
 */

import { NextRequest, NextResponse } from 'next/server';
import { toPublicGenome, PANTHEON, type Designation } from '@subtaste/core';
import { getUser } from '@/lib/storage-prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const user = await getUser(userId);

  if (!user || !user.genome) {
    return NextResponse.json(
      { error: 'Genome not found' },
      { status: 404 }
    );
  }

  // toPublicGenome returns the complete public genome with all necessary fields
  const publicGenome = toPublicGenome(user.genome);

  return NextResponse.json({
    ...publicGenome,
    signalCount: user.signalCount,
    stagesCompleted: user.stagesCompleted,
    sigilRevealed: user.sigilRevealed,
  });
}
