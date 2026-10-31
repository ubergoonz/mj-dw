# 麻将都Win (mj-dw)


[![License: PolyForm NonCommercial 1.0.0](https://img.shields.io/badge/License-PolyForm%20NonCommercial%201.0.0-blue.svg)](LICENSE)

> 麻将都Win is a set of multiple useful utilities for organizing and playing Singapore style mahjong.

## Live App

Open the GitHub Pages deployment:

https://ubergoonz.github.io/mj-dw/

Main routes:

1. `/#/` - 主頁 (utility hub)
2. `/#/wind-draw` - 選風打位
3. `/#/dice` - 掷骰子
4. `/#/in-game-dice` - 掷骰开墩
5. `/#/fan-payout` - 台數計算
6. `/#/side-bets` - 花獸槓計算
7. `/#/player-results` - Player Results
8. `/#/beckon-invite` - 招兵買馬

Documentation site:

https://ubergoonz.github.io/mj-dw/docs/

## Local development

Run both the app and documentation development servers from the repository root:

```sh
./_local-dev/start-dev.sh
```

This requires Node.js, npm, and installed project dependencies. It opens the Mahjong app and documentation site in separate browser tabs, runs both servers together, and stops them with `Ctrl+C`.

## Features

### 1. 選風打位

Use the compass view to determine seat positions before the game starts.

How it works:

1. Tap the center tile.
2. The four winds reveal in sequence.
3. 東 marks the dealer seat.
4. The ▲起莊 marker appears beside 東.

### 2. 掷骰子

Use a simple 2-dice or 3-dice roller for general table setup.

How it works:

1. Choose `2 个骰子` or `3 个骰子`.
2. Tap the roll button.
3. Read the final total shown below the dice.

### 3. 掷骰开墩

Use the in-game wall-break helper to determine where tile pick-up starts.

How it works:

1. Choose `2 个骰子 · 掷两次` or `3 个骰子 · 掷一次`.
2. Tap the center tile to roll.
3. Watch the compass reveal the opening seat.
4. Read the break position and the next stack for tile pick-up.

Extra behavior on this page:

1. Each seat shows its own mini wall stack.
2. 東 and 西 use 19 stacks; 南 and 北 use 18 stacks.
3. The opening wall animates when the break point is determined.
4. The wall color theme rotates between rolls.

### 4. 台數計算

Use the tai payout calculator to review the table payout for every 台 value in a selected range.

How it works:

1. Select the base pair: `player / shooter`.
2. Set the minimum and maximum 台; invalid ranges are highlighted.
3. Optionally enable `Include 自摸 bonus` and enter the bonus amount paid by each player.
4. Review every row in the selected range, including normal-win and 自摸 amounts.

The calculator shows:

- the selected base pair and active 台 range
- normal-win payments from each other player and the shooter
- the winner's total for a normal win
- 自摸 amount paid by each player and the winner's 自摸 total
- optional 自摸 bonus included in each applicable payment

This is designed for quick Singapore mahjong table checks and local-rule comparisons.

### 5. 花獸槓計算

Use the side-bet calculator to settle 花/獸 (flower/animal) and 槓 (kong) payouts outside the main hand.

How it works:

1. Pick a base min value; the max is automatically double the min.
2. 正暗 (hidden) pairs are valued at the max; 正明 (open) pairs are valued at the min.
3. Extra pairs of the same bet type multiply the payout.
4. Open 槓 shows a separate 出銃 column for the amount a discarder pays alone.
5. Each row is paid by all three other players to the winner at the shown per-player amount.

### 6. 秋後算績 (Player Results)

Track a play session's chip counts and settle net win/loss between players.

How it works:

1. Set the total base chips for the table; `Reset session` splits it evenly across the four seats.
2. Enter each player's name, base chips, and remaining chips in their seat card.
3. The tool validates that base and remaining chip tallies match the table total.
4. When a player leaves mid-session, use `接手` to record the outgoing result and seat a replacement.
5. At the end of play, use `完場` per seat or `全完場` for every seat.
6. Copy or share a formatted chat-ready summary of all recorded results; remove a wrong record with `×` and restore it with `Undo`.
7. The whole session is auto-saved on the device until you choose `Reset session`.

### 7. 招兵買馬

Organize a mahjong session and generate a chat-ready invite for players.

How it works:

1. Enter the venue; a debounced OpenStreetMap (Nominatim) lookup resolves it to an embedded map preview and an "Open in Google Maps" link, falling back to a plain Google Maps search link.
2. Enter parking, smoking availability, expected start/end date and time, and expected rounds; start, end, rounds, and total hours stay in sync automatically.
3. Set the table's game rules: stake size, tai range, 門清, 平胡 (Ping Hu), 花獸咬, Shooter, End Wall, and Dice Bonus.
4. Toggle special hands: 大三元, 大四喜, 七對子, 花胡, and 天地胡, each with their payout notes.
5. Copy the generated invite from the Chat tab, or switch to the AI tab for a banner image prompt. The form is saved on the device; use `Clear form` to start over.

### 8. 特別牌型

Look up Singapore-style tai values, example winning layouts, and table-rule notes for special hands.

How it works:

1. Choose a hand from the Special hand dropdown.
2. Choose `Classic color` or `Unicode` tile images.
3. Read the tai badge, description, and table-rule note.
4. Review the example layout; the red-bordered final tile is the winning tile.
5. Check Other winning potential for alternative waits.
6. Confirm values with your group before play; the catalogue lives in `src/data/specialHands.json`.

### 9. 清一色听牌

Analyze a one-suit (清一色) hand: find winning tiles, compare discards, and account for the visible discard river.

How it works:

1. Choose the suit: 萬, 筒, or 索.
2. In Step 1 · Select tiles, use each tile's `Hand` and `River` +/− steppers to record copies; the `N / 4 used` caption prevents recording more than four copies.
3. Record claimed Chi/Pong and hidden Gang sets in Step 2; upgrade a claimed pong with `Self-draw → Gang`.
4. Read the Ways to complete your hand panel for the best grouping and worth-calling discards.
5. At listening size, the Winning tiles panel lists every wait with remaining copies and a known-suit draw chance.
6. At discard size, Best discard choices ranks discards by draw chance; `Discard to river` applies a suggestion in one step.

## Wall-Break Rules

The 掷骰开墩 page follows the current logic implemented in the app.

### Seat selection

1. The first roll starts counting from 東.
2. Counting order for seat selection is: 東 → 南 → 西 → 北.
3. The seat landed on performs the second roll in 2-dice mode.

### Stack counting

1. In 3-dice mode, the single roll is used for both seat selection and stack counting.
2. In 2-dice mode, the two roll totals are added together.
3. Stack counting starts from the first stack of the selected wall.
4. The wall opens after the counted stack, and tile pick-up begins from the next stack.

### Rollover

1. If the count passes the current wall, it rolls to the next wall on the left.
2. Leftward rollover order is: 東 → 北 → 西 → 南 → 東.
3. If the count lands exactly at the wall end, opening continues at the next wall.

## Versioning

The project follows [Semantic Versioning](https://semver.org/) at two levels, and every page shows its version as a small badge in the header (hover or long-press it for the full app build identity).

| Level | Source of truth | Shown | Bump when |
| --- | --- | --- | --- |
| **App** | `version` in `package.json` | Badge on the home page; in every badge tooltip as `App vX.Y.Z · build <sha> · <date>` | A release is cut (any set of tool changes shipped together) |
| **Tool** | `version` on each entry in `src/lib/utilities.ts` | Badge on that tool's page; next to the tool in the utilities menu | That tool's behaviour changes |

Tool version semantics:

- **MAJOR** — rule or output changes players must re-learn: payout formula, chat text format, an incompatible saved-data shape.
- **MINOR** — new capability (a new control, option, or output).
- **PATCH** — fix or visual polish with no behaviour change.

Every change is recorded in [CHANGELOG.md](CHANGELOG.md) (Keep a Changelog format). A tool bump needs a `#### <tool label> v<version>` heading under the release it ships in; the app version needs a `## [X.Y.Z] - YYYY-MM-DD` release heading. `src/lib/utilities.test.ts` enforces both, so `npm test` / CI fails if a version is bumped without notes.

Release checklist:

1. Bump the affected tool versions in `src/lib/utilities.ts` and write their CHANGELOG entries under `[Unreleased]`.
2. Bump `version` in `package.json`, rename `[Unreleased]` to the new release heading with today's date, and update the compare links at the bottom.
3. `npm run lint && npx vitest run && npm run build`, commit, push — the deploy workflow publishes it.
4. Optionally tag the commit: `git tag vX.Y.Z && git push --tags`.

Saved-data keys in `localStorage` carry their own schema suffix (e.g. `mj-dw:player-results:v1`); bump that suffix when a stored shape changes incompatibly so old data is ignored rather than mis-read.

## Mobile Use

The app is installable. Open it in your phone's browser and choose **Add to Home Screen** (iOS Safari: Share → Add to Home Screen; Android Chrome: menu → Install app). It launches full-screen with its own icon, like a native app.

Robustness features designed for use at a live table:

1. **Auto-save.** 秋後算績 (the chip ledger), 招兵買馬 (the invite form), and your preferred 台數 / 花獸槓 bases and tile style are saved on the device. Locking the screen, switching apps, or reloading never loses your work.
2. **Safe destructive actions.** Resetting a session, 全完場, and recording while the chip tally is off all ask for confirmation. Individual records can be removed and undone.
3. **Copy that works everywhere.** Copy falls back gracefully on browsers that block the clipboard API and shows a clear message; on phones a native **Share** button is offered too.
4. **No white screens.** A render error shows a recovery card with Reload / Home; unknown routes show a friendly 404.
5. **Haptics.** Dice rolls give a short vibration on supporting phones.

Saved data lives only in your browser's local storage (`mj-dw:*` keys) and is never sent anywhere.

## Development

This app is built with [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), and [Vite](https://vite.dev/).

```bash
npm install       # install dependencies
npm run dev       # start the local dev server
npm run build     # type-check and build for production (outputs to dist/)
npm run preview   # preview the production build locally
npm run lint       # run eslint
```

### Documentation site

Documentation is a separate [Docusaurus](https://docusaurus.io/) project under `docs-site/`, kept isolated from the app's own React/Vite dependencies.

```bash
cd docs-site
npm install       # install docs dependencies
npm start         # start the docs dev server
npm run build     # build the docs site (outputs to docs-site/build/)
```

From the repo root, `npm run build:all` builds the app, builds the docs, and copies the docs output into `dist/docs` so both deploy together under `/mj-dw/` and `/mj-dw/docs/`.

## Technical Notes

### Frontend architecture

1. Routing is handled by `react-router-dom` using hash routes for GitHub Pages compatibility.
2. Route definitions live in `src/App.tsx`.
3. Each tool is implemented as a dedicated page component under `src/pages/`.
4. Shared UI components live in `src/components/`.
5. Pure game logic lives in `src/lib/`.

### Current page map

1. `src/pages/MainSplash.tsx` - 主頁 (utility hub)
2. `src/pages/WindDraw.tsx` - 選風打位
3. `src/pages/DiceRoll.tsx` - 掷骰子
4. `src/pages/InGameDiceRoll.tsx` - 掷骰开墩
5. `src/pages/FanPayout.tsx` - 台數計算
6. `src/pages/SideBets.tsx` - 花獸槓計算
7. `src/pages/PlayerResults.tsx` - 秋後算績
8. `src/pages/BeckonInvite.tsx` - 招兵買馬
9. `src/pages/SpecialHands.tsx` - 特別牌型
10. `src/pages/PureSuit.tsx` - 清一色听牌

### Core logic modules

1. `src/lib/winds.ts` handles wind shuffling for seat draw.
2. `src/lib/inGameDiceRoll.ts` contains wall-break resolution logic.
3. `src/lib/fanPayout.ts` handles tai payout calculation and self-draw/local-rule adjustments.
4. `src/lib/sideBets.ts` handles 花/獸/槓 side-bet row generation and payout amounts.
5. `src/lib/playerResults.ts` handles chip tally validation, net calculation, and result entry formatting.
6. `src/lib/beckonInvite.ts` handles total-hours calculation, venue geocoding (Nominatim) and OpenStreetMap embed URLs, start/end/rounds auto-sync, tai-range validation, and the chat/AI invite text generators.
7. `src/lib/pureSuit.ts` handles one-suit wait detection, hand grouping, call hints, and known-tile draw odds.
8. `src/lib/mahjongTileImage.ts` renders tile images for the Classic color and Unicode tile sets.
9. `src/data/specialHands.json` is the configurable special-hands catalogue (names, tai values, rule notes, example layouts).
10. `src/lib/utilities.ts` defines the utility menu registry, including each tool's version.
11. `src/lib/storage.ts` and `src/lib/usePersistentState.ts` provide guarded, validated `localStorage` persistence.
12. `src/lib/clipboard.ts` provides copy (with legacy fallback) and native share helpers; `src/lib/haptics.ts` wraps vibration.
13. `src/lib/version.ts` exposes the build-time app version/SHA and resolves the version to show for a route.

### App shell

1. `src/components/ErrorBoundary.tsx` catches render errors and shows a recovery card instead of a blank page.
2. `src/components/RouteChrome.tsx` resets scroll and sets the document title on every route change.
3. `src/components/CopyActions.tsx` is the shared Copy / Share control with self-clearing feedback.
4. `src/components/VersionBadge.tsx` renders the header version pill (tool version, or app version on Home).
5. `src/pages/NotFound.tsx` handles unknown hash routes.
6. `public/manifest.webmanifest` plus the icons in `public/` make the app installable to the home screen.

### In-game dice technical behavior

1. The compass view maps seats to physical table orientation.
2. Mini wall stacks are rendered per seat from `stacksForSeat(...)`.
3. Break animation and stack highlighting are driven from `WallBreakResult`.
4. A simulated rollover control is available in 2-dice mode for testing edge cases.

### Deployment

1. GitHub Actions workflow: `.github/workflows/deploy-pages.yml`
2. Trigger: push to `main` or manual dispatch
3. Runtime: Node.js 22; actions are pinned to commit SHAs and run with least-privilege permissions
4. Build steps:
   - `npm ci`
   - `npm ci --prefix docs-site`
   - `npm audit --omit=dev --audit-level=high` (deploy is blocked by high/critical production-dependency advisories)
   - `npm run lint`
   - `npx vitest run`
   - `npm run build:all` (app build + docs build, docs copied into `dist/docs`)
5. Output: `dist/` (app at root, docs under `dist/docs`)
6. Deploy target: GitHub Pages
7. Dependabot (`.github/dependabot.yml`) opens weekly grouped update PRs for the app, the docs site, and the workflow actions.

### Security posture

- The app is fully client-side: no backend, no accounts, no secrets. The only network calls are to OpenStreetMap Nominatim (venue lookup, user-initiated), Google Fonts, and Google Analytics.
- Saved state lives in `localStorage` under `mj-dw:*` keys and is shape-validated on read, so tampered or stale data falls back to defaults instead of breaking a page.
- Tile SVGs are generated from a fixed vocabulary and XML-escaped; there is no `dangerouslySetInnerHTML` anywhere in the app.
- Dev-only transitive advisories are closed with `overrides` in `package.json` and `docs-site/package.json`; `npm audit` on both trees should report zero high/critical findings.

### Project structure

```
src/
  components/   # shared UI such as Brand, Footer, HelpDialog, UtilityMenu
  lib/          # pure logic such as wind shuffle, wall-break, tai payout, side bets, player results
  pages/        # route-level pages: WindDraw, DiceRoll, InGameDiceRoll, FanPayout, SideBets, PlayerResults
  styles/       # shared and page-specific CSS
  App.tsx       # route definitions
  main.tsx      # app entry point
docs-site/      # standalone Docusaurus documentation site (own package.json)
```

## FAQs

1. Why create this app?

When playing the first game on an automatic mahjong table, players may need to spend time finding 東南西北 or determining where to open the wall. This app reduces setup friction so the table can stay intact and the game can start faster.

2. How does it work?

The app uses browser-based random dice and shuffle logic, then maps the result to visual compass and wall-opening rules for Singapore mahjong setup.

3. Why is it not Open Source?

I find that this logic could be integrated into a Automatic Mahjong Table with a touch screen LCD display, but I don't have investment to start the project.

I also don't want anyone to profit from this but this app will always stary free to use without charge.
