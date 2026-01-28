# THE TWELVE

Taste genome profiling for the creative economy. A unified classification system that maps users to one of twelve archetypes based on psychometric traits and aesthetic preferences.

## Quick Start

```bash
# Install dependencies
pnpm install

# Run the web app
pnpm dev
# → http://localhost:3000
```

---

## Integration Guide

### Option 1: SDK (Recommended)

The SDK provides a type-safe client and React hooks for seamless integration.

```bash
# In your app's package.json, add:
"@subtaste/sdk": "workspace:*"
# Or if published to npm:
"@subtaste/sdk": "^0.1.0"
```

#### React Integration

```tsx
// app/providers.tsx
import { SubtasteProvider } from '@subtaste/sdk/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SubtasteProvider
      config={{ baseUrl: 'https://your-subtaste-api.com/api/v2' }}
      userId={getUserId()} // from your auth system
      autoFetch={true}
    >
      {children}
    </SubtasteProvider>
  );
}
```

```tsx
// components/UserGlyph.tsx
import { useGlyph } from '@subtaste/sdk/react';

export function UserGlyph() {
  const glyph = useGlyph(); // 'KETH' | 'STRATA' | 'OMEN' | ...

  if (!glyph) return null;
  return <span className="glyph">{glyph}</span>;
}
```

```tsx
// components/SaveButton.tsx
import { useSignals } from '@subtaste/sdk/react';

export function SaveButton({ itemId }: { itemId: string }) {
  const { recordSave } = useSignals();

  return (
    <button onClick={() => recordSave(itemId)}>
      Save
    </button>
  );
}
```

#### Available Hooks

| Hook | Returns | Description |
|------|---------|-------------|
| `useSubtaste()` | `{ genome, glyph, loading, error, refetch }` | Full genome data |
| `useGlyph()` | `Glyph \| null` | Just the glyph name |
| `useSignals()` | `{ recordSave, recordSkip, recordShare, ... }` | Behavioral signal recording |
| `useCalibration()` | `{ available, stage, startCalibration }` | Calibration state |

#### Non-React / Server-Side

```typescript
import { createClient } from '@subtaste/sdk';

const subtaste = createClient({
  baseUrl: 'https://your-subtaste-api.com/api/v2'
});

// Get user's glyph
const glyph = await subtaste.getGlyph(userId);
// → 'KETH' | 'STRATA' | 'OMEN' | ...

// Get full genome
const genome = await subtaste.getGenome(userId);
// → { archetype: { primary: { designation, glyph, confidence }, ... } }

// Record behavioral signals
await subtaste.recordSignals(userId, [
  { type: 'implicit', action: 'save', itemId: 'track-123' },
  { type: 'implicit', action: 'skip', itemId: 'track-456' },
]);

// Check calibration availability
const calibration = await subtaste.isCalibrationAvailable(userId);
// → { available: true, stage: 'music', reason: 'Eligible for music calibration' }
```

---

### Option 2: Direct API

If you can't use the SDK, call the REST API directly.

#### Base URL
```
https://your-subtaste-api.com/api/v2
```

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/quiz` | Submit initial quiz responses |
| `GET` | `/quiz?userId=xxx` | Get user progress |
| `GET` | `/genome/{userId}/public` | Get public genome data |
| `POST` | `/genome/{userId}/sigil` | Reveal user's sigil |
| `POST` | `/signals/{userId}` | Record behavioral signals |
| `POST` | `/calibration/{userId}/submit` | Submit calibration responses |

#### Example: Get User's Archetype

```typescript
// Any language - just HTTP
const response = await fetch(
  `https://your-subtaste-api.com/api/v2/genome/${userId}/public`
);
const data = await response.json();

console.log(data.archetype.primary.glyph);      // 'KETH'
console.log(data.archetype.primary.designation); // 'S-0'
console.log(data.archetype.primary.confidence);  // 0.82
```

#### Example: Record Signals

```typescript
await fetch(`https://your-subtaste-api.com/api/v2/signals/${userId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    signals: [
      { type: 'implicit', action: 'save', itemId: 'item-123' },
      { type: 'implicit', action: 'share', itemId: 'item-123' },
    ]
  })
});
```

**Signal Actions:** `save` | `skip` | `share` | `listen` | `dwell` | `scroll` | `replay`

---

### Option 3: Core Package (Advanced)

For deep integration or building your own API, use the core classification engine directly.

```typescript
import {
  classify,
  createGenome,
  PANTHEON,
  type Signal
} from '@subtaste/core';

// Classify from signals
const signals: Signal[] = [
  {
    type: 'explicit',
    source: 'quiz',
    timestamp: new Date(),
    data: {
      kind: 'choice',
      questionId: 'initial-1',
      value: 0,
      archetypeWeights: { 'S-0': 0.3, 'V-2': 0.2 }
    }
  }
];

const result = classify({ signals });
// → { classification: { primary: { designation: 'S-0', glyph: 'KETH', confidence: 0.78 } } }

// Look up archetype details
const archetype = PANTHEON[result.classification.primary.designation];
// → { glyph: 'KETH', sigil: 'Aethonis', essence: '...', creativeMode: '...', ... }
```

---

## The Twelve Archetypes

| Designation | Glyph | Sigil | Creative Mode |
|-------------|-------|-------|---------------|
| S-0 | KETH | Aethonis | Synaesthetic Fusion |
| T-1 | STRATA | Tectris | Layered Construction |
| V-2 | OMEN | Vatis | Prophetic Intuition |
| L-3 | LIMN | Lucidis | Illuminated Clarity |
| C-4 | CRYPT | Celathos | Hidden Architecture |
| N-5 | NOVA | Novaris | Explosive Genesis |
| H-6 | HUSK | Huskaros | Essential Reduction |
| P-7 | PRISM | Spectris | Refractive Analysis |
| D-8 | DRIFT | Derivian | Fluid Emergence |
| F-9 | FORGE | Pyrrhon | Transformative Heat |
| R-10 | RUNE | Glyphonis | Symbolic Encoding |
| Ø | NULL | Voidmark | Creative Negation |

---

## Progressive Profiling

The system uses three stages of profiling:

1. **Initial Spark** (3 questions) → Assigns primary Glyph
2. **Music Calibration** (3 questions) → Unlocks after 5 behavioral signals
3. **Deep Calibration** (5 questions) → Unlocks after music calibration

Each stage refines the classification confidence.

---

## Three-Tier Identity Reveal

Users discover their archetype progressively:

1. **Glyph** → Public identity (e.g., "KETH")
2. **Sigil** → Formal notation, revealed on request (e.g., "Aethonis")
3. **Designation** → Internal code for power users (e.g., "S-0")

---

## Project Structure

```
subtaste-twelve/
├── packages/
│   ├── core/           # Classification engine
│   │   ├── engine/     # classify(), reclassify()
│   │   ├── pantheon/   # THE TWELVE definitions
│   │   ├── genome/     # Genome schema & operations
│   │   └── types/      # TypeScript types
│   │
│   ├── profiler/       # Question banks
│   │   ├── instruments/  # Quiz instruments
│   │   ├── questions/    # Question definitions
│   │   └── progressive/  # Stage orchestration
│   │
│   └── sdk/            # Integration SDK
│       ├── client.ts   # API client
│       └── react/      # React hooks
│
└── apps/
    └── web/            # Next.js reference app
```

---

## Environment Variables

For production, set:

```env
# If using external database
DATABASE_URL=postgresql://...

# API base URL (for SDK consumers)
NEXT_PUBLIC_SUBTASTE_API=https://your-api.com/api/v2
```

---

## License

Private - VIOLET SPHINX ecosystem
