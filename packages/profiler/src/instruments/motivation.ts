/**
 * @subtaste/profiler - Drive & Dynamics Instrument
 *
 * 5-question assessment: 3 motivation + 2 social dynamics
 * ~60 seconds, populates MotivationProfile + SocialProfile baseline
 */

import type { MotivationProfile, SocialProfile, SocialRole } from '@subtaste/core';
import {
  ALL_DRIVE_QUESTIONS,
  type MotivationQuestion,
  type MotivationWeights
} from '../questions/motivation-bank';

// ============================================================================
// TYPES
// ============================================================================

export interface DriveAssessmentState {
  questions: MotivationQuestion[];
  currentIndex: number;
  responses: DriveResponse[];
  startedAt: Date;
  completedAt: Date | null;
}

export interface DriveResponse {
  questionId: string;
  response: 0 | 1;
  timestamp: Date;
}

export interface DriveAssessmentResult {
  motivation: MotivationProfile;
  social: SocialProfile;
  duration: number;
}

// ============================================================================
// ASSESSMENT LIFECYCLE
// ============================================================================

/**
 * Create a new drive & dynamics assessment
 */
export function createDriveAssessment(): DriveAssessmentState {
  return {
    questions: ALL_DRIVE_QUESTIONS,
    currentIndex: 0,
    responses: [],
    startedAt: new Date(),
    completedAt: null
  };
}

/**
 * Get the current question
 */
export function getCurrentDriveQuestion(state: DriveAssessmentState): MotivationQuestion | null {
  if (state.currentIndex >= state.questions.length) return null;
  return state.questions[state.currentIndex];
}

/**
 * Submit a response and advance
 */
export function submitDriveResponse(
  state: DriveAssessmentState,
  response: 0 | 1
): DriveAssessmentState {
  const question = getCurrentDriveQuestion(state);
  if (!question) return state;

  const newState: DriveAssessmentState = {
    ...state,
    responses: [...state.responses, {
      questionId: question.id,
      response,
      timestamp: new Date()
    }],
    currentIndex: state.currentIndex + 1
  };

  if (newState.currentIndex >= newState.questions.length) {
    newState.completedAt = new Date();
  }

  return newState;
}

/**
 * Check if assessment is complete
 */
export function isDriveComplete(state: DriveAssessmentState): boolean {
  return state.completedAt !== null;
}

/**
 * Get progress (0-1)
 */
export function getDriveProgress(state: DriveAssessmentState): number {
  return state.currentIndex / state.questions.length;
}

/**
 * Complete the assessment and produce motivation + social profiles
 */
export function completeDriveAssessment(
  state: DriveAssessmentState
): DriveAssessmentResult | null {
  if (!isDriveComplete(state)) return null;

  // Accumulate weights from chosen options
  const motivationAccum = { expression: 0, connection: 0, mastery: 0, discovery: 0, identity: 0 };
  const socialAccum = { tastemaker: 0, consumer: 0, contrarian: 0, bridger: 0 };

  for (const resp of state.responses) {
    const question = state.questions.find(q => q.id === resp.questionId);
    if (!question) continue;

    const weights: MotivationWeights = question.weights[resp.response];

    // Motivation dimensions
    if (weights.expression) motivationAccum.expression += weights.expression;
    if (weights.connection) motivationAccum.connection += weights.connection;
    if (weights.mastery) motivationAccum.mastery += weights.mastery;
    if (weights.discovery) motivationAccum.discovery += weights.discovery;
    if (weights.identity) motivationAccum.identity += weights.identity;

    // Social dimensions
    if (weights.tastemaker) socialAccum.tastemaker += weights.tastemaker;
    if (weights.consumer) socialAccum.consumer += weights.consumer;
    if (weights.contrarian) socialAccum.contrarian += weights.contrarian;
    if (weights.bridger) socialAccum.bridger += weights.bridger;
  }

  // Normalize motivation to 0-1 range
  // Max possible per dimension across 5 questions is ~2.0, so /2 gives 0-1
  const motivation: MotivationProfile = {
    expression: clamp(motivationAccum.expression / 2, 0, 1),
    connection: clamp(motivationAccum.connection / 2, 0, 1),
    mastery: clamp(motivationAccum.mastery / 2, 0, 1),
    discovery: clamp(motivationAccum.discovery / 2, 0, 1),
    identity: clamp(motivationAccum.identity / 2, 0, 1)
  };

  // Normalize social scores to proportions and determine dominant role
  const socialTotal = socialAccum.tastemaker + socialAccum.consumer +
                      socialAccum.contrarian + socialAccum.bridger;

  const normalizedSocial = {
    tastemaker: socialTotal > 0 ? socialAccum.tastemaker / socialTotal : 0.25,
    consumer: socialTotal > 0 ? socialAccum.consumer / socialTotal : 0.25,
    contrarian: socialTotal > 0 ? socialAccum.contrarian / socialTotal : 0.25,
    bridger: socialTotal > 0 ? socialAccum.bridger / socialTotal : 0.25
  };

  const roleEntries: [SocialRole, number][] = [
    ['tastemaker', normalizedSocial.tastemaker],
    ['consumer', normalizedSocial.consumer],
    ['contrarian', normalizedSocial.contrarian],
    ['bridger', normalizedSocial.bridger]
  ];
  roleEntries.sort((a, b) => b[1] - a[1]);

  const social: SocialProfile = {
    ...normalizedSocial,
    role: roleEntries[0][0]
  };

  const duration = state.completedAt!.getTime() - state.startedAt.getTime();

  return { motivation, social, duration };
}

/**
 * Estimate time remaining in seconds
 */
export function estimateDriveTimeRemaining(state: DriveAssessmentState): number {
  const remaining = state.questions.length - state.currentIndex;
  return remaining * 12; // ~12s per binary question
}

// ============================================================================
// INTERNAL
// ============================================================================

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
