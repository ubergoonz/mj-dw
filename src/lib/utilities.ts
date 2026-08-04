export interface Utility {
  path: string;
  label: string;
  description: string;
}

/** Registry of utilities available from the top-right menu. Add new tools here. */
export const UTILITIES: Utility[] = [
  { path: "/", label: "選風打位", description: "Wind Draw" },
  { path: "/dice", label: "掷骰子", description: "Dice Roll" },
  { path: "/in-game-dice", label: "掷骰开墩", description: "In-Game Dice Roll" },
];
