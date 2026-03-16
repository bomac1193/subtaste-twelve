# Subtaste Psychometric System Architecture

> Complete technical reference for the taste classification and profiling engine.

---

## System Overview

Subtaste classifies creative taste across **12 archetypes** (THE TWELVE) using a multi-layer architecture that separates what you can see from what powers the engine.

```
USER-FACING                    ENGINE-INTERNAL
────────────                   ───────────────
Archetype (Glyph/Sigil)  ←──  12-dim classification
Motivation profile        ←──  5 explicit questions + behavioral inference
Social dynamics           ←──  2 explicit questions + behavioral inference
Sensitivity (overall)     ←──  Behavioral only (training card responses)
                               Psychometrics (Big Five + MUSIC)
                               Sephirotic balance
                               Orisha resonance
```

---

## Classification Dimensions (12)

The core classifier scores each archetype using **12 psychometric dimensions**:

### Big Five Openness Sub-Facets (6)

From the HEXACO/NEO-PI-R Openness domain. These are the strongest predictors of creative preferences.

| Facet | What It Measures |
|-------|-----------------|
| **Fantasy** | Imagination, daydreaming, vivid inner life |
| **Aesthetics** | Appreciation of art, beauty, sensory experience |
| **Feelings** | Receptiveness to inner emotions, emotional range |
| **Actions** | Willingness to try new activities, novelty-seeking |
| **Ideas** | Intellectual curiosity, abstract thinking |
| **Values** | Readiness to re-examine social/political/religious values |

### Intellect (1)

Separate from Openness in HEXACO models. Measures analytical curiosity and engagement with complex ideas. Combined with Openness facets, this gives a 7-dimensional personality picture.

### MUSIC Model Dimensions (5)

From Rentfrow et al.'s music preference research. Maps to broader aesthetic preferences beyond music.

| Dimension | Characteristic |
|-----------|---------------|
| **Mellow** | Slow, quiet, romantic, acoustic |
| **Unpretentious** | Percussive, conventional, straightforward |
| **Sophisticated** | Complex, instrumental, jazz/classical |
| **Intense** | Distorted, loud, aggressive, heavy |
| **Contemporary** | Rhythmic, electronic, urban, synthetic |

### Scoring Pipeline

```
For each archetype:
  psychoScore = Σ(userTrait × archetypeWeight) across all 12 dimensions
  signalScore = weighted sum of explicit/implicit signal matches

  rawScore = (psychoScore × 0.7) + (signalScore × 0.3)

Apply softmax(rawScores, temperature) → probability distribution
Primary = highest probability, Secondary = second highest (if > threshold)
```

---

## THE TWELVE Archetypes

Each archetype carries three registers of identity:

| Designation | Glyph | Sigil | Phase |
|------------|-------|-------|-------|
| S-0 | KETH | Aethonis | Genesis |
| T-1 | ANVIL | Forjaris | Refinement |
| V-2 | SCHISM | Velthoris | Vision |
| L-3 | LOOM | Nexaris | Manifestation |
| C-4 | CIPHER | Kryptonis | Refinement |
| N-5 | NOMAD | Erranthos | Flow |
| H-6 | HEARTH | Solanthe | Manifestation |
| P-7 | PRISM | Chromalis | Flow |
| D-8 | DRIFT | Thalassir | Flow |
| F-9 | FORGE | Ignathor | Genesis |
| R-10 | ROOT | Terranox | Genesis |
| Ø | VOID | Nihilaris | Flow |

- **Designation**: Alphanumeric code (internal, power users)
- **Glyph**: Spoken name (public identity, what users claim)
- **Sigil**: Formal notation (revealed on request, adds mystique)

---

## Symbolic Layers (Engine-Internal)

These layers are computed during classification but **never exposed to the client**. They live in `TasteGenome._engine`.

### Sephirotic Balance (Tree of Life)

Each archetype maps to a Sephirah on the Kabbalistic Tree of Life. The sephirotic balance tracks how a user's taste distributes across the tree's structure.

