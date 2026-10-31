# Changelog

All notable changes to 麻将都Win are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/).

Two kinds of version are tracked:

- **App version** — `version` in `package.json`, shown on the home page badge and
  in every badge tooltip together with the build SHA.
- **Tool versions** — `version` on each entry in `src/lib/utilities.ts`, shown as
  the badge on that tool's page and in the utilities menu. Each tool version bump
  must have a `#### <tool label> v<version>` heading in this file; the test in
  `src/lib/utilities.test.ts` fails otherwise.

Semantics for a tool version: **MAJOR** — rule or output changes players must
re-learn (payout formula, chat text format, incompatible saved-data shape);
**MINOR** — new capability; **PATCH** — fix or visual polish with no behaviour
change.

## [Unreleased]

## [1.0.0] - 2026-10-31

First versioned release. Establishes the app/tool versioning standard, hardens
the app for live-table use, and redraws the tile set.

### App

- Added: installable web app (manifest, home-screen icons, iOS meta).
- Added: error boundary with recovery card; 404 page; per-tool document titles; scroll reset on navigation.
- Added: validated `localStorage` persistence layer and shared Copy / Share control.
- Added: classic tile renderer modelled on a real Singapore set.
- Added: version badge in every page header; tool versions in the utilities menu.
- Security: dependency advisories patched via `npm audit fix` and `overrides`; deploy workflow pinned to commit SHAs with audit, lint and test gates; Dependabot enabled.

### Tools

#### 選風打位 v1.0.0

- Baseline.

#### 掷骰子 v1.1.0

- Added: remembers the chosen dice count on the device.
- Added: haptic tick when a roll starts and lands.
- Fixed: roll timers are cleared when leaving the page.

#### 掷骰开墩 v1.1.0

- Added: haptic tick when a roll starts and lands.

#### 台數計算 v1.1.0

- Added: base pair, 台 range and 自摸 bonus settings persist on the device.

#### 花獸槓計算 v1.1.0

- Added: base minimum persists on the device.

#### 秋後算績 v1.1.0

- Added: whole session auto-saved on the device with a "started at" banner.
- Added: confirmation before `Reset session`, `全完場`, and recording while the chip tally does not balance.
- Added: remove a record with `×` and restore it with `Undo`; empty-state row.
- Added: native Share alongside Copy; copy falls back gracefully when the clipboard is blocked.

#### 招兵買馬 v1.1.0

- Added: invite form persists on the device; `Clear form` resets it.
- Added: native Share alongside Copy; copy feedback clears itself.

#### 特別牌型 v1.1.0

- Changed: Classic tile images redrawn to match a real Singapore set (concentric 筒, segmented 索 with bird 一索, blue numeral / red 萬, framed 白, numbered flowers, animals).
- Added: tile image set choice persists on the device.

#### 清一色听牌 v1.0.1

- Changed: tile images use the redrawn classic set.

[Unreleased]: https://github.com/ubergoonz/mj-dw/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ubergoonz/mj-dw/releases/tag/v1.0.0
