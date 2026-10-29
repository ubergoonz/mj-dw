import { describe, expect, it } from "vitest";
import specialHands from "../data/specialHands.json";
import { MAHJONG_TILE_SETS, mahjongTileImage } from "./mahjongTileImage";

const NUMBERED = ["萬", "筒", "索"].flatMap((suit) => [..."一二三四五六七八九"].map((n) => `${n}${suit}`));
const HONOURS = [..."東南西北中發白"];
const FLOWERS = [..."春夏秋冬梅蘭菊竹"];
const ANIMALS = ["貓", "鼠", "雞", "蜈蚣"];
const FULL_SET = [...NUMBERED, ...HONOURS, ...FLOWERS, ...ANIMALS];

function decode(dataUrl: string): string {
  expect(dataUrl.startsWith("data:image/svg+xml,")).toBe(true);
  return decodeURIComponent(dataUrl.slice("data:image/svg+xml,".length));
}

describe("mahjongTileImage", () => {
  it("renders every tile of a Singapore set in every tile set without throwing", () => {
    for (const set of MAHJONG_TILE_SETS) {
      for (const tile of FULL_SET) {
        const svg = decode(mahjongTileImage(tile, set.id));
        expect(svg.startsWith("<svg")).toBe(true);
        expect(svg.endsWith("</svg>")).toBe(true);
      }
    }
  });

  it("renders every tile referenced by the special-hands catalogue", () => {
    const tiles = new Set<string>();
    for (const hand of specialHands) {
      hand.exampleTiles.forEach((tile: string) => tiles.add(tile));
      hand.winningPotentialTiles?.forEach((tile: string) => tiles.add(tile));
    }
    expect(tiles.size).toBeGreaterThan(0);
    for (const tile of tiles) {
      expect(decode(mahjongTileImage(tile))).toContain("<svg");
    }
  });

  it("uses the classic colour conventions: blue numeral over red 萬, with 伍 for five", () => {
    const five = decode(mahjongTileImage("五萬"));
    expect(five).toContain(">伍<");
    expect(five).toContain(">萬<");
    expect(five.indexOf("#1d4ea8")).toBeLessThan(five.indexOf("#cf2f2a"));
  });

  it("draws 一索 as a bird and 白 as a frame instead of text", () => {
    expect(decode(mahjongTileImage("一索"))).not.toContain("<text");
    const white = decode(mahjongTileImage("白"));
    expect(white).not.toContain(">白<");
    expect(white).toContain("<rect");
  });

  it("escapes unknown tile text so markup cannot leak into the SVG", () => {
    const svg = decode(mahjongTileImage("<b>"));
    expect(svg).not.toContain("<b>");
    expect(svg).toContain("&lt;b&gt;");
  });
});
