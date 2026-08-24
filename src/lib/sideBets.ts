export type SideBetState = "hidden" | "open";

export interface SideBetType {
  id: string;
  label: string;
  note: string;
  /** Prefix applied to the 暗/明 state labels for this bet type. */
  statePrefix: string;
  /** How many pairs this bet can be scored with; each extra pair multiplies the payout. */
  pairCounts: number[];
}

/** Both side bets inherit their amounts from the base: max when hidden, min when open. */
export const SIDE_BET_TYPES: SideBetType[] = [
  {
    id: "animal",
    label: "正咬 · 正動物 / 正花",
    note: "正暗：max · 正明：min",
    statePrefix: "正",
    pairCounts: [1, 2],
  },
  { id: "gang", label: "槓 · gang", note: "暗：max · 明：min", statePrefix: "", pairCounts: [1] },
];

export const SIDE_BET_STATES: { id: SideBetState; label: string }[] = [
  { id: "hidden", label: "暗 (hidden)" },
  { id: "open", label: "明 (open)" },
];

export interface SideBetInput {
  baseMin: number;
  baseMax: number;
}

export interface SideBetRow {
  key: string;
  typeId: string;
  typeLabel: string;
  state: SideBetState;
  stateLabel: string;
  pairs: number;
  pairLabel: string;
  perPlayer: number;
  winnerTakes: number;
  /** 明槓 is covered by the discarder, so only that seat pays. */
  hasShooter: boolean;
  shooterPays: number;
}

function safeNumber(value: number, fallback = 0): number {
  if (!Number.isFinite(value)) return fallback;
  return value;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getSideBetRows({ baseMin, baseMax }: SideBetInput): SideBetRow[] {
  const min = Math.max(0, safeNumber(baseMin, 0));
  const max = Math.max(min, safeNumber(baseMax, min));

  return SIDE_BET_TYPES.flatMap((type) =>
    type.pairCounts.flatMap((pairs) =>
      SIDE_BET_STATES.map(({ id: state, label: stateLabel }) => {
        const perPlayer = round2((state === "hidden" ? max : min) * pairs);
        const winnerTakes = round2(perPlayer * 3);
        const hasShooter = type.id === "gang" && state === "open";

        return {
          key: `${type.id}-${pairs}-${state}`,
          typeId: type.id,
          typeLabel: type.label,
          state,
          stateLabel: `${type.statePrefix}${stateLabel}`,
          pairs,
          pairLabel: `${pairs} 對`,
          perPlayer,
          winnerTakes,
          hasShooter,
          shooterPays: hasShooter ? winnerTakes : 0,
        };
      }),
    ),
  );
}
