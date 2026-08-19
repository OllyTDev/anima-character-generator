import { describe, expect, it } from "vitest";
import { addAdvantage } from "./creationPoints";
import { deriveSheet } from "./derived";
import { showsPsychicStats } from "./magic";
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

  it("does not show psychic stats for Free Access alone", () => {
    const character = addAdvantage(createEmptyCharacter(), "Free Access to Any Psychic Discipline", 2);
    expect(showsPsychicStats(character)).toBe(false);
  });
});
