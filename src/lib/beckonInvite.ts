export interface StakeOption {
  id: string;
  label: string;
}

/** 底注選項，含相同金額但採用「相公捨入」規則的變體，故以獨立 id 區分。 */
export const STAKE_OPTIONS: StakeOption[] = [
  { id: "0.10-0.20", label: "0.10 / 0.20" },
  { id: "0.20-0.40", label: "0.20 / 0.40" },
  { id: "0.30-0.60", label: "0.30 / 0.60" },
  { id: "0.30-0.60-ro", label: "0.30 / 0.60 (round off)" },
  { id: "0.50-1.00", label: "0.50 / 1.00" },
  { id: "1.00-2.00", label: "1.00 / 2.00" },
  { id: "2.00-4.00", label: "2.00 / 4.00" },
  { id: "3.00-6.00-ro", label: "3.00 / 6.00 (round off)" },
  { id: "5.00-10.00", label: "5.00 / 10.00" },
  { id: "10.00-20.00", label: "10.00 / 20.00" },
];

export interface SelectOption<T extends string> {
  id: T;
  label: string;
}

export type SmokingOption = "table" | "outside" | "none";

export const SMOKING_OPTIONS: SelectOption<SmokingOption>[] = [
  { id: "table", label: "Yes, at table" },
  { id: "outside", label: "Yes, outside" },
  { id: "none", label: "No, smoker not welcome" },
];

export type EndWallOption = "7.5" | "all";

export const END_WALL_OPTIONS: SelectOption<EndWallOption>[] = [
  { id: "7.5", label: "7.5" },
  { id: "all", label: "Play all" },
];

export type PingHuOption = 3.5 | 4;

export const PING_HU_OPTIONS: PingHuOption[] = [3.5, 4];

export type TableMode = "auto" | "manual";

export const TABLE_MODE_OPTIONS: SelectOption<TableMode>[] = [
  { id: "auto", label: "Auto" },
  { id: "manual", label: "Manual" },
];

export const FAN_MIN_BOUND = 0;
export const FAN_MAX_BOUND = 10;

export const EXPECTED_ROUNDS_OPTIONS: number[] = [1, 2, 3, 4, 5, 6, 7, 8];

export type MenQingMode = "off" | "play" | "fan";

export const MEN_QING_OPTIONS: SelectOption<MenQingMode>[] = [
  { id: "off", label: "Not played (不設)" },
  { id: "play", label: "Play" },
  { id: "fan", label: "Play + 加 1 台" },
];

export type BigHandMode = "off" | "complete" | "pong";

export const DA_SAN_YUAN_OPTIONS: SelectOption<BigHandMode>[] = [
  { id: "off", label: "Not played (不設)" },
  { id: "complete", label: "Winning hand only (和牌才算)" },
  { id: "pong", label: "Pong/Kong all 3 dragons (碰/槓三元即成)" },
];

export const DA_SI_XI_OPTIONS: SelectOption<BigHandMode>[] = [
  { id: "off", label: "Not played (不設)" },
  { id: "complete", label: "Winning hand only (和牌才算)" },
  { id: "pong", label: "Pong/Kong all 4 winds (碰/槓四喜即成)" },
];

export interface BeckonInviteForm {
  // Event info
  venueQuery: string;
  startDateTime: string;
  endDateTime: string;
  expectedRounds: number;
  parkingAvailable: boolean;
  parkingSituation: string;
  smoking: SmokingOption;

  // Game rules
  tableMode: TableMode;
  stakeId: string;
  minFan: number;
  maxFan: number;
  pingHu: PingHuOption;
  animalBite: boolean;
  openZheng: boolean;
  openChou: boolean;
  closeZheng: boolean;
  closeChou: boolean;
  fourTilesAddFan: boolean;
  fourTilesPayGang: boolean;
  menQing: MenQingMode;
  shooter: boolean;
  endWall: EndWallOption;
  diceBonus: boolean;
  diceBonusType: string;

  // Special hands
  daSanYuan: BigHandMode;
  daSiXi: BigHandMode;
  qiDuiZiHand: boolean;
  huaHu: boolean;
  tianDiHu: boolean;
}

