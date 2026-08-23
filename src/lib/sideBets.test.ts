import { describe, expect, it } from "vitest";
import { getSideBetRows } from "./sideBets";

describe("getSideBetRows", () => {
  it("inherits the max base when hidden and the min base when open", () => {
    const rows = getSideBetRows({ baseMin: 1, baseMax: 2 });

    expect(rows.find((row) => row.key === "animal-hidden")).toMatchObject({
      perPlayer: 2,
      winnerTakes: 6,
    });

    expect(rows.find((row) => row.key === "animal-open")).toMatchObject({
      perPlayer: 1,
      winnerTakes: 3,
    });
  });

  it("applies the same hidden/open rule to gang", () => {
    const rows = getSideBetRows({ baseMin: 1, baseMax: 5 });

    expect(rows.find((row) => row.key === "gang-hidden")).toMatchObject({
      perPlayer: 5,
      winnerTakes: 15,
    });

    expect(rows.find((row) => row.key === "gang-open")).toMatchObject({
      perPlayer: 1,
      winnerTakes: 3,
    });
  });

  it("keeps max at or above min", () => {
    const rows = getSideBetRows({ baseMin: 5, baseMax: 1 });

    expect(rows.find((row) => row.key === "animal-hidden")?.perPlayer).toBe(5);
  });

  it("charges each of the three players the same amount", () => {
    const rows = getSideBetRows({ baseMin: 1, baseMax: 2 });

    for (const row of rows) {
      expect(row.winnerTakes).toBe(row.perPlayer * 3);
    }
  });
});
