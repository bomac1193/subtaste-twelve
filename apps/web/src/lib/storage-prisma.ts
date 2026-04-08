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
 * Every genome write is versioned automatically.
 */
export async function setUser(
  userId: string,
  data: Partial<UserData>,
  trigger: string = 'unknown'
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

    // Save version snapshot (non-blocking — don't fail the main write)
    if (genome) {
      saveGenomeVersion(userId, genome, trigger).catch(err =>
        console.error('Failed to save genome version:', err)
      );
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
    // Save version before reset so the old genome can be recovered
    const existing = await getUser(userId);
    if (existing?.genome) {
      await saveGenomeVersion(userId, existing.genome, 'reset');
    }

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

// ============================================================================
// GENOME VERSIONING
// ============================================================================

const MAX_VERSIONS_PER_USER = 50;

/**
 * Save a genome version snapshot
 */
async function saveGenomeVersion(
  userId: string,
  genome: TasteGenome,
  trigger: string
): Promise<void> {
  try {
    await prisma.genomeVersion.create({
      data: {
        userId,
        genome: genome as any,
        trigger,
        primary: genome.archetype?.primary?.designation || null,
        secondary: genome.archetype?.secondary?.designation || null,
        confidence: genome.archetype?.primary?.confidence || 0,
        signalCount: genome.behaviour?.signalHistory?.length || 0,
        version: genome.version || 1,
      }
    });

    // Prune old versions beyond the limit
    const versions = await prisma.genomeVersion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
      skip: MAX_VERSIONS_PER_USER,
    });

    if (versions.length > 0) {
      await prisma.genomeVersion.deleteMany({
        where: { id: { in: versions.map(v => v.id) } }
      });
    }
  } catch (error) {
    console.error('Failed to save genome version:', error);
  }
}

/**
 * List genome versions for a user
 */
export async function listGenomeVersions(
  userId: string,
  limit: number = 20
): Promise<Array<{
  id: string;
  trigger: string;
  primary: string | null;
  secondary: string | null;
  confidence: number;
  signalCount: number;
  version: number;
  createdAt: Date;
}>> {
  try {
    return await prisma.genomeVersion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        trigger: true,
        primary: true,
        secondary: true,
        confidence: true,
        signalCount: true,
        version: true,
        createdAt: true,
      }
    });
  } catch (error) {
    console.error('Failed to list genome versions:', error);
    return [];
  }
}

/**
 * Restore a genome from a specific version
 */
export async function restoreGenomeVersion(
  userId: string,
  versionId: string
): Promise<TasteGenome | null> {
  try {
    const version = await prisma.genomeVersion.findFirst({
      where: { id: versionId, userId }
    });

    if (!version) return null;

    const genome = version.genome as unknown as TasteGenome;

    // Save the current genome as a version before restoring
    const current = await getUser(userId);
    if (current?.genome) {
      await saveGenomeVersion(userId, current.genome, 'pre-restore');
    }

    // Write the restored genome
    await setUser(userId, { genome }, 'restore');

    return genome;
  } catch (error) {
    console.error('Failed to restore genome version:', error);
    return null;
  }
}
