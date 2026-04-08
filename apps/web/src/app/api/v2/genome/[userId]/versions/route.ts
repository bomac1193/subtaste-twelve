/**
 * GET /api/v2/genome/[userId]/versions - List genome version history
 * POST /api/v2/genome/[userId]/versions - Restore a specific version
 */

import { NextRequest, NextResponse } from 'next/server';
import { listGenomeVersions, restoreGenomeVersion } from '@/lib/storage-prisma';
import { toPublicGenome, PANTHEON, type Designation } from '@subtaste/core';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const versions = await listGenomeVersions(userId);

  return NextResponse.json({
    versions: versions.map(v => ({
      id: v.id,
      trigger: v.trigger,
      primary: v.primary,
      primaryGlyph: v.primary ? PANTHEON[v.primary as Designation]?.glyph || v.primary : null,
      secondary: v.secondary,
      confidence: v.confidence,
      signalCount: v.signalCount,
      version: v.version,
      createdAt: v.createdAt,
    }))
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  try {
    const body = await request.json();
    const { versionId } = body;

    if (!versionId) {
      return NextResponse.json({ error: 'versionId required' }, { status: 400 });
    }

    const genome = await restoreGenomeVersion(userId, versionId);

    if (!genome) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    const publicGenome = toPublicGenome(genome);
    const designation = genome.archetype.primary.designation as Designation;

    return NextResponse.json({
      success: true,
      genome: publicGenome,
      designation,
      glyph: PANTHEON[designation]?.glyph,
      restoredFromVersion: versionId,
    });
  } catch (error) {
    console.error('Version restore error:', error);
    return NextResponse.json(
      { error: 'Failed to restore version' },
      { status: 500 }
    );
  }
}
