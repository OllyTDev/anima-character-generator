import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { deriveSheet } from "../engine/derived";
import { characterLevel } from "../engine/helpers";
import { hasKiAbility } from "../engine/martialKnowledge";
import {
  convertLegacyCharacter,
  isLegacyCharacter,
  parseCharacterDocument,
} from "./legacyMigration";

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "oldSheets");
const fixtures = ["KrisSheet1.txt", "KrisSheet2.txt", "FaireSheet1.txt"] as const;

function loadFixture(name: (typeof fixtures)[number]): unknown {
  return JSON.parse(readFileSync(join(fixtureDir, name), "utf8"));
}

describe("legacyMigration", () => {
  it("detects legacy sheets without schemaVersion", () => {
    expect(isLegacyCharacter(loadFixture("FaireSheet1.txt"))).toBe(true);
    expect(isLegacyCharacter({ schemaVersion: 1, name: "New", levels: [{ class: "Freelancer", dp: {} }] })).toBe(
      false,
    );
  });

  for (const fixture of fixtures) {
    it(`migrates ${fixture} to schema version 1`, () => {
      const raw = loadFixture(fixture);
      const { character, migrated } = parseCharacterDocument(JSON.stringify(raw));
      expect(migrated).toBe(true);
      expect(character.schemaVersion).toBe(1);
      expect(character.levels.length).toBeGreaterThan(0);
      expect(character.levels[0].class).toBeTruthy();
      expect(character.levels[0].dp).toBeTypeOf("object");
    });
  }

  it("preserves Seth Maxwell's ki purchases and martial art techniques", () => {
    const character = convertLegacyCharacter(loadFixture("KrisSheet1.txt"));
    expect(character.name).toBe("Seth Maxwell");
    expect(hasKiAbility(character, "Use of Ki")).toBe(true);
    expect(character.levels.some((level) => level.mk?.["The Silver Mountain"])).toBe(true);
    expect(character.advantages["Exceptional Physical Resistance"]).toBe(2);
    expect(character.disadvantages["Deep Sleeper"]).toBe(1);
    expect(characterLevel(character)).toBeGreaterThan(10);
  });

  it("preserves Xerxes Madrigas gift and specializations", () => {
    const character = convertLegacyCharacter(loadFixture("FaireSheet1.txt"));
    expect(character.name).toBe("Xerxes Madrigas");
    expect(character.advantages["Incomplete Gift"]).toBe("Standard");
    expect(character.specializations?.Dance).toBe("ballroom dancing");
    expect(character.characteristics.INT).toBe(9);
    expect(character.levels[1].characteristic).toBe("POW");
  });

  it("preserves Nephthys psychic advantages and first martial art", () => {
    const character = convertLegacyCharacter(loadFixture("KrisSheet2.txt"));
    expect(character.name).toBe("Nephthys");
    expect(character.advantages["Free Access to Any Psychic Discipline"]).toBe(2);
    expect(character.firstMartialArt).toBe("Aikido");
    expect(character.specializations?.Persuasion).toBe("seduction");
    expect(character.levels.some((level) => level.class === "Tao")).toBe(true);
  });

  it("builds a derived sheet from migrated characters", () => {
    const character = convertLegacyCharacter(loadFixture("KrisSheet1.txt"));
    const sheet = deriveSheet(character);
    expect(sheet.summary).toContain("Seth Maxwell");
    expect(sheet.usesKi).toBe(true);
  });

  it("migrates minimal legacy JSON with empty levels", () => {
    const { character, migrated } = parseCharacterDocument(JSON.stringify({ Name: "Old", levels: [] }));
    expect(migrated).toBe(true);
    expect(character.name).toBe("Old");
    expect(character.levels).toEqual([{ class: "Freelancer", dp: {} }]);
  });
});
