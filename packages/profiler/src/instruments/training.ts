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

  // Portfolio & Showcase
  { id: 'port-curated', topic: 'portfolio', prompt: 'Portfolio as gallery: only your 7 best pieces, carefully sequenced.', archetypeHint: 'S-0' },
  { id: 'port-comprehensive', topic: 'portfolio', prompt: 'Portfolio as archive: show range, process, evolution over time.', archetypeHint: 'P-7' },
  { id: 'port-process', topic: 'portfolio', prompt: 'Lead with process: sketches, iterations, the making-of story.', archetypeHint: 'T-1' },
  { id: 'port-impact', topic: 'portfolio', prompt: 'Lead with impact: before/after, metrics, what changed.', archetypeHint: 'F-9' },

  // Client & Commercial Work
  { id: 'client-educate', topic: 'client-work', prompt: 'Client wants generic work: educate them on why that fails.', archetypeHint: 'R-10' },
  { id: 'client-deliver', topic: 'client-work', prompt: 'Client wants generic work: deliver it professionally and move on.', archetypeHint: 'F-9' },
  { id: 'client-vision', topic: 'client-work', prompt: 'Brief is vague: interpret freely and show what\'s possible.', archetypeHint: 'V-2' },
  { id: 'client-clarify', topic: 'client-work', prompt: 'Brief is vague: ask questions until the ask crystallizes.', archetypeHint: 'T-1' },
  { id: 'client-personal', topic: 'client-work', prompt: 'Commercial work should feel indistinguishable from personal work.', archetypeHint: 'S-0' },
  { id: 'client-separate', topic: 'client-work', prompt: 'Commercial work and personal work serve different masters.', archetypeHint: 'P-7' },

  // Creative Inspiration
  { id: 'insp-obscure', topic: 'inspiration', prompt: 'Pull references from outside your field entirely.', archetypeHint: 'N-5' },
  { id: 'insp-canon', topic: 'inspiration', prompt: 'Study the canon: masters of your craft, deeply.', archetypeHint: 'P-7' },
  { id: 'insp-constraint', topic: 'inspiration', prompt: 'Constraints breed creativity: set arbitrary limits and solve within them.', archetypeHint: 'T-1' },
  { id: 'insp-abundance', topic: 'inspiration', prompt: 'Abundance breeds creativity: gather everything, collage freely.', archetypeHint: 'D-8' },
  { id: 'insp-consume', topic: 'inspiration', prompt: 'Consume voraciously across disciplines. Synthesis is creation.', archetypeHint: 'N-5' },
  { id: 'insp-starve', topic: 'inspiration', prompt: 'Starve inputs deliberately. Force original output.', archetypeHint: 'C-4' },

  // Tool & Platform Choices
  { id: 'tool-cutting', topic: 'tools', prompt: 'Use the newest tools: embrace what\'s just become possible.', archetypeHint: 'V-2' },
  { id: 'tool-proven', topic: 'tools', prompt: 'Use proven tools: stability and craft over novelty.', archetypeHint: 'L-3' },
  { id: 'tool-custom', topic: 'tools', prompt: 'Build your own tools when off-the-shelf won\'t do.', archetypeHint: 'T-1' },
  { id: 'tool-adapt', topic: 'tools', prompt: 'Adapt to whatever tool is available. Constraints spark solutions.', archetypeHint: 'F-9' },
  { id: 'plat-multi', topic: 'platform', prompt: 'Be everywhere: adapt your work to each platform\'s strengths.', archetypeHint: 'H-6' },
  { id: 'plat-home', topic: 'platform', prompt: 'Own your platform: build once, distribute from home base.', archetypeHint: 'P-7' },

  // Collaboration Dynamics
  { id: 'collab-solo', topic: 'collaboration', prompt: 'Work alone, present finished. Collaboration dilutes vision.', archetypeHint: 'S-0' },
  { id: 'collab-open', topic: 'collaboration', prompt: 'Work in public, iterate together. Vision emerges from dialogue.', archetypeHint: 'H-6' },
  { id: 'collab-lead', topic: 'collaboration', prompt: 'Lead the vision, delegate execution.', archetypeHint: 'S-0' },
  { id: 'collab-peer', topic: 'collaboration', prompt: 'Peer collaboration: everyone contributes to vision and execution.', archetypeHint: 'N-5' },
  { id: 'collab-credit', topic: 'collaboration', prompt: 'Credit every contributor publicly and prominently.', archetypeHint: 'H-6' },
  { id: 'collab-anon', topic: 'collaboration', prompt: 'Credit the collective: individual names are noise.', archetypeHint: 'Ø' },

  // Personal Brand & Identity
  { id: 'brand-consistent', topic: 'brand', prompt: 'Consistent aesthetic across everything: recognizable at a glance.', archetypeHint: 'S-0' },
  { id: 'brand-evolving', topic: 'brand', prompt: 'Evolving aesthetic: each project looks different, linked by taste.', archetypeHint: 'D-8' },
  { id: 'brand-transparent', topic: 'brand', prompt: 'Show everything: process, failures, uncertainty.', archetypeHint: 'L-3' },
  { id: 'brand-mystery', topic: 'brand', prompt: 'Maintain mystery: only show the work, never the making.', archetypeHint: 'P-7' },
  { id: 'brand-persona', topic: 'brand', prompt: 'Create a persona: the work and the person are separate.', archetypeHint: 'S-0' },
  { id: 'brand-authentic', topic: 'brand', prompt: 'No persona: the work is an extension of who you actually are.', archetypeHint: 'L-3' },

  // Creative Process Details
  { id: 'proc-morning', topic: 'process-time', prompt: 'Create in the morning: fresh mind, before the world intrudes.', archetypeHint: 'C-4' },
  { id: 'proc-night', topic: 'process-time', prompt: 'Create at night: when defenses are down, filters dissolve.', archetypeHint: 'D-8' },
  { id: 'proc-ritual', topic: 'process-ritual', prompt: 'Ritual before work: same place, same time, same sequence.', archetypeHint: 'T-1' },
  { id: 'proc-chaos', topic: 'process-ritual', prompt: 'No ritual: create when the impulse strikes, wherever you are.', archetypeHint: 'D-8' },
  { id: 'proc-deadline', topic: 'process-deadline', prompt: 'Deadlines unlock flow: pressure reveals what matters.', archetypeHint: 'F-9' },
  { id: 'proc-spacious', topic: 'process-deadline', prompt: 'Spacious timelines: ideas need room to breathe and evolve.', archetypeHint: 'L-3' },

  // Curation & Taste Expression
  { id: 'cur-edit', topic: 'curation', prompt: 'Curation is editing: 100 options to 5 perfect selections.', archetypeHint: 'C-4' },
  { id: 'cur-context', topic: 'curation', prompt: 'Curation is contexting: show relationships between 30 interesting things.', archetypeHint: 'N-5' },
  { id: 'cur-gateway', topic: 'curation', prompt: 'Curate as gateway: introduce people to what they don\'t know yet.', archetypeHint: 'V-2' },
  { id: 'cur-mirror', topic: 'curation', prompt: 'Curate as mirror: reflect what\'s already resonating.', archetypeHint: 'Ø' },
  { id: 'cur-explain', topic: 'curation', prompt: 'Every selection needs explanation: why this, why now.', archetypeHint: 'T-1' },
  { id: 'cur-silent', topic: 'curation', prompt: 'Never explain: the selections speak for themselves.', archetypeHint: 'P-7' },

  // Professional Development
  { id: 'dev-depth', topic: 'development', prompt: 'Master one thing completely: depth creates authority.', archetypeHint: 'S-0' },
  { id: 'dev-breadth', topic: 'development', prompt: 'Learn many things shallowly: breadth creates connections.', archetypeHint: 'N-5' },
  { id: 'dev-formal', topic: 'development', prompt: 'Formal education: structured curriculum, recognized credentials.', archetypeHint: 'T-1' },
  { id: 'dev-autodidact', topic: 'development', prompt: 'Self-taught: follow curiosity, build your own curriculum.', archetypeHint: 'P-7' },
  { id: 'dev-mentorship', topic: 'development', prompt: 'Learn from someone 10 years ahead: shorten the path.', archetypeHint: 'L-3' },
  { id: 'dev-pioneering', topic: 'development', prompt: 'Pioneer new territory: no mentor because no path exists yet.', archetypeHint: 'V-2' },

  // Creative Community Engagement
  { id: 'comm-build', topic: 'community', prompt: 'Build community: create spaces for others to gather and grow.', archetypeHint: 'H-6' },
  { id: 'comm-observe', topic: 'community', prompt: 'Observe community: participate quietly, learn from the periphery.', archetypeHint: 'Ø' },
  { id: 'comm-teach', topic: 'community', prompt: 'Teach what you learn: giving back is part of the practice.', archetypeHint: 'L-3' },
  { id: 'comm-gatekeep', topic: 'community', prompt: 'Protect the signal: not everything should be shared publicly.', archetypeHint: 'P-7' },
  { id: 'comm-provocateur', topic: 'community', prompt: 'Play provocateur: challenge consensus, spark necessary debate.', archetypeHint: 'R-10' },
  { id: 'comm-unifier', topic: 'community', prompt: 'Play unifier: find common ground, build bridges between factions.', archetypeHint: 'N-5' },

  // Project Approach
  { id: 'proj-prototype', topic: 'project-approach', prompt: 'Ship a rough prototype: test the idea before investing deeply.', archetypeHint: 'F-9' },
  { id: 'proj-complete', topic: 'project-approach', prompt: 'Complete it fully before showing anyone: no half-formed ideas.', archetypeHint: 'S-0' },
  { id: 'proj-iterative', topic: 'project-approach', prompt: 'Build in public: version 0.1, 0.2, 0.3 as you learn.', archetypeHint: 'H-6' },
  { id: 'proj-reveal', topic: 'project-approach', prompt: 'Work in private: reveal only when it\'s fully realized.', archetypeHint: 'C-4' },
  { id: 'proj-breadcrumbs', topic: 'project-approach', prompt: 'Drop cryptic hints: build anticipation before the reveal.', archetypeHint: 'V-2' },
  { id: 'proj-surprise', topic: 'project-approach', prompt: 'Total surprise drop: no warning, no buildup, just appear.', archetypeHint: 'R-10' },

  // Feedback & Criticism
  { id: 'feed-everyone', topic: 'feedback', prompt: 'Get feedback from everyone: diverse perspectives improve everything.', archetypeHint: 'N-5' },
  { id: 'feed-selective', topic: 'feedback', prompt: 'Get feedback from 2-3 trusted people whose taste you respect.', archetypeHint: 'S-0' },
  { id: 'feed-integrate', topic: 'feedback', prompt: 'Integrate all feedback: every critique contains a signal.', archetypeHint: 'L-3' },
  { id: 'feed-filter', topic: 'feedback', prompt: 'Filter feedback through vision: use what serves the work, ignore the rest.', archetypeHint: 'S-0' },
  { id: 'feed-public', topic: 'feedback', prompt: 'Seek public critique: transparency and openness improve work.', archetypeHint: 'H-6' },
  { id: 'feed-private', topic: 'feedback', prompt: 'Keep critique private: public feedback creates performance anxiety.', archetypeHint: 'P-7' },

  // Trend & Timing
  { id: 'trend-early', topic: 'trend-timing', prompt: 'Spot trends early: be first to explore new territory.', archetypeHint: 'V-2' },
  { id: 'trend-timeless', topic: 'trend-timing', prompt: 'Ignore trends entirely: build timeless work that outlasts cycles.', archetypeHint: 'P-7' },
  { id: 'trend-counter', topic: 'trend-timing', prompt: 'Go counter to trends: zig when everyone else zags.', archetypeHint: 'R-10' },
  { id: 'trend-peak', topic: 'trend-timing', prompt: 'Enter trends at peak: ride maximum energy and attention.', archetypeHint: 'H-6' },
  { id: 'trend-synthesize', topic: 'trend-timing', prompt: 'Synthesize multiple trends: create new combinations.', archetypeHint: 'N-5' },
  { id: 'trend-establish', topic: 'trend-timing', prompt: 'Establish the trend: be so early you define the category.', archetypeHint: 'V-2' },

  // Documentation & Memory
  { id: 'doc-everything', topic: 'documentation', prompt: 'Document everything: future you will thank present you.', archetypeHint: 'P-7' },
  { id: 'doc-nothing', topic: 'documentation', prompt: 'Document nothing: if it mattered, you\'ll remember.', archetypeHint: 'F-9' },
  { id: 'doc-process', topic: 'documentation', prompt: 'Document process over output: how you got there matters more.', archetypeHint: 'T-1' },
  { id: 'doc-outcomes', topic: 'documentation', prompt: 'Document outcomes only: results speak louder than process.', archetypeHint: 'F-9' },
  { id: 'doc-public', topic: 'documentation', prompt: 'Public documentation: make your notes a learning resource.', archetypeHint: 'H-6' },
  { id: 'doc-private', topic: 'documentation', prompt: 'Private archive: some knowledge is for you alone.', archetypeHint: 'P-7' },

  // Success & Recognition
  { id: 'succ-external', topic: 'success', prompt: 'Success is external: awards, followers, industry recognition.', archetypeHint: 'H-6' },
  { id: 'succ-internal', topic: 'success', prompt: 'Success is internal: did you make what you wanted to make.', archetypeHint: 'S-0' },
  { id: 'succ-influence', topic: 'success', prompt: 'Success is influence: see your ideas in others\' work.', archetypeHint: 'V-2' },
  { id: 'succ-craft', topic: 'success', prompt: 'Success is craft: each piece better than the last.', archetypeHint: 'L-3' },
  { id: 'succ-disruption', topic: 'success', prompt: 'Success is disruption: force the field to reconsider itself.', archetypeHint: 'R-10' },
  { id: 'succ-sustainability', topic: 'success', prompt: 'Success is sustainability: still making work in 10 years.', archetypeHint: 'L-3' },

  // Material & Medium
  { id: 'med-digital', topic: 'medium', prompt: 'Digital-first: born on screens, for screens.', archetypeHint: 'V-2' },
  { id: 'med-physical', topic: 'medium', prompt: 'Physical-first: tangible objects you can hold.', archetypeHint: 'P-7' },
  { id: 'med-hybrid', topic: 'medium', prompt: 'Hybrid experiences: blur the line between physical and digital.', archetypeHint: 'N-5' },
  { id: 'med-agnostic', topic: 'medium', prompt: 'Medium agnostic: the idea determines the format.', archetypeHint: 'T-1' },
  { id: 'med-specific', topic: 'medium', prompt: 'Medium specific: master one format deeply.', archetypeHint: 'S-0' },
  { id: 'med-experimental', topic: 'medium', prompt: 'Experimental formats: push medium boundaries constantly.', archetypeHint: 'R-10' },

  // Revision & Refinement
  { id: 'rev-minimal', topic: 'revision', prompt: 'Revise minimally: first instinct is usually right.', archetypeHint: 'D-8' },
  { id: 'rev-exhaustive', topic: 'revision', prompt: 'Revise exhaustively: first draft is just raw material.', archetypeHint: 'S-0' },
  { id: 'rev-break', topic: 'revision', prompt: 'Take breaks: step away, return with fresh eyes.', archetypeHint: 'L-3' },
  { id: 'rev-immersive', topic: 'revision', prompt: 'Stay immersed: continuous iteration maintains flow.', archetypeHint: 'F-9' },
  { id: 'rev-others', topic: 'revision', prompt: 'Revise based on others\' reading: dialogue shapes final form.', archetypeHint: 'H-6' },
  { id: 'rev-vision', topic: 'revision', prompt: 'Revise toward initial vision: ignore external input.', archetypeHint: 'S-0' },
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
 * Cross-topic selection: randomly picks 4 prompts from entire pool for each card
 * Allows prompt reuse after pool is exhausted (after 21 unique cards with 184 prompts)
 */
export function createTrainingSession(cardCount: number = 20): TrainingCard[] {
  const cards: TrainingCard[] = [];
  const usedPromptIds = new Set<string>();

  for (let i = 0; i < cardCount; i++) {
    // Get available prompts (not yet used)
    let availablePrompts = TRAINING_PROMPTS.filter(p => !usedPromptIds.has(p.id));

    // If fewer than 4 prompts remain, reset the pool to allow reuse
    if (availablePrompts.length < 4) {
      usedPromptIds.clear();
      availablePrompts = TRAINING_PROMPTS;
      console.log('[createTrainingSession] Pool reset - reusing prompts for card', i + 1);
    }

    // Randomly select 4 prompts for this card (cross-topic)
    const shuffled = shuffleArray([...availablePrompts]);
    const selectedPrompts = shuffled.slice(0, 4);

    // Mark these prompts as used
    selectedPrompts.forEach(p => usedPromptIds.add(p.id));

    // Generate the card
    const card = generateTrainingCard(selectedPrompts);
    if (card) {
      cards.push(card);
    }
  }

  console.log(`[createTrainingSession] Generated ${cards.length} cards (requested: ${cardCount})`);
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
