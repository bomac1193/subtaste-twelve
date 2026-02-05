/**
 * POST /api/v2/axes/submit - Submit axes calibration and derive hexagram
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  validateAxesResponse,
  normalizeAxesResponse,
  type AxesResponse
} from '@subtaste/profiler';
import {
  deriveHexagramReading,
  toPublicHexagram,
  type HexagramReading
} from '@subtaste/core';
import { getUser, setUser, completeStage } from '@/lib/storage-prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, axes } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    if (!axes) {
      return NextResponse.json(
        { error: 'Axes values required' },
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

    // Normalize and validate axes
    const normalizedAxes = normalizeAxesResponse(axes);

    if (!validateAxesResponse(normalizedAxes)) {
      return NextResponse.json(
        { error: 'Invalid axes values (must be between 0 and 1)' },
        { status: 400 }
      );
    }

    // Derive hexagram from axes
    const hexagramReading = deriveHexagramReading(normalizedAxes);

    // Update genome with axes and hexagram
    const updatedGenome = {
      ...user.genome,
      axes: normalizedAxes,
      iching: hexagramReading
    };

    // Store updated genome
    await setUser(userId, { genome: updatedGenome });
    await completeStage(userId, 'axes');

    // Convert to public format for client
    const publicHexagram = toPublicHexagram(hexagramReading.present);
    const transformingPublic = hexagramReading.transforming
      ? toPublicHexagram(hexagramReading.transforming)
      : undefined;

    return NextResponse.json({
      success: true,
      axes: normalizedAxes,
      hexagram: {
        present: publicHexagram,
        transforming: transformingPublic
          ? {
              number: transformingPublic.number,
              name: transformingPublic.name,
              chinese: transformingPublic.chinese
            }
          : undefined,
        movingLines: hexagramReading.movingLines
      }
    });
  } catch (error) {
    console.error('Axes submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process axes calibration' },
      { status: 500 }
    );
  }
}
