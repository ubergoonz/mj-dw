import { describe, expect, it } from "vitest";
import { FAN_BASE_OPTIONS, FAN_TABLE_MAX, getFanPayoutRows } from "./fanPayout";

describe("FAN_BASE_OPTIONS", () => {
  it("lists the player/shooter base pairs", () => {
    expect(FAN_BASE_OPTIONS).toEqual([
      { player: 0.5, shooter: 1 },
      { player: 1, shooter: 2 },
      { player: 2, shooter: 4 },
      { player: 3, shooter: 6 },
      { player: 5, shooter: 10 },
      { player: 10, shooter: 20 },
    ]);
  });
});

describe("getFanPayoutRows", () => {
  it("uses the base pair as the 0 台 foundation", () => {
    const rows = getFanPayoutRows({
      base: 1,
      minFan: 0,
      maxFan: 2,
      selfDrawBonus: false,
      selfDrawBonusAmount: 0,
    });

    expect(rows[0]).toMatchObject({
      fan: 0,
      label: "鸡胡",
      multiplier: 1,
      playerPays: 1,
      shooterPays: 2,
      winnerTakes: 4,
    });

    expect(rows[1]).toMatchObject({
      fan: 1,
      label: "1",
      multiplier: 2,
      playerPays: 2,
      shooterPays: 4,
      winnerTakes: 8,
    });
  });

  it("treats every seat as a shooter on 自摸", () => {
    const rows = getFanPayoutRows({
      base: 1,
      minFan: 0,
      maxFan: 0,
      selfDrawBonus: false,
      selfDrawBonusAmount: 0,
    });

    expect(rows[0]).toMatchObject({
      fan: 0,
      selfDrawEach: 2,
      selfDrawWinnerTakes: 6,
    });
  });

  it("adds the 自摸 bonus to every seat", () => {
    const rows = getFanPayoutRows({
      base: 1,
      minFan: 0,
      maxFan: 1,
      selfDrawBonus: true,
      selfDrawBonusAmount: 1,
    });

    expect(rows[0]).toMatchObject({
      fan: 0,
      shooterPays: 2,
      selfDrawEach: 3,
      selfDrawWinnerTakes: 9,
    });

    expect(rows[1]).toMatchObject({
      fan: 1,
      shooterPays: 4,
      selfDrawEach: 5,
      selfDrawWinnerTakes: 15,
    });
  });

  it("ignores the bonus amount when the 自摸 bonus is off", () => {
    const rows = getFanPayoutRows({
      base: 2,
      minFan: 0,
      maxFan: 0,
      selfDrawBonus: false,
      selfDrawBonusAmount: 5,
    });

    expect(rows[0]).toMatchObject({
      playerPays: 2,
      shooterPays: 4,
      winnerTakes: 8,
      selfDrawEach: 4,
      selfDrawWinnerTakes: 12,
    });
  });

  it("doubles each fan step from the base", () => {
    const rows = getFanPayoutRows({
      base: 3,
      minFan: 0,
      maxFan: 3,
      selfDrawBonus: false,
      selfDrawBonusAmount: 0,
    });

    expect(rows.slice(0, 4).map((row) => [row.playerPays, row.shooterPays])).toEqual([
      [3, 6],
      [6, 12],
      [12, 24],
      [24, 48],
    ]);
  });

  it("always renders 0 台 through the table limit and flags the selected range", () => {
    const rows = getFanPayoutRows({
      base: 1,
      minFan: 2,
      maxFan: 3,
      selfDrawBonus: false,
      selfDrawBonusAmount: 0,
    });

    expect(rows).toHaveLength(FAN_TABLE_MAX + 1);
    expect(rows[0].fan).toBe(0);
    expect(rows[FAN_TABLE_MAX].fan).toBe(FAN_TABLE_MAX);
    expect(rows.filter((row) => row.inRange).map((row) => row.fan)).toEqual([2, 3]);
  });
});