export function createInitialBeckonInviteForm(): BeckonInviteForm {
  return {
    venueQuery: "",
    startDateTime: "",
    endDateTime: "",
    expectedRounds: 3,
    parkingAvailable: true,
    parkingSituation: "",
    smoking: "none",

    tableMode: "auto",
    stakeId: "1.00-2.00",
    minFan: 1,
    maxFan: 5,
    pingHu: 4,
    animalBite: true,
    openZheng: true,
    openChou: false,
    closeZheng: true,
    closeChou: false,
    fourTilesAddFan: true,
    fourTilesPayGang: true,
    menQing: "play",
    shooter: true,
    endWall: "all",
    diceBonus: false,
    diceBonusType: "",

    daSanYuan: "complete",
    daSiXi: "complete",
    qiDuiZiHand: true,
    huaHu: true,
    tianDiHu: true,
  };
}

export function findStakeOption(stakeId: string): StakeOption {
  return STAKE_OPTIONS.find((option) => option.id === stakeId) ?? STAKE_OPTIONS[0];
}

export function isFanRangeValid(minFan: number, maxFan: number): boolean {
  return maxFan > minFan;
}

/** Returns the venue's Google Maps search link, or empty string if no venue was entered. */
export function buildGoogleMapsUrl(venueQuery: string): string {
  const trimmed = venueQuery.trim();
  if (!trimmed) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

export interface VenueGeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
}

/** Looks up a venue query (location name or postal code) via OpenStreetMap's Nominatim search. Null on no match or failure. */
export async function geocodeVenue(
  venueQuery: string,
  signal?: AbortSignal,
): Promise<VenueGeocodeResult | null> {
  const trimmed = venueQuery.trim();
  if (!trimmed) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(trimmed)}`;
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) return null;

  const results: Array<{ lat: string; lon: string; display_name: string }> = await response.json();
  const first = results[0];
  if (!first) return null;

  const lat = Number(first.lat);
  const lon = Number(first.lon);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

  return { lat, lon, displayName: first.display_name };
}

/** Builds a no-API-key OpenStreetMap embed URL for a small preview map centered on the given coordinates. */
export function buildOsmEmbedUrl(lat: number, lon: number): string {
  const delta = 0.006;
  const left = lon - delta;
  const right = lon + delta;
  const top = lat + delta;
  const bottom = lat - delta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lon}`;
}

/** Total session hours between start/end datetime-local values, rounded to 1 decimal. Null if invalid or end <= start. */
export function calculateTotalHours(startDateTime: string, endDateTime: string): number | null {
  if (!startDateTime || !endDateTime) return null;

  const start = new Date(startDateTime).getTime();
  const end = new Date(endDateTime).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;

  return Math.round(((end - start) / 3_600_000) * 10) / 10;
}

export const HOURS_PER_ROUND = 2;

