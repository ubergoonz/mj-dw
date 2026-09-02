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
  const face = numberedTile
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
