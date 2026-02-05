/**
 * @subtaste/core - I Ching Hexagram System
 *
 * All 64 hexagrams with derivation from personality axes.
 * Ported from Boveda's oripheon package.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Hexagram {
  number: number;
  name: string;
  chinese: string;
  image: string;
  judgment: string;
  lines: [boolean, boolean, boolean, boolean, boolean, boolean]; // bottom to top, true = yang
}

export interface HexagramReading {
  present: Hexagram;
  transforming: Hexagram | null;
  movingLines: number[]; // 1-indexed line positions that are moving
}

// ============================================================================
// ALL 64 HEXAGRAMS
// ============================================================================

const HEXAGRAMS: Hexagram[] = [
  { number: 1,  name: 'The Creative',        chinese: '乾', image: 'Heaven over Heaven',    judgment: 'Supreme success through perseverance.',                lines: [true, true, true, true, true, true] },
  { number: 2,  name: 'The Receptive',        chinese: '坤', image: 'Earth over Earth',      judgment: 'Devotion brings supreme success.',                      lines: [false, false, false, false, false, false] },
  { number: 3,  name: 'Difficulty at the Beginning', chinese: '屯', image: 'Water over Thunder', judgment: 'Perseverance furthers; appoint helpers.',           lines: [true, false, false, false, true, false] },
  { number: 4,  name: 'Youthful Folly',       chinese: '蒙', image: 'Mountain over Water',   judgment: 'The fool seeks me; I do not seek the fool.',           lines: [false, true, false, false, false, true] },
  { number: 5,  name: 'Waiting',              chinese: '需', image: 'Water over Heaven',     judgment: 'Sincerity brings brilliant success.',                   lines: [true, true, true, false, true, false] },
  { number: 6,  name: 'Conflict',             chinese: '訟', image: 'Heaven over Water',     judgment: 'Seek a great person; do not cross the great water.',    lines: [false, true, false, true, true, true] },
  { number: 7,  name: 'The Army',             chinese: '師', image: 'Earth over Water',      judgment: 'Perseverance and a strong leader bring good fortune.',   lines: [false, true, false, false, false, false] },
  { number: 8,  name: 'Holding Together',     chinese: '比', image: 'Water over Earth',      judgment: 'Inquire of the oracle once more; examine yourself.',     lines: [false, false, false, false, true, false] },
  { number: 9,  name: 'Small Taming',         chinese: '小畜', image: 'Wind over Heaven',    judgment: 'Dense clouds, no rain from the western region.',         lines: [true, true, true, false, true, true] },
  { number: 10, name: 'Treading',             chinese: '履', image: 'Heaven over Lake',      judgment: 'Treading upon the tiger\'s tail; it does not bite.',     lines: [true, true, false, true, true, true] },
  { number: 11, name: 'Peace',                chinese: '泰', image: 'Earth over Heaven',     judgment: 'The small departs, the great approaches.',               lines: [true, true, true, false, false, false] },
  { number: 12, name: 'Standstill',           chinese: '否', image: 'Heaven over Earth',     judgment: 'The great departs, the small approaches.',               lines: [false, false, false, true, true, true] },
  { number: 13, name: 'Fellowship',           chinese: '同人', image: 'Heaven over Fire',    judgment: 'Fellowship in the open; cross the great water.',         lines: [true, false, true, true, true, true] },
  { number: 14, name: 'Great Possession',     chinese: '大有', image: 'Fire over Heaven',    judgment: 'Supreme success.',                                       lines: [true, true, true, true, false, true] },
  { number: 15, name: 'Modesty',              chinese: '謙', image: 'Earth over Mountain',   judgment: 'Modesty brings success; the superior completes.',         lines: [false, false, true, false, false, false] },
  { number: 16, name: 'Enthusiasm',           chinese: '豫', image: 'Thunder over Earth',    judgment: 'Set up helpers and armies.',                              lines: [false, false, false, true, false, false] },
  { number: 17, name: 'Following',            chinese: '隨', image: 'Lake over Thunder',     judgment: 'Supreme success; perseverance furthers.',                 lines: [true, false, false, false, true, true] },
  { number: 18, name: 'Work on the Decayed',  chinese: '蠱', image: 'Mountain over Wind',    judgment: 'Cross the great water; three days before and after.',     lines: [true, true, false, true, false, false] },
  { number: 19, name: 'Approach',             chinese: '臨', image: 'Earth over Lake',       judgment: 'Great success through perseverance.',                     lines: [true, true, false, false, false, false] },
  { number: 20, name: 'Contemplation',        chinese: '觀', image: 'Wind over Earth',       judgment: 'Ablution, not yet the offering; confidence inspires.',    lines: [false, false, false, false, true, true] },
  { number: 21, name: 'Biting Through',       chinese: '噬嗑', image: 'Fire over Thunder',  judgment: 'Success; it furthers to let justice be administered.',    lines: [true, false, false, true, false, true] },
  { number: 22, name: 'Grace',                chinese: '賁', image: 'Mountain over Fire',    judgment: 'Grace brings success in small matters.',                  lines: [true, false, true, false, false, true] },
  { number: 23, name: 'Splitting Apart',      chinese: '剝', image: 'Mountain over Earth',   judgment: 'It does not further to go anywhere.',                     lines: [false, false, false, false, false, true] },
  { number: 24, name: 'Return',               chinese: '復', image: 'Earth over Thunder',    judgment: 'Success. Going out and coming in without error.',          lines: [true, false, false, false, false, false] },
  { number: 25, name: 'Innocence',            chinese: '無妄', image: 'Heaven over Thunder', judgment: 'Supreme success through perseverance.',                   lines: [true, false, false, true, true, true] },
  { number: 26, name: 'Great Taming',         chinese: '大畜', image: 'Mountain over Heaven', judgment: 'Perseverance furthers; cross the great water.',          lines: [true, true, true, false, false, true] },
  { number: 27, name: 'Nourishment',          chinese: '頤', image: 'Mountain over Thunder', judgment: 'Perseverance brings good fortune.',                       lines: [true, false, false, false, false, true] },
  { number: 28, name: 'Great Excess',         chinese: '大過', image: 'Lake over Wind',      judgment: 'The ridgepole sags. Furthers to have somewhere to go.',   lines: [false, true, true, true, true, false] },
  { number: 29, name: 'The Abysmal',          chinese: '坎', image: 'Water over Water',      judgment: 'Sincerity brings success of the heart.',                  lines: [false, true, false, false, true, false] },
  { number: 30, name: 'The Clinging',         chinese: '離', image: 'Fire over Fire',        judgment: 'Perseverance furthers; care for the cow.',                lines: [true, false, true, true, false, true] },
  { number: 31, name: 'Influence',            chinese: '咸', image: 'Lake over Mountain',    judgment: 'Success. Perseverance furthers; take a wife.',            lines: [false, false, true, true, true, false] },
  { number: 32, name: 'Duration',             chinese: '恆', image: 'Thunder over Wind',     judgment: 'Success. Perseverance furthers.',                         lines: [false, true, true, true, false, false] },
  { number: 33, name: 'Retreat',              chinese: '遯', image: 'Heaven over Mountain',  judgment: 'Success. Perseverance furthers in small matters.',         lines: [false, false, true, true, true, true] },
  { number: 34, name: 'Great Power',          chinese: '大壯', image: 'Thunder over Heaven', judgment: 'Perseverance furthers.',                                  lines: [true, true, true, true, false, false] },
  { number: 35, name: 'Progress',             chinese: '晉', image: 'Fire over Earth',       judgment: 'The powerful prince receives horses in great number.',     lines: [false, false, false, true, false, true] },
  { number: 36, name: 'Darkening of the Light', chinese: '明夷', image: 'Earth over Fire',   judgment: 'Perseverance in adversity furthers.',                     lines: [true, false, true, false, false, false] },
  { number: 37, name: 'The Family',           chinese: '家人', image: 'Wind over Fire',      judgment: 'Perseverance of the woman furthers.',                     lines: [true, false, true, false, true, true] },
  { number: 38, name: 'Opposition',           chinese: '睽', image: 'Fire over Lake',        judgment: 'Good fortune in small matters.',                          lines: [true, true, false, true, false, true] },
  { number: 39, name: 'Obstruction',          chinese: '蹇', image: 'Water over Mountain',   judgment: 'The southwest furthers; seek the great person.',          lines: [false, false, true, false, true, false] },
  { number: 40, name: 'Deliverance',          chinese: '解', image: 'Thunder over Water',    judgment: 'The southwest furthers; return brings good fortune.',     lines: [false, true, false, true, false, false] },
  { number: 41, name: 'Decrease',             chinese: '損', image: 'Mountain over Lake',    judgment: 'Sincerity brings supreme good fortune.',                  lines: [true, true, false, false, false, true] },
  { number: 42, name: 'Increase',             chinese: '益', image: 'Wind over Thunder',     judgment: 'Furthers to cross the great water.',                     lines: [true, false, false, false, true, true] },
  { number: 43, name: 'Breakthrough',         chinese: '夬', image: 'Lake over Heaven',      judgment: 'One must resolutely make the matter known.',              lines: [true, true, true, true, true, false] },
  { number: 44, name: 'Coming to Meet',       chinese: '姤', image: 'Heaven over Wind',      judgment: 'The maiden is powerful; do not marry such a maiden.',     lines: [false, true, true, true, true, true] },
  { number: 45, name: 'Gathering Together',   chinese: '萃', image: 'Lake over Earth',       judgment: 'Success. The king approaches his temple.',                lines: [false, false, false, true, true, false] },
  { number: 46, name: 'Pushing Upward',       chinese: '升', image: 'Earth over Wind',       judgment: 'Supreme success; seek the great person.',                 lines: [false, true, true, false, false, false] },
  { number: 47, name: 'Oppression',           chinese: '困', image: 'Lake over Water',       judgment: 'Success. Perseverance of the great person.',              lines: [false, true, false, true, true, false] },
  { number: 48, name: 'The Well',             chinese: '井', image: 'Water over Wind',       judgment: 'The town may change, but the well does not.',             lines: [false, true, true, false, true, false] },
  { number: 49, name: 'Revolution',           chinese: '革', image: 'Lake over Fire',        judgment: 'On your own day you are believed. Supreme success.',      lines: [true, false, true, true, true, false] },
  { number: 50, name: 'The Cauldron',         chinese: '鼎', image: 'Fire over Wind',        judgment: 'Supreme good fortune. Success.',                          lines: [false, true, true, true, false, true] },
  { number: 51, name: 'The Arousing',         chinese: '震', image: 'Thunder over Thunder',  judgment: 'Shock brings success; laughing words.',                   lines: [true, false, false, true, false, false] },
  { number: 52, name: 'Keeping Still',        chinese: '艮', image: 'Mountain over Mountain', judgment: 'Keeping still. No blame.',                              lines: [false, false, true, false, false, true] },
  { number: 53, name: 'Development',          chinese: '漸', image: 'Wind over Mountain',    judgment: 'The maiden is given in marriage. Perseverance furthers.', lines: [false, false, true, false, true, true] },
  { number: 54, name: 'The Marrying Maiden',  chinese: '歸妹', image: 'Thunder over Lake',   judgment: 'Undertakings bring misfortune.',                          lines: [true, true, false, true, false, false] },
  { number: 55, name: 'Abundance',            chinese: '豐', image: 'Thunder over Fire',     judgment: 'Success. The king attains abundance.',                    lines: [true, false, true, true, false, false] },
  { number: 56, name: 'The Wanderer',         chinese: '旅', image: 'Fire over Mountain',    judgment: 'Success through smallness. Perseverance furthers.',       lines: [false, false, true, true, false, true] },
  { number: 57, name: 'The Gentle',           chinese: '巽', image: 'Wind over Wind',        judgment: 'Small success. Furthers to have somewhere to go.',        lines: [false, true, true, false, true, true] },
  { number: 58, name: 'The Joyous',           chinese: '兌', image: 'Lake over Lake',        judgment: 'Success. Perseverance furthers.',                         lines: [true, true, false, true, true, false] },
  { number: 59, name: 'Dispersion',           chinese: '渙', image: 'Wind over Water',       judgment: 'Success. The king approaches his temple.',                lines: [false, true, false, false, true, true] },
  { number: 60, name: 'Limitation',           chinese: '節', image: 'Water over Lake',       judgment: 'Success. Galling limitation must not be persevered in.',  lines: [true, true, false, false, true, false] },
  { number: 61, name: 'Inner Truth',          chinese: '中孚', image: 'Wind over Lake',      judgment: 'Pigs and fishes. Good fortune. Cross the great water.',   lines: [true, true, false, false, true, true] },
  { number: 62, name: 'Small Excess',         chinese: '小過', image: 'Thunder over Mountain', judgment: 'Success in small matters. The flying bird brings the message.', lines: [false, false, true, true, false, false] },
  { number: 63, name: 'After Completion',     chinese: '既濟', image: 'Water over Fire',     judgment: 'Success in small matters. Perseverance furthers.',        lines: [true, false, true, false, true, false] },
  { number: 64, name: 'Before Completion',    chinese: '未濟', image: 'Fire over Water',     judgment: 'Success. The small fox nearly completed the crossing.',   lines: [false, true, false, true, false, true] },
];

// ============================================================================
// HEXAGRAM LOOKUP
// ============================================================================

/**
 * Build a lookup key from 6 boolean lines (bottom-to-top).
 * Each line is encoded as 1 (yang/true) or 0 (yin/false).
 */
