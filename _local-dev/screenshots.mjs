// Regenerates docs-site/static/img/features/*.png from a running build of the app.
// Drives the locally installed Google Chrome (no browser download needed).
//
//   npm run build && npm run preview          # in one terminal
//   npm run docs:screenshots                  # in another
//
// Optional args: node _local-dev/screenshots.mjs <baseUrl> <outDir>
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const [, , base = "http://localhost:4173/mj-dw/", outDir = path.join(here, "..", "docs-site", "static", "img", "features")] =
  process.argv;
fs.mkdirSync(outDir, { recursive: true });

const WIDTH = 726;

const shots = [
  {
    name: "wind-draw",
    route: "wind-draw",
    height: 760,
    async act(page) {
      await page.getByRole("button", { name: "开始抽风" }).click();
      await page.waitForTimeout(3200);
    },
  },
  {
    name: "dice-roll",
    route: "dice",
    height: 760,
    async act(page) {
      await page.locator(".roll-button").click();
      await page.waitForTimeout(1400);
    },
  },
  {
    name: "in-game-dice-roll",
    route: "in-game-dice",
    height: 900,
    async act(page) {
      const btn = page.locator(".compass button, .dice-center, button[aria-label*='掷']").first();
      await btn.click();
      await page.waitForTimeout(1300);
      await btn.click();
      await page.waitForTimeout(3200);
    },
  },
  { name: "fan-payout", route: "fan-payout", height: 1000 },
  { name: "side-bets", route: "side-bets", height: 1000 },
  {
    name: "player-results",
    route: "player-results",
    height: 1000,
    async act(page) {
      page.on("dialog", (d) => d.accept());
      const names = ["Ah Seng", "Mei Ling", "Uncle Tan", "Jia Wei"];
      for (const [i, seat] of ["東", "南", "西", "北"].entries()) {
        await page.getByPlaceholder(`${seat} player`).fill(names[i]);
      }
      const nums = page.locator("input[type=number]");
      // inputs: total, then per seat (base, left)
      await nums.nth(2).fill("650");
      await nums.nth(4).fill("380");
      await nums.nth(6).fill("520");
      await nums.nth(8).fill("450");
      await page.getByRole("button", { name: "全完場" }).click();
      await page.waitForTimeout(300);
    },
    extra: [{ name: "player-results-records", focus: ".fan-table-wrap", offset: 140 }],
  },
  { name: "beckon-invite", route: "beckon-invite", height: 1000 },
  { name: "special-hands", route: "special-hands", height: 1000 },
  {
    name: "pure-suit",
    route: "pure-suit",
    height: 1000,
    async act(page) {
      // 13-tile listening hand in 萬: 1112345678999 (nine gates).
      const counts = { 一: 3, 二: 1, 三: 1, 四: 1, 五: 1, 六: 1, 七: 1, 八: 1, 九: 3 };
      for (const [n, c] of Object.entries(counts)) {
        for (let i = 0; i < c; i++) await page.getByRole("button", { name: `Add one ${n}萬 to hand` }).click();
      }
      await page.waitForTimeout(300);
    },
    extra: [{ name: "pure-suit-waits", focus: ".pure-suit-waits", offset: 540 }],
  },
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const shot of shots) {
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: shot.height },
    deviceScaleFactor: 1,
    locale: "en-SG",
    timezoneId: "Asia/Singapore",
  });
  const page = await context.newPage();
  await page.goto(`${base}#/${shot.route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  if (shot.act) await shot.act(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${outDir}/${shot.name}.png` });
  console.log("captured", shot.name);
  for (const extra of shot.extra ?? []) {
    await page.evaluate(([sel, off]) => {
      const el = document.querySelector(sel);
      const top = el.getBoundingClientRect().top + window.scrollY - off;
      window.scrollTo(0, Math.max(0, top));
    }, [extra.focus, extra.offset ?? 0]);
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${outDir}/${extra.name}.png` });
    console.log("captured", extra.name);
  }
  await context.close();
}
await browser.close();
