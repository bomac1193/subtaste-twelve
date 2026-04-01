# The Twelve - Symbol System Architecture

## Overview
Three-layer identity system: Mathematical Operators (Layer 1), Fractal Topology (Layer 2), Nsibidi/Adinkra Visual Marks (Layer 3).

## Layer 1: Greek/Mathematical Operators (IMPLEMENTED)
Designations now use mathematical symbols with functional meaning:

| Symbol | Name | Mathematical Meaning | Archetype Function |
|--------|------|---------------------|-------------------|
| Θ (theta) | Keth | Angle of rotation, phase shift | Reorients perspective |
| Σ (sigma) | Strata | Summation, accumulation | Layers and builds |
| Δ (delta) | Omen | Change, difference | Senses what's shifting |
| Λ (lambda) | Silt | Abstraction, function | Filters and distills |
| Ξ (xi) | Cull | Selection, partition | Separates signal from noise |
| ∇ (nabla) | Limn | Gradient, edge detection | Illuminates boundaries |
| Φ (phi) | Toll | Golden ratio, harmony | Finds natural proportion |
| Ω (omega) | Vault | Limit, completion, archive | Preserves and stores |
| Ψ (psi) | Wick | Wave function, channelling | Conducts energy |
| Π (pi) | Anvil | Product, multiplication | Forges and transforms |
| Γ (gamma) | Schism | Boundary, interface | Fractures and recombines |
| Ø | Void | Null set | The empty vessel |

Each symbol was chosen for functional correspondence: nabla (∇) IS gradient/edge detection, which IS what Limn does. Not decorative - structural.

## Layer 2: Eglash Fractal Topology (IMPLEMENTED)
Based on Ron Eglash's "African Fractals" (Ch. 2-5), particularly Ba-ila settlement recursive structure.

Each archetype has fractal coordinates (depth, branching) that define a mathematical space. Relationships between archetypes (growth, stress, compatibility) are geometric operations in this space, not hand-designed lookup tables.

- Growth paths follow increasing fractal depth (more self-similar complexity)
- Stress paths follow decreasing branching (constriction, narrowing)
- Compatibility is computed from coordinate distance and product
- Team composition optimizes for complementary coverage of the fractal space

Reference: Eglash, R. (1999). African Fractals: Modern Computing and Indigenous Design. Rutgers University Press. Chapters 2 (Ba-ila settlements), 3 (Fractal architecture), 5 (Recursive generation).

Also: ~/Feedback/eglash_reference/ for local reference material.

## Layer 3: Nsibidi/Adinkra Visual Marks (FUTURE - COMMISSION)

### Brief for Artist/Designer

**What we need**: 12 visual marks (glyphs/symbols), one for each archetype, inspired by West African ideographic traditions.

**Primary references**:
- Nsibidi: Igbo/Efik ideographic system. Abstract symbols carrying semantic meaning. Not pictographic - conceptual.
- Adinkra: Akan visual symbols, each encoding a proverb or concept. Stamped on cloth.
- Lusona: Chokwe sand drawings (Gerdes "Lunda Geometry"). Single continuous line creating complex symmetric patterns.

**What each mark should convey**:

| Symbol | Name | Seal | Visual Direction |
|--------|------|------|-----------------|
| Θ | Keth | "The throne that does not announce" | Authority without display. A contained form. |
| Σ | Strata | "Layer beneath layer beneath layer" | Visible stratification. Sedimentary. |
| Δ | Omen | "What arrives before itself" | Forward-pointing, anticipatory. |
| Λ | Silt | "What accumulates in darkness" | Dense, settled, grounded. |
| Ξ | Cull | "The necessary cut" | Severing, partitioning. Clean lines. |
| ∇ | Limn | "The edge that reveals" | Boundary, outline, gradient. |
| Φ | Toll | "The bell that cannot be unheard" | Radiating, resonant. |
| Ω | Vault | "Writing over writing over writing" | Layered, archival, palimpsestic. |
| Ψ | Wick | "The hollow channel" | Vertical, channelling, hollow. |
| Π | Anvil | "Where pressure becomes form" | Dense, compressed, productive. |
| Γ | Schism | "What breaks to reveal grain" | Fractured, split, revealing internal structure. |
| Ø | Void | "What receives by containing nothing" | Empty, receptive, circular. |

**Constraints**:
1. Each mark must work at 16px (favicon), 64px (profile badge), and 512px (full display)
2. Single color (bone on void, or inverse). No gradients or fills.
3. Must be drawable in a single continuous stroke if possible (lusona principle)
4. Should NOT be literal representations - abstract/conceptual like Nsibidi
5. Should feel like they were discovered in an archaeological dig, not designed in Figma

**Style references**:
- Victor Ekpuk (contemporary Nsibidi-inspired art)
- Owusu-Ankomah (Adinkra in contemporary painting)
- The existing Feedback project lusona visualizations (~/Feedback/td/)
- Kentridge's process marks (erasure as meaning)

**Format**: SVG, with a single `<path>` element per mark. Delivered as a font file (OTF) mapped to the Greek symbol Unicode points AND as individual SVGs.

**Budget guidance**: Commission from African diaspora artist with knowledge of these traditions. Not a generic "tribal pattern" freelancer. Someone who understands the semantic layer of Nsibidi/Adinkra.

### Integration Plan
Once commissioned, each mark becomes:
- The visual component of the Seal (displayed alongside the operative phrase)
- A profile badge element
- A favicon variant per archetype
- A watermark on exported profile cards

## Seal Naming Convention

Renamed from "Sigil" (European grimoire connotation) to "Seal" (cross-cultural: Yoruba ase, Islamic khatam, Chinese yin, African royal seals).

Seal text changed from Latin proper nouns (Aethonis, Nexilis, etc.) to operative phrases in the tradition of African proverbs (Akan Adinkra, Yoruba owe, Igbo ilu):

| Old Sigil | New Seal |
|-----------|----------|
| Aethonis | The throne that does not announce |
| Tectris | Layer beneath layer beneath layer |
| Vatis | What arrives before itself |
| Seris | What accumulates in darkness |
| Severis | The necessary cut |
| Nexilis | The edge that reveals |
| Voxis | The bell that cannot be unheard |
| Palimpsest | Writing over writing over writing |
| Siphis | The hollow channel |
| Crucis | Where pressure becomes form |
| Apostis | What breaks to reveal grain |
| Lacuna | What receives by containing nothing |

## Theoretical Foundations

### Why These Specific Theories

1. **Eglash Fractals** - African mathematical tradition that predates European fractal mathematics by centuries. Ba-ila settlements demonstrate recursive self-similarity. Our archetype topology uses the same (depth, branching) parameters.

2. **Greek Mathematical Operators** - Universal mathematical notation. Not culturally biased toward any tradition. Theta means phase rotation everywhere on Earth.

3. **Nsibidi/Adinkra** - The visual layer reclaims the aesthetic from European esotericism. These are actual writing systems with actual semantic depth, not decorative "tribal" patterns.

4. **Kuramoto Coupling** (future) - Cross-domain calibration as coupled oscillator synchronization. Already implemented in the Feedback project for music.

5. **Bayesian Updating** (future) - Replace softmax classification with proper Bayesian inference. Confidence becomes statistically meaningful.

6. **Shannon Entropy** (future) - Information-theoretic measure of profile sharpness. Replaces arbitrary signal count thresholds.