| Archetype | Sephirah | Meaning |
|-----------|----------|---------|
| S-0 KETH | Keter | Crown — pure creative impulse |
| T-1 ANVIL | Binah | Understanding — analytical discernment |
| V-2 SCHISM | Chokmah | Wisdom — visionary insight |
| L-3 LOOM | Tiferet | Beauty — harmonious integration |
| C-4 CIPHER | Gevurah | Judgment — critical precision |
| N-5 NOMAD | Netzach | Eternity — endurance through change |
| H-6 HEARTH | Chesed | Mercy — generative warmth |
| P-7 PRISM | Hod | Splendor — analytical beauty |
| D-8 DRIFT | Yesod | Foundation — flow state |
| F-9 FORGE | Tiferet | Beauty — creative synthesis |
| R-10 ROOT | Malkuth | Kingdom — grounded manifestation |
| Ø VOID | Da'at | Knowledge — the hidden sephirah |

### Orisha Resonance

Each archetype carries a primary Orisha (creative patron) and a shadow Orisha (creative challenge).

| Archetype | Primary | Shadow | Tension |
|-----------|---------|--------|---------|
| S-0 | Obatala | Eshu | Purity vs trickster chaos |
| T-1 | Ogun | Oshun | Discipline vs flowing beauty |
| V-2 | Orunmila | Shango | Foresight vs impulsive power |
| L-3 | Oshun | Ogun | Connection vs isolation |
| C-4 | Eshu | Obatala | Complexity vs simplicity |
| N-5 | Eshu | Yemoja | Wandering vs rooted nurture |
| H-6 | Yemoja | Eshu | Nurture vs disruption |
| P-7 | Oshun | Ogun | Beauty-seeking vs raw force |
| D-8 | Olokun | Shango | Deep currents vs surface fire |
| F-9 | Shango | Olokun | Creative fire vs depth |
| R-10 | Ogun | Oshun | Earth-working vs ornament |
| Ø | Olokun | Obatala | Void depth vs crown order |

### I-Ching Hexagram

Derived from the four personality axes (see Progressive Profiling below). The hexagram reading provides a narrative layer for the user's current creative state and transformation direction.

---

## Motivation Profile

**Population method**: 3 explicit questions + ongoing behavioral inference from signals

Measures WHY someone creates and consumes. Five dimensions, each 0-1:

| Dimension | Description | Behavioral Signals |
|-----------|-------------|-------------------|
| **Expression** | Creating to get something OUT | share actions, Genesis archetype affinity |
| **Connection** | Creating to REACH others | share actions, Manifestation archetype affinity |
| **Mastery** | Technical excellence drive | repeat/dwell actions, Refinement archetype affinity |
| **Discovery** | Finding/exploring new things | click/skip/save actions, Flow archetype affinity |
| **Identity** | Defining self through taste | save actions, Vision archetype affinity |

### Explicit Questions (3)

Binary choice format, ~30s total:

1. "When you create something, what matters most?"
   - "That it's exactly right" → mastery, identity
   - "That it reaches people" → connection, expression

2. "What pulls you to explore new music, art, or ideas?"
   - "I want to find what no one else has found" → discovery, identity
   - "I want to understand how it all connects" → mastery, discovery

3. "When something you love becomes popular, you..."
   - "Feel validated — your taste was ahead" → tastemaker, identity
   - "Lose interest — move to what's next" → contrarian, discovery

### Behavioral Inference

Every signal processed through `updateGenomeWithSignals()` also updates motivation via `extractMotivationDeltas()`. The explicit questions set the baseline; signals refine it over time.

---

## Social Dynamics

**Population method**: 2 explicit questions + primarily behavioral inference

Measures HOW taste behaves around others. Four social roles:

