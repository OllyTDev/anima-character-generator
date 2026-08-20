import { describe, expect, it } from "vitest";
import {
  addKiGeneration,
  clampKiPoolValue,
  halfKiGeneration,
  kiPoolDefinitions,
} from "./kiPools";
import { deriveSheet } from "./derived";
import { createEmptyCharacter } from "../schema/character";
import { addKiAbility } from "./martialKnowledge";

describe("kiPools", () => {
  it("uses half generation rounded down with a minimum of 1", () => {
    expect(halfKiGeneration(4)).toBe(2);
    expect(halfKiGeneration(3)).toBe(1);
    expect(halfKiGeneration(1)).toBe(1);
  });

  it("adds generation per pool without exceeding max", () => {
    const defs = [
      { id: "STR", label: "STR", max: 6, perTurn: 2 },
      { id: "DEX", label: "DEX", max: 5, perTurn: 1 },
    ];
    const afterFull = addKiGeneration({ STR: 5, DEX: 0 }, defs, "full");
    expect(afterFull).toEqual({ STR: 6, DEX: 1 });
    const afterHalf = addKiGeneration({ STR: 0, DEX: 0 }, defs, "half");
    expect(afterHalf).toEqual({ STR: 1, DEX: 1 });
  });

  it("clamps pool values between 0 and max", () => {
    expect(clampKiPoolValue(3, 6)).toBe(3);
    expect(clampKiPoolValue(8, 6)).toBe(6);
    expect(clampKiPoolValue(-2, 6)).toBe(0);
    expect(clampKiPoolValue(null, 6)).toBe(0);
    expect(clampKiPoolValue(2.9, 6)).toBe(2);
  });

  it("builds one combined pool definition when ki generation is combined", () => {
    const character = addKiAbility(createEmptyCharacter(), "Use of Ki", 1);
    character.settings.kiGenerationMode = "combined";
    const defs = kiPoolDefinitions(deriveSheet(character));
    expect(defs).toHaveLength(1);
    expect(defs[0]?.id).toBe("combined");
  });
});
