export type SideBetState = "hidden" | "open";

export interface SideBetType {
  id: string;
  label: string;
  note: string;
}

/** Both side bets inherit their amounts from the base: max when hidden, min when open. */
export const SIDE_BET_TYPES: SideBetType[] = [
  { id: "animal", label: "咬 · animal / flower", note: "hidden: max · open: min" },
  { id: "gang", label: "槓 · gang", note: "hidden: max · open: min" },
];

export const SIDE_BET_STATES: { id: SideBetState; label: string }[] = [
  { id: "hidden", label: "Hidden (暗)" },
  { id: "open", label: "Open (明)" },
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
  perPlayer: number;
  winnerTakes: number;
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
    SIDE_BET_STATES.map(({ id: state, label: stateLabel }) => {
      const perPlayer = round2(state === "hidden" ? max : min);

      return {
        key: `${type.id}-${state}`,
        typeId: type.id,
        typeLabel: type.label,
        state,
        stateLabel,
        perPlayer,
        winnerTakes: round2(perPlayer * 3),
      };
    }),
  );
}
