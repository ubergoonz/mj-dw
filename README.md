# mj-dw

[![License: Custom Permission Required](https://img.shields.io/badge/License-Custom%20Permission%20Required-red.svg)](LICENSE)

> 雀起 - 選風打位 - 一掷定乾坤，谁来坐庄？

<p align="center">
	<img src="./mj-dw-1.png" alt="screenshot" width="420" />
	<img src="./mj-dw-2.png" alt="screenshot" width="420" />
	<img src="./mj-dw-3.png" alt="screenshot" width="420" />
</p>

## Launch on GitHub Pages

Open the live app here:

https://ubergoonz.github.io/mj-dw/

After opening the page:

1. Tap or click 發 in the center tile.
2. Wait for the reveal animation.
3. Read the result below the compass.
4. Tap or click 發 to draw again.

## Save the webpage as a shortcut on your mobile phone.

Depending on your mobile phone, you can save the webpage as a shortcut on your mobile phone and accessit to 打位。

## Dice Roll

Added new feature for dice roll.

Access it via:

https://ubergoonz.github.io/mj-dw/#/dice

## Development

This app is built with [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), and [Vite](https://vite.dev/).

```bash
npm install       # install dependencies
npm run dev       # start the local dev server
npm run build     # type-check and build for production (outputs to dist/)
npm run preview   # preview the production build locally
npm run lint       # run eslint
```

Routing is handled with `react-router-dom` (`HashRouter`), so the wind-draw page lives at `/` and the dice-roll page at `/#/dice`. Pushing to `main` triggers the `deploy-pages.yml` workflow, which builds the app and deploys `dist/` to GitHub Pages.

### Project structure

```
src/
  components/   # shared UI (e.g. Footer)
  lib/          # pure logic (e.g. wind shuffling)
  pages/        # route-level pages (WindDraw, DiceRoll)
  styles/       # ported CSS from the original static site
  App.tsx       # route definitions
  main.tsx      # app entry point
```

## FAQs

1. Why create this app?

1A. When playing the 1st game using automatic table, have to spend some time to search for 東南西北。 This is wasting time. So I created this app, no need to destroy the 1st automatic arranged setup. Start faster and play more!

2. How does it work?

2A. The app uses a random number generator to generate a random direction and then use that as an input to the compass.


