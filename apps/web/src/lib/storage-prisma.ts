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
    // The database stores a serialized JSON genome
    let genome: TasteGenome | null = user.tasteGenome
      ? (user.tasteGenome.distribution as any) // The full genome is stored in the distribution field as JSON
      : null;

    // Ensure confidence is properly set - use database field as fallback
    if (genome && user.tasteGenome) {
      if (!genome.behaviour?.confidence && user.tasteGenome.confidence) {
        genome = {
          ...genome,
          behaviour: {
            ...genome.behaviour,
            confidence: user.tasteGenome.confidence
          }
        };
      }
    }

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

    // If user doesn't exist, create default data structure
    const defaultUserData: UserData = {
      genome: null,
      signalCount: 0,
      stagesCompleted: [],
      sigilRevealed: false
    };

    const merged = { ...(existing || defaultUserData), ...data };
    const genome = merged.genome;

    // Store the entire genome as JSON in the distribution field
    // Extract basic fields for database columns
    const genomeData = genome ? {
      primary: genome.archetype?.primary?.designation || 'UNKNOWN',
      secondary: genome.archetype?.secondary?.designation || null,
      confidence: genome.behaviour?.confidence || genome.archetype?.primary?.confidence || 0,
      distribution: genome as any, // Store full genome as JSON
      signalCount: merged.signalCount,
      stagesCompleted: merged.stagesCompleted,
      sigilRevealed: genome.formal?.revealed || merged.sigilRevealed,
      psychometrics: genome._engine?.psychometrics as any,
      updatedAt: new Date()
    } : {
      primary: 'UNKNOWN',
      secondary: null,
      confidence: 0,
      distribution: null,
      signalCount: merged.signalCount,
      stagesCompleted: merged.stagesCompleted,
      sigilRevealed: merged.sigilRevealed,
      psychometrics: null,
      updatedAt: new Date()
    };

    // Use updateMany which works without replica set
    const result = await prisma.tasteGenome.updateMany({
      where: { userId },
      data: genomeData
    });

    // If nothing was updated, create new
    if (result.count === 0) {
      await prisma.tasteGenome.create({
        data: {
          userId,
          ...genomeData,
          createdAt: new Date()
        }
      });
    }
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
      // Check if taste genome exists
      const existingGenome = await prisma.tasteGenome.findUnique({
        where: { userId: currentUserId }
      });

      // Create if doesn't exist
      if (!existingGenome) {
        await prisma.tasteGenome.create({
          data: {
            userId: currentUserId,
            primary: 'UNKNOWN',
            signalCount: 0,
            stagesCompleted: [],
            sigilRevealed: false
          }
        });
      }
      return currentUserId;
    }

    // For unauthenticated users (shouldn't happen with new auth system)
    // Create a temporary user
    const user = await prisma.user.create({
      data: {
        email: email || `temp_${Date.now()}@subtaste.local`,
        name: name || 'Guest'
      }
    });

    // Create tasteGenome separately to avoid transaction requirement
    await prisma.tasteGenome.create({
      data: {
        userId: user.id,
        primary: 'UNKNOWN',
        signalCount: 0,
        stagesCompleted: [],
        sigilRevealed: false
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
    // Get current count
    const current = await prisma.tasteGenome.findUnique({
      where: { userId },
      select: { signalCount: true }
    });

    const newCount = (current?.signalCount || 0) + count;

    // Update with new count
    await prisma.tasteGenome.updateMany({
      where: { userId },
      data: { signalCount: newCount }
    });

    return newCount;
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
      const newStages = [...user.stagesCompleted, stage];
      await prisma.tasteGenome.updateMany({
        where: { userId },
        data: {
          stagesCompleted: newStages
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
    await prisma.tasteGenome.updateMany({
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

/**
 * Reset user profile - clears genome, signals, and stages
 * This creates a fresh start while preserving the user account
 */
export async function resetUserProfile(userId: string): Promise<boolean> {
  try {
    await prisma.tasteGenome.updateMany({
      where: { userId },
      data: {
        primary: 'UNKNOWN',
        secondary: null,
        confidence: 0,
        distribution: null,
        signalCount: 0,
        stagesCompleted: [],
        sigilRevealed: false,
        psychometrics: null,
        updatedAt: new Date()
      }
    });
    return true;
  } catch (error) {
    console.error('Failed to reset user profile:', error);
    return false;
  }
}
