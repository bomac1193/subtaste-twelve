/**
 * @subtaste/profiler - Training Instrument
 *
 * Best/Worst selection training cards ported from Slayt.
 * 103 prompts covering creative preferences across multiple dimensions.
 */

import type { Designation } from '@subtaste/core';
import type { ExplicitSignal } from '@subtaste/core';

// ============================================================================
// TYPES
// ============================================================================

export interface TrainingPrompt {
  id: string;
  topic: string;
  prompt: string;
  archetypeHint: Designation;
}

export interface TrainingCard {
  id: string;
  topic: string;
  prompt: string;
  options: Array<{
    id: string;
    text: string;
    archetypeHint: Designation;
  }>;
}

export interface TrainingSubmission {
  cardId: string;
  bestId: string;
  worstId: string;
}

// ============================================================================
// TRAINING PROMPT POOL (103 prompts from Slayt)
// ============================================================================

export const TRAINING_PROMPTS: TrainingPrompt[] = [
  { id: 'bw-opening-thesis', topic: 'opening', prompt: 'Open with a blade: state the thesis in one line.', archetypeHint: 'R-10' },
  { id: 'bw-opening-scene', topic: 'opening', prompt: 'Open with a scene; let the idea surface later.', archetypeHint: 'D-8' },
  { id: 'bw-payoff-fast', topic: 'payoff', prompt: 'Payoff now. No suspense, no detours.', archetypeHint: 'F-9' },
  { id: 'bw-payoff-slow', topic: 'payoff', prompt: 'Slow burn; land the reveal at the end.', archetypeHint: 'D-8' },
  { id: 'bw-hook-contrarian', topic: 'hook', prompt: 'Start with a heresy that splits the room.', archetypeHint: 'R-10' },
  { id: 'bw-hook-curiosity', topic: 'hook', prompt: 'Start with a half-told question that pulls me in.', archetypeHint: 'N-5' },
  { id: 'bw-hook-transmission', topic: 'hook', prompt: 'Open like an intercepted transmission: fragment first, meaning later.', archetypeHint: 'D-8' },
  { id: 'bw-evidence', topic: 'evidence', prompt: 'Show receipts and sources; make it undeniable.', archetypeHint: 'T-1' },
  { id: 'bw-casefile', topic: 'casefile', prompt: 'Present it like evidence in a case file.', archetypeHint: 'T-1' },
  { id: 'bw-constraints', topic: 'constraints', prompt: 'Show the constraints up front before the content.', archetypeHint: 'T-1' },
  { id: 'bw-framework', topic: 'framework', prompt: 'Give me a clean model I can reuse.', archetypeHint: 'T-1' },
  { id: 'bw-narrative', topic: 'narrative', prompt: 'Myth, mood, and symbols over analysis.', archetypeHint: 'D-8' },
  { id: 'bw-symbol-anchor', topic: 'symbol', prompt: 'Use one object as the symbol for the entire idea.', archetypeHint: 'D-8' },
  { id: 'bw-ritual-steps', topic: 'ritual', prompt: 'Write it as a ritual instruction: steps, not commentary.', archetypeHint: 'T-1' },
  { id: 'bw-structure', topic: 'structure', prompt: 'Systems and playbooks over story arcs.', archetypeHint: 'T-1' },
  { id: 'bw-voice-lived', topic: 'authority', prompt: 'Speak from scars and lived experience.', archetypeHint: 'L-3' },
  { id: 'bw-voice-research', topic: 'authority', prompt: 'Speak from research and synthesis.', archetypeHint: 'T-1' },
  { id: 'bw-audience-insider', topic: 'audience', prompt: 'Write for insiders who already get it.', archetypeHint: 'P-7' },
  { id: 'bw-audience-bridge', topic: 'audience', prompt: 'Bridge the gap for outsiders and first-timers.', archetypeHint: 'L-3' },
  { id: 'bw-private-memo', topic: 'intimacy', prompt: 'Make it feel like a private memo, not a broadcast.', archetypeHint: 'L-3' },
  { id: 'bw-risk', topic: 'risk', prompt: 'Make a sharp bet. No hedging.', archetypeHint: 'R-10' },
  { id: 'bw-nuance', topic: 'nuance', prompt: 'Hold nuance; show both sides.', archetypeHint: 'L-3' },
  { id: 'bw-energy', topic: 'energy', prompt: 'High-energy delivery with short, charged sentences.', archetypeHint: 'F-9' },
  { id: 'bw-calm', topic: 'energy', prompt: 'Low-velocity calm; controlled and steady.', archetypeHint: 'L-3' },
  { id: 'bw-visual-polish', topic: 'visual', prompt: 'Cinematic polish; every frame designed.', archetypeHint: 'S-0' },
  { id: 'bw-visual-utility', topic: 'visual', prompt: 'Utilitarian clarity; function over flair.', archetypeHint: 'T-1' },
  { id: 'bw-format-short', topic: 'format', prompt: 'Tight modules: shorts, carousels, snippets.', archetypeHint: 'F-9' },
  { id: 'bw-format-long', topic: 'format', prompt: 'Longform essays; depth over speed.', archetypeHint: 'T-1' },
  { id: 'bw-novel-framing', topic: 'novelty', prompt: 'Reframe the familiar; shift the lens.', archetypeHint: 'N-5' },
  { id: 'bw-new-facts', topic: 'novelty', prompt: 'Bring new facts, even if the frame is plain.', archetypeHint: 'T-1' },
  { id: 'bw-archive-label', topic: 'artifact', prompt: 'Treat it like an archive label: title, origin, purpose.', archetypeHint: 'P-7' },
  { id: 'bw-texture-analog', topic: 'texture', prompt: 'Analog grit, texture, imperfection.', archetypeHint: 'P-7' },
  { id: 'bw-texture-digital', topic: 'texture', prompt: 'Clean, precise, digital surfaces.', archetypeHint: 'S-0' },
  { id: 'bw-silence', topic: 'silence', prompt: 'Use fewer words than feels safe; let silence carry weight.', archetypeHint: 'C-4' },
  { id: 'bw-contradiction', topic: 'contrast', prompt: 'Let the visual contradict the copy on purpose.', archetypeHint: 'N-5' },
  { id: 'bw-cadence-serial', topic: 'cadence', prompt: 'Serialized drops with ongoing threads.', archetypeHint: 'H-6' },
  { id: 'bw-cadence-single', topic: 'cadence', prompt: 'Standalone posts; each one complete.', archetypeHint: 'S-0' },
  { id: 'bw-signal-subtle', topic: 'signal', prompt: 'Coded, subtle signals for insiders.', archetypeHint: 'P-7' },
  { id: 'bw-signal-explicit', topic: 'signal', prompt: 'Direct, explicit, broad reach.', archetypeHint: 'H-6' },
  { id: 'bw-purpose-utility', topic: 'purpose', prompt: 'Change behavior with practical utility.', archetypeHint: 'F-9' },
  { id: 'bw-purpose-shift', topic: 'purpose', prompt: 'Change perception with a worldview shift.', archetypeHint: 'N-5' },
  { id: 'bw-ambiguity', topic: 'ambiguity', prompt: 'Leave edges ambiguous; let it linger.', archetypeHint: 'D-8' },
  { id: 'bw-precision', topic: 'precision', prompt: 'Exact wording and naming matter more than the idea.', archetypeHint: 'S-0' },
  { id: 'bw-lineage', topic: 'lineage', prompt: 'Show lineage and provenance; earn trust.', archetypeHint: 'P-7' },
  { id: 'bw-futurism', topic: 'futurism', prompt: 'Speculative, future-facing ideas.', archetypeHint: 'V-2' },
  { id: 'bw-community', topic: 'community', prompt: 'Community reaction is part of the work.', archetypeHint: 'H-6' },
  { id: 'bw-humor', topic: 'humor', prompt: 'Humor is the delivery vehicle, not a garnish.', archetypeHint: 'N-5' },
  { id: 'bw-vulnerability', topic: 'vulnerability', prompt: 'Vulnerability beats authority.', archetypeHint: 'L-3' },
  { id: 'bw-sit-deadline-ship', topic: 'situation-deadline', prompt: 'Two hours left: ship what you have, raw and unfinished.', archetypeHint: 'F-9' },
  { id: 'bw-sit-deadline-polish', topic: 'situation-deadline', prompt: 'Two hours left: cut scope and polish what remains.', archetypeHint: 'S-0' },
  { id: 'bw-sit-viral', topic: 'situation-viral', prompt: 'Your post went viral for the wrong reason: address it head-on.', archetypeHint: 'R-10' },
  { id: 'bw-sit-viral-ignore', topic: 'situation-viral', prompt: 'Your post went viral for the wrong reason: say nothing and move on.', archetypeHint: 'C-4' },
  { id: 'bw-sit-collab', topic: 'situation-collab', prompt: 'A collaborator rewrites your intro: accept it if it\u2019s better.', archetypeHint: 'T-1' },
  { id: 'bw-sit-collab-reject', topic: 'situation-collab', prompt: 'A collaborator rewrites your intro: reject it — voice is non-negotiable.', archetypeHint: 'S-0' },
  { id: 'bw-sit-blank', topic: 'situation-blank', prompt: 'Staring at a blank page: start with structure and fill in later.', archetypeHint: 'T-1' },
  { id: 'bw-sit-blank-flow', topic: 'situation-blank', prompt: 'Staring at a blank page: free-write until something catches.', archetypeHint: 'D-8' },
  { id: 'bw-sit-feedback', topic: 'situation-feedback', prompt: 'Harsh feedback on your best work: rethink the core assumption.', archetypeHint: 'N-5' },
  { id: 'bw-sit-feedback-hold', topic: 'situation-feedback', prompt: 'Harsh feedback on your best work: hold the line — they will catch up.', archetypeHint: 'V-2' },
  { id: 'bw-sit-trend', topic: 'situation-trend', prompt: 'A trend aligns with your niche: ride it with your own angle.', archetypeHint: 'H-6' },
  { id: 'bw-sit-trend-ignore', topic: 'situation-trend', prompt: 'A trend aligns with your niche: ignore it — trends dilute signal.', archetypeHint: 'P-7' },
  { id: 'bw-abs-density', topic: 'abstract-density', prompt: 'A page with only 3 words on it. Nothing else.', archetypeHint: 'C-4' },
  { id: 'bw-abs-density-full', topic: 'abstract-density', prompt: 'A page packed with 300 words. Dense and complete.', archetypeHint: 'T-1' },
  { id: 'bw-abs-tempo-fast', topic: 'abstract-tempo', prompt: 'Fast cuts, no pauses, relentless forward motion.', archetypeHint: 'F-9' },
  { id: 'bw-abs-tempo-slow', topic: 'abstract-tempo', prompt: 'Slow dissolves, held frames, deliberate silence.', archetypeHint: 'D-8' },
  { id: 'bw-abs-palette-mono', topic: 'abstract-palette', prompt: 'Monochrome with one accent color.', archetypeHint: 'C-4' },
  { id: 'bw-abs-palette-max', topic: 'abstract-palette', prompt: 'Saturated, layered, maximalist color.', archetypeHint: 'S-0' },
  { id: 'bw-abs-grid', topic: 'abstract-layout', prompt: 'Rigid grid. Every element snapped to place.', archetypeHint: 'T-1' },
  { id: 'bw-abs-organic', topic: 'abstract-layout', prompt: 'Organic scatter. Elements placed by feel.', archetypeHint: 'D-8' },
  { id: 'bw-abs-sound-sharp', topic: 'abstract-sound', prompt: 'Sharp percussive hits between sections.', archetypeHint: 'R-10' },
  { id: 'bw-abs-sound-drone', topic: 'abstract-sound', prompt: 'Continuous ambient drone underneath everything.', archetypeHint: 'D-8' },
  { id: 'bw-lat-incomplete', topic: 'latent-completion', prompt: 'An unfinished sentence is more powerful than a finished one.', archetypeHint: 'N-5' },
  { id: 'bw-lat-complete', topic: 'latent-completion', prompt: 'A finished sentence earns more trust than an open question.', archetypeHint: 'T-1' },
  { id: 'bw-lat-first-draft', topic: 'latent-revision', prompt: 'The first draft is usually closest to the truth.', archetypeHint: 'D-8' },
  { id: 'bw-lat-tenth-draft', topic: 'latent-revision', prompt: 'The tenth revision is where the real work lives.', archetypeHint: 'S-0' },
  { id: 'bw-lat-read-room', topic: 'latent-audience', prompt: 'You instinctively know what a room wants to hear.', archetypeHint: 'H-6' },
  { id: 'bw-lat-ignore-room', topic: 'latent-audience', prompt: 'You say what needs saying regardless of the room.', archetypeHint: 'R-10' },
  { id: 'bw-lat-archive', topic: 'latent-time', prompt: 'You collect and preserve more than you publish.', archetypeHint: 'P-7' },
  { id: 'bw-lat-burn', topic: 'latent-time', prompt: 'You publish and move on — old work should burn.', archetypeHint: 'F-9' },
  { id: 'bw-lat-name-first', topic: 'latent-naming', prompt: 'You name the thing before you build it.', archetypeHint: 'V-2' },
  { id: 'bw-lat-name-last', topic: 'latent-naming', prompt: 'You build the thing and the name finds itself.', archetypeHint: 'D-8' },
  { id: 'bw-lat-pattern-break', topic: 'latent-pattern', prompt: 'Breaking a pattern feels like progress.', archetypeHint: 'R-10' },
  { id: 'bw-lat-pattern-refine', topic: 'latent-pattern', prompt: 'Refining a pattern feels like mastery.', archetypeHint: 'S-0' },
  { id: 'bw-lat-alone', topic: 'latent-process', prompt: 'Your best ideas come when you\u2019re completely alone.', archetypeHint: 'C-4' },
  { id: 'bw-lat-friction', topic: 'latent-process', prompt: 'Your best ideas come from friction with other people.', archetypeHint: 'H-6' },
];

