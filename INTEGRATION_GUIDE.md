# Integration Guide: Using New Systems

Quick reference for developers working with the newly integrated Training, Axes, and I-Ching systems.

---

## Training System

### Basic Usage

```typescript
import { createTrainingSession, generateTrainingSignals } from '@subtaste/profiler';

// Create a session with 20 cards
const cards = createTrainingSession(20);

// Present first card to user
const card = cards[0];
console.log(card.prompt); // Topic description
console.log(card.options); // 4 options to choose from

// User selects best and worst
const submission = {
  cardId: card.id,
  bestId: 'bw-opening-thesis',  // User's best choice
  worstId: 'bw-opening-scene'   // User's worst choice
};

// Generate signals for classification
const signals = generateTrainingSignals(card, submission);
// Returns 2 ExplicitSignals with archetype weights
```

### XP Calculation

```typescript
import { calculateTrainingXP } from '@subtaste/profiler';

const completedTopics = new Set(['opening', 'payoff']);
const currentTopic = 'hook'; // New topic
const xp = calculateTrainingXP(completedTopics, currentTopic);
// Returns 15 (10 base + 5 new topic bonus)
```

---

## Axes Calibration

### Collecting Responses

```typescript
import { AXES_QUESTIONS, normalizeAxesResponse } from '@subtaste/profiler';
import { deriveHexagramReading } from '@subtaste/core';

// Display questions to user (4 sliders)
AXES_QUESTIONS.forEach(q => {
  console.log(q.prompt);
  console.log(`${q.lowLabel} <---> ${q.highLabel}`);
});

// User provides slider values (0-1)
const rawResponse = {
  orderChaos: 0.7,        // High chaos
  mercyRuthlessness: 0.3, // High mercy
  introvertExtrovert: 0.6,// Slightly extrovert
  faithDoubt: 0.5         // Balanced
};

// Normalize (clamp to 0-1, fill missing)
const axes = normalizeAxesResponse(rawResponse);
```

### Deriving Hexagram

```typescript
import { deriveHexagramReading } from '@subtaste/core';

const reading = deriveHexagramReading(axes);

console.log(reading.present.name);     // "The Wanderer"
console.log(reading.present.chinese);   // "旅"
console.log(reading.present.judgment);  // "Success through smallness..."
console.log(reading.movingLines);       // [4] - Line 4 is transforming

if (reading.transforming) {
  console.log('Transforms into:', reading.transforming.name);
}
```

### Real-time Preview

For UI with live hexagram preview as user moves sliders:

```typescript
const [axes, setAxes] = useState({
  orderChaos: 0.5,
  mercyRuthlessness: 0.5,
  introvertExtrovert: 0.5,
  faithDoubt: 0.5
});

// Update on slider change
const handleSliderChange = (axis: AxisType, value: number) => {
  setAxes(prev => ({ ...prev, [axis]: value }));
};

// Derive hexagram on every change
const reading = deriveHexagramReading(axes);
```

---

## I-Ching Hexagrams

### Display Hexagram

```typescript
import { Hexagram } from '@subtaste/core';

const HexagramDisplay = ({ hexagram }: { hexagram: Hexagram }) => {
  return (
    <div>
      <h2>Hexagram {hexagram.number}</h2>
      <h3>{hexagram.name} ({hexagram.chinese})</h3>
      <p>{hexagram.image}</p>
      <blockquote>{hexagram.judgment}</blockquote>

      {/* Visual representation */}
      <div className="hexagram-lines">
        {hexagram.lines.slice().reverse().map((yang, i) => (
          <div key={i} className={yang ? 'yang-line' : 'yin-line'}>
            {yang ? '━━━━━━' : '━━  ━━'}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Show Moving Lines

```typescript
const MovingLines = ({ reading }: { reading: HexagramReading }) => {
  if (reading.movingLines.length === 0) return <p>No moving lines</p>;

  return (
    <div>
      <h4>Moving Lines (Transformation)</h4>
      <ul>
        {reading.movingLines.map(line => (
          <li key={line}>Line {line} is near threshold</li>
        ))}
      </ul>
      {reading.transforming && (
        <p>Transforms into: {reading.transforming.name}</p>
      )}
    </div>
  );
};
```

---

## Keyword Learning

### Extracting Keywords

```typescript
import { categorizeKeywords, updateKeywordScores } from '@subtaste/core';

