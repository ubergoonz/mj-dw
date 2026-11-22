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
  { path: "/", glyph: "麻", label: "主页", description: "Home" },
  { path: "/wind-draw", glyph: "风", label: "选风打位", description: "Wind Draw", version: "1.0.0" },
  { path: "/dice", glyph: "⚄", label: "掷骰子", description: "Dice Roll", version: "1.1.0" },
  { path: "/in-game-dice", glyph: "⚅", label: "掷骰开墩", description: "In-Game Dice Roll", version: "1.1.0" },
  { path: "/fan-payout", glyph: "台", label: "台数计算", description: "Payout", version: "1.1.0" },
  { path: "/side-bets", glyph: "花", label: "花兽杠计算", description: "Side Bets", version: "1.1.0" },
  { path: "/player-results", glyph: "绩", label: "秋后算绩", description: "Player Results", version: "1.1.0" },
  { path: "/beckon-invite", glyph: "招", label: "招兵买马", description: "Beckon Invite", version: "1.1.0" },
  { path: "/special-hands", glyph: "胡", label: "特别牌型", description: "Special Hands", version: "1.1.0" },
  { path: "/pure-suit", glyph: "清", label: "清一色听牌", description: "Pure Suit Waits", version: "1.0.1" },
  { path: "/mj-dw/docs/", glyph: "书", label: "使用说明", description: "Docs", external: true },
];

/** Tools that carry their own version (excludes Home and external links). */
export const VERSIONED_UTILITIES = UTILITIES.filter(
  (utility): utility is Utility & { version: string } => typeof utility.version === "string",
);
