import { SEAT_ORDER, type Seat } from "./inGameDiceRoll";

export interface PlayerSessionSlot {
  seat: Seat;
  playerName: string;
  baseChips: number;
}

export type PlayerResultReason = "takeover" | "end";

export interface PlayerResultEntry {
  id: string;
  seat: Seat;
  playerName: string;
  baseChips: number;
  leftChips: number;
  net: number;
  reason: PlayerResultReason;
  nextPlayerName?: string;
}

export function createInitialSlots(totalBaseChips = 100): PlayerSessionSlot[] {
  const baseChips = round2(totalBaseChips / SEAT_ORDER.length);
  return SEAT_ORDER.map((seat) => ({ seat, playerName: "", baseChips }));
}

export function calculateNet(baseChips: number, leftChips: number): number {
  return round2(leftChips - baseChips);
}

export function createResultEntry({
  id,
  slot,
  leftChips,
  reason,
  nextPlayerName,
}: {
  id: string;
  slot: PlayerSessionSlot;
  leftChips: number;
  reason: PlayerResultReason;
  nextPlayerName?: string;
}): PlayerResultEntry {
  return {
    id,
    seat: slot.seat,
    playerName: displayPlayerName(slot),
    baseChips: round2(slot.baseChips),
    leftChips: round2(leftChips),
    net: calculateNet(slot.baseChips, leftChips),
    reason,
    nextPlayerName: nextPlayerName?.trim() || undefined,
  };
}

export function replaceSeatPlayer(
  slot: PlayerSessionSlot,
  nextPlayerName: string,
  leftChips: number,
): PlayerSessionSlot {
  return {
    seat: slot.seat,
    playerName: nextPlayerName.trim(),
    baseChips: round2(leftChips),
  };
}

export function formatSignedChips(value: number): string {
  const rounded = round2(value);
  if (rounded > 0) return `+${formatChips(rounded)}`;
  if (rounded < 0) return `-${formatChips(Math.abs(rounded))}`;
  return "0";
}

export function formatChips(value: number): string {
  const rounded = Number(value.toFixed(2));
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

export function formatPlayerResultsForChat(entries: PlayerResultEntry[]): string {
  if (entries.length === 0) return "麻將成績\n未記錄任何結果";

  const lines = entries.map((entry) => {
    const reason = entry.reason === "takeover" ? "離場" : "完場";
    const takeover = entry.nextPlayerName ? ` -> ${entry.nextPlayerName} 接手` : "";

    return `${entry.playerName}: ${formatSignedChips(entry.net)} (${reason}${takeover})`;
  });

  return ["麻將成績", ...lines].join("\n");
}

function displayPlayerName(slot: PlayerSessionSlot): string {
  return slot.playerName.trim() || `${slot.seat}家`;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
