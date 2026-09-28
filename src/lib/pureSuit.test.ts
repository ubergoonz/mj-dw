import { describe, expect, it } from "vitest";
import {
  getPureSuitBestDecomposition,
  getPureSuitDiscardSuggestions,
  getPureSuitExposedMeldCount,
  getPureSuitHandPlan,
  getPureSuitTileUsefulness,
  getPureSuitWinningTiles,
  isPureSuitWin,
  knownRemainingCopies,
} from "./pureSuit";

describe("pure suit hand solver", () => {
  it("recognizes four sets and a pair", () => {
    expect(isPureSuitWin([3, 1, 1, 1, 1, 1, 2, 1, 3], 0)).toBe(true);
  });

  it("lists winning tiles for a concealed one-suit wait", () => {
    expect(getPureSuitWinningTiles([3, 1, 1, 1, 1, 1, 2, 1, 2], 0)).toContain(9);
  });

  it("uses the exposed meld count when validating hand size", () => {
    expect(getPureSuitWinningTiles([3, 1, 1, 1, 1, 1, 1, 0, 1], 1)).toContain(9);
  });

  it("recognizes exposed chi and pong groups", () => {
    expect(getPureSuitExposedMeldCount([3, 1, 1, 1, 0, 0, 0, 0, 0])).toBe(2);
    expect(getPureSuitExposedMeldCount([2, 1, 1, 0, 0, 0, 0, 0, 0])).toBeNull();
  });

  it("suggests discards that leave a legal waiting hand", () => {
    const suggestions = getPureSuitDiscardSuggestions([3, 1, 1, 1, 1, 1, 2, 1, 3], 0);
    expect(suggestions.find((suggestion) => suggestion.discard === 9)?.winningTiles).toContain(9);
  });

  it("subtracts hand and river tiles from known copies", () => {
    expect(knownRemainingCopies(9, [0, 0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 0, 1])).toBe(1);
  });

  it("counts chi and pong membership per tile", () => {
    const uses = getPureSuitTileUsefulness([3, 1, 1, 1, 0, 0, 0, 0, 0]);
    expect(uses[0]).toEqual({ tile: 1, pongs: 1, chis: 1 }); // 111 pong + 123 chi
    expect(uses[1]).toEqual({ tile: 2, pongs: 0, chis: 2 }); // 123 + 234
    expect(uses[4].chis).toBe(0);
    expect(uses[8].pongs).toBe(0); // no tiles held
  });

  it("decomposes a hand into the fewest loose tiles", () => {
    const { groups, leftovers } = getPureSuitBestDecomposition([3, 1, 1, 1, 0, 0, 0, 0, 2]);
    expect(groups).toContainEqual([1, 1, 1]);
    expect(groups).toContainEqual([2, 3, 4]);
    expect(groups).toContainEqual([9, 9]);
    expect(leftovers).toEqual([]);
  });

  it("flags pong and chi claims for loose tiles", () => {
    // Hand: 1,2,3 (chi) + 7,7 (pair) + 4,9 (loose)
    const plan = getPureSuitHandPlan([1, 1, 1, 1, 0, 0, 2, 0, 1]);
    expect(plan.groups).toContainEqual([1, 2, 3]);
    expect(plan.groups).toContainEqual([7, 7]);
    expect(plan.leftovers.sort((a, b) => a - b)).toEqual([4, 9]);
    // Pair 7,7 → a discarded 7 can be claimed as a pong
    expect(plan.claimHints).toContainEqual({ tile: 7, type: "pong", completes: [7, 7] });
    // Loose 4: a discarded 2 completes 2-3-4 using hand 3
    expect(plan.claimHints).toContainEqual({ tile: 2, type: "chi", completes: [3, 4] });
  });

  it("flags a pong claim when a leftover pair exists", () => {
    // Hand: 5,5 leftover pair with a lone 9
    const plan = getPureSuitHandPlan([0, 0, 0, 0, 2, 0, 0, 0, 1]);
    expect(plan.claimHints).toContainEqual({ tile: 5, type: "pong", completes: [5, 5] });
  });
});
