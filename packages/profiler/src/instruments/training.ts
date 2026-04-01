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
  // Opening & Hook
  { id: 'bw-opening-thesis', topic: 'opening', prompt: 'Your first sentence draws blood. The reader knows exactly where you stand before paragraph two.', archetypeHint: 'R-10' },
  { id: 'bw-opening-scene', topic: 'opening', prompt: 'You open with rain on a window, a stranger on a train, a sound from another room. The point arrives when it arrives.', archetypeHint: 'D-8' },
  { id: 'bw-payoff-fast', topic: 'payoff', prompt: 'You give them the answer in the first 10 seconds. No treasure hunt, no buildup. Here it is.', archetypeHint: 'F-9' },
  { id: 'bw-payoff-slow', topic: 'payoff', prompt: 'The whole piece is a fuse. They only realize what it was about in the final line.', archetypeHint: 'D-8' },
  { id: 'bw-hook-contrarian', topic: 'hook', prompt: 'You open with the thing nobody in the room would dare say out loud. Half the audience leaves. The rest leans in.', archetypeHint: 'R-10' },
  { id: 'bw-hook-curiosity', topic: 'hook', prompt: 'You start mid-sentence, like the audience just walked into a conversation that was already happening.', archetypeHint: 'N-5' },
  { id: 'bw-hook-transmission', topic: 'hook', prompt: 'It opens like a corrupted file. A fragment. A date. A name. The meaning assembles itself slowly.', archetypeHint: 'D-8' },

  // Evidence & Structure
  { id: 'bw-evidence', topic: 'evidence', prompt: 'You screenshot the receipts, link the sources, timestamp everything. Nobody can argue with the record.', archetypeHint: 'T-1' },
  { id: 'bw-casefile', topic: 'casefile', prompt: 'You lay it out like a detective pinning evidence to a wall. Exhibit A, Exhibit B, conclusion.', archetypeHint: 'T-1' },
  { id: 'bw-constraints', topic: 'constraints', prompt: 'Before you show anyone the idea, you tell them exactly what you had to work with. Budget, timeline, limits.', archetypeHint: 'T-1' },
  { id: 'bw-framework', topic: 'framework', prompt: 'Someone asks how you did it. You hand them a diagram they can use tomorrow on their own project.', archetypeHint: 'T-1' },
  { id: 'bw-narrative', topic: 'narrative', prompt: 'You tell the story through a myth. A symbol. An image that haunts people three days later.', archetypeHint: 'D-8' },
  { id: 'bw-symbol-anchor', topic: 'symbol', prompt: 'A cracked mirror. A locked door. A single object carries the weight of the entire idea.', archetypeHint: 'D-8' },
  { id: 'bw-ritual-steps', topic: 'ritual', prompt: 'Step one. Step two. Step three. No opinions, no stories. Just the instructions, clean enough to follow blind.', archetypeHint: 'T-1' },
  { id: 'bw-structure', topic: 'structure', prompt: 'You prefer blueprints over bedtime stories. A good system outlasts any single narrative.', archetypeHint: 'T-1' },

  // Voice & Authority
  { id: 'bw-voice-lived', topic: 'authority', prompt: 'You earned the right to say this because it happened to you. The scars are the credentials.', archetypeHint: 'L-3' },
  { id: 'bw-voice-research', topic: 'authority', prompt: 'You read 40 papers before writing one paragraph. Your authority comes from homework, not biography.', archetypeHint: 'T-1' },
  { id: 'bw-audience-insider', topic: 'audience', prompt: 'If they need it explained, it is not for them. You write for the people who already know the language.', archetypeHint: 'P-7' },
  { id: 'bw-audience-bridge', topic: 'audience', prompt: 'Your cousin who knows nothing about your field reads your work and finally gets it. That is the win.', archetypeHint: 'L-3' },
  { id: 'bw-private-memo', topic: 'intimacy', prompt: 'It reads like a note someone left on your desk, not a post aimed at thousands.', archetypeHint: 'L-3' },
  { id: 'bw-risk', topic: 'risk', prompt: 'You publish the piece that might end a friendship. You said what you meant and you meant every word.', archetypeHint: 'R-10' },
  { id: 'bw-nuance', topic: 'nuance', prompt: 'Everyone is shouting their side. You are the one saying "it is actually more complicated than that."', archetypeHint: 'L-3' },

  // Energy & Aesthetic
  { id: 'bw-energy', topic: 'energy', prompt: 'Every sentence is a punch. Short. Charged. The reader is breathing fast by the end.', archetypeHint: 'F-9' },
  { id: 'bw-calm', topic: 'energy', prompt: 'Your work has the tempo of a deep breath. Controlled. Unhurried. People slow down to match it.', archetypeHint: 'L-3' },
  { id: 'bw-visual-polish', topic: 'visual', prompt: 'You spent three hours color-grading a 12-second clip and it was worth every minute.', archetypeHint: 'S-0' },
  { id: 'bw-visual-utility', topic: 'visual', prompt: 'Black text on white background. No decoration. The information is the design.', archetypeHint: 'T-1' },
  { id: 'bw-format-short', topic: 'format', prompt: 'You say it in 30 seconds or you do not say it. Everything is a tight, self-contained unit.', archetypeHint: 'F-9' },
  { id: 'bw-format-long', topic: 'format', prompt: 'You wrote 5,000 words and did not apologize for the length because the idea needed all of them.', archetypeHint: 'T-1' },

  // Novelty & Artifact
  { id: 'bw-novel-framing', topic: 'novelty', prompt: 'Everyone saw the same event. You are the only one who noticed what it actually meant.', archetypeHint: 'N-5' },
  { id: 'bw-new-facts', topic: 'novelty', prompt: 'You found something nobody else found. A data point, a primary source, a forgotten interview. The frame is plain but the fact is new.', archetypeHint: 'T-1' },
  { id: 'bw-archive-label', topic: 'artifact', prompt: 'You labeled it like a museum piece. Title, year, origin, materials. Let the object speak.', archetypeHint: 'P-7' },
  { id: 'bw-texture-analog', topic: 'texture', prompt: 'Grain, dust, tape hiss, bent edges. You want people to feel like they found it in a box somewhere.', archetypeHint: 'P-7' },
  { id: 'bw-texture-digital', topic: 'texture', prompt: 'Pixel-perfect edges, glass surfaces, light that looks rendered. Clean enough to eat off.', archetypeHint: 'S-0' },

  // Space & Rhythm
  { id: 'bw-silence', topic: 'silence', prompt: 'You deleted half the words and the piece got twice as powerful. The silence said more than the sentences did.', archetypeHint: 'C-4' },
  { id: 'bw-contradiction', topic: 'contrast', prompt: 'The image shows someone laughing. The caption is about grief. The clash is the point.', archetypeHint: 'N-5' },
  { id: 'bw-cadence-serial', topic: 'cadence', prompt: 'Part one drops Monday. Part two drops Thursday. Your audience checks back because the story is not finished.', archetypeHint: 'H-6' },
  { id: 'bw-cadence-single', topic: 'cadence', prompt: 'Every post stands alone. No sequels, no threads, no "link in bio." Each one is the whole thing.', archetypeHint: 'S-0' },
  { id: 'bw-signal-subtle', topic: 'signal', prompt: 'Only 200 people will understand that reference. That is exactly why you used it.', archetypeHint: 'P-7' },
  { id: 'bw-signal-explicit', topic: 'signal', prompt: 'You want a million people to get it on the first read. No gatekeeping, no inside jokes.', archetypeHint: 'H-6' },

  // Purpose & Position
  { id: 'bw-purpose-utility', topic: 'purpose', prompt: 'Someone read your post, changed their morning routine, and texted you a week later saying it worked.', archetypeHint: 'F-9' },
  { id: 'bw-purpose-shift', topic: 'purpose', prompt: 'They did not learn a new skill. They started seeing the world differently. That is what your work does.', archetypeHint: 'N-5' },
  { id: 'bw-ambiguity', topic: 'ambiguity', prompt: 'You ended the piece without answering the question you raised. On purpose. Let them sit with it.', archetypeHint: 'D-8' },
  { id: 'bw-precision', topic: 'precision', prompt: 'You spent 20 minutes choosing between two words that mean almost the same thing. The difference mattered.', archetypeHint: 'S-0' },
  { id: 'bw-lineage', topic: 'lineage', prompt: 'You always credit who came before. This is not new. This came from somewhere. You show the trail.', archetypeHint: 'P-7' },
  { id: 'bw-futurism', topic: 'futurism', prompt: 'You are making work for a world that does not exist yet. When it arrives, your stuff will already be there.', archetypeHint: 'V-2' },
  { id: 'bw-community', topic: 'community', prompt: 'The comments section is as important as the post. The audience completing your work is the whole point.', archetypeHint: 'H-6' },
  { id: 'bw-humor', topic: 'humor', prompt: 'The funniest post you ever made was also the truest. The joke was the delivery system for something real.', archetypeHint: 'N-5' },
  { id: 'bw-vulnerability', topic: 'vulnerability', prompt: 'You posted the thing that made your hands shake. It connected more than anything you have ever made.', archetypeHint: 'L-3' },

  // Situations
  { id: 'bw-sit-deadline-ship', topic: 'situation-deadline', prompt: 'Two hours until the deadline. You ship it rough, typos and all. Done is the only thing that counts right now.', archetypeHint: 'F-9' },
  { id: 'bw-sit-deadline-polish', topic: 'situation-deadline', prompt: 'Two hours until the deadline. You cut three sections and spend every remaining minute on what survives.', archetypeHint: 'S-0' },
  { id: 'bw-sit-viral', topic: 'situation-viral', prompt: 'Your post blew up for a reason you hate. You go live and say exactly what you actually meant.', archetypeHint: 'R-10' },
  { id: 'bw-sit-viral-ignore', topic: 'situation-viral', prompt: 'Your post blew up for a reason you hate. You close the app, go for a walk, and never mention it again.', archetypeHint: 'C-4' },
  { id: 'bw-sit-collab', topic: 'situation-collab', prompt: 'A collaborator completely rewrites your opening. It is genuinely better. You swallow your ego and keep their version.', archetypeHint: 'T-1' },
  { id: 'bw-sit-collab-reject', topic: 'situation-collab', prompt: 'A collaborator completely rewrites your opening. It is objectively good, but it is not your voice. You revert it.', archetypeHint: 'S-0' },
  { id: 'bw-sit-blank', topic: 'situation-blank', prompt: 'Blank page, no ideas. You open a template, write the headings first, and fill in the gaps like a form.', archetypeHint: 'T-1' },
  { id: 'bw-sit-blank-flow', topic: 'situation-blank', prompt: 'Blank page, no ideas. You just start typing garbage until a sentence surprises you. That becomes the seed.', archetypeHint: 'D-8' },
  { id: 'bw-sit-feedback', topic: 'situation-feedback', prompt: 'Someone you respect tears apart your best work. You sit with it overnight and realize they were right about one thing.', archetypeHint: 'N-5' },
  { id: 'bw-sit-feedback-hold', topic: 'situation-feedback', prompt: 'Someone you respect tears apart your best work. You thank them, ignore it, and wait for the world to catch up.', archetypeHint: 'V-2' },
  { id: 'bw-sit-trend', topic: 'situation-trend', prompt: 'A trend blows up that is basically what you have been doing for years. You ride it and use the attention while it lasts.', archetypeHint: 'H-6' },
  { id: 'bw-sit-trend-ignore', topic: 'situation-trend', prompt: 'A trend blows up that is basically what you have been doing for years. You refuse to participate because the wave would contaminate your version.', archetypeHint: 'P-7' },

  // Abstract Preferences
  { id: 'bw-abs-density', topic: 'abstract-density', prompt: 'Three words on an empty white page. Nothing else. The negative space is doing all the work.', archetypeHint: 'C-4' },
  { id: 'bw-abs-density-full', topic: 'abstract-density', prompt: 'Every inch of the page is filled. 300 words, no margins, no air. Dense and absolute.', archetypeHint: 'T-1' },
  { id: 'bw-abs-tempo-fast', topic: 'abstract-tempo', prompt: 'Cut. Cut. Cut. No shot lasts longer than two seconds. The viewer cannot look away because there is no pause to escape in.', archetypeHint: 'F-9' },
  { id: 'bw-abs-tempo-slow', topic: 'abstract-tempo', prompt: 'A single shot held for 40 seconds. Nothing moves. The stillness becomes the subject.', archetypeHint: 'D-8' },
  { id: 'bw-abs-palette-mono', topic: 'abstract-palette', prompt: 'Black, white, and one single color. That discipline is the whole visual identity.', archetypeHint: 'C-4' },
  { id: 'bw-abs-palette-max', topic: 'abstract-palette', prompt: 'Every color at once. Saturated, clashing, overwhelming. The excess is the aesthetic.', archetypeHint: 'S-0' },
  { id: 'bw-abs-grid', topic: 'abstract-layout', prompt: 'Everything on the grid. Pixel-perfect alignment. One element out of place would ruin it.', archetypeHint: 'T-1' },
  { id: 'bw-abs-organic', topic: 'abstract-layout', prompt: 'Nothing is aligned. Objects placed by intuition, not measurement. It looks wrong and feels right.', archetypeHint: 'D-8' },
  { id: 'bw-abs-sound-sharp', topic: 'abstract-sound', prompt: 'A gunshot snare between every section. Silence, then impact. Silence, then impact.', archetypeHint: 'R-10' },
  { id: 'bw-abs-sound-drone', topic: 'abstract-sound', prompt: 'A low hum underneath everything. You do not notice it until it stops, and then the silence is deafening.', archetypeHint: 'D-8' },

  // Latent Beliefs
  { id: 'bw-lat-incomplete', topic: 'latent-completion', prompt: 'You left the last sentence unfinished and the comment section went wild filling in the blank. That was the plan.', archetypeHint: 'N-5' },
  { id: 'bw-lat-complete', topic: 'latent-completion', prompt: 'You tied every loose end before publishing. If someone has to guess what you meant, you failed.', archetypeHint: 'T-1' },
  { id: 'bw-lat-first-draft', topic: 'latent-revision', prompt: 'You re-read the first draft and it had an energy the polished version lost. You went back to the original.', archetypeHint: 'D-8' },
  { id: 'bw-lat-tenth-draft', topic: 'latent-revision', prompt: 'Draft ten is when you finally found the real shape of the idea. Everything before that was raw material.', archetypeHint: 'S-0' },
  { id: 'bw-lat-read-room', topic: 'latent-audience', prompt: 'You walk into a room and immediately know what will land. You adjust mid-sentence and nobody notices.', archetypeHint: 'H-6' },
  { id: 'bw-lat-ignore-room', topic: 'latent-audience', prompt: 'The room wanted a feel-good story. You gave them the uncomfortable truth instead. Some left. The rest stayed forever.', archetypeHint: 'R-10' },
  { id: 'bw-lat-archive', topic: 'latent-time', prompt: 'Your hard drive has 50 folders of things you never published. One day the right moment will come for each of them.', archetypeHint: 'P-7' },
  { id: 'bw-lat-burn', topic: 'latent-time', prompt: 'You deleted your old work and felt lighter. Looking backward is a trap. Only the next thing matters.', archetypeHint: 'F-9' },
  { id: 'bw-lat-name-first', topic: 'latent-naming', prompt: 'You had the title before you had the first sentence. The name told you what the project wanted to become.', archetypeHint: 'V-2' },
  { id: 'bw-lat-name-last', topic: 'latent-naming', prompt: 'You finished the whole thing and stared at it for a week. The name showed up on a Tuesday morning out of nowhere.', archetypeHint: 'D-8' },
  { id: 'bw-lat-pattern-break', topic: 'latent-pattern', prompt: 'You had a signature style and you killed it on purpose. Starting over felt like the only honest move.', archetypeHint: 'R-10' },
  { id: 'bw-lat-pattern-refine', topic: 'latent-pattern', prompt: 'You have made the same kind of thing a hundred times and each one is slightly better. The repetition is the craft.', archetypeHint: 'S-0' },
  { id: 'bw-lat-alone', topic: 'latent-process', prompt: 'Your phone is off. The door is locked. Nobody knows where you are. This is where the real work happens.', archetypeHint: 'C-4' },
  { id: 'bw-lat-friction', topic: 'latent-process', prompt: 'Someone disagreed with you at 2am and the argument became the best idea you have had all year.', archetypeHint: 'H-6' },

  // Portfolio & Showcase
  { id: 'port-curated', topic: 'portfolio', prompt: 'You have made 200 things but your portfolio only shows 7. Each one is there because it earned its place.', archetypeHint: 'S-0' },
  { id: 'port-comprehensive', topic: 'portfolio', prompt: 'Your portfolio shows everything, including the early embarrassing stuff. The arc from bad to good is the point.', archetypeHint: 'P-7' },
  { id: 'port-process', topic: 'portfolio', prompt: 'You show the sketches, the dead ends, the wrong turns. The finished piece is just the last page of a longer story.', archetypeHint: 'T-1' },
  { id: 'port-impact', topic: 'portfolio', prompt: 'You lead with the numbers. What changed? Who was affected? The work is measured by its dent in the world.', archetypeHint: 'F-9' },

  // Client & Commercial Work
  { id: 'client-educate', topic: 'client-work', prompt: 'The client asked for something generic. You showed them why generic would hurt them, even if it meant losing the gig.', archetypeHint: 'R-10' },
  { id: 'client-deliver', topic: 'client-work', prompt: 'The client asked for something generic. You delivered it cleanly, got paid, and saved your real energy for your own stuff.', archetypeHint: 'F-9' },
  { id: 'client-vision', topic: 'client-work', prompt: 'The brief was three vague sentences. You came back with a full concept deck that surprised even the client.', archetypeHint: 'V-2' },
  { id: 'client-clarify', topic: 'client-work', prompt: 'The brief was three vague sentences. You sent back 12 clarifying questions before touching a single tool.', archetypeHint: 'T-1' },
  { id: 'client-personal', topic: 'client-work', prompt: 'Nobody can tell which pieces in your portfolio are personal projects and which were commissions. That is by design.', archetypeHint: 'S-0' },
  { id: 'client-separate', topic: 'client-work', prompt: 'Your client work pays the rent. Your personal work is where you are honest. They serve different purposes and that is fine.', archetypeHint: 'P-7' },

  // Creative Inspiration
  { id: 'insp-obscure', topic: 'inspiration', prompt: 'Your last music video was inspired by a 1970s Soviet textile manual. Nobody in your genre has seen that book.', archetypeHint: 'N-5' },
  { id: 'insp-canon', topic: 'inspiration', prompt: 'You have studied the masters of your craft so deeply that you dream in their techniques.', archetypeHint: 'P-7' },
  { id: 'insp-constraint', topic: 'inspiration', prompt: 'You gave yourself an absurd restriction. Only red. Only 4 bars. Only found footage. And it unlocked everything.', archetypeHint: 'T-1' },
  { id: 'insp-abundance', topic: 'inspiration', prompt: 'Your studio is drowning in materials. Clippings, samples, screenshots, fragments. The pile is the method.', archetypeHint: 'D-8' },
  { id: 'insp-consume', topic: 'inspiration', prompt: 'You read about architecture, then watched a biology documentary, then listened to a jazz bootleg. Somehow it all fed the same project.', archetypeHint: 'N-5' },
  { id: 'insp-starve', topic: 'inspiration', prompt: 'You have not listened to new music in a month. Not watched anything. You are forcing yourself to produce without consuming.', archetypeHint: 'C-4' },

  // Tool & Platform Choices
  { id: 'tool-cutting', topic: 'tools', prompt: 'The software launched last week. You are already building with it while everyone else is still reading the changelog.', archetypeHint: 'V-2' },
  { id: 'tool-proven', topic: 'tools', prompt: 'You have used the same three tools for five years. You know every shortcut, every edge case. The tools disappear and only the work remains.', archetypeHint: 'L-3' },
  { id: 'tool-custom', topic: 'tools', prompt: 'The tool you needed did not exist, so you built it yourself. It is ugly but it does exactly what you need.', archetypeHint: 'T-1' },
  { id: 'tool-adapt', topic: 'tools', prompt: 'Your laptop died so you finished the project on a borrowed phone. The tool does not matter. You do.', archetypeHint: 'F-9' },
  { id: 'plat-multi', topic: 'platform', prompt: 'Your work lives on six platforms, each version tailored to how people use that space. Same idea, different shapes.', archetypeHint: 'H-6' },
  { id: 'plat-home', topic: 'platform', prompt: 'You post everything on your own site. If a platform dies tomorrow, you lose nothing.', archetypeHint: 'P-7' },

  // Collaboration Dynamics
  { id: 'collab-solo', topic: 'collaboration', prompt: 'You finished the entire thing alone in your room. Nobody saw it until it was done. That is how you make your best work.', archetypeHint: 'S-0' },
  { id: 'collab-open', topic: 'collaboration', prompt: 'You posted the rough idea publicly and let strangers help shape it. The final version belongs to everyone who touched it.', archetypeHint: 'H-6' },
  { id: 'collab-lead', topic: 'collaboration', prompt: 'You hold the vision. Other people help execute it. You trust their hands but the direction is yours alone.', archetypeHint: 'S-0' },
  { id: 'collab-peer', topic: 'collaboration', prompt: 'Five people in a room, all contributing equally. Nobody is the boss. The best idea wins, no matter who said it.', archetypeHint: 'N-5' },
  { id: 'collab-credit', topic: 'collaboration', prompt: 'The credits list is as long as the piece itself. Every name visible. Every contribution acknowledged.', archetypeHint: 'H-6' },
  { id: 'collab-anon', topic: 'collaboration', prompt: 'The work has no author listed. It just exists. Individual credit would make it smaller.', archetypeHint: 'Ø' },

  // Personal Brand & Identity
  { id: 'brand-consistent', topic: 'brand', prompt: 'Someone screenshots your work with the name cropped out. Everyone still knows it is yours. That consistency took years.', archetypeHint: 'S-0' },
  { id: 'brand-evolving', topic: 'brand', prompt: 'Every project looks completely different from the last. The thread connecting them is taste, not style.', archetypeHint: 'D-8' },
  { id: 'brand-transparent', topic: 'brand', prompt: 'You showed the failed attempt alongside the successful one. People respected you more for showing what went wrong.', archetypeHint: 'L-3' },
  { id: 'brand-mystery', topic: 'brand', prompt: 'Nobody knows what you look like or where you live. All they have is the work. That is all they need.', archetypeHint: 'P-7' },
  { id: 'brand-persona', topic: 'brand', prompt: 'Online you are a character. Offline you are someone else entirely. The separation protects the work.', archetypeHint: 'S-0' },
  { id: 'brand-authentic', topic: 'brand', prompt: 'There is no gap between who you are and what you make. Your work is your life and your life is your work.', archetypeHint: 'L-3' },

  // Creative Process Details
  { id: 'proc-morning', topic: 'process-time', prompt: 'You wake up at 5am and the world is silent. Two hours of pure creation before anyone can interrupt.', archetypeHint: 'C-4' },
  { id: 'proc-night', topic: 'process-time', prompt: '2am and everything is soft. Your inner critic fell asleep three hours ago. This is when the real stuff surfaces.', archetypeHint: 'D-8' },
  { id: 'proc-ritual', topic: 'process-ritual', prompt: 'Same chair. Same coffee. Same playlist. You sit down and the work starts because your body recognizes the sequence.', archetypeHint: 'T-1' },
  { id: 'proc-chaos', topic: 'process-ritual', prompt: 'You made your best thing on a park bench using a notes app. No studio, no ritual, just the impulse and whatever was nearby.', archetypeHint: 'D-8' },
  { id: 'proc-deadline', topic: 'process-deadline', prompt: 'The deadline is tomorrow and you are finally in flow. The pressure burned away everything that did not matter.', archetypeHint: 'F-9' },
  { id: 'proc-spacious', topic: 'process-deadline', prompt: 'You gave yourself three months when you could have done it in three weeks. The extra time let the idea become something you did not expect.', archetypeHint: 'L-3' },

  // Curation & Taste Expression
  { id: 'cur-edit', topic: 'curation', prompt: 'You started with 100 options and cut to 5. Every elimination sharpened the message. Curation is subtraction.', archetypeHint: 'C-4' },
  { id: 'cur-context', topic: 'curation', prompt: 'You put 30 different things side by side and suddenly they were in conversation. The relationship between them was the art.', archetypeHint: 'N-5' },
  { id: 'cur-gateway', topic: 'curation', prompt: 'You introduced someone to an artist they had never heard of. The look on their face when they got it was the reward.', archetypeHint: 'V-2' },
  { id: 'cur-mirror', topic: 'curation', prompt: 'You shared the thing that everyone was already thinking about but nobody had named yet. It went everywhere.', archetypeHint: 'Ø' },
  { id: 'cur-explain', topic: 'curation', prompt: 'Every recommendation comes with a paragraph explaining why. The context is what makes your taste valuable, not just the pick.', archetypeHint: 'T-1' },
  { id: 'cur-silent', topic: 'curation', prompt: 'You shared it with no caption, no explanation, no context. If you have to explain why it is good, maybe it is not.', archetypeHint: 'P-7' },

  // Professional Development
  { id: 'dev-depth', topic: 'development', prompt: 'You have done one thing for ten years and you are still finding new layers. The depth of mastery has no floor.', archetypeHint: 'S-0' },
  { id: 'dev-breadth', topic: 'development', prompt: 'You know a little about a lot of things and that is exactly why you see connections nobody else sees.', archetypeHint: 'N-5' },
  { id: 'dev-formal', topic: 'development', prompt: 'You went through the program, got the credential, learned the canon. There is a reason the structured path exists.', archetypeHint: 'T-1' },
  { id: 'dev-autodidact', topic: 'development', prompt: 'You have never taken a class for this. YouTube, forums, trial and error. Your curriculum was curiosity itself.', archetypeHint: 'P-7' },
  { id: 'dev-mentorship', topic: 'development', prompt: 'Someone 10 years ahead of you told you one sentence that saved you two years of wrong turns.', archetypeHint: 'L-3' },
  { id: 'dev-pioneering', topic: 'development', prompt: 'There is no mentor for what you do because nobody has done it before. You are building the path as you walk it.', archetypeHint: 'V-2' },

  // Creative Community Engagement
  { id: 'comm-build', topic: 'community', prompt: 'You built a group chat that turned into a scene. People make things together now that would not exist without that space.', archetypeHint: 'H-6' },
  { id: 'comm-observe', topic: 'community', prompt: 'You lurk in 12 communities and post in none. You absorb everything and it all shows up in your work quietly.', archetypeHint: 'Ø' },
  { id: 'comm-teach', topic: 'community', prompt: 'You made a tutorial for the technique that took you a year to figure out. 10,000 people learned it in an afternoon.', archetypeHint: 'L-3' },
  { id: 'comm-gatekeep', topic: 'community', prompt: 'Someone asked you to share your sources and you said no. Some things lose their power when everyone has access.', archetypeHint: 'P-7' },
  { id: 'comm-provocateur', topic: 'community', prompt: 'You posted a take that split the entire community in half. Three weeks later everyone agreed you were right.', archetypeHint: 'R-10' },
  { id: 'comm-unifier', topic: 'community', prompt: 'Two rival factions in your scene are both talking to you. You are the only person both sides trust.', archetypeHint: 'N-5' },

  // Project Approach
  { id: 'proj-prototype', topic: 'project-approach', prompt: 'You built a rough version in 48 hours and showed 10 people. Their reactions told you whether to keep going.', archetypeHint: 'F-9' },
  { id: 'proj-complete', topic: 'project-approach', prompt: 'Nobody saw it until it was done. You do not show process because a half-built bridge is not a bridge.', archetypeHint: 'S-0' },
  { id: 'proj-iterative', topic: 'project-approach', prompt: 'Version 0.1 was embarrassing. Version 0.4 was interesting. Version 1.0 was great. The public saw every step.', archetypeHint: 'H-6' },
  { id: 'proj-reveal', topic: 'project-approach', prompt: 'You worked on it in silence for six months. When it appeared, people thought you had made it overnight.', archetypeHint: 'C-4' },
  { id: 'proj-breadcrumbs', topic: 'project-approach', prompt: 'You posted a cryptic image with no explanation. Then another. By the time you revealed the project, people were already obsessed.', archetypeHint: 'V-2' },
  { id: 'proj-surprise', topic: 'project-approach', prompt: 'No announcement, no trailer, no countdown. You just dropped it at midnight and let people find it on their own.', archetypeHint: 'R-10' },

  // Feedback & Criticism
  { id: 'feed-everyone', topic: 'feedback', prompt: 'You showed the rough cut to 20 different people. A barista, your mother, a stranger online. Every perspective taught you something.', archetypeHint: 'N-5' },
  { id: 'feed-selective', topic: 'feedback', prompt: 'You only show unfinished work to three people. They have been vetted over years. Their taste is the only feedback that matters.', archetypeHint: 'S-0' },
  { id: 'feed-integrate', topic: 'feedback', prompt: 'Someone gave you a note you initially hated. A week later you realized it was the smartest thing anyone said about the project.', archetypeHint: 'L-3' },
  { id: 'feed-filter', topic: 'feedback', prompt: 'You got 50 pieces of feedback and used exactly two of them. The rest did not understand the vision, and that is okay.', archetypeHint: 'S-0' },
  { id: 'feed-public', topic: 'feedback', prompt: 'You invited public critique on a live stream. It was brutal and awkward and the work got dramatically better because of it.', archetypeHint: 'H-6' },
  { id: 'feed-private', topic: 'feedback', prompt: 'Someone offered to critique your work publicly and you declined. That conversation needs to happen behind closed doors or not at all.', archetypeHint: 'P-7' },

  // Trend & Timing
  { id: 'trend-early', topic: 'trend-timing', prompt: 'You were doing this two years before it had a name. When the trend hit, you were already three moves ahead.', archetypeHint: 'V-2' },
  { id: 'trend-timeless', topic: 'trend-timing', prompt: 'Trends come and go and your work looks exactly the same as it did five years ago. It will still look right in five more.', archetypeHint: 'P-7' },
  { id: 'trend-counter', topic: 'trend-timing', prompt: 'Everyone pivoted to short form. You released a 40-minute piece. The contrarian move got more attention than any reel.', archetypeHint: 'R-10' },
  { id: 'trend-peak', topic: 'trend-timing', prompt: 'The wave was at its peak and you rode it perfectly. Your version of the trend reached people who would never have found you otherwise.', archetypeHint: 'H-6' },
  { id: 'trend-synthesize', topic: 'trend-timing', prompt: 'Two completely unrelated trends collided in your work and created something that belonged to neither. That was the breakthrough.', archetypeHint: 'N-5' },
  { id: 'trend-establish', topic: 'trend-timing', prompt: 'People are calling it a trend now but you have been doing it since 2019. You did not follow the wave. You were the origin.', archetypeHint: 'V-2' },

  // Documentation & Memory
  { id: 'doc-everything', topic: 'documentation', prompt: 'You have notes from every session, every meeting, every failed attempt. In three years that archive will be more valuable than the work itself.', archetypeHint: 'P-7' },
  { id: 'doc-nothing', topic: 'documentation', prompt: 'You do not take notes. If the idea was good enough it will come back. If it does not, it was not the one.', archetypeHint: 'F-9' },
  { id: 'doc-process', topic: 'documentation', prompt: 'Your documentation of how you built it is more popular than the thing itself. People want the recipe, not just the meal.', archetypeHint: 'T-1' },
  { id: 'doc-outcomes', topic: 'documentation', prompt: 'Nobody cares how you built it. They care that it works. You only document what shipped.', archetypeHint: 'F-9' },
  { id: 'doc-public', topic: 'documentation', prompt: 'Your working notes are public. Anyone can read your thinking in real time. It keeps you honest and helps others learn.', archetypeHint: 'H-6' },
  { id: 'doc-private', topic: 'documentation', prompt: 'Your journal is for you and you alone. Publishing your process would drain it of the thing that makes it useful.', archetypeHint: 'P-7' },

  // Success & Recognition
  { id: 'succ-external', topic: 'success', prompt: 'You won the award and it changed everything. Suddenly the phone rang. Opportunities appeared. Recognition opened doors that talent alone could not.', archetypeHint: 'H-6' },
  { id: 'succ-internal', topic: 'success', prompt: 'Nobody noticed the project. But you made exactly what you intended to make. That quiet satisfaction is the only metric that counts.', archetypeHint: 'S-0' },
  { id: 'succ-influence', topic: 'success', prompt: 'You saw a stranger using a technique you invented. They had no idea where it came from. That was more satisfying than any award.', archetypeHint: 'V-2' },
  { id: 'succ-craft', topic: 'success', prompt: 'This version is 5% better than the last one. Nobody else can see the difference but you can. That 5% is everything.', archetypeHint: 'L-3' },
  { id: 'succ-disruption', topic: 'success', prompt: 'Your project made the entire industry reconsider its assumptions. People hated it at first. Now they teach it in schools.', archetypeHint: 'R-10' },
  { id: 'succ-sustainability', topic: 'success', prompt: 'You have been making work steadily for 10 years. No viral moment, no big break. Just showing up every day, still here, still making.', archetypeHint: 'L-3' },

  // Material & Medium
  { id: 'med-digital', topic: 'medium', prompt: 'Your work was born on a screen and it will die on a screen. It exists nowhere else and it does not need to.', archetypeHint: 'V-2' },
  { id: 'med-physical', topic: 'medium', prompt: 'Someone held your work in their hands and the weight of it mattered. A screen could never do that.', archetypeHint: 'P-7' },
  { id: 'med-hybrid', topic: 'medium', prompt: 'You scan the painting, project the scan onto a wall, film the projection, and edit the film. The final thing is all of those layers at once.', archetypeHint: 'N-5' },
  { id: 'med-agnostic', topic: 'medium', prompt: 'The idea tells you what medium it wants. Sometimes that is a video. Sometimes a poster. Sometimes a voice note. You follow the idea.', archetypeHint: 'T-1' },
  { id: 'med-specific', topic: 'medium', prompt: 'You only work in one format and you know it better than anyone alive. The constraint is the whole point.', archetypeHint: 'S-0' },
  { id: 'med-experimental', topic: 'medium', prompt: 'You made a song out of voicemails, a sculpture out of data, a film out of screenshots. The medium itself is the experiment.', archetypeHint: 'R-10' },

  // Revision & Refinement
  { id: 'rev-minimal', topic: 'revision', prompt: 'You changed almost nothing from the first draft. The raw impulse had a truth that editing would have polished away.', archetypeHint: 'D-8' },
  { id: 'rev-exhaustive', topic: 'revision', prompt: 'You rewrote it from scratch four times. Each version stripped away another layer of self-indulgence. The final cut is bone.', archetypeHint: 'S-0' },
  { id: 'rev-break', topic: 'revision', prompt: 'You put it in a drawer for two weeks. When you came back, the problems were obvious and the solutions were easy.', archetypeHint: 'L-3' },
  { id: 'rev-immersive', topic: 'revision', prompt: 'You worked on it for 14 hours straight, revising as you went. Stopping would have broken the spell.', archetypeHint: 'F-9' },
  { id: 'rev-others', topic: 'revision', prompt: 'You read your draft out loud to three people and watched their faces. Their confusion at paragraph four told you exactly what to rewrite.', archetypeHint: 'H-6' },
  { id: 'rev-vision', topic: 'revision', prompt: 'People suggested changes and you listened politely and changed nothing. The original vision was right. You just needed to trust it.', archetypeHint: 'S-0' },
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
 * Generate revision signals when a user goes back and changes their answer.
 * Produces 4 signals:
 * - 2 cancellation signals (inverse polarity, half weight) for original choices
 * - 2 new signals (normal polarity, full weight) for revised choices
 * The half-weight cancellation preserves a trace of the initial instinct
 * while the full-weight new signals reflect the deliberated choice.
 */
export function generateRevisionSignals(
  card: TrainingCard,
  newSubmission: TrainingSubmission,
  originalSubmission: { bestId: string; worstId: string }
): ExplicitSignal[] {
  const signals: ExplicitSignal[] = [];

  const origBest = card.options.find(o => o.id === originalSubmission.bestId);
  const origWorst = card.options.find(o => o.id === originalSubmission.worstId);

  if (!origBest || !origWorst) {
    throw new Error('Invalid revision: original options not found in card');
  }

  // Cancellation: invert original best (was positive → now negative, half weight)
  signals.push({
    type: 'explicit',
    source: 'training',
    text: origBest.text,
    weight: 0.8,
    polarity: 'negative',
    archetypeWeights: {
      [origBest.archetypeHint]: 5
    }
  });

  // Cancellation: invert original worst (was negative → now positive, half weight)
  signals.push({
    type: 'explicit',
    source: 'training',
    text: origWorst.text,
    weight: 0.8,
    polarity: 'positive',
    archetypeWeights: {
      [origWorst.archetypeHint]: 1
    }
  });

  // New signals at full weight
  const newSignals = generateTrainingSignals(card, newSubmission);
  signals.push(...newSignals);

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
