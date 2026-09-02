export interface FanBaseOption {
  /** Amount each of the two non-shooter players pays at 0 台. */
  player: number;
  /** Amount the shooter pays at 0 台. */
  shooter: number;
}

export const FAN_BASE_OPTIONS: FanBaseOption[] = [
  { player: 0.5, shooter: 1 },
  { player: 1, shooter: 2 },
  { player: 2, shooter: 4 },
  { player: 3, shooter: 6 },
  { player: 5, shooter: 10 },
  { player: 10, shooter: 20 },
];

export interface FanPayoutInput {
  /** The player side of the base pair, used as the 0 台 foundation. */
  base: number;
  minFan?: number;
  maxFan: number;
  selfDrawBonus: boolean;
  selfDrawBonusAmount: number;
}

export interface FanPayoutRow {
  fan: number;
  label: string;
  multiplier: number;
  playerPays: number;
  shooterPays: number;
  winnerTakes: number;
  selfDrawEach: number;
  selfDrawWinnerTakes: number;
  inRange: boolean;
}

/** The table always renders 0 台 through this limit; min/max only highlights rows. */
export const FAN_TABLE_MAX = 15;

/** Highest 台 a player can enter in the range inputs. */
export const FAN_INPUT_MAX = 99;

function safeNumber(value: number, fallback = 0): number {
  if (!Number.isFinite(value)) return fallback;
  return value;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getFanPayoutRows({
  base,
  minFan = 0,
  maxFan,
  selfDrawBonus,
  selfDrawBonusAmount,
}: FanPayoutInput): FanPayoutRow[] {
  const normalizedBase = Math.max(0, safeNumber(base, 0));
  const normalizedMinFan = Math.max(0, Math.floor(safeNumber(minFan, 0)));
  const normalizedMaxFan = Math.max(
    normalizedMinFan,
    Math.floor(safeNumber(maxFan, normalizedMinFan)),
  );
  const bonusAmount = selfDrawBonus ? Math.max(0, safeNumber(selfDrawBonusAmount, 0)) : 0;

  return Array.from({ length: Math.max(FAN_TABLE_MAX, normalizedMaxFan) + 1 }, (_, fan) => {
    const multiplier = 2 ** fan;
    const playerPays = round2(normalizedBase * multiplier);
    const shooterPays = round2(playerPays * 2);
    const selfDrawEach = round2(shooterPays + bonusAmount);

    return {
      fan,
      label: fan === 0 ? "鸡胡" : String(fan),
      multiplier,
      playerPays,
      shooterPays,
      winnerTakes: round2(playerPays * 2 + shooterPays),
      selfDrawEach,
      selfDrawWinnerTakes: round2(selfDrawEach * 3),
      inRange: fan >= normalizedMinFan && fan <= normalizedMaxFan,
    };
  });
}
