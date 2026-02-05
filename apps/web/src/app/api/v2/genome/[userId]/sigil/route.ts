/**
 * POST /api/v2/genome/[userId]/sigil - Reveal sigil
 */

import { NextRequest, NextResponse } from 'next/server';
import { PANTHEON, type Designation } from '@subtaste/core';
import { getUser, revealSigil } from '@/lib/storage-prisma';

export async function POST(
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

  await revealSigil(userId);

  const designation = user.genome.classification.primary.designation;
  const archetype = PANTHEON[designation as Designation];

  return NextResponse.json({
    success: true,
    sigil: archetype.sigil,
    designation: designation,
  });
}

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

  if (!user.sigilRevealed) {
    return NextResponse.json({
      revealed: false,
      sigil: null,
    });
  }

  const designation = user.genome.classification.primary.designation;
  const archetype = PANTHEON[designation as Designation];

  return NextResponse.json({
    revealed: true,
    sigil: archetype.sigil,
  });
}
