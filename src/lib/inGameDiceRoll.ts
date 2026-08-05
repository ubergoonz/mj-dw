export const SEAT_ORDER = ["東", "南", "西", "北"] as const;

const LEFTWARD_ROLLOVER_ORDER = ["東", "北", "西", "南"] as const;

export type Seat = (typeof SEAT_ORDER)[number];

export interface WallBreakResult {
  /** Roll used to count around to the wall-break seat. */
  seatRoll: number;
  /** Roll used to count stacks into that seat's wall (same as seatRoll for a single combined roll). */
  breakRoll: number;
  /** Seat selected by the first roll to perform the second roll. */
  chosenSeat: Seat;
  /** Seat whose wall is actually broken open for tile pick-up (may differ from chosenSeat after a roll-over). */
  seat: Seat;
  /** Total stacks (dun) built in the broken-open seat's wall. */
  totalStacks: number;
  /** Stack counted from the right-hand end of the wall where the break occurs. */
  breakStack: number;
  /** Stacks remaining to the left of the break. */
  remainingStacks: number;
  /** True if the count ran past chosenSeat's wall and rolled over into the next seat's wall. */
  rolledOver: boolean;
}

/**
 * Stacks (dun) built in each seat's wall under Singapore mahjong rules:
 * 東 (East) and 西 (West) each stack 19 pairs, 南 (South) and 北 (North) stack 18.
 */
export function stacksForSeat(seat: Seat): number {
  return seat === "東" || seat === "西" ? 19 : 18;
}

/**
 * Resolves where tile pick-up begins from the dealer's dice roll(s).
 *
 * `seatRoll` is counted starting at the dealer (東 = 1) and proceeding in
 * play order (東 → 南 → 西 → 北 → 東 …); the seat the count lands on
 * (`chosenSeat`) performs the second roll.
 *
 * With three dice, a single roll serves as `seatRoll` and is also counted
 * directly as stacks from the right-hand end of that wall (omit `breakRoll`).
 * With two dice, the dealer rolls twice: the first roll (`seatRoll`) picks
 * the seat, then the second roll (`breakRoll`) is *added* to the first —
 * that combined total is counted as stacks from the right-hand end of the
 * chosen wall.
 *
 * In two-dice mode, the combined count starts at the second roller's wall.
 * If it exceeds that wall's stack count, it rolls over to the next wall on
 * the left: 東→北→西→南→東, carrying the remaining count forward.
 * Either way, the wall is broken immediately after the counted stack, and
 * tile pick-up begins with the very next one.
 */
export function resolveWallBreak(seatRoll: number, breakRoll?: number): WallBreakResult {
  const chosenSeat = SEAT_ORDER[((seatRoll - 1) % SEAT_ORDER.length + SEAT_ORDER.length) % SEAT_ORDER.length];

  // Three-dice mode uses a single roll and never needs rollover in practice
  // (max 18), but keep this path direct and explicit.
  if (breakRoll === undefined) {
    return {
      seatRoll,
      breakRoll: seatRoll,
      chosenSeat,
      seat: chosenSeat,
      totalStacks: stacksForSeat(chosenSeat),
      breakStack: seatRoll,
      remainingStacks: stacksForSeat(chosenSeat) - seatRoll,
      rolledOver: false,
    };
  }

  let breakCount = seatRoll + breakRoll;
  let seatIndex = LEFTWARD_ROLLOVER_ORDER.indexOf(chosenSeat);
  let seat: Seat = chosenSeat;
  let totalStacks = stacksForSeat(seat);

  while (breakCount > totalStacks) {
    breakCount -= totalStacks;
    seatIndex = (seatIndex + 1) % LEFTWARD_ROLLOVER_ORDER.length;
    seat = LEFTWARD_ROLLOVER_ORDER[seatIndex];
    totalStacks = stacksForSeat(seat);
  }

  const breakStack = breakCount;

  return {
    seatRoll,
    breakRoll,
    chosenSeat,
    seat,
    totalStacks,
    breakStack,
    remainingStacks: totalStacks - breakStack,
    rolledOver: seat !== chosenSeat,
  };
}
