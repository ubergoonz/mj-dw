import { describe, expect, it } from "vitest";
import { getSideBetRows } from "./sideBets";

describe("getSideBetRows", () => {
  it("inherits the max base when hidden and the min base when open", () => {
    const rows = getSideBetRows({ baseMin: 1, baseMax: 2 });

    expect(rows.find((row) => row.key === "animal-1-hidden")).toMatchObject({
      perPlayer: 2,
      winnerTakes: 6,
    });

    expect(rows.find((row) => row.key === "animal-1-open")).toMatchObject({
      perPlayer: 1,
      winnerTakes: 3,
    });
  });

  it("adds one more max for a two pair 正咬", () => {
    const rows = getSideBetRows({ baseMin: 1, baseMax: 2 });

    expect(rows.find((row) => row.key === "animal-2-hidden")).toMatchObject({
      pairs: 2,
      perPlayer: 6,
      winnerTakes: 18,
    });

    expect(rows.find((row) => row.key === "animal-2-open")).toMatchObject({
      pairs: 2,
      perPlayer: 4,
      winnerTakes: 12,
    });
  });

  it("applies the same hidden/open rule to gang", () => {
    const rows = getSideBetRows({ baseMin: 1, baseMax: 5 });

    expect(rows.find((row) => row.key === "gang-1-hidden")).toMatchObject({
      perPlayer: 5,
      winnerTakes: 15,
    });

    expect(rows.find((row) => row.key === "gang-1-open")).toMatchObject({
      perPlayer: 1,
      winnerTakes: 3,
    });
  });

  it("keeps max at or above min", () => {
    const rows = getSideBetRows({ baseMin: 5, baseMax: 1 });

    expect(rows.find((row) => row.key === "animal-1-hidden")?.perPlayer).toBe(5);
  });

  it("charges each of the three players the same amount", () => {
    const rows = getSideBetRows({ baseMin: 1, baseMax: 2 });

    for (const row of rows) {
      expect(row.winnerTakes).toBe(row.perPlayer * 3);
    }
  });

  it("lets the discarder cover the whole payout on open gang", () => {
    const rows = getSideBetRows({ baseMin: 1, baseMax: 2 });

    expect(rows.find((row) => row.key === "gang-1-open")).toMatchObject({
      hasShooter: true,
      shooterPays: 3,
      winnerTakes: 3,
    });

    for (const row of rows.filter((candidate) => candidate.key !== "gang-1-open")) {
      expect(row).toMatchObject({ hasShooter: false, shooterPays: 0 });
    }
  });
});
