/**
 * @subtaste/core - Keyword Learning Engine
 *
 * Extracts and scores keywords from training text to build
 * preference profiles. Ported from Slayt's tasteGenome.js.
 */

import type { KeywordScores } from '../types/genome';

// ============================================================================
// KEYWORD CATEGORIES
// ============================================================================

const VISUAL_KEYWORDS = new Set([
  // Style & Aesthetic
  'cinematic', 'minimalist', 'maximalist', 'analog', 'digital', 'grit', 'texture',
  'polish', 'raw', 'clean', 'dirty', 'smooth', 'rough', 'sharp', 'soft',
  'saturated', 'monochrome', 'colorful', 'muted', 'bright', 'dark',
  // Layout & Composition
  'grid', 'organic', 'structured', 'scattered', 'aligned', 'asymmetric', 'balanced',
  'dense', 'sparse', 'layered', 'flat', 'deep', 'shallow',
  // Motion & Tempo
  'fast', 'slow', 'static', 'dynamic', 'smooth', 'jarring', 'fluid', 'staccato',
  'continuous', 'interrupted', 'flowing', 'halting',
  // Visual Quality
  'crisp', 'blurred', 'focused', 'diffused', 'precise', 'loose', 'tight', 'relaxed'
]);

const CONTENT_KEYWORDS = new Set([
  // Tone & Voice
  'formal', 'casual', 'intimate', 'distant', 'warm', 'cold', 'serious', 'playful',
  'earnest', 'ironic', 'direct', 'indirect', 'subtle', 'explicit', 'coded', 'clear',
  // Structure & Form
  'linear', 'nonlinear', 'fragmented', 'complete', 'open', 'closed', 'ambiguous', 'precise',
  'structured', 'freeform', 'systematic', 'intuitive', 'logical', 'poetic',
  // Content Approach
  'analytical', 'narrative', 'symbolic', 'literal', 'abstract', 'concrete',
  'theoretical', 'practical', 'speculative', 'grounded', 'experimental', 'traditional',
  // Depth & Complexity
  'simple', 'complex', 'shallow', 'deep', 'nuanced', 'binary', 'layered', 'singular',
  'dense', 'light', 'heavy', 'airy',
  // Pacing & Energy
  'fast', 'slow', 'urgent', 'patient', 'explosive', 'gradual', 'immediate', 'delayed',
  'compressed', 'expanded', 'tight', 'loose'
]);

// ============================================================================
// KEYWORD EXTRACTION
// ============================================================================

/**
 * Extract keywords from text (simple word matching)
 */
function extractKeywords(text: string, categorySet: Set<string>): string[] {
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);

  const found: string[] = [];

  for (const word of words) {
    if (categorySet.has(word)) {
      found.push(word);
    }
  }

  // Also check for multi-word phrases (up to 2 words)
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    if (categorySet.has(phrase)) {
      found.push(phrase);
    }
  }

  return found;
}

/**
 * Categorize text into visual or content keywords
 */
export function categorizeKeywords(text: string): {
  visual: string[];
  content: string[];
} {
  return {
    visual: extractKeywords(text, VISUAL_KEYWORDS),
    content: extractKeywords(text, CONTENT_KEYWORDS)
  };
}

// ============================================================================
// KEYWORD SCORING
// ============================================================================

/**
 * Update keyword scores in a genome's keyword map
 *
 * @param currentScores - Existing keyword scores (or undefined)
 * @param text - Text to extract keywords from
 * @param weight - Signal weight multiplier (default 1.0)
 * @param polarity - 'positive' adds score, 'negative' subtracts
 * @returns Updated keyword scores
 */
