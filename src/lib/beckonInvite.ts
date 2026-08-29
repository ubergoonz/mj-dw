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

export const FAN_MIN_BOUND = 0;
export const FAN_MAX_BOUND = 10;

export const EXPECTED_ROUNDS_OPTIONS: number[] = [4, 8, 12, 16, 20, 24, 32];

export interface BeckonInviteForm {
  // Event info
  venueQuery: string;
  startDateTime: string;
  endDateTime: string;
  expectedRounds: number;
  parkingAvailable: boolean;
  smoking: SmokingOption;

  // Game rules
  stakeId: string;
  minFan: number;
  maxFan: number;
  pingHu: PingHuOption;
  animalBite: boolean;
  openZheng: boolean;
  openChou: boolean;
  closeZheng: boolean;
  closeChou: boolean;
  sevenPair: boolean;
  shooter: boolean;
  endWall: EndWallOption;
  diceBonus: boolean;
  diceBonusType: string;

  // Special hands
  daSanYuan: boolean;
  daSiXi: boolean;
  qiDuiZiHand: boolean;
  huaHu: boolean;
  tianDiHu: boolean;
}

export function createInitialBeckonInviteForm(): BeckonInviteForm {
  return {
    venueQuery: "",
    startDateTime: "",
    endDateTime: "",
    expectedRounds: 8,
    parkingAvailable: true,
    smoking: "none",

    stakeId: STAKE_OPTIONS[0].id,
    minFan: 1,
    maxFan: 8,
    pingHu: 4,
    animalBite: true,
    openZheng: true,
    openChou: false,
    closeZheng: true,
    closeChou: false,
    sevenPair: true,
    shooter: true,
    endWall: "all",
    diceBonus: false,
    diceBonusType: "",

    daSanYuan: true,
    daSiXi: true,
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

/** Total session hours between start/end datetime-local values, rounded to 1 decimal. Null if invalid or end <= start. */
export function calculateTotalHours(startDateTime: string, endDateTime: string): number | null {
  if (!startDateTime || !endDateTime) return null;

  const start = new Date(startDateTime).getTime();
  const end = new Date(endDateTime).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;

  return Math.round(((end - start) / 3_600_000) * 10) / 10;
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
  const endWallLabel = END_WALL_OPTIONS.find((option) => option.id === form.endWall)?.label ?? "";

  const lines: string[] = [
    "📣 招兵買馬 · Mahjong Session Invite",
    "",
    `📍 Venue: ${form.venueQuery.trim() || "TBC"}${mapsUrl ? ` (${mapsUrl})` : ""}`,
    `🕒 Start: ${formatDateTime(form.startDateTime)}`,
    `🕒 End: ${formatDateTime(form.endDateTime)}`,
    `⏱️ Total hours: ${totalHours !== null ? `${totalHours}h` : "TBC"}`,
    `🀄 Expected rounds: ${form.expectedRounds}`,
    `🅿️ Parking: ${form.parkingAvailable ? "Available" : "Not available"}`,
    `🚬 Smoking: ${smokingLabel}`,
    "",
    "💰 Game rules",
    `Stake: ${stake.label}`,
    `Fan range: ${form.minFan}–${form.maxFan}`,
    `鸡胡 (Ping Hu): ${form.pingHu}`,
    `花獸咬: ${form.animalBite ? "Yes" : "No"}`,
  ];

  if (form.animalBite) {
    lines.push(
      `  正明: ${form.openZheng ? "Yes" : "No"} · 臭明: ${form.openChou ? "Yes" : "No"}`,
      `  正暗: ${form.closeZheng ? "Yes" : "No"} · 臭暗: ${form.closeChou ? "Yes" : "No"}`,
    );
  }

  lines.push(
    `七對: ${form.sevenPair ? "Yes" : "No"}`,
    `出銃 (Shooter): ${form.shooter ? "Yes" : "No"}`,
    `尾墩: ${endWallLabel}`,
    `骰子花紅: ${form.diceBonus ? form.diceBonusType.trim() || "Yes" : "No"}`,
    "",
    "🏆 Special hands",
    `大三元: ${form.daSanYuan ? "食詖 Yes" : "No"}`,
    `大四喜: ${form.daSiXi ? "食詖 Yes" : "No"}`,
    `七對子: ${form.qiDuiZiHand ? "食詖 Yes" : "No"}`,
    `花胡: ${form.huaHu ? "Yes" : "No"}`,
  );

  if (form.huaHu) {
    lines.push(
      "  自摸第7張可搶第8張，抓第8張者付1台出銃 + 2台閒家",
      "  自摸第8張，全體以出銃價支付",
    );
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