const text = "Cinematic polish with minimalist design";
const keywords = categorizeKeywords(text);
// { visual: ['cinematic', 'minimalist', 'polish'], content: [] }
```

### Updating Genome

```typescript
import { updateKeywordScores } from '@subtaste/core';

// Start with empty or existing scores
let scores = genome.keywords;

// User picks "best" option (positive)
scores = updateKeywordScores(
  scores,
  bestOption.text,
  1.6,  // Weight
  'positive'
);

// User picks "worst" option (negative)
scores = updateKeywordScores(
  scores,
  worstOption.text,
  1.6,
  'negative'
);

// Store back in genome
genome.keywords = scores;
```

### Displaying Preferences

```typescript
import { getAttractedKeywords, getRepelledKeywords } from '@subtaste/core';

const attracted = getAttractedKeywords(genome.keywords, 10);
const repelled = getRepelledKeywords(genome.keywords, 10);

console.log('You prefer:');
attracted.visual.forEach(k => {
  console.log(`  ${k.keyword}: ${k.score} (${k.count} times)`);
});

console.log('You avoid:');
repelled.content.forEach(k => {
  console.log(`  ${k.keyword}: ${k.score} (${k.count} times)`);
});
```

---

## Archetype Enrichments

### Accessing Phase and Wu Xing

```typescript
import { getArchetype } from '@subtaste/core';

const archetype = getArchetype('T-1'); // STRATA
console.log(archetype.phase);         // 'refinement'
console.log(archetype.wuXingElement); // 'metal'
console.log(archetype.growthTarget);  // 'N-5'
console.log(archetype.stressTarget);  // 'P-7'
```

### Growth Path Visualization

```typescript
const GrowthPath = ({ designation }: { designation: Designation }) => {
  const current = getArchetype(designation);
  const growth = getArchetype(current.growthTarget!);
  const stress = getArchetype(current.stressTarget!);

  return (
    <div className="growth-map">
      <div className="current">{current.glyph}</div>
      <div className="arrow growth">→ {growth.glyph}</div>
      <div className="arrow stress">⚠ {stress.glyph}</div>

      <p>Growth: {growth.essence}</p>
      <p>Under stress: {stress.essence}</p>
    </div>
  );
};
```

---

## Gamification

### Tracking XP and Tier

```typescript
import type { Gamification } from '@subtaste/core';

const gamification: Gamification = {
  xp: 0,
  tier: 0,
  achievements: [],
  streak: 0,
  totalTrainings: 0
};

// Award XP
gamification.xp += calculateTrainingXP(completedTopics, currentTopic);
gamification.totalTrainings += 1;

// Tier progression
const tiers = [
  { name: 'Nascent', threshold: 0 },
  { name: 'Attuned', threshold: 100 },
  { name: 'Refined', threshold: 300 },
  { name: 'Crystalline', threshold: 600 }
];

gamification.tier = tiers.findIndex(t =>
  gamification.xp < t.threshold
) - 1;

// Achievements
if (gamification.totalTrainings === 1) {
  gamification.achievements.push('First Training');
}
if (gamification.totalTrainings >= 50) {
  gamification.achievements.push('Dedicated Explorer');
}
if (genome.iching) {
  gamification.achievements.push('Hexagram Unlocked');
}
```

---

## Complete Flow Example

```typescript
import {
  createTrainingSession,
  generateTrainingSignals,
  calculateTrainingXP,
  AXES_QUESTIONS,
  normalizeAxesResponse
} from '@subtaste/profiler';

import {
  deriveHexagramReading,
  updateKeywordScores,
  classify
} from '@subtaste/core';

// 1. Training Phase
const session = createTrainingSession(15);
let completedTopics = new Set<string>();
let signals: ExplicitSignal[] = [];
let keywords = undefined;
let totalXP = 0;

for (const card of session) {
  // User responds
  const submission = getUserSelection(card);

  // Generate signals
  const cardSignals = generateTrainingSignals(card, submission);
  signals.push(...cardSignals);

  // Update keywords
  keywords = updateKeywordScores(
    keywords,
    card.options.find(o => o.id === submission.bestId)!.text,
    1.6,
    'positive'
  );
  keywords = updateKeywordScores(
    keywords,
    card.options.find(o => o.id === submission.worstId)!.text,
    1.6,
    'negative'
  );

  // Award XP
  const xp = calculateTrainingXP(completedTopics, card.topic);
  totalXP += xp;
  completedTopics.add(card.topic);
}

