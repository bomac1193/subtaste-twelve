/**
 * @subtaste/profiler/instruments - Assessment Instrument Exports
 */

// Initial assessment
export {
  createInitialAssessment,
  getCurrentQuestion,
  submitResponse,
  isComplete,
  getProgress,
  completeAssessment,
  estimateTimeRemaining
} from './initial';

export type {
  InitialAssessmentState,
  InitialAssessmentResult
} from './initial';

// Calibration instruments
export {
  createMusicCalibration,
  createDeepCalibration,
  getCurrentCalibrationQuestion,
  submitCalibrationResponse,
  isCalibrationComplete,
  getCalibrationProgress,
  completeCalibration,
  qualifiesForMusicCalibration,
  qualifiesForDeepCalibration,
  getEstimatedTime
} from './calibration';

export type {
  CalibrationType,
  CalibrationState,
  CalibrationResult
} from './calibration';

// Implicit signals
export {
  behaviourToSignal,
  behaviourBatchToSignals,
  calculateBehaviouralStrength
} from './implicit';

export type {
  BehaviouralEvent,
  ItemMetadata
} from './implicit';

// Drive & dynamics assessment
export {
  createDriveAssessment,
  getCurrentDriveQuestion,
  submitDriveResponse,
  isDriveComplete,
  getDriveProgress,
  completeDriveAssessment,
  estimateDriveTimeRemaining
} from './motivation';

export type {
  DriveAssessmentState,
  DriveResponse,
  DriveAssessmentResult
} from './motivation';
