# mj-dw

[![License: PolyForm NonCommercial 1.0.0](https://img.shields.io/badge/License-PolyForm%20NonCommercial%201.0.0-blue.svg)](LICENSE)

> 雀起: Singapore mahjong helper tools for seat draw, dice rolling, and wall-break opening.

## Live App

Open the GitHub Pages deployment:

https://ubergoonz.github.io/mj-dw/

Main routes:

1. `/#/` - 選風打位
2. `/#/dice` - 掷骰子
3. `/#/in-game-dice` - 掷骰开墩
4. `/#/fan-payout` - 番數計算

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

### 4. 番數計算

Use the fan payout calculator to estimate the table payout across fan counts.

How it works:

1. Set a base value and a max fan limit.
2. Choose whether shooter pays on behalf of the other two players.
3. Toggle 自摸 bonus on and set the bonus amount if needed.
4. Pick the local self-draw rule: `all other players` or `one player only`.
5. Review the table from 0 fan up to the limit.

The calculator shows:

- base payout by fan count
- multiplier pattern such as `base × 2 × 2`
- other players amount
- shooter amount
- total payout for the winning hand

This is designed for quick Singapore mahjong table checks and local-rule comparisons.

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

## Mobile Use

You can save the web app as a shortcut on your phone and open it directly at the table.

## Development

This app is built with [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), and [Vite](https://vite.dev/).

```bash
npm install       # install dependencies
npm run dev       # start the local dev server
npm run build     # type-check and build for production (outputs to dist/)
npm run preview   # preview the production build locally
npm run lint       # run eslint
```

## Technical Notes

### Frontend architecture

1. Routing is handled by `react-router-dom` using hash routes for GitHub Pages compatibility.
2. Route definitions live in `src/App.tsx`.
3. Each tool is implemented as a dedicated page component under `src/pages/`.
4. Shared UI components live in `src/components/`.
5. Pure game logic lives in `src/lib/`.

### Current page map

1. `src/pages/WindDraw.tsx` - 選風打位
2. `src/pages/DiceRoll.tsx` - 掷骰子
3. `src/pages/InGameDiceRoll.tsx` - 掷骰开墩
4. `src/pages/FanPayout.tsx` - 番數計算

### Core logic modules

1. `src/lib/winds.ts` handles wind shuffling for seat draw.
2. `src/lib/inGameDiceRoll.ts` contains wall-break resolution logic.
3. `src/lib/fanPayout.ts` handles fan payout calculation and self-draw/local-rule adjustments.
4. `src/lib/utilities.ts` defines the utility menu registry.

### In-game dice technical behavior

1. The compass view maps seats to physical table orientation.
2. Mini wall stacks are rendered per seat from `stacksForSeat(...)`.
3. Break animation and stack highlighting are driven from `WallBreakResult`.
4. A simulated rollover control is available in 2-dice mode for testing edge cases.

### Deployment

1. GitHub Actions workflow: `.github/workflows/deploy-pages.yml`
2. Trigger: push to `main` or manual dispatch
3. Runtime: Node.js 20
4. Build steps:
   - `npm ci`
   - `npm run build`
5. Output: `dist/`
6. Deploy target: GitHub Pages

### Project structure

```
src/
  components/   # shared UI such as Brand, Footer, HelpDialog, UtilityMenu
  lib/          # pure logic such as wind shuffle and wall-break calculation
  pages/        # route-level pages: WindDraw, DiceRoll, InGameDiceRoll
  styles/       # shared and page-specific CSS
  App.tsx       # route definitions
  main.tsx      # app entry point
```

## FAQs

1. Why create this app?

When playing the first game on an automatic mahjong table, players may need to spend time finding 東南西北 or determining where to open the wall. This app reduces setup friction so the table can stay intact and the game can start faster.

2. How does it work?

The app uses browser-based random dice and shuffle logic, then maps the result to visual compass and wall-opening rules for Singapore mahjong setup.

3. Why is it not Open Source?

I find that this logic could be integrated into a Automatic Mahjong Table with a touch screen LCD display, but I don't have investment to start the project.

I also don't want anyone to profit from this but this app will always stary free to use without charge.


