import { describe, expect, it } from "vitest";
import { tables } from "../data/tables";
import { ability } from "./ability";
import { characteristic, lifePoints, modifier, characteristicPointValue, characteristicTotal } from "./characteristics";
import { addAdvantage, addDisadvantage, cpRemaining, cpTotal } from "./creationPoints";
import { dpCost, dpRemaining, dpRemainingForLevel, dpRemainingForLevelExcluding, dpSpentForPurchase, maxAffordableDpSpend, maxDpForPurchase, unitsFromDpSpend } from "./developmentPoints";
import { characterLevel, presence, syncLevels } from "./helpers";
import { createEmptyCharacter } from "../schema/character";
import { parseCharacter, serializeCharacter } from "../persist/save";
import { parseCharacterDocument } from "../persist/legacyMigration";
import { kiAbilityCost } from "../data/kiAbilities";
import { deriveSheet } from "./derived";

function freelancer() {
  const character = createEmptyCharacter();
  character.name = "Freelancer Test";
  character.characteristics = { STR: 7, DEX: 7, AGI: 10, CON: 3, INT: 8, POW: 4, WP: 10, PER: 4 };
  character.appearance = 10;
  character.gender = "Male";
  return character;
}

describe("tables", () => {
  it("maps characteristic 10 to a +15 modifier", () => {
    expect(tables.modifiers[10]).toBe(15);
  });

  it("treats 0 XP as level 1 and negative XP as level 0", () => {
    expect(characterLevel(createEmptyCharacter())).toBe(1);
    const leveled = createEmptyCharacter();
    leveled.xp = 100;
    expect(characterLevel(leveled)).toBe(2);
    leveled.xp = 225;
    expect(characterLevel(leveled)).toBe(3);
    const rookie = createEmptyCharacter();
    rookie.xp = -100;
    expect(characterLevel(rookie)).toBe(0);
  });
});

describe("characteristics and ability", () => {
  it("computes presence from level", () => {
    const character = createEmptyCharacter();
    expect(presence(character)).toBe(30);
    character.xp = 225;
    expect(presence(character)).toBe(40);
  });

  it("totals primary characteristics with 10 counting as 11", () => {
    expect(characteristicPointValue(10)).toBe(11);
    expect(characteristicPointValue(7)).toBe(7);
    expect(characteristicTotal(createEmptyCharacter())).toBe(40);
    expect(characteristicTotal(freelancer())).toBe(55);
  });

  it("adds class bonuses into Attack for a level 1 freelancer", () => {
    const character = syncLevels(freelancer());
    character.xp = 100;
    const synced = syncLevels(character);
    expect(characteristic(synced, "DEX")).toBe(7);
    expect(modifier(synced, "DEX")).toBe(5);
    expect(ability(synced, "Attack")).toBe(5);
  });

  it("applies untrained secondary penalty without Jack of All Trades", () => {
    const character = freelancer();
    expect(ability(character, "Notice")).toBeLessThan(0);
  });
});

describe("creation points", () => {
  it("starts with 3 CP and spends Quick Reflexes", () => {
    let character = freelancer();
    expect(cpTotal(character)).toBe(3);
    expect(cpRemaining(character)).toBe(3);
    character = addAdvantage(character, "Quick Reflexes", 1);
    expect(cpRemaining(character)).toBe(2);
  });

  it("gains CP from a disadvantage", () => {
    let character = freelancer();
    character = addDisadvantage(character, "Klutzy", 1);
    expect(cpTotal(character)).toBe(4);
    expect(cpRemaining(character)).toBe(4);
  });
});

describe("development points", () => {
  it("gives 600 DP at level 1 and 400 DP at level 0", () => {
    const one = dpRemaining(createEmptyCharacter());
    expect(one[0].Total).toBe(600);
    const zero = dpRemaining(syncLevels({ ...createEmptyCharacter(), xp: -100 }));
    expect(zero[0].Total).toBe(400);
  });

  it("charges Weaponsmaster the reduced module cost", () => {
    const character = createEmptyCharacter();
    character.levels[0].class = "Weaponsmaster";
    expect(dpCost(character, "Similar Weapon", "Weaponsmaster")).toBe(5);
    expect(dpCost(character, "Similar Weapon", "Freelancer")).toBe(10);
  });

  it("caps spendable DP by total, category, and ability-specific limits", () => {
    const character = createEmptyCharacter();
    const remaining = dpRemainingForLevel(character, 1);
    expect(maxDpForPurchase(remaining, "Attack")).toBeLessThanOrEqual(remaining.Total);
    expect(maxDpForPurchase(remaining, "Attack")).toBeLessThanOrEqual(remaining.Combat);
    expect(maxDpForPurchase(remaining, "Attack")).toBeLessThanOrEqual(remaining.Attack);
    expect(maxDpForPurchase(remaining, "Wear Armor")).toBe(remaining.Combat);
  });

  it("computes max affordable DP spend in unit increments", () => {
    expect(maxAffordableDpSpend(10, 2)).toBe(10);
    expect(maxAffordableDpSpend(11, 2)).toBe(10);
    expect(maxAffordableDpSpend(3, 2)).toBe(2);
    expect(maxAffordableDpSpend(1, 2)).toBe(0);
    expect(unitsFromDpSpend(10, 2)).toBe(5);
  });

  it("adds back DP from an excluded purchase when editing", () => {
    const character = createEmptyCharacter();
    character.levels[0].dp.Attack = 5;
    const before = dpRemainingForLevel(character, 1).Total;
    const excluding = dpRemainingForLevelExcluding(character, 1, "Attack").Total;
    expect(excluding).toBeGreaterThan(before);
    expect(dpSpentForPurchase(character, "Attack", 5, character.levels[0].class)).toBe(10);
  });
});

describe("life points", () => {
  it("uses CON base LP plus class LP at level 1", () => {
    const character = freelancer();
    expect(lifePoints(character)).toBe((tables.base_lp[3] ?? 0) + 5);
  });
});

describe("ki house rules", () => {
  it("makes Use of Ki free under OllyT rules", () => {
    expect(kiAbilityCost("Use of Ki", false)).toBe(40);
    expect(kiAbilityCost("Use of Ki", true)).toBe(0);
  });
});

describe("save format", () => {
  it("round-trips a versioned character document", () => {
    const character = freelancer();
    const parsed = parseCharacter(serializeCharacter(character));
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.name).toBe("Freelancer Test");
  });

  it("migrates legacy unversioned JSON", () => {
    const { character, migrated } = parseCharacterDocument(JSON.stringify({ Name: "Old", levels: [] }));
    expect(migrated).toBe(true);
    expect(character.schemaVersion).toBe(1);
    expect(character.name).toBe("Old");
  });
});

describe("derived sheet", () => {
  it("builds a readable summary", () => {
    const sheet = deriveSheet(freelancer());
    expect(sheet.summary).toContain("Freelancer Test");
    expect(sheet.summary).toContain("Freelancer");
    expect(sheet.lifePoints).toBeGreaterThan(0);
  });
});