function lineKey(lines: [boolean, boolean, boolean, boolean, boolean, boolean]): string {
  return lines.map(l => l ? '1' : '0').join('');
}

const HEXAGRAM_MAP = new Map<string, Hexagram>();
for (const hex of HEXAGRAMS) {
  HEXAGRAM_MAP.set(lineKey(hex.lines), hex);
}

export function findHexagram(lines: [boolean, boolean, boolean, boolean, boolean, boolean]): Hexagram {
  const key = lineKey(lines);
  const hex = HEXAGRAM_MAP.get(key);
  if (hex) return hex;
  // Fallback to hex 64 (Before Completion) if no match
  return HEXAGRAMS[63]!;
}

export function getHexagram(number: number): Hexagram | undefined {
  return HEXAGRAMS.find(h => h.number === number);
}

export function getAllHexagrams(): Hexagram[] {
  return HEXAGRAMS;
}

// ============================================================================
// HEXAGRAM DERIVATION FROM PERSONALITY AXES
// ============================================================================

/**
 * Derive an I Ching hexagram reading from personality axes.
 *
 * Lines 1-4: one per axis (>=0.5 = yang)
 * Line 5: average of orderChaos and mercyRuthlessness
 * Line 6: average of introvertExtrovert and faithDoubt
 *
 * Moving lines: any axis value within 0.1 of the 0.5 threshold
 * (indicating instability/transformation at that position).
 */
