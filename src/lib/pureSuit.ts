export type TileCounts = number[];

export interface DiscardSuggestion {
  discard: number;
  winningTiles: number[];
}

export interface TileUse {
  tile: number;
  pongs: number;
  chis: number;
}

export type ClaimType = "pong" | "chi";

export interface HandPlan {
  /** Decomposed sets and pair, as groups of tile numbers. */
  groups: number[][];
  /** Tiles in hand not used by this decomposition. */
  leftovers: number[];
  /**
   * Discarded tiles worth claiming. `tile` is the discard to call;
   * `completes` lists the hand tiles it completes into a set.
   */
  claimHints: { tile: number; type: ClaimType; completes: number[] }[];
}

function totalTiles(counts: TileCounts): number {
  return counts.reduce((total, count) => total + count, 0);
}

function canFormSets(counts: TileCounts, setsRemaining: number): boolean {
  if (setsRemaining === 0) return counts.every((count) => count === 0);

  const firstTile = counts.findIndex((count) => count > 0);
  if (firstTile === -1) return false;

  if (counts[firstTile] >= 3) {
    const next = [...counts];
    next[firstTile] -= 3;
    if (canFormSets(next, setsRemaining - 1)) return true;
  }

  if (firstTile <= 6 && counts[firstTile + 1] > 0 && counts[firstTile + 2] > 0) {
    const next = [...counts];
    next[firstTile] -= 1;
    next[firstTile + 1] -= 1;
    next[firstTile + 2] -= 1;
    if (canFormSets(next, setsRemaining - 1)) return true;
  }

  return false;
}

/** Returns the number of valid exposed chi/pong sets, or null when the open tiles cannot form complete sets. */
export function getPureSuitExposedMeldCount(counts: TileCounts): number | null {
  const tileCount = totalTiles(counts);
  if (counts.length !== 9 || tileCount % 3 !== 0) return null;
  const meldCount = tileCount / 3;
  if (meldCount > 4 || counts.some((count) => count < 0 || count > 4)) return null;
  return canFormSets([...counts], meldCount) ? meldCount : null;
}

/** Returns true when the concealed tiles plus exposed melds make a standard one-suit winning hand. */
export function isPureSuitWin(counts: TileCounts, exposedMelds: number): boolean {
  if (counts.length !== 9 || counts.some((count) => count < 0 || count > 4)) return false;
  if (exposedMelds < 0 || exposedMelds > 4 || !Number.isInteger(exposedMelds)) return false;
  if (totalTiles(counts) !== 14 - exposedMelds * 3) return false;

  const setsRemaining = 4 - exposedMelds;
  for (let pair = 0; pair < counts.length; pair += 1) {
    if (counts[pair] < 2) continue;
    const next = [...counts];
    next[pair] -= 2;
    if (canFormSets(next, setsRemaining)) return true;
  }

  return false;
}

/** Lists the numbered tiles that complete a correctly sized one-suit hand. */
export function getPureSuitWinningTiles(counts: TileCounts, exposedMelds: number): number[] {
  if (totalTiles(counts) !== 13 - exposedMelds * 3) return [];

  return counts.flatMap((count, index) => {
    if (count >= 4) return [];
    const next = [...counts];
    next[index] += 1;
    return isPureSuitWin(next, exposedMelds) ? [index + 1] : [];
  });
}

/** Ranks every discard that leaves the hand waiting on at least one one-suit tile. */
export function getPureSuitDiscardSuggestions(counts: TileCounts, exposedMelds: number): DiscardSuggestion[] {
  if (totalTiles(counts) !== 14 - exposedMelds * 3) return [];

  return counts
    .flatMap((count, index) => {
      if (count === 0) return [];
      const next = [...counts];
      next[index] -= 1;
      const winningTiles = getPureSuitWinningTiles(next, exposedMelds);
      return winningTiles.length > 0 ? [{ discard: index + 1, winningTiles }] : [];
    })
    .sort((first, second) => second.winningTiles.length - first.winningTiles.length || first.discard - second.discard);
}

/** Returns the known remaining copies after hidden-hand, river, and open-meld tiles are subtracted. */
export function knownRemainingCopies(
  tile: number,
  handCounts: TileCounts,
  riverCounts: TileCounts,
  exposedCounts: TileCounts = [],
): number {
  const index = tile - 1;
  return Math.max(0, 4 - (handCounts[index] ?? 0) - (riverCounts[index] ?? 0) - (exposedCounts[index] ?? 0));
}

