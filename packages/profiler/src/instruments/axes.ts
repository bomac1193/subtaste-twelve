/**
 * @subtaste/profiler - Axes Calibration Instrument
 *
 * Four personality axes that derive I-Ching hexagram readings.
 * From Boveda's personality axes system.
 */

// ============================================================================
// TYPES
// ============================================================================

export type AxisType = 'orderChaos' | 'mercyRuthlessness' | 'introvertExtrovert' | 'faithDoubt';

export interface AxesQuestion {
  id: string;
  axis: AxisType;
  prompt: string;
  lowLabel: string;
  highLabel: string;
  lowDescription?: string;
  highDescription?: string;
}

export interface AxesResponse {
  orderChaos: number;          // 0-1
  mercyRuthlessness: number;   // 0-1
  introvertExtrovert: number;  // 0-1
  faithDoubt: number;          // 0-1
}

// ============================================================================
// AXES QUESTIONS
// ============================================================================

export const AXES_QUESTIONS: AxesQuestion[] = [
  {
    id: 'axes-order',
    axis: 'orderChaos',
    prompt: 'In creative work, I prefer...',
    lowLabel: 'Clear structure and planning',
    highLabel: 'Spontaneous emergence',
    lowDescription: 'You work best with frameworks, plans, and clear stages. Structure enables your creativity.',
    highDescription: 'You thrive in the unplanned. The best work emerges from improvisation and intuition.'
  },
  {
    id: 'axes-mercy',
    axis: 'mercyRuthlessness',
    prompt: 'When evaluating work, I tend toward...',
    lowLabel: 'Generous interpretation',
    highLabel: 'Exacting standards',
    lowDescription: 'You find the potential in work. You see what could be, not just what is.',
    highDescription: 'You hold work to high standards. Quality matters more than feelings.'
  },
  {
    id: 'axes-social',
    axis: 'introvertExtrovert',
    prompt: 'My creative energy comes from...',
    lowLabel: 'Solitude and reflection',
    highLabel: 'Collaboration and exchange',
    lowDescription: 'You need quiet space to create. Your best work happens alone.',
    highDescription: 'You generate ideas through conversation. Other people energize your creativity.'
  },
  {
    id: 'axes-faith',
    axis: 'faithDoubt',
    prompt: 'I approach new ideas with...',
    lowLabel: 'Openness and trust',
    highLabel: 'Skepticism and testing',
    lowDescription: 'You give ideas the benefit of the doubt. You explore first, judge later.',
    highDescription: 'You question before accepting. Ideas must prove themselves to you.'
  }
];

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get all axes questions in order
 */
export function getAllAxesQuestions(): AxesQuestion[] {
  return AXES_QUESTIONS;
}

/**
 * Get a specific axes question by ID
 */
export function getAxesQuestion(id: string): AxesQuestion | undefined {
  return AXES_QUESTIONS.find(q => q.id === id);
}

/**
 * Get a specific axes question by axis type
 */
export function getAxesQuestionByAxis(axis: AxisType): AxesQuestion | undefined {
  return AXES_QUESTIONS.find(q => q.axis === axis);
}

/**
 * Validate axes response (all values between 0 and 1)
 */
export function validateAxesResponse(response: AxesResponse): boolean {
  const values = [
    response.orderChaos,
    response.mercyRuthlessness,
    response.introvertExtrovert,
    response.faithDoubt
  ];

  return values.every(v => v >= 0 && v <= 1);
}

/**
 * Normalize axes response to ensure values are in 0-1 range
 */
export function normalizeAxesResponse(response: Partial<AxesResponse>): AxesResponse {
  const clamp = (val: number | undefined, fallback: number = 0.5): number => {
    if (val === undefined) return fallback;
    return Math.max(0, Math.min(1, val));
  };

  return {
    orderChaos: clamp(response.orderChaos),
    mercyRuthlessness: clamp(response.mercyRuthlessness),
    introvertExtrovert: clamp(response.introvertExtrovert),
    faithDoubt: clamp(response.faithDoubt)
  };
}

/**
 * Calculate distance between two axes responses (0-1, where 0 is identical)
 */
export function calculateAxesDistance(a: AxesResponse, b: AxesResponse): number {
  const distances = [
    Math.abs(a.orderChaos - b.orderChaos),
    Math.abs(a.mercyRuthlessness - b.mercyRuthlessness),
    Math.abs(a.introvertExtrovert - b.introvertExtrovert),
    Math.abs(a.faithDoubt - b.faithDoubt)
  ];

  return distances.reduce((sum, d) => sum + d, 0) / distances.length;
}

/**
 * Get human-readable interpretation of an axis value
 */
export function interpretAxisValue(axis: AxisType, value: number): string {
  const question = getAxesQuestionByAxis(axis);
  if (!question) return 'Unknown';

  if (value < 0.3) return question.lowLabel;
  if (value > 0.7) return question.highLabel;
  return 'Balanced';
}

/**
 * Get full interpretation of axes response
 */
export function interpretAxesResponse(response: AxesResponse): Record<AxisType, string> {
  return {
    orderChaos: interpretAxisValue('orderChaos', response.orderChaos),
    mercyRuthlessness: interpretAxisValue('mercyRuthlessness', response.mercyRuthlessness),
    introvertExtrovert: interpretAxisValue('introvertExtrovert', response.introvertExtrovert),
    faithDoubt: interpretAxisValue('faithDoubt', response.faithDoubt)
  };
}
