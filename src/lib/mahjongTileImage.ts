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
/*
 * Classic set: modelled on a real Singapore-style set (see src/assets/
 * Singaporean-Mahjong-Set-Gold-Tile-5_1800x1800.jpg.webp): ivory face with a
 * yellow back edge, concentric-ring 筒 with the traditional green/red/blue
 * placements, segmented 索 with the bird 一索, blue numerals over a red 萬,
 * blue winds, red 中 / green 發 / blue-framed 白, numbered flowers, and the
 * Singapore animal tiles.
 */

const BLUE = "#1d4ea8";
const RED = "#cf2f2a";
const GREEN = "#1f7f3c";
const ORANGE = "#d9771c";
const INK = "#1f2a2a";

const FACE_FONT = "'Noto Serif SC','Songti SC','STSong','Noto Serif CJK SC','SimSun',serif";

const NUMERALS = "一二三四五六七八九";
/** Real sets write 5 as 伍 on the 萬 tile. */
const WAN_NUMERALS = ["一", "二", "三", "四", "伍", "六", "七", "八", "九"];

type Colored = [number, number, string];

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (ch) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[ch]!);
}

function text(x: number, y: number, size: number, fill: string, value: string, weight = 700): string {
  return `<text x="${x}" y="${y}" fill="${fill}" text-anchor="middle" font-family="${FACE_FONT}" font-size="${size}" font-weight="${weight}">${escapeXml(value)}</text>`;
}

/* ---------- 筒 (circles): concentric rings ---------- */

function ring(x: number, y: number, r: number, color: string): string {
  const inner = Math.max(1.6, r * 0.36);
  const mid = r * 0.68;
  return (
    `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="${Math.max(1.2, r * 0.22)}"/>` +
    `<circle cx="${x}" cy="${y}" r="${mid}" fill="none" stroke="${color}" stroke-width="${Math.max(0.8, r * 0.12)}"/>` +
    `<circle cx="${x}" cy="${y}" r="${inner}" fill="${color}"/>`
  );
}