function toDateTimeLocalString(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Adds the given number of hours to a datetime-local value, returning a new datetime-local string. Empty input yields empty output. */
export function addHoursToDateTimeLocal(dateTimeLocal: string, hours: number): string {
  if (!dateTimeLocal) return "";
  const date = new Date(dateTimeLocal);
  if (Number.isNaN(date.getTime())) return "";
  date.setTime(date.getTime() + hours * 3_600_000);
  return toDateTimeLocalString(date);
}

/** Estimates expected rounds from total hours (2 hours/round), clamped to the supported rounds range. */
export function estimateRoundsFromHours(hours: number): number {
  const raw = Math.round(hours / HOURS_PER_ROUND);
  const min = EXPECTED_ROUNDS_OPTIONS[0];
  const max = EXPECTED_ROUNDS_OPTIONS[EXPECTED_ROUNDS_OPTIONS.length - 1];
  return Math.min(max, Math.max(min, raw));
}

function formatDateTime(value: string): string {
  if (!value) return "TBC";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBC";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatBeckonInviteForChat(form: BeckonInviteForm): string {
  const stake = findStakeOption(form.stakeId);
  const totalHours = calculateTotalHours(form.startDateTime, form.endDateTime);
  const mapsUrl = buildGoogleMapsUrl(form.venueQuery);
  const smokingLabel = SMOKING_OPTIONS.find((option) => option.id === form.smoking)?.label ?? "";
  const tableModeLabel = TABLE_MODE_OPTIONS.find((option) => option.id === form.tableMode)?.label ?? "";
  const endWallLabel = END_WALL_OPTIONS.find((option) => option.id === form.endWall)?.label ?? "";
  const menQingLabel = MEN_QING_OPTIONS.find((option) => option.id === form.menQing)?.label ?? "Not played (不設)";

  const lines: string[] = [
    "📣 招兵買馬 · Mahjong Session Invite",
    "",
    `📍 Venue: ${form.venueQuery.trim() || "TBC"}${mapsUrl ? ` (${mapsUrl})` : ""}`,
    `🕒 Start: ${formatDateTime(form.startDateTime)}`,
    `🕒 End: ${formatDateTime(form.endDateTime)}`,
    `⏱️ Total hours: ${totalHours !== null ? `${totalHours}h` : "TBC"}`,
    `🀄 Expected rounds: ${form.expectedRounds}`,
    `🅿️ Parking: ${form.parkingAvailable ? "Available" : "Not available"}${form.parkingSituation.trim() ? ` (${form.parkingSituation.trim()})` : ""}`,
    `🚬 Smoking: ${smokingLabel}`,
    "",
    "💰 Game rules",
    `Table mode: ${tableModeLabel}`,
    `Stake: ${stake.label}`,
    `Fan range: ${form.minFan}–${form.maxFan}`,
    `門清: ${menQingLabel}`,
    `平胡幾台(Ping Hu): ${form.pingHu}`,
    `花獸咬: ${form.animalBite ? "Yes" : "No"}`,
  ];

  if (form.animalBite) {
    lines.push(
      `  正明: ${form.openZheng ? "Yes" : "No"} · 臭明: ${form.openChou ? "Yes" : "No"}`,
      `  正暗: ${form.closeZheng ? "Yes" : "No"} · 臭暗: ${form.closeChou ? "Yes" : "No"}`,
      `  4隻: Add 1 fan: ${form.fourTilesAddFan ? "Yes" : "No"} · Pay 花獸槓: ${form.fourTilesPayGang ? "Yes" : "No"}`,
    );
  }

  lines.push(
    `出銃 (Shooter): ${form.shooter ? "Yes" : "No"}`,
    `尾墩: ${endWallLabel}`,
    `骰子花紅: ${form.diceBonus ? form.diceBonusType.trim() || "Yes" : "No"}`,
    "",
    "🏆 Special hands",
    `大三元: ${DA_SAN_YUAN_OPTIONS.find((option) => option.id === form.daSanYuan)?.label ?? "Not played (不設)"}`,
    `大四喜: ${DA_SI_XI_OPTIONS.find((option) => option.id === form.daSiXi)?.label ?? "Not played (不設)"}`,
    `七对子: ${form.qiDuiZiHand ? "有玩" : "没有玩"}`,
    `花胡: ${form.huaHu ? "有玩" : "没有玩"}`,
  );

  if (form.huaHu) {
    lines.push(
      "  自摸第7張可搶第8張，抓第8張者付1台出銃 + 2台閒家",
      "  自摸第8張，全體以出銃價支付",
    );
  } else {
    lines.push("  不設花胡：自摸可打到第7張，第8張仍可搶（付1台）");
  }

  lines.push(`天地胡: ${form.tianDiHu ? "Yes" : "No"}`);

  if (form.tianDiHu) {
    lines.push(
      "  僅限首圈",
      "  天胡：限庄家，全體以出銃價支付",
      "  地胡：自摸第7張可搶第8張，抓第8張者付1台出銃 + 2台閒家",
    );
  }

  return lines.join("\n");
}

/** Builds a text prompt (for AI image generators) describing a banner image for this session invite. */
export function formatBeckonInviteImagePrompt(form: BeckonInviteForm): string {
  const stake = findStakeOption(form.stakeId);
  const totalHours = calculateTotalHours(form.startDateTime, form.endDateTime);

  const lines: string[] = [
    "Design a vibrant, eye-catching banner image inviting friends to a mahjong game session.",
    "",
    "Include these details tastefully in the design (as decorative text or captions):",
    `- Venue: ${form.venueQuery.trim() || "TBC"}`,
    `- Date/time: ${formatDateTime(form.startDateTime)} to ${formatDateTime(form.endDateTime)}${totalHours !== null ? ` (${totalHours}h)` : ""}`,
    `- Expected rounds: ${form.expectedRounds}`,
    `- Stake: ${stake.label}`,
    "",
    "Visual style: festive Chinese/Singaporean mahjong theme, mahjong tiles (bamboo, dots, characters, winds, dragons) artfully arranged, warm red/gold/jade color palette, celebratory and inviting mood, clean modern layout suitable for a landscape banner (16:9), legible bold title text such as \"MAHJONG NIGHT\" or \"招兵買馬\".",
    "Avoid photorealistic faces; keep the style illustrative/graphic.",
  ];

  return lines.join("\n");
}
