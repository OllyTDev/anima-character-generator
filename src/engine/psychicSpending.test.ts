import { describe, expect, it } from "vitest";
import { addAdvantage } from "./creationPoints";
import { spendDp } from "./developmentPoints";
import { createEmptyCharacter } from "../schema/character";
import {
  buyInnateSlot,
  basePsychicPotential,
  canBuyDisciplinesWithPP,
  canLearnPower,
  canMasterDiscipline,
  canTempSpend,
  freePPRemaining,
  globalPotentialBonus,
  investInPower,
  innateSlotPotential,
  learnPower,
  maintainableLearnedPowers,
  masterDiscipline,
  permanentPPSpent,
  powerPotential,
  raiseGlobalPotential,
  removePsychicDevelopmentEntry,
  setInnateSlotAssignment,
  tempSpend,
  undoTempSpend,
  unlearnedPowersInAccessibleDisciplines,
  unlearnPower,
  unmasterDiscipline,
  innateSlotAssignments,
} from "./psychicSpending";

function psychicWithFreeAccess() {
  return addAdvantage(createEmptyCharacter(), "Free Access to Any Psychic Discipline", 2);
}

function psychicWithOneDiscipline(discipline = "Telepathy") {
  return addAdvantage(createEmptyCharacter(), "Access to One Psychic Discipline", 1, discipline);
}

function withExtraPP(character: ReturnType<typeof createEmptyCharacter>, count: number) {
  let next = character;
  for (let i = 0; i < count; i++) {
    const index = 0;
    const current = Number(next.levels[index].dp["Psychic Points"] ?? 0);
    next = spendDp(next, 1, "Psychic Points", current + 1);
  }
  return next;
}

