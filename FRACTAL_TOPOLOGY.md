# Fractal Topology Engine

Technical documentation for `packages/core/src/engine/fractal-topology.ts`.

---

## 1. The Problem with Signal Counts

Most classification systems gate on raw counts: "collect 80 signals, then classify." This is wrong for two reasons.

First, 80 uniform signals carry zero information. A user who distributes activity evenly across all 12 archetypes after 200 signals is *less* classifiable than a user who concentrates on two archetypes after 20. The count measures effort, not differentiation.

Second, thresholds are arbitrary. Why 80 and not 60 or 120? There is no theoretical basis. The real question is whether the *distribution* has peaked -- whether one or two archetypes have pulled away from the pack. That is an information-theoretic question, not an arithmetic one.

The engine replaces signal counts with Shannon entropy (Section 5) and replaces linear scoring with fractal geometry (Sections 2-4).

---

## 2. Eglash Fractal Topology

Ron Eglash's *African Fractals: Modern Computing and Indigenous Design* (Rutgers, 1999) documents recursive self-similar structures in African architecture, art, and settlement planning. Chapter 2 analyzes the Ba-ila settlement of southern Zambia, where the village layout repeats at multiple scales: the chief's enclosure contains a smaller version of the village plan, which contains smaller versions in turn. The structure is parameterized by two values: **recursive depth** (how many levels of self-similarity) and **branching factor** (how many sub-structures at each level).

The engine maps each of the 12 archetypes to coordinates `(d, n)` in this fractal parameter space:

- **depth** `d` (1--4): Recursive self-similarity depth. Higher depth = more layered perception. An archetype at `d=4` processes information through four nested levels of abstraction. An archetype at `d=1` operates on surface structure.
- **branching** `n` (1--8): Connections per recursive level. Higher branching = wider creative reach. An archetype at `n=7` maintains many simultaneous connections. An archetype at `n=1` is a pure channel.

The product `d * n` is the **fractal area** -- total creative bandwidth. Two archetypes can have similar bandwidth through different shapes (deep-and-narrow vs. shallow-and-wide).

### Archetype Coordinate Table

| Key | Symbol | Glyph | Depth (d) | Branching (n) | Area (d*n) |
|------|--------|---------|-----------|---------------|------------|
| S-0  | Theta    | Keth    | 4         | 3             | 12         |
| T-1  | Sigma    | Strata  | 3         | 5             | 15         |
| V-2  | Delta    | Omen    | 4         | 2             | 8          |
| L-3  | Lambda   | Silt    | 2         | 4             | 8          |
| C-4  | Xi       | Cull    | 3         | 2             | 6          |
| N-5  | Nabla    | Limn    | 3         | 6             | 18         |
| H-6  | Phi      | Toll    | 2         | 7             | 14         |
| P-7  | Omega    | Vault   | 4         | 4             | 16         |
| D-8  | Psi      | Wick    | 4         | 1             | 4          |
| F-9  | Pi       | Anvil   | 1         | 7             | 7          |
| R-10 | Gamma    | Schism  | 2         | 3             | 6          |
| null   | null       | Void    | 1         | 1             | 1          |

Coordinates are assigned so that existing growth paths move toward greater depth and stress paths move toward lower branching. Relationships between archetypes become geometric operations in this 2D space.

---

## 3. Compatibility Algorithm

Given two archetypes `a` and `b` with coordinates `(d_a, n_a)` and `(d_b, n_b)`, four sub-scores are computed:

### Complement (distance)

Euclidean distance in `(d, n)` space, normalized to `[0, 1]`:

```
complement = sqrt((d_a - d_b)^2 + (n_a - n_b)^2) / sqrt(3^2 + 7^2)
```

The denominator `sqrt(58)` is the maximum possible distance (depth range 1--4, branching range 1--8). High complement means the pair covers each other's blind spots.

### Growth (depth delta)

How much `b` deepens `a`'s perception. Asymmetric -- only positive depth differences count:

