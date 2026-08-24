import { describe, expect, it } from "vitest";
import { potentialToDifficulty } from "./difficulty";

describe("potentialToDifficulty", () => {
  it("rounds down to the highest reached tier", () => {
    expect(potentialToDifficulty(130)).toEqual({
      basePotential: 130,
      roundedPotential: 120,
      tierName: "Difficult",
    });
  });

  it("returns the exact threshold when potential matches a boundary", () => {
    expect(potentialToDifficulty(140)).toEqual({
      basePotential: 140,
      roundedPotential: 140,
      tierName: "Very Difficult",
    });
  });

  it("returns no tier below Routine", () => {
    expect(potentialToDifficulty(15)).toEqual({
      basePotential: 15,
      roundedPotential: 0,
      tierName: null,
    });
  });

  it("caps at Zen for potential above the highest threshold", () => {
    expect(potentialToDifficulty(500)).toEqual({
      basePotential: 500,
      roundedPotential: 440,
      tierName: "Zen",
    });
  });
});
