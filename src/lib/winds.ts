export interface Wind {
  name: string;
  character: string;
  detail: string;
}

export const winds: Wind[] = [
  { name: "東风", character: "東", detail: "庄家先行，开局大吉" },
  { name: "南风", character: "南", detail: "南来北往，手气正旺" },
  { name: "西风", character: "西", detail: "西风送爽，静待好牌" },
  { name: "北风", character: "北", detail: "北辰高照，稳坐牌桌" },
];

/** Fisher-Yates shuffle; returns a new shuffled copy without mutating input. */
export function shuffledWinds(source: Wind[] = winds): Wind[] {
  const shuffled = [...source];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}