```
growth = max(0, d_b - d_a) / 3
```

Normalized by the maximum depth delta of 3. A Wick (`d=4`) contributes zero growth to a Vault (`d=4`) but maximum growth to an Anvil (`d=1`).

### Tension (branching collision)

Archetypes with similar branching compete for connective bandwidth:

```
if |n_a - n_b| <= 1:
    tension = 0.8 - |d_a - d_b| * 0.2
else:
    tension = max(0, 0.4 - |n_a - n_b| * 0.08)
```

Tension is highest when branching is nearly identical (within 1) and decreases as the branching gap widens. When branching matches, different depths slightly reduce tension.

### Harmonic (area similarity)

Natural resonance from similar total bandwidth despite different shape:

```
harmonic = 1 - |d_a * n_a - d_b * n_b| / 32
```

The denominator 32 is the theoretical maximum area (`4 * 8`). Silt `(2,4)` and Omen `(4,2)` are a perfect harmonic pair: both have area 8, totally different shapes.

### Overall Score

```
overall = complement * 0.35
        + growth * 0.15
        + harmonic * 0.35
        - max(0, tension - 0.5) * 0.15
```

Complement and harmonic dominate (0.35 each). Growth adds modest directional value (0.15). Tension only penalizes when it exceeds 0.5 -- mild tension is not harmful. The result is clamped to `[0, 1]`.

The relationship is labeled by thresholds: `complement > 0.6` = "complement", `growth > 0.5` = "growth-pair", `harmonic > 0.8 && complement > 0.3` = "harmonic", `tension > 0.6` = "tension-pair", else "neutral". These are evaluated in priority order.

---

## 4. Team Analysis

`analyzeTeam()` takes an array of archetype designations and returns:

**Coverage metrics.** Depth coverage is the range of depths present, normalized by 3 (max range). Branching coverage is the range of branching factors, normalized by 7. Average bandwidth is the mean `d * n` across the team.

**Shannon entropy of quadrant distribution.** The `(d, n)` space is partitioned into four quadrants by the thresholds `d > 2` and `n > 4`:

| Quadrant | Region |
|----------|--------|
| 0 | Low depth, low branching |
| 1 | Low depth, high branching |
| 2 | High depth, low branching |
| 3 | High depth, high branching |

Entropy is computed over the quadrant occupation counts (see Section 5 for the formula) and normalized by `log2(4) = 2`. A perfectly balanced team has one member per quadrant and entropy = 1.

**Balance** combines all three:

```
balance = depthCoverage * 0.3 + branchingCoverage * 0.3 + normalizedEntropy * 0.4
```

**Gap detection.** For each archetype not on the team, compute its Euclidean distance from the team centroid. The three most distant archetypes are reported as gaps -- they would maximally diversify the team's coverage.

**Pairwise compatibility matrix.** All `n*(n-1)/2` pairs are evaluated via `computeCompatibility()`.

---

## 5. Shannon Entropy for Profile Sharpness

`distributionEntropy()` computes normalized Shannon entropy over an archetype probability distribution. Given signal counts `{c_1, ..., c_k}` for archetypes with nonzero activity:

```
p_i = c_i / sum(c)
H = -sum(p_i * log2(p_i))
H_normalized = H / log2(k)
```

where `k` is the number of archetypes with any signal. The result is in `[0, 1]`:
- `H_normalized = 0`: all signals concentrate on one archetype (maximally sharp).
- `H_normalized = 1`: signals are uniformly distributed (maximally flat, no classification).

`profileSharpness()` maps entropy to four stages:

| Entropy Range | Stage | Interpretation |
|---------------|-------|----------------|
| > 0.92 | forming | Nearly uniform. No differentiation visible. |
| 0.85 -- 0.92 | emerging | Some peaks appearing. |
| 0.70 -- 0.85 | defined | Clear primary archetype. |
| < 0.70 | crystallized | Strong, stable classification. |

