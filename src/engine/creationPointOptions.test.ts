import { createEmptyCharacter } from "../schema/character";
import { addAdvantage } from "./creationPoints";
import { buildAdvantageOptions, buildDisadvantageOptions, advantageEffectText, groupCreationPointsByCategory } from "./creationPointOptions";
import { describe, expect, it } from "vitest";

describe("creationPointOptions", () => {
  it("groups advantages by category tab", () => {
    const character = createEmptyCharacter();
    const tabs = buildAdvantageOptions(character);
    expect(tabs.Magic.some((item) => item.name === "Born Wizard")).toBe(true);
    expect(tabs.Common.some((item) => item.name === "Quick Reflexes")).toBe(true);
    expect(tabs.Background.some((item) => item.name === "Fame")).toBe(true);
  });

  it("marks owned advantages as unavailable", () => {
    let character = createEmptyCharacter();
    character = addAdvantage(character, "Quick Reflexes", 1);
    const tabs = buildAdvantageOptions(character);
    const quickReflexes = tabs.Common.find((item) => item.name === "Quick Reflexes");
    expect(quickReflexes?.allowed).toBe(false);
  });

  it("includes effect text for advantages with legacy descriptions", () => {
    expect(advantageEffectText("Quick Reflexes")).toContain("initiative");
  });

  it("groups disadvantages by category tab", () => {
    const character = createEmptyCharacter();
    const tabs = buildDisadvantageOptions(character);
    expect(tabs.Common.some((item) => item.name === "Klutzy")).toBe(true);
    expect(tabs.Magic.some((item) => item.name === "Magical Blockage")).toBe(true);
  });

  it("groups selected advantages and disadvantages by cp category", () => {
    let character = createEmptyCharacter();
    character = addAdvantage(character, "Quick Reflexes", 1);
    character = addAdvantage(character, "Born Wizard", 1);
    character.disadvantages.Klutzy = 1;

    expect(groupCreationPointsByCategory(Object.keys(character.advantages), "advantage")).toEqual({
      Common: ["Quick Reflexes"],
      Magic: ["Born Wizard"],
    });
    expect(groupCreationPointsByCategory(Object.keys(character.disadvantages), "disadvantage")).toEqual({
      Common: ["Klutzy"],
    });
  });
});