/** Chance of drawing any winning tile among the still-unknown tiles in the selected suit. */
export function pureSuitDrawChance(
  winningTiles: number[],
  handCounts: TileCounts,
  riverCounts: TileCounts,
  exposedCounts: TileCounts = [],
): number {
  const available = winningTiles.reduce(
    (total, tile) => total + knownRemainingCopies(tile, handCounts, riverCounts, exposedCounts),
    0,
  );
  const unknownSuitTiles = 36 - totalTiles(handCounts) - totalTiles(riverCounts) - totalTiles(exposedCounts);
  return unknownSuitTiles > 0 ? available / unknownSuitTiles : 0;
}

/** Counts how many chi and pong sets each tile participates in within the current hand. */
export function getPureSuitTileUsefulness(counts: TileCounts): TileUse[] {
  return counts.map((count, index) => {
    const tile = index + 1;
    if (count === 0) return { tile, pongs: 0, chis: 0 };
    const pongs = count >= 3 ? 1 : 0;
    let chis = 0;
    for (let start = tile - 2; start <= tile; start += 1) {
      if (start < 1 || start > 7) continue;
      if (counts[start - 1] > 0 && counts[start] > 0 && counts[start + 1] > 0) chis += 1;
    }
    return { tile, pongs, chis };
  });
}

/** Finds the decomposition of the concealed tiles that leaves the fewest loose tiles. */
export function getPureSuitBestDecomposition(counts: TileCounts): { groups: number[][]; leftovers: number[] } {
  let best: { groups: number[][]; leftoverCount: number } = { groups: [], leftoverCount: totalTiles(counts) };

  function search(remaining: TileCounts, groups: number[][]) {
    const leftoverCount = totalTiles(remaining);
    if (leftoverCount < best.leftoverCount) {
      best = { groups, leftoverCount };
    }
    const firstTile = remaining.findIndex((count) => count > 0);
    if (firstTile === -1) return;
    const tile = firstTile + 1;

    if (remaining[firstTile] >= 3) {
      const next = [...remaining];
      next[firstTile] -= 3;
      search(next, [...groups, [tile, tile, tile]]);
    }

    if (tile <= 7 && remaining[firstTile + 1] > 0 && remaining[firstTile + 2] > 0) {
      const next = [...remaining];
      next[firstTile] -= 1;
      next[firstTile + 1] -= 1;
      next[firstTile + 2] -= 1;
      search(next, [...groups, [tile, tile + 1, tile + 2]]);
    }

    if (remaining[firstTile] >= 2) {
      const next = [...remaining];
      next[firstTile] -= 2;
      search(next, [...groups, [tile, tile]]);
    }

    const next = [...remaining];
    next[firstTile] -= 1;
    search(next, groups);
  }

  search([...counts], []);
  const leftovers = [...counts];
  for (const group of best.groups) {
    for (const tile of group) leftovers[tile - 1] -= 1;
  }
  return {
    groups: best.groups,
    leftovers: leftovers.flatMap((count, index) => Array.from({ length: count }, () => index + 1)),
  };
}

/**
 * Plans how to complete the hand from the best decomposition: which discarded tiles
 * are worth a pong or chi claim, and which loose tiles should be worked into sets.
 */
export function getPureSuitHandPlan(counts: TileCounts): HandPlan {
  const { groups, leftovers } = getPureSuitBestDecomposition(counts);
  const claimHints: HandPlan["claimHints"] = [];
  const seen = new Set<string>();

  // Any pair in hand can be completed by claiming a discarded third copy.
  for (let tile = 1; tile <= 9; tile += 1) {
    if (counts[tile - 1] === 2) claimHints.push({ tile, type: "pong", completes: [tile, tile] });
  }

  for (const tile of [...new Set(leftovers)]) {
    if (counts[tile - 1] >= 2) continue; // already covered by the pong hint
    // A discarded D completes a chi with this loose tile when the third tile is also in hand.
    const discards: [number, number[]][] = [
      [tile - 2, [tile - 1, tile]],
      [tile - 1, [tile, tile + 1]],
      [tile + 1, [tile, tile + 2]],
      [tile + 2, [tile, tile + 1]],
    ];
    for (const [discard, needed] of discards) {
      if (discard < 1 || discard > 9) continue;
      if (!needed.every((partner) => partner === tile || counts[partner - 1] > 0)) continue;
      const key = `${discard}:${[...needed].sort((a, b) => a - b).join(",")}`;
      if (seen.has(key)) continue;
      seen.add(key);
      claimHints.push({ tile: discard, type: "chi", completes: needed });
    }
  }

  return { groups, leftovers, claimHints };
}
