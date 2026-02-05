/**
 * Prisma-based storage for taste genome data
 * Replaces in-memory storage with MongoDB persistence
 */

import { prisma } from './prisma';
import type { TasteGenome } from '@subtaste/core';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

interface UserData {
  genome: TasteGenome | null;
  signalCount: number;
  stagesCompleted: string[];
  sigilRevealed: boolean;
}

/**
 * Get current authenticated user from session
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

/**
 * Get user data from database
 */
export async function getUser(userId: string): Promise<UserData | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tasteGenome: true }
    });

    if (!user) return null;

    // Convert TasteGenome model to TasteGenome type
    const genome: TasteGenome | null = user.tasteGenome
      ? {
          primary: user.tasteGenome.primary as any,
          secondary: user.tasteGenome.secondary as any,
          confidence: user.tasteGenome.confidence,
          distribution: user.tasteGenome.distribution as any,
          axes: user.tasteGenome.orderChaos !== null ? {
            orderChaos: user.tasteGenome.orderChaos,
            mercyRuthlessness: user.tasteGenome.mercyRuthlessness!,
            introvertExtrovert: user.tasteGenome.introvertExtrovert!,
            faithDoubt: user.tasteGenome.faithDoubt!
          } : undefined,
          iching: user.tasteGenome.iching as any,
          keywords: user.tasteGenome.keywords as any,
          gamification: {
            xp: user.tasteGenome.xp,
            tier: user.tasteGenome.tier as any,
            achievements: user.tasteGenome.achievements as any,
            streak: user.tasteGenome.streak as any
          },
          psychometrics: user.tasteGenome.psychometrics as any,
          subtasteContext: user.tasteGenome.subtasteContext as any
        }
      : null;

    return {
      genome,
      signalCount: user.tasteGenome?.signalCount || 0,
      stagesCompleted: user.tasteGenome?.stagesCompleted || [],
      sigilRevealed: user.tasteGenome?.sigilRevealed || false
    };
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
}

/**
 * Update user data in database
 */
export async function setUser(
  userId: string,
  data: Partial<UserData>
): Promise<void> {
  try {
    const existing = await getUser(userId);

    if (!existing) {
      throw new Error(`User ${userId} not found`);
    }

    const merged = { ...existing, ...data };
    const genome = merged.genome;

    if (!genome) {
      // If no genome yet, just update metadata
      await prisma.tasteGenome.upsert({
        where: { userId },
        create: {
          userId,
          primary: 'UNKNOWN',
          signalCount: merged.signalCount,
          stagesCompleted: merged.stagesCompleted,
          sigilRevealed: merged.sigilRevealed
        },
        update: {
          signalCount: merged.signalCount,
          stagesCompleted: merged.stagesCompleted,
          sigilRevealed: merged.sigilRevealed
        }
      });
      return;
    }

    // Update with full genome data
    await prisma.tasteGenome.upsert({
      where: { userId },
      create: {
        userId,
        primary: genome.primary,
        secondary: genome.secondary,
        confidence: genome.confidence,
        distribution: genome.distribution as any,
        orderChaos: genome.axes?.orderChaos,
        mercyRuthlessness: genome.axes?.mercyRuthlessness,
        introvertExtrovert: genome.axes?.introvertExtrovert,
        faithDoubt: genome.axes?.faithDoubt,
        iching: genome.iching as any,
        keywords: genome.keywords as any,
        xp: genome.gamification?.xp || 0,
        tier: genome.gamification?.tier || 'novice',
        achievements: genome.gamification?.achievements as any,
        streak: genome.gamification?.streak as any,
        signalCount: merged.signalCount,
        stagesCompleted: merged.stagesCompleted,
        sigilRevealed: merged.sigilRevealed,
        psychometrics: genome.psychometrics as any,
        subtasteContext: genome.subtasteContext as any
      },
      update: {
        primary: genome.primary,
        secondary: genome.secondary,
        confidence: genome.confidence,
        distribution: genome.distribution as any,
        orderChaos: genome.axes?.orderChaos,
        mercyRuthlessness: genome.axes?.mercyRuthlessness,
        introvertExtrovert: genome.axes?.introvertExtrovert,
        faithDoubt: genome.axes?.faithDoubt,
        iching: genome.iching as any,
        keywords: genome.keywords as any,
        xp: genome.gamification?.xp || 0,
        tier: genome.gamification?.tier || 'novice',
        achievements: genome.gamification?.achievements as any,
        streak: genome.gamification?.streak as any,
        signalCount: merged.signalCount,
        stagesCompleted: merged.stagesCompleted,
        sigilRevealed: merged.sigilRevealed,
        psychometrics: genome.psychometrics as any,
        subtasteContext: genome.subtasteContext as any
      }
    });
  } catch (error) {
    console.error('Failed to set user:', error);
    throw error;
  }
}

/**
 * Create a new user (should be called after signup)
 * Returns the user ID
 */
export async function createUser(email?: string, name?: string): Promise<string> {
  try {
    // If authenticated, use current user
    const currentUserId = await getCurrentUserId();
    if (currentUserId) {
      // Ensure taste genome exists
      await prisma.tasteGenome.upsert({
        where: { userId: currentUserId },
        create: {
          userId: currentUserId,
          primary: 'UNKNOWN',
          signalCount: 0,
          stagesCompleted: [],
          sigilRevealed: false
        },
        update: {}
      });
      return currentUserId;
    }

    // For unauthenticated users (shouldn't happen with new auth system)
    // Create a temporary user
    const user = await prisma.user.create({
      data: {
        email: email || `temp_${Date.now()}@subtaste.local`,
        name: name || 'Guest',
        tasteGenome: {
          create: {
            primary: 'UNKNOWN',
            signalCount: 0,
            stagesCompleted: [],
            sigilRevealed: false
          }
        }
      }
    });

    return user.id;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
}

/**
 * Increment signal count
 */
export async function incrementSignals(
  userId: string,
  count: number = 1
): Promise<number> {
  try {
    const result = await prisma.tasteGenome.update({
      where: { userId },
      data: {
        signalCount: {
          increment: count
        }
      }
    });
    return result.signalCount;
  } catch (error) {
    console.error('Failed to increment signals:', error);
    return 0;
  }
}

/**
 * Mark a stage as completed
 */
export async function completeStage(userId: string, stage: string): Promise<void> {
  try {
    const user = await getUser(userId);
    if (!user) return;

    if (!user.stagesCompleted.includes(stage)) {
      await prisma.tasteGenome.update({
        where: { userId },
        data: {
          stagesCompleted: {
            push: stage
          }
        }
      });
    }
  } catch (error) {
    console.error('Failed to complete stage:', error);
  }
}

/**
 * Reveal sigil
 */
export async function revealSigil(userId: string): Promise<boolean> {
  try {
    await prisma.tasteGenome.update({
      where: { userId },
      data: {
        sigilRevealed: true
      }
    });
    return true;
  } catch (error) {
    console.error('Failed to reveal sigil:', error);
    return false;
  }
}