// 2. Classification from training
const classification = classify({ signals });

// 3. Axes Phase
const axesResponses = getUserAxesResponses(AXES_QUESTIONS);
const axes = normalizeAxesResponse(axesResponses);
const hexagram = deriveHexagramReading(axes);

// 4. Build Complete Genome
const genome: TasteGenome = {
  // ... standard fields
  archetype: classification,
  axes,
  iching: {
    present: toPublicHexagram(hexagram.present),
    transforming: hexagram.transforming ? toPublicHexagram(hexagram.transforming) : undefined,
    movingLines: hexagram.movingLines
  },
  keywords,
  gamification: {
    xp: totalXP,
    tier: calculateTier(totalXP),
    achievements: ['First Training', 'Hexagram Unlocked'],
    streak: 1,
    totalTrainings: 15
  },
  subtasteContext: {
    phase: classification.primary.designation.phase!,
    wuXingElement: classification.primary.designation.wuXingElement!,
    growthTarget: classification.primary.designation.growthTarget!,
    stressTarget: classification.primary.designation.stressTarget!
  }
};
```

---

## API Route Example

```typescript
// /api/v2/training/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateTrainingSignals, calculateTrainingXP } from '@subtaste/profiler';
import { updateKeywordScores } from '@subtaste/core';

export async function POST(req: NextRequest) {
  const { userId, cardId, bestId, worstId, card } = await req.json();

  // Fetch genome
  const genome = await getGenome(userId);

  // Generate signals
  const signals = generateTrainingSignals(card, { cardId, bestId, worstId });

  // Update keywords
  const bestOption = card.options.find(o => o.id === bestId);
  const worstOption = card.options.find(o => o.id === worstId);

  let keywords = genome.keywords;
  keywords = updateKeywordScores(keywords, bestOption.text, 1.6, 'positive');
  keywords = updateKeywordScores(keywords, worstOption.text, 1.6, 'negative');

  // Update gamification
  const completedTopics = getCompletedTopics(genome);
  const xpGained = calculateTrainingXP(completedTopics, card.topic);

  genome.gamification = genome.gamification || { xp: 0, tier: 0, achievements: [], streak: 0, totalTrainings: 0 };
  genome.gamification.xp += xpGained;
  genome.gamification.totalTrainings += 1;
  genome.keywords = keywords;

  // Save genome
  await saveGenome(genome);

  return NextResponse.json({
    xpGained,
    totalXP: genome.gamification.xp,
    tier: calculateTier(genome.gamification.xp),
    keywords: {
      attracted: getAttractedKeywords(keywords, 5),
      repelled: getRepelledKeywords(keywords, 5)
    }
  });
}
```

---

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { deriveHexagramReading } from '@subtaste/core';

describe('I-Ching Derivation', () => {
  it('derives hexagram from balanced axes', () => {
    const axes = {
      orderChaos: 0.5,
      mercyRuthlessness: 0.5,
      introvertExtrovert: 0.5,
      faithDoubt: 0.5
    };

    const reading = deriveHexagramReading(axes);

    // Line 5 = avg(0.5, 0.5) = 0.5 → yang
    // Line 6 = avg(0.5, 0.5) = 0.5 → yang
    expect(reading.present.lines).toEqual([
      true, true, true, true, true, true
    ]);
    expect(reading.present.number).toBe(1); // The Creative
  });

  it('detects moving lines near threshold', () => {
    const axes = {
      orderChaos: 0.51,  // Near threshold
      mercyRuthlessness: 0.8,
      introvertExtrovert: 0.2,
      faithDoubt: 0.9
    };

    const reading = deriveHexagramReading(axes);
    expect(reading.movingLines).toContain(1); // Line 1 is moving
  });
});
```

---

## Notes

- All new fields in TasteGenome are **optional** for backwards compatibility
- Axes values are **always 0-1 range** (use sliders, not discrete choices)
- Training cards are **auto-grouped by topic** (ensures 4 options per card)
- Hexagram derivation is **deterministic** (same axes = same hexagram)
- Keywords accumulate **over time** (scores can be positive or negative)

---

## See Also

- `/IMPLEMENTATION_STATUS.md` - Full implementation details
- Plan document in conversation context
- Source files: Slayt and Boveda repos