| Role | Description | Behavioral Signals |
|------|-------------|-------------------|
| **Tastemaker** | Sets direction, others follow | share frequency, curation of obscure content |
| **Consumer** | Absorbs culture deeply | save popular content, long dwell times |
| **Contrarian** | Defines self against mainstream | block actions, save obscure, skip popular |
| **Bridger** | Cross-pollinates between scenes | diverse signal sources, cross-genre sharing |

### Explicit Questions (2)

4. "Your creative work is..."
   - "For yourself first, audience second" → expression, contrarian
   - "Incomplete without an audience" → connection, tastemaker

5. "In a group setting, your taste usually..."
   - "Sets the direction — people follow your picks" → tastemaker
   - "Finds the bridge — you connect different worlds" → bridger

### Behavioral Inference

Signal patterns update social scores via `extractSocialDeltas()`:
- Source diversity (3+ sources) → bridger boost
- Share actions → tastemaker signal
- Save obscure content → contrarian + tastemaker
- Save popular content → consumer
- Block actions → contrarian (active taste boundary)

The dominant role is recalculated on every update.

---

## Perceptual Sensitivity

**Population method**: Behavioral only — purely measured from training card responses

You MEASURE sensitivity, you don't ask about it. Three sub-dimensions:

| Sub-dimension | Weight | What It Measures |
|--------------|--------|-----------------|
| **Consistency** | 50% | Same choices across similar stimuli. Do they pick the same archetype hints when presented multiple times? |
| **Discrimination** | 40% | Distinguishing subtle differences. When options have similar archetype hints, do they still differentiate best/worst? |
| **Speed Consistency** | 10% | Deliberate evaluation. Not faster=better, but consistent response times indicate systematic evaluation. |

### Formula

```
overall = (consistency × 0.5) + (discrimination × 0.4) + (speedConsistency × 0.1)
```

### Reliability

Score becomes reliable at **sampleSize >= 10** training cards. Before that, it's marked unreliable and should not be surfaced.

### Speed Consistency Calculation

Uses coefficient of variation (stddev / mean) of response times. A CV of 0 = perfectly consistent = score of 1.0. High variance = impulsive/random = lower score.

---

## Progressive Profiling Stages

Profiling unfolds across 6 stages, from onboarding through deep calibration:

| Order | Stage | Questions | Time | Trigger | Confidence Gain |
|-------|-------|-----------|------|---------|----------------|
| 1 | **Training** | 15 cards | ~120s | Onboarding | +0.25 |
| 2 | **Initial Spark** | 3 | ~30s | Onboarding | +0.30 |
| 3 | **Personality Axes** | 4 | ~45s | Onboarding | +0.10 |
| 4 | **Drive & Dynamics** | 5 | ~60s | Onboarding | +0.10 |
| 5 | **Music Calibration** | 3 | ~45s | Milestone (5 interactions) | +0.15 |
| 6 | **Deep Calibration** | 5 | ~120s | On-demand | +0.20 |

### What Each Stage Populates

- **Training**: Archetype classification (12-dim), perceptual sensitivity (behavioral)
- **Initial Spark**: Primary Glyph assignment, psychometric baseline
- **Personality Axes**: I-Ching hexagram, personality axes (order/chaos, mercy/ruthlessness, introvert/extrovert, faith/doubt)
- **Drive & Dynamics**: Motivation profile (5-dim) + social dynamics (4 roles)
- **Music Calibration**: MUSIC model refinement
- **Deep Calibration**: Full genome refinement, Sigil reveal eligibility

---

## Signal Flow Pipeline

```
User Action
    │
    ▼
Signal (explicit or implicit)
    │
    ├──▶ classify() ──▶ Psychometric update ──▶ Archetype reclassification
    │                        │
    │                        ├──▶ Sephirotic balance update
    │                        └──▶ Orisha resonance update
    │
    ├──▶ extractMotivationDeltas() ──▶ applyMotivationDeltas()
    │
    ├──▶ extractSocialDeltas() ──▶ applySocialDeltas()
    │
    └──▶ (if training card) updateSensitivityFromTraining()
    │
    ▼
Updated TasteGenome
    │
    ├──▶ toPublicGenome() ──▶ Client (strips _engine, limits sensitivity)
    └──▶ Full genome ──▶ Storage (all layers preserved)
```