function oneCircle(): string {
  // Large ornate "big cake" 一筒: scalloped green outer, blue ring, red core.
  const petals = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const x = 27 + Math.cos(a) * 18.5;
    const y = 37 + Math.sin(a) * 18.5;
    return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="2.2" fill="${GREEN}"/>`;
  }).join("");
  return (
    petals +
    `<circle cx="27" cy="37" r="15.5" fill="none" stroke="${GREEN}" stroke-width="2"/>` +
    `<circle cx="27" cy="37" r="11.5" fill="none" stroke="${BLUE}" stroke-width="2.2"/>` +
    `<circle cx="27" cy="37" r="7.5" fill="none" stroke="${RED}" stroke-width="1.6"/>` +
    `<circle cx="27" cy="37" r="4" fill="${RED}"/>`
  );
}

const circleLayouts: Record<number, { r: number; dots: Colored[] }> = {
  2: { r: 8, dots: [[27, 23, GREEN], [27, 51, BLUE]] },
  3: { r: 7, dots: [[15, 21, BLUE], [27, 37, RED], [39, 53, BLUE]] },
  4: { r: 7, dots: [[16, 23, GREEN], [38, 23, BLUE], [16, 51, BLUE], [38, 51, GREEN]] },
  5: { r: 6.4, dots: [[15, 21, GREEN], [39, 21, BLUE], [27, 37, RED], [15, 53, BLUE], [39, 53, GREEN]] },
  6: { r: 6.4, dots: [[17, 20, GREEN], [37, 20, GREEN], [17, 37, RED], [37, 37, RED], [17, 54, RED], [37, 54, RED]] },
  7: {
    r: 5.6,
    dots: [[13, 16, GREEN], [27, 21, GREEN], [41, 26, GREEN], [17, 43, RED], [37, 43, RED], [17, 58, RED], [37, 58, RED]],
  },
  8: { r: 5.4, dots: [[17, 14, BLUE], [37, 14, BLUE], [17, 29, BLUE], [37, 29, BLUE], [17, 45, BLUE], [37, 45, BLUE], [17, 60, BLUE], [37, 60, BLUE]] },
  9: {
    r: 5.4,
    dots: [
      [13, 18, GREEN], [27, 18, GREEN], [41, 18, GREEN],
      [13, 37, RED], [27, 37, RED], [41, 37, RED],
      [13, 56, BLUE], [27, 56, BLUE], [41, 56, BLUE],
    ],
  },
};

function circleFace(n: number): string {
  if (n === 1) return oneCircle();
  const { r, dots } = circleLayouts[n];
  return dots.map(([x, y, c]) => ring(x, y, r, c)).join("");
}

/* ---------- 索 (bamboo): segmented sticks ---------- */

function stick(x: number, y: number, color: string, h = 18, rotate = 0, w = 5.6): string {
  const top = y - h / 2;
  const seg = h / 3;
  const transform = rotate ? ` transform="rotate(${rotate} ${x} ${y})"` : "";
  return (
    `<g${transform}>` +
    `<rect x="${x - w / 2}" y="${top}" width="${w}" height="${h}" rx="2.2" fill="${color}"/>` +
    `<rect x="${x - w / 2 - 0.9}" y="${top + seg - 0.9}" width="${w + 1.8}" height="1.8" rx="0.9" fill="#fdfbf3"/>` +
    `<rect x="${x - w / 2 - 0.9}" y="${top + seg * 2 - 0.9}" width="${w + 1.8}" height="1.8" rx="0.9" fill="#fdfbf3"/>` +
    `<rect x="${x - 0.6}" y="${top + 1.5}" width="1.2" height="${seg - 3}" rx="0.6" fill="#fdfbf3" opacity="0.55"/>` +
    `</g>`
  );
}

function bird(): string {
  // Stylised sparrow of the 一索, perched facing left: green body, blue wing, red tail/beak.
  return (
    `<path d="M22 58 L34 58" stroke="${ORANGE}" stroke-width="2" stroke-linecap="round"/>` +
    `<path d="M24 36 C 18 40, 18 52, 28 55 C 36 57, 41 50, 39 42 C 37 34, 30 31, 24 36 Z" fill="${GREEN}"/>` +
    `<path d="M29 40 C 34 38, 40 42, 40 48 C 36 46, 32 46, 29 50 Z" fill="${BLUE}"/>` +
    `<path d="M37 52 L47 48 M38 54 L48 54 M37 56 L46 60" stroke="${RED}" stroke-width="2.2" stroke-linecap="round"/>` +
    `<circle cx="21" cy="30" r="6.2" fill="${GREEN}"/>` +
    `<path d="M15.5 30 L9 32.5 L15.5 33.5 Z" fill="${RED}"/>` +
    `<circle cx="22.5" cy="28.5" r="1.4" fill="#fdfbf3"/><circle cx="22.9" cy="28.5" r="0.7" fill="${INK}"/>` +
    `<path d="M20 24 C 21 19, 25 18, 27 21" stroke="${RED}" stroke-width="1.8" fill="none" stroke-linecap="round"/>` +
    `<path d="M24 55 L22 60 M29 56 L29 61" stroke="${ORANGE}" stroke-width="1.6" stroke-linecap="round"/>`
  );
}

type StickSpec = [number, number, string, number?, number?];

const bambooLayouts: Record<number, { h: number; sticks: StickSpec[] }> = {
  2: { h: 20, sticks: [[27, 24, GREEN], [27, 50, BLUE]] },
  3: { h: 19, sticks: [[27, 22, BLUE], [18, 50, GREEN], [36, 50, GREEN]] },
  4: { h: 19, sticks: [[18, 24, GREEN], [36, 24, BLUE], [18, 50, BLUE], [36, 50, GREEN]] },
  5: { h: 17, sticks: [[16, 22, GREEN], [38, 22, BLUE], [27, 37, RED], [16, 52, BLUE], [38, 52, GREEN]] },
  6: { h: 18, sticks: [[16, 24, GREEN], [27, 24, GREEN], [38, 24, GREEN], [16, 50, BLUE], [27, 50, BLUE], [38, 50, BLUE]] },
  7: {
    h: 15,
    sticks: [[27, 15, RED], [16, 35, GREEN], [27, 35, GREEN], [38, 35, GREEN], [16, 55, GREEN], [27, 55, GREEN], [38, 55, GREEN]],
  },
  8: {
    // Traditional "M over W" arrangement.
    h: 16,
    sticks: [
      [13, 23, GREEN, 16, -18], [22, 23, GREEN, 16, 18], [32, 23, GREEN, 16, -18], [41, 23, GREEN, 16, 18],
      [13, 51, BLUE, 16, 18], [22, 51, BLUE, 16, -18], [32, 51, BLUE, 16, 18], [41, 51, BLUE, 16, -18],
    ],
  },
  9: {
    h: 15,
    sticks: [
      [15, 18, GREEN], [27, 18, RED], [39, 18, BLUE],
      [15, 37, GREEN], [27, 37, RED], [39, 37, BLUE],
      [15, 56, GREEN], [27, 56, RED], [39, 56, BLUE],
    ],
  },
};

function bambooFace(n: number): string {
  if (n === 1) return bird();
  const { h, sticks } = bambooLayouts[n];
  // Sparse layouts use chunkier sticks, as on real tiles.
  const width = sticks.length <= 4 ? 7 : 5.6;
  return sticks.map(([x, y, c, hh, rot]) => stick(x, y, c, hh ?? h, rot ?? 0, width)).join("");
}

/* ---------- 萬, honours ---------- */

function wanFace(n: number): string {
  return text(27, 31, 23, BLUE, WAN_NUMERALS[n - 1]) + text(27, 59, 24, RED, "萬");
}

function honourFace(tile: string): string {
  if (tile === "白") {
    return (
      `<rect x="13" y="13" width="28" height="46" rx="3" fill="none" stroke="${BLUE}" stroke-width="2.4"/>` +
      `<rect x="17" y="17" width="20" height="38" rx="2" fill="none" stroke="${BLUE}" stroke-width="1.3"/>`
    );
  }
  const color = tile === "中" ? RED : tile === "發" ? GREEN : BLUE;
  return text(27, 49, 34, color, tile);
}

/* ---------- Flowers (春夏秋冬 numbered 1-4, 梅蘭菊竹 numbered 1-4) ---------- */

function bloom(x: number, y: number, color: string, r = 2.6): string {
  const petals = Array.from({ length: 5 }, (_, i) => {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    return `<circle cx="${(x + Math.cos(a) * r * 1.35).toFixed(2)}" cy="${(y + Math.sin(a) * r * 1.35).toFixed(2)}" r="${r}" fill="${color}"/>`;
  }).join("");
  return petals + `<circle cx="${x}" cy="${y}" r="${r * 0.8}" fill="#f6d35b"/>`;
}

function leaf(x: number, y: number, rot: number, color = GREEN, rx = 5, ry = 2): string {
  return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${color}" transform="rotate(${rot} ${x} ${y})"/>`;
}

