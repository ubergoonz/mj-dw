import { describe, expect, it } from "vitest";
import {
  calculateNet,
  createInitialSlots,
  createResultEntry,
  formatPlayerResultsForChat,
  replaceSeatPlayer,
} from "./playerResults";

describe("player results", () => {
  it("creates four seats in the same direction order with the total base split evenly", () => {
    expect(createInitialSlots(80)).toEqual([
      { seat: "東", playerName: "", baseChips: 20 },
      { seat: "南", playerName: "", baseChips: 20 },
      { seat: "西", playerName: "", baseChips: 20 },
      { seat: "北", playerName: "", baseChips: 20 },
    ]);
  });

  it("calculates win or loss from left chips minus base chips", () => {
    expect(calculateNet(100, 140)).toBe(40);
    expect(calculateNet(100, 65)).toBe(-35);
  });

  it("records a takeover and carries left chips into the next player's base", () => {
    const slot = { seat: "東" as const, playerName: "Alice", baseChips: 100 };
    const entry = createResultEntry({
      id: "1",
      slot,
      leftChips: 72,
      reason: "takeover",
      nextPlayerName: "Ben",
    });
    const replacement = replaceSeatPlayer(slot, "Ben", entry.leftChips);

    expect(entry).toMatchObject({
      playerName: "Alice",
      baseChips: 100,
      leftChips: 72,
      net: -28,
      nextPlayerName: "Ben",
    });
    expect(replacement).toEqual({ seat: "東", playerName: "Ben", baseChips: 72 });
  });

  it("formats results into copy-ready chat text", () => {
    const entries = [
      createResultEntry({
        id: "1",
        slot: { seat: "南", playerName: "Mei", baseChips: 100 },
        leftChips: 130,
        reason: "end",
      }),
      createResultEntry({
        id: "2",
        slot: { seat: "西", playerName: "Jun", baseChips: 100 },
        leftChips: 88,
        reason: "takeover",
        nextPlayerName: "Kai",
      }),
    ];

    expect(formatPlayerResultsForChat(entries)).toBe(
      "麻將成績\nMei: +30 (完場)\nJun: -12 (離場 -> Kai 接手)",
    );
  });
});
