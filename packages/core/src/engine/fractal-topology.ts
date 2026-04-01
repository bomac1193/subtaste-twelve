/**
 * Eglash Fractal Topology Engine
 *
 * Based on Ron Eglash's "African Fractals: Modern Computing and Indigenous Design"
 * (Rutgers, 1999), particularly the Ba-ila settlement recursive structure (Ch. 2).
 *
 * Each archetype is positioned in a 2D fractal parameter space:
 * - depth (d): recursive self-similarity depth (1-4). Higher = more layered perception.
 * - branching (n): connection factor per level (1-8). Higher = wider creative reach.
 *
 * The fractal "area" (d * n) represents total creative bandwidth.
 * Relationships between archetypes are geometric operations in this space.
 *
 * Growth: movement toward greater depth (deepening perception)
 * Stress: movement toward lower branching (constriction, narrowing)
 * Complement: large distance in the space (covers each other's blind spots)
 * Harmonic: similar fractal area d*n (natural resonance despite different shape)
 * Tension: same branching, different depth (compete for connective bandwidth)
 */

import type { Designation } from '../types';

// ---------------------------------------------------------------------------
// Fractal Coordinates
// ---------------------------------------------------------------------------

export interface FractalCoordinate {
  depth: number;      // 1-4: recursive self-similarity depth
  branching: number;  // 1-8: connections per recursive level
}

/**
 * Fractal coordinates for each archetype.
 * Assigned to be consistent with existing growth/stress paths:
 * - Growth target has equal or greater depth
 * - Stress target has lower branching
 */
export const FRACTAL_COORDINATES: Record<Designation, FractalCoordinate> = {
  'S-0': { depth: 4, branching: 3 },  // Θ Keth: deep perception, focused connections
  'T-1': { depth: 3, branching: 5 },  // Σ Strata: layered systems, wide architecture
  'V-2': { depth: 4, branching: 2 },  // Δ Omen: deepest sensing, narrow but profound
  'L-3': { depth: 2, branching: 4 },  // Λ Silt: patient accumulation, moderate spread
  'C-4': { depth: 3, branching: 2 },  // Ξ Cull: selective depth, pruned connections
  'N-5': { depth: 3, branching: 6 },  // ∇ Limn: moderate depth, widest integration
  'H-6': { depth: 2, branching: 7 },  // Φ Toll: shallow depth, maximum broadcast
  'P-7': { depth: 4, branching: 4 },  // Ω Vault: deep archival, moderate connections
  'D-8': { depth: 4, branching: 1 },  // Ψ Wick: deepest recursion, pure channel
  'F-9': { depth: 1, branching: 7 },  // Π Anvil: minimal recursion, maximum output
  'R-10': { depth: 2, branching: 3 }, // Γ Schism: surface fracture, moderate spread
  'Ø':    { depth: 1, branching: 1 }, // Ø Void: minimal everything, empty vessel
};

// ---------------------------------------------------------------------------
// Distance and Similarity Metrics
// ---------------------------------------------------------------------------

/**
 * Euclidean distance in fractal space (normalized 0-1)
 */
function fractalDistance(a: FractalCoordinate, b: FractalCoordinate): number {
  const maxDist = Math.sqrt(9 + 49); // max possible: (4-1)^2 + (8-1)^2
  const dist = Math.sqrt(
    Math.pow(a.depth - b.depth, 2) +
    Math.pow(a.branching - b.branching, 2)
  );
  return dist / maxDist;
}

/**
 * Fractal area: total creative bandwidth
 */
function fractalArea(coord: FractalCoordinate): number {
  return coord.depth * coord.branching;
}

/**
 * Area similarity (0-1): how close two archetypes are in total bandwidth
 * despite potentially different shapes
 */
function areaSimilarity(a: FractalCoordinate, b: FractalCoordinate): number {
  const areaA = fractalArea(a);
  const areaB = fractalArea(b);
  const maxArea = 4 * 8; // theoretical max
  return 1 - Math.abs(areaA - areaB) / maxArea;
}

/**
 * Depth difference (signed): positive means b has more depth than a
 */
function depthDelta(a: FractalCoordinate, b: FractalCoordinate): number {
  return b.depth - a.depth;
}