function seasonPlant(tile: string): string {
  const stem = `<path d="M27 60 C 26 50, 30 44, 27 34" stroke="${GREEN}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  switch (tile) {
    case "春":
      return stem + leaf(21, 50, -35) + leaf(33, 44, 35) + bloom(27, 31, RED);
    case "夏":
      return stem + leaf(20, 52, -30) + leaf(34, 52, 30) + leaf(33, 42, 40) + bloom(24, 30, RED, 3) + bloom(32, 36, RED, 2.2);
    case "秋":
      return stem + leaf(21, 48, -40, ORANGE) + leaf(33, 54, 40, ORANGE) + bloom(27, 31, ORANGE, 2.8) + bloom(35, 40, RED, 2);
    default: // 冬
      return (
        `<path d="M27 60 C 25 50, 29 44, 25 34 M27 60 C 30 52, 33 48, 36 40" stroke="${GREEN}" stroke-width="1.8" fill="none" stroke-linecap="round"/>` +
        leaf(20, 50, -35) + bloom(24, 31, RED, 2.6) + bloom(37, 38, RED, 2)
      );
  }
}

function gentlemanPlant(tile: string): string {
  switch (tile) {
    case "梅":
      return (
        `<path d="M22 61 C 24 52, 28 46, 36 36 M28 48 C 24 44, 22 41, 20 38" stroke="${ORANGE}" stroke-width="2" fill="none" stroke-linecap="round"/>` +
        bloom(36, 34, RED, 2.4) + bloom(29, 43, RED, 2.2) + bloom(20, 36, RED, 2) + bloom(32, 54, RED, 1.9)
      );
    case "蘭":
      return (
        `<path d="M27 61 C 20 54, 14 46, 15 32 M27 61 C 34 54, 40 46, 40 32 M27 61 C 25 50, 24 40, 27 30 M27 61 C 31 52, 34 44, 33 34" stroke="${GREEN}" stroke-width="2" fill="none" stroke-linecap="round"/>` +
        bloom(16, 30, RED, 1.8) + bloom(40, 30, RED, 1.8) + bloom(27, 28, RED, 1.8)
      );
    case "菊": {
      const petals = Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return `<ellipse cx="${(27 + Math.cos(a) * 7).toFixed(2)}" cy="${(38 + Math.sin(a) * 7).toFixed(2)}" rx="4" ry="1.7" fill="${ORANGE}" transform="rotate(${((a * 180) / Math.PI).toFixed(1)} ${(27 + Math.cos(a) * 7).toFixed(2)} ${(38 + Math.sin(a) * 7).toFixed(2)})"/>`;
      }).join("");
      return (
        `<path d="M27 61 C 27 54, 27 50, 27 46" stroke="${GREEN}" stroke-width="2" fill="none" stroke-linecap="round"/>` +
        leaf(20, 56, -30) + leaf(34, 56, 30) + petals + `<circle cx="27" cy="38" r="3" fill="#f6d35b"/>`
      );
    }
    default: // 竹
      return (
        stick(21, 46, GREEN, 28) + stick(33, 42, GREEN, 32) +
        `<path d="M24 36 L31 30 M24 50 L17 44 M36 32 L43 27 M36 52 L43 56" stroke="${GREEN}" stroke-width="1.8" stroke-linecap="round"/>` +
        leaf(33, 28, -30, GREEN, 4, 1.5) + leaf(15, 42, 25, GREEN, 4, 1.5) + leaf(44, 25, -25, GREEN, 4, 1.5) + leaf(45, 57, 30, GREEN, 4, 1.5)
      );
  }
}

function flowerFace(tile: string): string {
  const seasons = "春夏秋冬";
  const seasonIndex = seasons.indexOf(tile);
  if (seasonIndex !== -1) {
    // Red numeral top-left, red character top-right.
    return (
      `<text x="9" y="18" fill="${RED}" font-family="${FACE_FONT}" font-size="11" font-weight="700">${seasonIndex + 1}</text>` +
      `<text x="45" y="18" fill="${RED}" text-anchor="end" font-family="${FACE_FONT}" font-size="11" font-weight="700">${tile}</text>` +
      seasonPlant(tile)
    );
  }
  const gentlemen = "梅蘭菊竹";
  const gIndex = gentlemen.indexOf(tile);
  const labelColor = gIndex % 2 === 0 ? BLUE : GREEN;
  // Character top-left, numeral top-right.
  return (
    `<text x="9" y="18" fill="${labelColor}" font-family="${FACE_FONT}" font-size="11" font-weight="700">${tile}</text>` +
    `<text x="45" y="18" fill="${labelColor}" text-anchor="end" font-family="${FACE_FONT}" font-size="11" font-weight="700">${gIndex + 1}</text>` +
    gentlemanPlant(tile)
  );
}

/* ---------- Singapore animals: 貓 鼠 雞 蜈蚣 ---------- */

const ANIMAL_TILES: Record<string, { color: string; label: string }> = {
  貓: { color: GREEN, label: "貓" },
  猫: { color: GREEN, label: "貓" },
  鼠: { color: BLUE, label: "鼠" },
  老鼠: { color: BLUE, label: "鼠" },
  雞: { color: RED, label: "雞" },
  鸡: { color: RED, label: "雞" },
  公雞: { color: RED, label: "雞" },
  蜈蚣: { color: GREEN, label: "蜈蚣" },
};

function animalFace(tile: string): string {
  const { color, label } = ANIMAL_TILES[tile];
  if (label === "蜈蚣") {
    const legs = Array.from({ length: 7 }, (_, i) => {
      const y = 22 + i * 5.5;
      return `<path d="M22 ${y} L15 ${y - 3} M32 ${y} L39 ${y - 3}" stroke="${color}" stroke-width="1.4" stroke-linecap="round"/>`;
    }).join("");
    return (
      `<path d="M27 18 C 31 26, 23 34, 27 42 C 31 50, 23 56, 27 62" stroke="${color}" stroke-width="4.5" fill="none" stroke-linecap="round"/>` +
      legs + `<circle cx="27" cy="17" r="3.2" fill="${RED}"/>`
    );
  }
  return text(27, 50, 32, color, label);
}

/* ---------- Tile body ---------- */

const FLOWER_TILES = "春夏秋冬梅蘭菊竹";

function classicFace(tile: string): string {
  const numbered = tile.match(/^([一二三四五六七八九])([萬筒索])$/);
  if (numbered) {
    const n = NUMERALS.indexOf(numbered[1]) + 1;
    if (numbered[2] === "筒") return circleFace(n);
    if (numbered[2] === "索") return bambooFace(n);
    return wanFace(n);
  }
  if ("東南西北中發白".includes(tile)) return honourFace(tile);
  if (FLOWER_TILES.includes(tile)) return flowerFace(tile);
  if (tile in ANIMAL_TILES) return animalFace(tile);
  return text(27, 48, 26, INK, tile);
}

function classicTileSvg(tile: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 72">` +
    `<defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffefa"/><stop offset="1" stop-color="#f6f1e3"/></linearGradient></defs>` +
    // Yellow back peeking over the top edge, like a real tile seen slightly from above.
    `<rect x="1" y="0.5" width="52" height="71" rx="5" fill="#e3cf6e"/>` +
    `<rect x="1" y="3.5" width="52" height="68" rx="5" fill="url(#f)" stroke="#d6cdb4" stroke-width="1.2"/>` +
    `<rect x="2.6" y="5" width="48.8" height="65" rx="3.6" fill="none" stroke="#ffffff" stroke-opacity="0.7" stroke-width="0.8"/>` +
    classicFace(tile) +
    `</svg>`
  );
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
