/**
 * Simple in-memory storage for development
 *
 * In production, replace with your database (Prisma, Supabase, etc.)
 */

import type { TasteGenome } from '@subtaste/core';

interface UserData {
  genome: TasteGenome | null;
  signalCount: number;
  stagesCompleted: string[];
  sigilRevealed: boolean;
}

// In-memory store (replace with database in production)
const store = new Map<string, UserData>();

export function getUser(userId: string): UserData | null {
  return store.get(userId) || null;
}

export function setUser(userId: string, data: Partial<UserData>): void {
  const existing = store.get(userId) || {
    genome: null,
    signalCount: 0,
    stagesCompleted: [],
    sigilRevealed: false,
  };
  store.set(userId, { ...existing, ...data });
}

export function createUser(): string {
  const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  store.set(userId, {
    genome: null,
    signalCount: 0,
    stagesCompleted: [],
    sigilRevealed: false,
  });
  return userId;
}

export function incrementSignals(userId: string, count: number = 1): number {
  const user = getUser(userId);
  if (!user) return 0;
  user.signalCount += count;
  store.set(userId, user);
  return user.signalCount;
}

export function completeStage(userId: string, stage: string): void {
  const user = getUser(userId);
  if (!user) return;
  if (!user.stagesCompleted.includes(stage)) {
    user.stagesCompleted.push(stage);
  }
  store.set(userId, user);
}

export function revealSigil(userId: string): boolean {
  const user = getUser(userId);
  if (!user) return false;
  user.sigilRevealed = true;
  store.set(userId, user);
  return true;
}