/**
 * Branching difference (signed): positive means b has more branching
 */
function branchingDelta(a: FractalCoordinate, b: FractalCoordinate): number {
  return b.branching - a.branching;
}

// ---------------------------------------------------------------------------
// Compatibility Scores
// ---------------------------------------------------------------------------

export interface CompatibilityResult {
  /** Overall compatibility (0-1). Higher = better pairing. */
  overall: number;
  /** How well they cover each other's blind spots (0-1) */
  complement: number;
  /** How much b helps a grow (0-1). Asymmetric. */
  growth: number;
  /** How much natural friction exists (0-1). Higher = more tension. */
  tension: number;
  /** How naturally they resonate (0-1). Similar bandwidth, different shape. */
  harmonic: number;
  /** Human-readable summary */
  summary: string;
  /** Relationship type label */
  relationship: 'complement' | 'growth-pair' | 'harmonic' | 'tension-pair' | 'neutral';
}

/**
 * Compute full compatibility between two archetypes.
 *
 * The algorithm uses fractal geometry:
 * - Complement: large distance in (d,n) space = covers different territory
 * - Growth: b has greater depth than a = b deepens a's perception
 * - Tension: same branching, different depth = compete for connection bandwidth
 * - Harmonic: similar d*n area despite different shape = natural resonance
 */
export function computeCompatibility(
  a: Designation,
  b: Designation
): CompatibilityResult {
  if (a === b) {
    return {
      overall: 0.5,
      complement: 0,
      growth: 0,
      tension: 0,
      harmonic: 1,
      summary: 'Same archetype. Perfect resonance, zero complement.',
      relationship: 'neutral'
    };
  }

  const coordA = FRACTAL_COORDINATES[a];
  const coordB = FRACTAL_COORDINATES[b];

  // Complement: distance in fractal space (further apart = more complementary)
  const complement = fractalDistance(coordA, coordB);

  // Growth: how much b deepens a (positive depth delta, normalized)
  const dDepth = depthDelta(coordA, coordB);
  const growth = Math.max(0, dDepth) / 3; // max depth delta is 3

  // Tension: same branching direction, inversely related to branching difference
  const branchDiff = Math.abs(coordA.branching - coordB.branching);
  const tension = branchDiff <= 1
    ? 0.8 - (Math.abs(coordA.depth - coordB.depth) * 0.2)
    : Math.max(0, 0.4 - branchDiff * 0.08);

  // Harmonic: similar total area (d*n) despite different shape
  const harmonic = areaSimilarity(coordA, coordB);

  // Overall: weighted combination
  // High complement + high harmonic = best pairing (different shape, similar power)
  // High tension reduces overall
  const overall = (
    complement * 0.35 +
    growth * 0.15 +
    harmonic * 0.35 -
    Math.max(0, tension - 0.5) * 0.15
  );

  // Determine relationship type
  let relationship: CompatibilityResult['relationship'];
  let summary: string;

  if (complement > 0.6) {
    relationship = 'complement';
    summary = `Strong complement. ${getGlyphName(a)} and ${getGlyphName(b)} cover each other's blind spots in the fractal space.`;
  } else if (growth > 0.5) {
    relationship = 'growth-pair';
    summary = `Growth pairing. ${getGlyphName(b)} deepens ${getGlyphName(a)}'s perceptual recursion.`;
  } else if (harmonic > 0.8 && complement > 0.3) {
    relationship = 'harmonic';
    summary = `Harmonic resonance. Similar creative bandwidth through different shapes.`;
  } else if (tension > 0.6) {
    relationship = 'tension-pair';
    summary = `Tension pairing. Compete for similar connective bandwidth. Productive friction.`;
  } else {
    relationship = 'neutral';
    summary = `Neutral relationship. Neither strongly complementary nor antagonistic.`;
  }

  return {
    overall: Math.max(0, Math.min(1, overall)),
    complement,
    growth,
    tension: Math.max(0, Math.min(1, tension)),
    harmonic,
    summary,
    relationship
  };
}

