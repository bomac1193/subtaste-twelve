/**
 * @subtaste/profiler
 *
 * Assessment instruments for taste profiling.
 * Progressive profiling from 3-question onboarding to deep calibration.
 */

// ============================================================================
// INSTRUMENTS
// ============================================================================

export {
  // Initial assessment
  createInitialAssessment,
  getCurrentQuestion,
  submitResponse,
  isComplete,
  getProgress,
  completeAssessment,
  estimateTimeRemaining,

  // Calibration
  createMusicCalibration,
  createDeepCalibration,
  getCurrentCalibrationQuestion,
  submitCalibrationResponse,
  isCalibrationComplete,
  getCalibrationProgress,
  completeCalibration,
  qualifiesForMusicCalibration,
  qualifiesForDeepCalibration,
  getEstimatedTime,

  // Implicit signals
  behaviourToSignal,
  behaviourBatchToSignals,
  calculateBehaviouralStrength
} from './instruments';

export type {
  InitialAssessmentState,
  InitialAssessmentResult,
  CalibrationType,
  CalibrationState,
  CalibrationResult,
  BehaviouralEvent,
  ItemMetadata
} from './instruments';

// ============================================================================
// QUESTIONS
// ============================================================================

export {
  INITIAL_QUESTIONS,
  MUSIC_CALIBRATION_QUESTIONS,
  DEEP_CALIBRATION_QUESTIONS,
  getQuestionsForStage,
  getQuestionById,
  mapBinaryResponse,
  mapLikertResponse,
  mapRankingResponse,
  responseToSignal,
  responsesToSignals,
  calculateConfidenceGain
} from './questions';

export type {
  QuestionType,
  Question,
  BinaryQuestion,
  LikertQuestion,
  RankingQuestion,
  BinaryResponse,
  LikertResponse,
  RankingResponse,
  QuestionResponse
} from './questions';

// ============================================================================
// PROGRESSIVE PROFILING
// ============================================================================

export {
  PROFILING_STAGES,
  getStage,
  getAllStages,
  createProfilingState,
  isStageAvailable,
  getNextAvailableStage,
  completeStage,
  recordInteraction,
  shouldPromptCalibration,
  getProfilingProgress,
  estimateFinalConfidence,
  ProfilingOrchestrator,
  createOrchestrator
} from './progressive';

export type {
  StageId,
  StageTrigger,
  ProfilingStage,
  ProfilingState,
  OrchestratorState,
  OrchestratorEvent,
  EventHandler
} from './progressive';

// ============================================================================
// TRAINING
// ============================================================================

export {
  TRAINING_PROMPTS,
  generateTrainingCard,
  createTrainingSession,
  generateTrainingSignals,
  calculateTrainingXP
} from './instruments/training';

export type {
  TrainingPrompt,
  TrainingCard,
  TrainingSubmission
} from './instruments/training';

// ============================================================================
// AXES
// ============================================================================

export {
  AXES_QUESTIONS,
  getAllAxesQuestions,
  getAxesQuestion,
  getAxesQuestionByAxis,
  validateAxesResponse,
  normalizeAxesResponse,
  calculateAxesDistance,
  interpretAxisValue,
  interpretAxesResponse
} from './instruments/axes';

export type {
  AxisType,
  AxesQuestion,
  AxesResponse
} from './instruments/axes';
