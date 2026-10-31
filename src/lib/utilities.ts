export interface Utility {
  path: string;
  glyph: string;
  label: string;
  description: string;
  /**
   * Tool version (SemVer). Bump it whenever the tool's behaviour changes and
   * record the change under a matching heading in CHANGELOG.md — the test in
   * utilities.test.ts enforces both. MAJOR: rule/output changes players must
   * re-learn (payout formula, chat text format, saved-data shape). MINOR: new
   * capability. PATCH: fix or visual polish with no behaviour change.
   */
  version?: string;
  /** External link that opens outside the app's router, e.g. the docs site. */
  external?: boolean;
}

/** Registry of utilities available from the top-right menu. Add new tools here. */
export const UTILITIES: Utility[] = [
  { path: "/", glyph: "麻", label: "主頁", description: "Home" },
  { path: "/wind-draw", glyph: "風", label: "選風打位", description: "Wind Draw", version: "1.0.0" },
  { path: "/dice", glyph: "⚄", label: "掷骰子", description: "Dice Roll", version: "1.1.0" },
  { path: "/in-game-dice", glyph: "⚅", label: "掷骰开墩", description: "In-Game Dice Roll", version: "1.1.0" },
  { path: "/fan-payout", glyph: "台", label: "台數計算", description: "Payout", version: "1.1.0" },
  { path: "/side-bets", glyph: "花", label: "花獸槓計算", description: "Side Bets", version: "1.1.0" },
  { path: "/player-results", glyph: "績", label: "秋後算績", description: "Player Results", version: "1.1.0" },
  { path: "/beckon-invite", glyph: "招", label: "招兵買馬", description: "Beckon Invite", version: "1.1.0" },
  { path: "/special-hands", glyph: "胡", label: "特別牌型", description: "Special Hands", version: "1.1.0" },
  { path: "/pure-suit", glyph: "清", label: "清一色听牌", description: "Pure Suit Waits", version: "1.0.1" },
  { path: "/mj-dw/docs/", glyph: "書", label: "使用說明", description: "Docs", external: true },
];

/** Tools that carry their own version (excludes Home and external links). */
export const VERSIONED_UTILITIES = UTILITIES.filter(
  (utility): utility is Utility & { version: string } => typeof utility.version === "string",
);