// Helper to get glyph name for summaries
function getGlyphName(d: Designation): string {
  const names: Record<Designation, string> = {
    'S-0': 'Keth', 'T-1': 'Strata', 'V-2': 'Omen', 'L-3': 'Silt',
    'C-4': 'Cull', 'N-5': 'Limn', 'H-6': 'Toll', 'P-7': 'Vault',
    'D-8': 'Wick', 'F-9': 'Anvil', 'R-10': 'Schism', 'Ø': 'Void'
  };
  return names[d] || d;
}

// ---------------------------------------------------------------------------
// Team Composition
// ---------------------------------------------------------------------------

export interface TeamAnalysis {
  /** Overall team balance (0-1). 1 = perfectly balanced coverage of fractal space. */
  balance: number;
  /** Average fractal area of the team */
  averageBandwidth: number;
  /** Depth coverage: range of recursive depths represented */
  depthCoverage: number;
  /** Branching coverage: range of connection styles represented */
  branchingCoverage: number;
  /** Identified gaps: archetypes that would most improve the team */
  gaps: Designation[];
  /** Pairwise compatibility matrix */
  pairwise: Array<{ a: Designation; b: Designation; compatibility: CompatibilityResult }>;
  /** Shannon entropy of the team's fractal distribution */
  entropy: number;
}

/**
 * Analyze a team's composition using fractal topology.
 *
 * A well-balanced team covers the fractal space evenly:
 * - Mix of depth levels (deep perceivers + surface actors)
 * - Mix of branching factors (focused specialists + wide integrators)
 * - Low redundancy (team members occupy different regions)
 */
export function analyzeTeam(members: Designation[]): TeamAnalysis {
  if (members.length === 0) {
    return {
      balance: 0,
      averageBandwidth: 0,
      depthCoverage: 0,
      branchingCoverage: 0,
      gaps: ['S-0', 'N-5', 'F-9', 'Ø'] as Designation[],
      pairwise: [],
      entropy: 0
    };
  }

  const coords = members.map(m => FRACTAL_COORDINATES[m]);

  // Coverage metrics
  const depths = coords.map(c => c.depth);
  const branches = coords.map(c => c.branching);
  const depthCoverage = (Math.max(...depths) - Math.min(...depths)) / 3;
  const branchingCoverage = (Math.max(...branches) - Math.min(...branches)) / 7;
  const averageBandwidth = coords.reduce((sum, c) => sum + fractalArea(c), 0) / coords.length;

  // Shannon entropy of position distribution (binned into 4 quadrants)
  const quadrants = [0, 0, 0, 0]; // [low-d/low-n, low-d/high-n, high-d/low-n, high-d/high-n]
  for (const c of coords) {
    const qi = (c.depth > 2 ? 2 : 0) + (c.branching > 4 ? 1 : 0);
    quadrants[qi]!++;
  }
  const total = coords.length;
  let entropy = 0;
  for (const q of quadrants) {
    if (q > 0) {
      const p = q / total;
      entropy -= p * Math.log2(p);
    }
  }
  const maxEntropy = Math.log2(4); // max when evenly distributed across 4 quadrants
  const normalizedEntropy = entropy / maxEntropy;

  // Balance = combination of coverage metrics
  const balance = (depthCoverage * 0.3 + branchingCoverage * 0.3 + normalizedEntropy * 0.4);

  // Pairwise compatibility
  const pairwise: TeamAnalysis['pairwise'] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      pairwise.push({
        a: members[i]!,
        b: members[j]!,
        compatibility: computeCompatibility(members[i]!, members[j]!)
      });
    }
  }

  // Find gaps: which quadrants are unrepresented?
  const allDesignations: Designation[] = [
    'S-0', 'T-1', 'V-2', 'L-3', 'C-4', 'N-5',
    'H-6', 'P-7', 'D-8', 'F-9', 'R-10', 'Ø'
  ];
  const memberSet = new Set(members);

  // Score each non-member by how much they'd improve balance
  const gapScores = allDesignations
    .filter(d => !memberSet.has(d))
    .map(d => {
      const coord = FRACTAL_COORDINATES[d];
      // How far is this archetype from the team centroid?
      const centroidD = depths.reduce((a, b) => a + b, 0) / depths.length;
      const centroidN = branches.reduce((a, b) => a + b, 0) / branches.length;
      const distFromCentroid = Math.sqrt(
        Math.pow(coord.depth - centroidD, 2) +
        Math.pow(coord.branching - centroidN, 2)
      );
      return { designation: d, score: distFromCentroid };
    })
    .sort((a, b) => b.score - a.score);

  const gaps = gapScores.slice(0, 3).map(g => g.designation);

  return {
    balance,
    averageBandwidth,
    depthCoverage,
    branchingCoverage,
    gaps,
    pairwise,
    entropy: normalizedEntropy
  };
}

