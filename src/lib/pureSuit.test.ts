import { describe, expect, it } from "vitest";
import {
  getPureSuitDiscardSuggestions,
  getPureSuitExposedMeldCount,
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
});
