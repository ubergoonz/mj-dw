export type MahjongTileSetId = "classic" | "unicode";

export const MAHJONG_TILE_SETS: Array<{ id: MahjongTileSetId; label: string }> = [
  { id: "classic", label: "Classic color" },
  { id: "unicode", label: "Unicode" },
];

const unicodeTileGlyphs: Record<string, string> = {
  東: "🀀",
  南: "🀁",
  西: "🀂",
  北: "🀃",
  中: "中",
  發: "🀅",
  白: "🀆",
  一萬: "🀇",
  二萬: "🀈",
  三萬: "🀉",
  四萬: "🀊",
  五萬: "🀋",
  六萬: "🀌",
  七萬: "🀍",
  八萬: "🀎",
  九萬: "🀏",
  一筒: "🀙",
  二筒: "🀚",
  三筒: "🀛",
  四筒: "🀜",
  五筒: "🀝",
  六筒: "🀞",
  七筒: "🀟",
  八筒: "🀠",
  九筒: "🀡",
  一索: "🀐",
  二索: "🀑",
  三索: "🀒",
  四索: "🀓",
  五索: "🀔",
  六索: "🀕",
  七索: "🀖",
  八索: "🀗",
  九索: "🀘",
  春: "🀢",
  夏: "🀣",
  秋: "🀤",
  冬: "🀥",
  梅: "🀦",
  蘭: "🀧",
  菊: "🀨",
  竹: "🀩",
};

const pipLayouts: Record<number, Array<[number, number]>> = {
  1: [[27, 36]],
  2: [[18, 24], [36, 48]],
  3: [[18, 22], [27, 36], [36, 50]],
  4: [[17, 23], [37, 23], [17, 49], [37, 49]],
  5: [[17, 23], [37, 23], [27, 36], [17, 49], [37, 49]],
  6: [[17, 21], [37, 21], [17, 36], [37, 36], [17, 51], [37, 51]],
  7: [[17, 20], [37, 20], [27, 30], [17, 36], [37, 36], [17, 52], [37, 52]],
  8: [[17, 19], [37, 19], [17, 30], [37, 30], [17, 42], [37, 42], [17, 53], [37, 53]],
  9: [[17, 19], [27, 19], [37, 19], [17, 36], [27, 36], [37, 36], [17, 53], [27, 53], [37, 53]],
};

function circleFace(number: number): string {
  return pipLayouts[number]
    .map(([x, y], index) => `<circle cx="${x}" cy="${y}" r="6" fill="${index % 3 === 1 ? "#c5503a" : "#2c668e"}" stroke="#173d38" stroke-width="1"/>`)
    .join("");
}

function bambooFace(number: number): string {
  return pipLayouts[number]
    .map(([x, y]) => `<rect x="${x - 3}" y="${y - 9}" width="6" height="18" rx="3" fill="#39836d"/><path d="M${x} ${y - 7}V${y + 7}" stroke="#d19a42" stroke-width="1"/>`)
    .join("");
}

function classicTileSvg(tile: string): string {
  const numberedTile = tile.match(/^([一二三四五六七八九])([萬筒索])$/);
  const isRedDragon = tile === "中";
  const isGreenDragon = tile === "發";
  const isFlower = "春夏秋冬梅蘭菊竹".includes(tile);
  const color = numberedTile
    ? { 萬: "#c5503a", 筒: "#2c668e", 索: "#39836d" }[numberedTile[2]]
    : isRedDragon
      ? "#c5503a"
      : isGreenDragon
        ? "#39836d"
        : isFlower
          ? "#b35a73"
          : "#173d38";
  const numberedValue = numberedTile ? "一二三四五六七八九".indexOf(numberedTile[1]) + 1 : 0;
  const face = numberedTile?.[2] === "筒"
    ? circleFace(numberedValue)
    : numberedTile?.[2] === "索"
      ? bambooFace(numberedValue)
      : numberedTile
        ? `<text x="27" y="34" fill="${color}" text-anchor="middle" font-family="Noto Serif SC, serif" font-size="27" font-weight="700">${numberedTile[1]}</text><text x="27" y="57" fill="${color}" text-anchor="middle" font-family="Noto Serif SC, serif" font-size="15" font-weight="700">${numberedTile[2]}</text>`
    : `<text x="27" y="46" fill="${color}" text-anchor="middle" font-family="Noto Serif SC, serif" font-size="29" font-weight="700">${tile}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 72"><rect x="1" y="1" width="52" height="70" rx="5" fill="#fffdf8" stroke="#cdb988" stroke-width="2"/>${face}</svg>`;
}

function unicodeTileSvg(tile: string): string {
  const glyph = unicodeTileGlyphs[tile] ?? tile;
  const isRedDragon = tile === "中";
  const fontFamily = isRedDragon ? "Noto Serif SC, serif" : "Apple Color Emoji, Noto Color Emoji, sans-serif";
  const fill = isRedDragon ? "#c5503a" : "#0c2d29";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 72"><rect x="1" y="1" width="52" height="70" rx="5" fill="#fffdf8" stroke="#cdb988" stroke-width="2"/><text x="27" y="47" fill="${fill}" text-anchor="middle" font-family="${fontFamily}" font-size="37">${glyph}</text></svg>`;
}

/** Returns a self-contained Mahjong tile image from the selected visual set. */
export function mahjongTileImage(tile: string, tileSet: MahjongTileSetId = "classic"): string {
  const svg = tileSet === "classic" ? classicTileSvg(tile) : unicodeTileSvg(tile);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