// ---------------------------------------------------------------------------
// Bayesian Confidence
// ---------------------------------------------------------------------------

/**
 * Compute Shannon entropy of an archetype distribution.
 * Returns 0-1 where 0 = maximally sharp (one archetype dominates)
 * and 1 = maximally flat (uniform distribution).
 *
 * This replaces the arbitrary "80 signals" threshold with a
 * mathematically grounded measure of classification certainty.
 */
export function distributionEntropy(
  distribution: Record<Designation, number>
): number {
  const values = Object.values(distribution).filter(v => v > 0);
  if (values.length <= 1) return 0;

  const total = values.reduce((a, b) => a + b, 0);
  let entropy = 0;
  for (const v of values) {
    const p = v / total;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }

  const maxEntropy = Math.log2(values.length);
  return maxEntropy > 0 ? entropy / maxEntropy : 0;
}

/**
 * Determine if a profile is "sharp" enough to be meaningful.
 * Uses entropy threshold instead of raw signal count.
 *
 * Returns:
 * - 'forming': entropy > 0.92 (nearly uniform, needs more data)
 * - 'emerging': entropy 0.85-0.92 (some differentiation visible)
 * - 'defined': entropy 0.7-0.85 (clear primary archetype)
 * - 'crystallized': entropy < 0.7 (strong, stable classification)
 */
export function profileSharpness(
  distribution: Record<Designation, number>
): 'forming' | 'emerging' | 'defined' | 'crystallized' {
  const ent = distributionEntropy(distribution);
  if (ent > 0.92) return 'forming';
  if (ent > 0.85) return 'emerging';
  if (ent > 0.7) return 'defined';
  return 'crystallized';
}

// ---------------------------------------------------------------------------
// Cross-Domain Coherence (Kuramoto-inspired)
// ---------------------------------------------------------------------------

/**
 * Compute coherence between distributions from different calibration domains.
 * Inspired by Kuramoto coupling model (already used in Feedback project).
 *
 * Two distributions from different domains (e.g., sound vs. visual) are
 * treated as oscillator phases. Their coupling strength indicates how
 * coherent someone's creative taste is across modalities.
 *
 * Returns 0-1 where:
 * - 1 = identical distributions across domains (perfectly coherent taste)
 * - 0 = orthogonal distributions (different archetype per domain)
 */
export function crossDomainCoherence(
  distributionA: Record<Designation, number>,
  distributionB: Record<Designation, number>
): number {
  const designations: Designation[] = [
    'S-0', 'T-1', 'V-2', 'L-3', 'C-4', 'N-5',
    'H-6', 'P-7', 'D-8', 'F-9', 'R-10', 'Ø'
  ];

  // Treat each distribution as a unit vector in 12D archetype space
  // Coherence = cosine similarity
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const d of designations) {
    const a = distributionA[d] || 0;
    const b = distributionB[d] || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Compute the Kuramoto order parameter for multiple domain distributions.
 * This is the magnitude of the mean "phase vector" across all domains.
 *
 * High order parameter (close to 1) = all domains produce similar archetype
 * profiles. The person's creative taste is coherent across modalities.
 *
 * Low order parameter (close to 0) = different domains produce different
 * profiles. The person may be a "domain specialist" or needs more calibration.
 */
export function kuramotoOrderParameter(
  distributions: Record<Designation, number>[]
): number {
  if (distributions.length <= 1) return 1;

  let totalCoherence = 0;
  let pairs = 0;

  for (let i = 0; i < distributions.length; i++) {
    for (let j = i + 1; j < distributions.length; j++) {
      totalCoherence += crossDomainCoherence(distributions[i]!, distributions[j]!);
      pairs++;
    }
  }

  return pairs > 0 ? totalCoherence / pairs : 1;
}
