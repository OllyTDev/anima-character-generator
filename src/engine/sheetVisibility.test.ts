import { describe, expect, it } from "vitest";
import { addAdvantage } from "./creationPoints";
import { deriveSheet } from "./derived";
import { canAccessSupernaturalDevelopment, hasFreePsychicDisciplineAccess, showsPsychicStats } from "./magic";
import { addKiAbility, usesKi } from "./martialKnowledge";
import { createEmptyCharacter } from "../schema/character";

describe("sheet visibility", () => {
  it("hides Ki stats until Use of Ki or Use of Nemesis is learned", () => {
    const character = createEmptyCharacter();
    expect(usesKi(character)).toBe(false);
    expect(deriveSheet(character).usesKi).toBe(false);

    const withKi = addKiAbility(character, "Use of Ki", 1);
    expect(usesKi(withKi)).toBe(true);
    expect(deriveSheet(withKi).usesKi).toBe(true);
  });

  it("hides summoning stats until The Gift or Incomplete Gift is taken", () => {
    const character = createEmptyCharacter();
    expect(deriveSheet(character).hasGift).toBe(false);

    const gifted = addAdvantage(character, "Incomplete Gift", 1, "Sample Theorem");
    expect(deriveSheet(gifted).hasGift).toBe(true);
  });

  it("hides psychic stats until a psychic access advantage is taken", () => {
    const character = createEmptyCharacter();
    expect(showsPsychicStats(character)).toBe(false);
    expect(deriveSheet(character).showsPsychicStats).toBe(false);

    const psychic = addAdvantage(character, "Access to One Psychic Discipline", 1, "Telepathy");
    expect(showsPsychicStats(psychic)).toBe(true);
    expect(deriveSheet(psychic).showsPsychicStats).toBe(true);
  });

  it("shows psychic stats for Free Access", () => {
    const character = addAdvantage(createEmptyCharacter(), "Free Access to Any Psychic Discipline", 2);
    expect(showsPsychicStats(character)).toBe(true);
  });

  it("shows the supernatural development tab only for Free Access or The Gift", () => {
    const character = createEmptyCharacter();
    expect(canAccessSupernaturalDevelopment(character)).toBe(false);

    const oneDiscipline = addAdvantage(character, "Access to One Psychic Discipline", 1, "Telepathy");
    expect(canAccessSupernaturalDevelopment(oneDiscipline)).toBe(false);
    expect(hasFreePsychicDisciplineAccess(oneDiscipline)).toBe(false);

    const freeAccess = addAdvantage(createEmptyCharacter(), "Free Access to Any Psychic Discipline", 2);
    expect(canAccessSupernaturalDevelopment(freeAccess)).toBe(true);
    expect(hasFreePsychicDisciplineAccess(freeAccess)).toBe(true);

    const gifted = addAdvantage(createEmptyCharacter(), "The Gift", 2, "Standard");
    expect(canAccessSupernaturalDevelopment(gifted)).toBe(true);
    expect(hasFreePsychicDisciplineAccess(gifted)).toBe(false);
  });
});
