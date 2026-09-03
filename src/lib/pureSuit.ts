export type TileCounts = number[];

export interface DiscardSuggestion {
  discard: number;
  winningTiles: number[];
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