describe("psychicSpending", () => {
  it("tracks PP accounting: total − permanent − temp = free", () => {
    let character = withExtraPP(psychicWithFreeAccess(), 5);
    expect(freePPRemaining(character)).toBe(6);
    character = masterDiscipline(character, "Energy");
    expect(permanentPPSpent(character)).toBe(1);
    expect(freePPRemaining(character)).toBe(5);
    character = tempSpend(character, "eliminate-fatigue");
    expect(freePPRemaining(character)).toBe(4);
    const spendId = character.psychic!.tempSpends[0].id;
    character = undoTempSpend(character, spendId);
    expect(freePPRemaining(character)).toBe(5);
  });

  it("blocks extra disciplines for Access to One", () => {
    const character = psychicWithOneDiscipline("Telepathy");
    expect(canBuyDisciplinesWithPP(character)).toBe(false);
    expect(canMasterDiscipline(character, "Energy")).toBe(false);
  });

  it("allows multiple disciplines for Free Access", () => {
    let character = withExtraPP(psychicWithFreeAccess(), 2);
    expect(canMasterDiscipline(character, "Energy")).toBe(true);
    character = masterDiscipline(character, "Energy");
    expect(canMasterDiscipline(character, "Pyrokinesis")).toBe(true);
    character = masterDiscipline(character, "Pyrokinesis");
    expect(permanentPPSpent(character)).toBe(2);
  });

  it("enforces level gates within a discipline", () => {
    let character = withExtraPP(psychicWithOneDiscipline("Telepathy"), 3);
    expect(canLearnPower(character, "Mind Control")).toBe(false);
    expect(canLearnPower(character, "Area Scanning")).toBe(true);
    character = learnPower(character, "Area Scanning");
    expect(canLearnPower(character, "Mental Research")).toBe(true);
    character = learnPower(character, "Mental Research");
    expect(canLearnPower(character, "Mind Control")).toBe(true);
  });

  it("learns matrix powers without a discipline", () => {
    let character = withExtraPP(psychicWithFreeAccess(), 1);
    expect(canLearnPower(character, "Sense Matrices")).toBe(true);
    character = learnPower(character, "Sense Matrices");
    expect(character.psychic?.learnedPowers).toContain("Sense Matrices");
  });

  it("applies cumulative global potential tiers", () => {
    let character = withExtraPP(psychicWithFreeAccess(), 10);
    expect(canMasterDiscipline(character, "Energy")).toBe(true);
    character = raiseGlobalPotential(character);
    expect(globalPotentialBonus(character)).toBe(10);
    expect(permanentPPSpent(character)).toBe(1);
    character = raiseGlobalPotential(character);
    expect(globalPotentialBonus(character)).toBe(20);
    expect(permanentPPSpent(character)).toBe(3);
  });

  it("caps per-power investment at 10 PP", () => {
    let character = withExtraPP(psychicWithOneDiscipline("Telepathy"), 12);
    character = learnPower(character, "Area Scanning");
    for (let i = 0; i < 10; i++) {
      character = investInPower(character, "Area Scanning");
    }
    expect(character.psychic?.powerInvestment?.["Area Scanning"]).toBe(10);
    expect(freePPRemaining(character)).toBeGreaterThanOrEqual(0);
    const before = freePPRemaining(character);
    character = investInPower(character, "Area Scanning");
    expect(freePPRemaining(character)).toBe(before);
  });

  it("charges 2 PP per innate slot", () => {
    let character = withExtraPP(psychicWithFreeAccess(), 3);
    const before = freePPRemaining(character);
    character = buyInnateSlot(character);
    expect(character.psychic?.innateSlots).toBe(1);
    expect(freePPRemaining(character)).toBe(before - 2);
  });

  it("computes potential as WP×10 + global + investment×10", () => {
    let character = psychicWithOneDiscipline("Telepathy");
    character = { ...character, characteristics: { ...character.characteristics, WP: 8 } };
    character = withExtraPP(character, 15);
    character = learnPower(character, "Area Scanning");
    character = raiseGlobalPotential(character);
    character = investInPower(character, "Area Scanning");
    expect(powerPotential(character, "Area Scanning")).toBe(80 + 10 + 10);
    expect(basePsychicPotential(character)).toBe(80 + 10);
  });

  it("removes PP spends and restores free PP", () => {
    let character = withExtraPP(psychicWithFreeAccess(), 5);
    character = masterDiscipline(character, "Energy");
    character = learnPower(character, "Create Energy");
    expect(freePPRemaining(character)).toBe(4);
    character = removePsychicDevelopmentEntry(character, "power-Create Energy");
    expect(freePPRemaining(character)).toBe(5);
    character = removePsychicDevelopmentEntry(character, "disc-Energy");
    expect(freePPRemaining(character)).toBe(6);
  });

  it("blocks removing a discipline while powers remain", () => {
    let character = withExtraPP(psychicWithFreeAccess(), 2);
    character = masterDiscipline(character, "Energy");
    character = learnPower(character, "Create Energy");
    expect(unmasterDiscipline(character, "Energy")).toBe(character);
  });

  it("blocks removing a power that would break level gates", () => {
    let character = withExtraPP(psychicWithOneDiscipline("Telepathy"), 3);
    character = learnPower(character, "Area Scanning");
    character = learnPower(character, "Mental Research");
    expect(unlearnPower(character, "Area Scanning")).toBe(character);
    character = unlearnPower(character, "Mental Research");
    expect(character.psychic?.learnedPowers).not.toContain("Mental Research");
  });

  it("does not allow PP removal on locked characters", () => {
    let character = withExtraPP(psychicWithFreeAccess(), 2);
    character = masterDiscipline(character, "Energy");
    character = { ...character, created: true };
    expect(unmasterDiscipline(character, "Energy")).toBe(character);
  });

  it("assigns innate slots to maintenance powers", () => {
    let character = withExtraPP(psychicWithOneDiscipline("Telepathy"), 4);
    character = learnPower(character, "Area Scanning");
    character = buyInnateSlot(character);
    character = setInnateSlotAssignment(character, 0, "Area Scanning");
    expect(innateSlotAssignments(character)).toEqual(["Area Scanning"]);
    character = setInnateSlotAssignment(character, 0, "");
    expect(innateSlotAssignments(character)).toEqual([""]);
  });

  it("lists unlearned powers only from accessible disciplines for temporary access", () => {
    let character = psychicWithOneDiscipline("Telepathy");
    const unlearned = unlearnedPowersInAccessibleDisciplines(character);
    expect(unlearned).toContain("Area Scanning");
    expect(unlearned).not.toContain("Create Energy");
    character = learnPower(character, "Area Scanning");
    expect(unlearnedPowersInAccessibleDisciplines(character)).not.toContain("Area Scanning");
  });

  it("lists maintainable learned powers for improve innate", () => {
    let character = psychicWithOneDiscipline("Telepathy");
    expect(maintainableLearnedPowers(character)).toEqual([]);
    character = learnPower(character, "Area Scanning");
    expect(maintainableLearnedPowers(character)).toEqual(["Area Scanning"]);
  });

  it("validates temp spend power choices per effect", () => {
    let character = withExtraPP(psychicWithOneDiscipline("Telepathy"), 2);
    character = learnPower(character, "Area Scanning");
    expect(canTempSpend(character, "temporary-power", "Area Scanning")).toBe(false);
    expect(canTempSpend(character, "temporary-power", "Mental Research")).toBe(true);
    expect(canTempSpend(character, "improve-innate", "Area Scanning")).toBe(true);
    expect(canTempSpend(character, "improve-innate", "Mental Research")).toBe(false);
  });

  it("includes improve-innate temp spends in innate slot potential", () => {
    let character = withExtraPP(psychicWithOneDiscipline("Telepathy"), 3);
    character = learnPower(character, "Area Scanning");
    expect(innateSlotPotential(character, "Area Scanning")).toBe(powerPotential(character, "Area Scanning"));
    character = tempSpend(character, "improve-innate", "Area Scanning");
    expect(innateSlotPotential(character, "Area Scanning")).toBe(powerPotential(character, "Area Scanning") + 20);
  });
});