// ============================================================================
// TRAINING SESSION GENERATION
// ============================================================================

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/**
 * Generate a training card with 4 options from the same topic
 */
export function generateTrainingCard(prompts: TrainingPrompt[]): TrainingCard | null {
  if (prompts.length < 4) return null;

  const shuffled = shuffleArray(prompts);
  const selected = shuffled.slice(0, 4);
  const topic = selected[0]!.topic;

  return {
    id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    topic,
    prompt: `Choose your preferences for: ${topic}`,
    options: selected.map(p => ({
      id: p.id,
      text: p.prompt,
      archetypeHint: p.archetypeHint
    }))
  };
}

/**
 * Create a training session with N cards
 * Groups prompts by topic to ensure 4 options per card
 */
export function createTrainingSession(cardCount: number = 20): TrainingCard[] {
  // Group prompts by topic
  const byTopic = new Map<string, TrainingPrompt[]>();

  for (const prompt of TRAINING_PROMPTS) {
    if (!byTopic.has(prompt.topic)) {
      byTopic.set(prompt.topic, []);
    }
    byTopic.get(prompt.topic)!.push(prompt);
  }

  // Generate cards from topics with 4+ options
  const cards: TrainingCard[] = [];
  const availableTopics = Array.from(byTopic.entries())
    .filter(([_, prompts]) => prompts.length >= 4);

  const shuffledTopics = shuffleArray(availableTopics);

  for (let i = 0; i < Math.min(cardCount, shuffledTopics.length); i++) {
    const [_, prompts] = shuffledTopics[i]!;
    const card = generateTrainingCard(prompts);
    if (card) {
      cards.push(card);
    }
  }

  return cards;
}