export function deriveHexagramReading(axes: {
  orderChaos: number;
  mercyRuthlessness: number;
  introvertExtrovert: number;
  faithDoubt: number;
}): HexagramReading {
  const { orderChaos, mercyRuthlessness, introvertExtrovert, faithDoubt } = axes;

  const rawValues: number[] = [
    orderChaos,                                  // Line 1
    mercyRuthlessness,                           // Line 2
    introvertExtrovert,                          // Line 3
    faithDoubt,                                  // Line 4
    (orderChaos + mercyRuthlessness) / 2,        // Line 5
    (introvertExtrovert + faithDoubt) / 2,       // Line 6
  ];

  const threshold = 0.5;
  const movingThreshold = 0.1;

  const presentLines = rawValues.map(v => v >= threshold) as [boolean, boolean, boolean, boolean, boolean, boolean];
  const movingLines: number[] = [];

  for (let i = 0; i < rawValues.length; i++) {
    if (Math.abs(rawValues[i]! - threshold) < movingThreshold) {
      movingLines.push(i + 1); // 1-indexed
    }
  }

  const presentHexagram = findHexagram(presentLines);

  let transformingHexagram: Hexagram | null = null;
  if (movingLines.length > 0) {
    const transformedLines = [...presentLines] as [boolean, boolean, boolean, boolean, boolean, boolean];
    for (const lineNum of movingLines) {
      const idx = lineNum - 1;
      transformedLines[idx] = !transformedLines[idx];
    }
    transformingHexagram = findHexagram(transformedLines);
  }

  return {
    present: presentHexagram,
    transforming: transformingHexagram,
    movingLines,
  };
}

/**
 * Convert Hexagram to public HexagramReading format
 */
export function toPublicHexagram(hex: Hexagram) {
  return {
    number: hex.number,
    name: hex.name,
    chinese: hex.chinese,
    judgment: hex.judgment,
  };
}