export function updateKeywordScores(
  currentScores: KeywordScores | undefined,
  text: string,
  weight: number = 1.0,
  polarity: 'positive' | 'negative' = 'positive'
): KeywordScores {
  const scores: KeywordScores = currentScores || {
    visual: {},
    content: {}
  };

  const keywords = categorizeKeywords(text);
  const scoreModifier = polarity === 'positive' ? weight : -weight;

  // Update visual keywords
  for (const keyword of keywords.visual) {
    if (!scores.visual[keyword]) {
      scores.visual[keyword] = { score: 0, count: 0 };
    }
    scores.visual[keyword]!.score += scoreModifier;
    scores.visual[keyword]!.count += 1;
  }

  // Update content keywords
  for (const keyword of keywords.content) {
    if (!scores.content[keyword]) {
      scores.content[keyword] = { score: 0, count: 0 };
    }
    scores.content[keyword]!.score += scoreModifier;
    scores.content[keyword]!.count += 1;
  }

  return scores;
}

/**
 * Get top N keywords by score from a category
 */
export function getTopKeywords(
  categoryScores: Record<string, { score: number; count: number }>,
  limit: number = 10
): Array<{ keyword: string; score: number; count: number }> {
  return Object.entries(categoryScores)
    .map(([keyword, { score, count }]) => ({ keyword, score, count }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get keywords the user is attracted to (positive scores)
 */
export function getAttractedKeywords(
  scores: KeywordScores,
  limit: number = 10
): {
  visual: Array<{ keyword: string; score: number; count: number }>;
  content: Array<{ keyword: string; score: number; count: number }>;
} {
  const visualFiltered = Object.entries(scores.visual)
    .filter(([_, { score }]) => score > 0)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

  const contentFiltered = Object.entries(scores.content)
    .filter(([_, { score }]) => score > 0)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

  return {
    visual: getTopKeywords(visualFiltered, limit),
    content: getTopKeywords(contentFiltered, limit)
  };
}

/**
 * Get keywords the user is repelled by (negative scores)
 */
export function getRepelledKeywords(
  scores: KeywordScores,
  limit: number = 10
): {
  visual: Array<{ keyword: string; score: number; count: number }>;
  content: Array<{ keyword: string; score: number; count: number }>;
} {
  const visualFiltered = Object.entries(scores.visual)
    .filter(([_, { score }]) => score < 0)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

  const contentFiltered = Object.entries(scores.content)
    .filter(([_, { score }]) => score < 0)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

  return {
    visual: getTopKeywords(visualFiltered, limit).map(k => ({ ...k, score: Math.abs(k.score) })),
    content: getTopKeywords(contentFiltered, limit).map(k => ({ ...k, score: Math.abs(k.score) }))
  };
}

/**
 * Merge keyword scores from multiple sources
 */
export function mergeKeywordScores(
  ...scoreSets: Array<KeywordScores | undefined>
): KeywordScores {
  const merged: KeywordScores = {
    visual: {},
    content: {}
  };

  for (const scores of scoreSets) {
    if (!scores) continue;

    // Merge visual
    for (const [keyword, { score, count }] of Object.entries(scores.visual)) {
      if (!merged.visual[keyword]) {
        merged.visual[keyword] = { score: 0, count: 0 };
      }
      merged.visual[keyword]!.score += score;
      merged.visual[keyword]!.count += count;
    }

    // Merge content
    for (const [keyword, { score, count }] of Object.entries(scores.content)) {
      if (!merged.content[keyword]) {
        merged.content[keyword] = { score: 0, count: 0 };
      }
      merged.content[keyword]!.score += score;
      merged.content[keyword]!.count += count;
    }
  }

  return merged;
}

/**
 * Get keyword summary statistics
 */
export function getKeywordStats(scores: KeywordScores): {
  totalKeywords: number;
  totalVisual: number;
  totalContent: number;
  positiveKeywords: number;
  negativeKeywords: number;
  neutralKeywords: number;
} {
  const allKeywords = [
    ...Object.values(scores.visual),
    ...Object.values(scores.content)
  ];

  return {
    totalKeywords: allKeywords.length,
    totalVisual: Object.keys(scores.visual).length,
    totalContent: Object.keys(scores.content).length,
    positiveKeywords: allKeywords.filter(k => k.score > 0).length,
    negativeKeywords: allKeywords.filter(k => k.score < 0).length,
    neutralKeywords: allKeywords.filter(k => k.score === 0).length
  };
}