### Signal Types

| Type | Examples | Weight |
|------|----------|--------|
| **Explicit** | Quiz responses, ratings, archetype selections | High (direct intent) |
| **Intentional Implicit** | Save, share, repeat, block | Medium (deliberate action) |
| **Unintentional Implicit** | Dwell time, skip, click | Low (passive behavior) |

---

## Data Visibility Layers

| Layer | Contents | Visible To |
|-------|----------|-----------|
| **Public** | Archetype (Glyph), confidence, distribution | Client, other users |
| **Sigil** | Formal notation (Sigil name) | User on request (reveal mechanic) |
| **Profile** | Motivation, social dynamics, sensitivity (overall only) | Client (user's own profile) |
| **Engine** | Psychometrics, Sephirotic, Orisha, full sensitivity detail | Server only, never exposed |

---

## Package Structure

```
packages/
├── core/                          # Classification engine + genome
│   └── src/
│       ├── types/                 # TasteGenome, signals, archetypes
│       ├── pantheon/              # THE TWELVE definitions + hidden layers
│       │   ├── definitions.ts     # Public archetype data
│       │   └── internal.ts        # Sephirotic, Orisha, psychometric weights
│       ├── engine/                # Classification + profiling engines
│       │   ├── classifier.ts      # 12-dim softmax classifier
│       │   ├── psychometrics.ts   # Big Five + MUSIC scoring
│       │   ├── motivation.ts      # Motivation inference engine
│       │   ├── social.ts          # Social dynamics engine
│       │   ├── sensitivity.ts     # Perceptual sensitivity engine
│       │   ├── keywords.ts        # Keyword learning
│       │   └── weights.ts         # Scoring configuration
│       ├── genome/                # Genome CRUD + encoding
│       │   ├── schema.ts          # Create, serialize, public transform
│       │   └── encoder.ts         # Signal → genome update pipeline
│       ├── context/               # Multi-context profiles
│       └── iching/                # Hexagram derivation
│
├── profiler/                      # Assessment instruments
│   └── src/
│       ├── instruments/           # Assessment lifecycle managers
│       │   ├── initial.ts         # 3-question onboarding
│       │   ├── axes.ts            # 4 personality axes
│       │   ├── motivation.ts      # 5-question drive & dynamics
│       │   ├── calibration.ts     # Music + deep calibration
│       │   ├── training.ts        # Training card generation
│       │   └── implicit.ts        # Behavioral signal conversion
│       ├── questions/             # Question banks
│       │   ├── bank.ts            # Initial + calibration questions
│       │   ├── motivation-bank.ts # Motivation + social questions
│       │   └── mapping.ts         # Response → signal mapping
│       └── progressive/           # Stage orchestration
│           ├── stages.ts          # 6-stage definitions
│           └── orchestrator.ts    # Stage flow management
│
├── sdk/                           # Client SDK
└── apps/web/                      # Web application
```

---

## Design Principles

1. **Measure, don't ask** — Sensitivity is behavioral only. Motivation and social dynamics start with questions but are continuously refined by behavior.

2. **Hidden layers power, don't define** — Sephirotic/Orisha/psychometric data drives classification accuracy but is never surfaced. Users see Glyphs and Sigils, not trait scores.

3. **Progressive revelation** — Users start with a Glyph (30 seconds), unlock personality axes, then motivation/social, then deep calibration. Each layer adds depth without overwhelming.

4. **Behavioral correction** — Self-report (questions) sets the baseline. Every subsequent signal corrects toward actual behavior, reducing self-report bias over time.

5. **Signal-first architecture** — Everything flows through the Signal type. Explicit signals (quiz answers) and implicit signals (saves, shares, dwells) use the same pipeline and are weighted by intent strength.