**Why these thresholds.** For 12 archetypes, `H_max = log2(12) ~ 3.585`. An entropy of 0.92 means the distribution is within 8% of uniform -- statistically indistinguishable from noise. At 0.70, the leading archetype commands roughly 2--3x the share of the runner-up, enough for a reliable primary classification. Below 0.70, the profile is stable under perturbation.

This matters because a user with 200 signals at `H = 0.95` is less classifiable than a user with 30 signals at `H = 0.60`. Entropy measures what we actually care about: has the distribution converged?

---

## 6. Kuramoto Coherence

The Kuramoto model (Yoshiki Kuramoto, 1975) describes synchronization of coupled oscillators. The **order parameter** `r` measures how synchronized a population is: `r = 1` means full phase lock, `r = 0` means incoherent.

The engine adapts this for cross-domain taste coherence. A user may be calibrated through multiple domains -- sound, visuals, text, behavior. Each domain produces its own archetype distribution (a vector in 12D archetype space). The question: does the user's taste converge to the same profile regardless of domain?

### `crossDomainCoherence(A, B)`

Cosine similarity between two distribution vectors:

```
coherence = (A . B) / (|A| * |B|)
```

where `A` and `B` are 12-dimensional vectors of archetype scores. Result in `[0, 1]` (distributions are non-negative, so cosine similarity cannot go negative):
- `1` = identical archetype profiles across both domains.
- `0` = orthogonal profiles (completely different archetypes activated).

### `kuramotoOrderParameter(distributions[])`

The order parameter across `N` domains is the mean pairwise coherence:

```
r = (2 / N(N-1)) * sum_{i<j} crossDomainCoherence(D_i, D_j)
```

This is the scalar magnitude of the mean coupling. High `r` (close to 1) means the user's creative taste is coherent across modalities -- sound, visuals, and text all point to the same archetype structure. Low `r` (close to 0) suggests domain-specific taste or insufficient calibration data.

For a single domain, `r = 1` by definition.

---

## 7. Integration

These components compose into the Subtaste profiling pipeline:

1. **Signals arrive** from calibration (explicit choices) and behavioral tracking (implicit signals). Each signal is weighted and accumulated into an archetype distribution `Record<Designation, number>`.

2. **Entropy check.** `profileSharpness()` determines whether the distribution has converged. If `forming`, the system requests more calibration. If `crystallized`, the primary/secondary archetypes are stable.

3. **Classification.** The primary archetype is the distribution's argmax. The secondary is the runner-up (if its share exceeds a confidence threshold). Both are positioned in `(d, n)` fractal space via `FRACTAL_COORDINATES`.

4. **Compatibility.** When comparing two users, `computeCompatibility()` computes complement, growth, tension, and harmonic scores from their archetype coordinates. This drives collaboration suggestions, team formation, and relationship mapping.

5. **Team analysis.** `analyzeTeam()` evaluates group composition: coverage of the fractal space, balance across quadrants, and gap identification for recruitment.

6. **Cross-domain coherence.** When distributions exist for multiple calibration domains, `kuramotoOrderParameter()` measures whether the user's taste is modality-independent. High coherence increases classification confidence; low coherence flags the need for domain-specific profiles.

The three theoretical foundations -- Eglash (geometry of archetype space), Shannon (convergence measurement), Kuramoto (cross-domain coupling) -- replace what would otherwise be ad hoc thresholds and arbitrary formulas with operations grounded in information theory, fractal geometry, and dynamical systems.

---

*Source: `packages/core/src/engine/fractal-topology.ts`*
*References: Eglash, R. (1999). African Fractals: Modern Computing and Indigenous Design. Rutgers University Press. Shannon, C.E. (1948). A Mathematical Theory of Communication. Bell System Technical Journal. Kuramoto, Y. (1975). Self-entrainment of a population of coupled non-linear oscillators. Lecture Notes in Physics, 39.*
