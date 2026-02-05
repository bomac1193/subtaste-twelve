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

  const publicGenome = toPublicGenome(user.genome);
  const designation = user.genome.classification.primary.designation;
  const archetype = PANTHEON[designation as Designation];

  return NextResponse.json({
    ...publicGenome,
    archetype: {
      primary: {
        designation: user.genome.classification.primary.designation,
        glyph: archetype.glyph,
        confidence: user.genome.classification.primary.confidence,
      },
      secondary: user.genome.classification.secondary ? {
        designation: user.genome.classification.secondary.designation,
        glyph: PANTHEON[user.genome.classification.secondary.designation as Designation].glyph,
        confidence: user.genome.classification.secondary.confidence,
      } : null,
    },
    confidence: user.genome.classification.primary.confidence,
    sigilRevealed: user.sigilRevealed,
  });
}
