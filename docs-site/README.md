# 麻将都Win Docs

Documentation site for the [mj-dw](https://github.com/ubergoonz/mj-dw) mahjong toolkit, built with [Docusaurus](https://docusaurus.io/). It is kept as a standalone project so its dependencies stay isolated from the app's React/Vite stack.

Live site: https://ubergoonz.github.io/mj-dw/docs/

## Structure

- `docs/intro.mdx` — overview, install-to-home-screen guidance, what each tool remembers on the device
- `docs/features/*.mdx` — one page per tool, in sidebar order: 選風打位, 掷骰子, 掷骰开墩, 台數計算, 花獸槓計算, 秋後算績, 招兵買馬, 特別牌型, 清一色听牌
- `static/img/features/*.png` — screenshots referenced by the feature pages
- `src/components/HomepageFeatures` — the card grid on the docs homepage

Blogging is disabled (`blog: false` in `docusaurus.config.ts`).

## Local development

```bash
npm install
npm run start      # dev server with live reload
npm run build      # static output in build/
```

From the repository root, `npm run dev` runs the app and docs together, and `npm run build:all` builds both and copies this site into `dist/docs`.

## Keeping docs in sync with the app

When a tool's behaviour changes:

1. Update its page under `docs/features/` and, if the change is cross-cutting (persistence, copy/share, install), `docs/intro.mdx`.
2. Regenerate screenshots so they match the current UI:

   ```bash
   # repository root
   npm run build && npm run preview     # terminal 1 — serves the app on :4173
   npm run docs:screenshots             # terminal 2 — writes static/img/features/*.png
   ```

   The script (`_local-dev/screenshots.mjs`) drives the locally installed Google Chrome through `playwright-core`, captures every tool at 726px wide, and puts each stateful tool into a representative state (a completed wind draw, a finished wall break, a settled 秋後算績 session, a listening 清一色 hand).
3. Run `npm run build` here to validate MDX and links before committing.

## Deployment

The site is deployed automatically by `.github/workflows/deploy-pages.yml` on every push to `main`, together with the app. There is no manual `npm run deploy` step.