// ============================================================================
// SIGNAL GENERATION FROM TRAINING SUBMISSION
// ============================================================================

/**
 * Generate signals from a training submission
 * Best choice gets +5 score, 1.6x weight, positive polarity
 * Worst choice gets +1 score, 1.6x weight, negative polarity
 */
export function generateTrainingSignals(
  card: TrainingCard,
  submission: TrainingSubmission
): ExplicitSignal[] {
  const signals: ExplicitSignal[] = [];

  const bestOption = card.options.find(o => o.id === submission.bestId);
  const worstOption = card.options.find(o => o.id === submission.worstId);

  if (!bestOption || !worstOption) {
    throw new Error('Invalid submission: best or worst option not found in card');
  }

  // Best signal - positive
  signals.push({
    type: 'explicit',
    source: 'training',
    text: bestOption.text,
    weight: 1.6,
    polarity: 'positive',
    archetypeWeights: {
      [bestOption.archetypeHint]: 5
    }
  });

  // Worst signal - negative
  signals.push({
    type: 'explicit',
    source: 'training',
    text: worstOption.text,
    weight: 1.6,
    polarity: 'negative',
    archetypeWeights: {
      [worstOption.archetypeHint]: 1
    }
  });

  return signals;
}

/**
 * Calculate XP gained from a training submission
 * Base XP + bonus for topic diversity
 */
export function calculateTrainingXP(
  completedTopics: Set<string>,
  currentTopic: string
): number {
  const baseXP = 10;
  const newTopicBonus = completedTopics.has(currentTopic) ? 0 : 5;
  return baseXP + newTopicBonus;
}
