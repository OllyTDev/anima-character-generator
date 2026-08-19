import { describe, expect, it } from "vitest";
import { kiAbilities } from "../data/kiAbilities";
import { createEmptyCharacter } from "../schema/character";
import { addKiAbility, hasKiAbility, insufficientMkPenalty, mkPurchasesForLevel, removeKiAbility, repairInsufficientMkPurchase } from "./martialKnowledge";
import {
  buildKiForestGraph,
  buildNemesisForestGraph,
  canLearnKiAbility,
  hasKiGraphCycle,
  kiAbilityEdgeKey,
  kiAbilityEffectText,
  kiAbilityNodeStatus,
  kiAbilityPrerequisitePath,
  kiAbilityRequirementsMet,
  kiAbilityRoots,
  missingKiAbilityRequirements,
  partitionKiAbilities,
} from "./kiAbilityGraph";

describe("kiAbilityGraph", () => {
  it("has exactly two root abilities", () => {
    expect(kiAbilityRoots().sort()).toEqual(["Use of Ki", "Use of Nemesis"]);
  });

  it("references only valid requirement names", () => {
    const names = new Set(Object.keys(kiAbilities));
    for (const [name, def] of Object.entries(kiAbilities)) {
      for (const req of def.Requirements ?? []) {
        expect(names.has(req), `${name} requires unknown ${req}`).toBe(true);
      }
    }
  });

  it("includes effect text placeholders for every Ki ability", () => {
    for (const name of Object.keys(kiAbilities)) {
      expect(kiAbilities[name].effect, name).toBeTruthy();
      expect(kiAbilityEffectText(name)).toBe(kiAbilities[name].effect);
    }
  });

  it("partitions abilities into expected group sizes", () => {
    const { ki, nemesis, core } = partitionKiAbilities();
    expect(core.sort()).toEqual(["Use of Ki", "Use of Necessary Energy", "Use of Nemesis"]);
    expect(ki.length).toBe(52);
    expect(nemesis.length).toBe(20);
    expect(ki.length + nemesis.length + core.length).toBe(Object.keys(kiAbilities).length);
  });

  it("builds acyclic ki and nemesis forests", () => {
    expect(hasKiGraphCycle(buildKiForestGraph())).toBe(false);
    expect(hasKiGraphCycle(buildNemesisForestGraph())).toBe(false);
  });

  it("places Use of Necessary Energy in the ki forest under Use of Ki", () => {
    const graph = buildKiForestGraph();
    expect(graph.nodes).toContain("Use of Necessary Energy");
    expect(graph.nodes).not.toContain("Use of Nemesis");
    expect(graph.edges).toContainEqual({ from: "Use of Ki", to: "Use of Necessary Energy" });
  });

  it("tracks requirement and purchase status at the spending level", () => {
    let character = createEmptyCharacter();
    character.advantages["Martial Mastery"] = 2;
    const level = 1;

    expect(kiAbilityRequirementsMet(character, "Ki Control", level)).toBe(false);
    expect(missingKiAbilityRequirements(character, "Ki Control", level)).toEqual(["Use of Ki"]);
    expect(kiAbilityNodeStatus(character, "Ki Control", level, 100)).toBe("locked");

    character = addKiAbility(character, "Use of Ki", level);
    expect(kiAbilityRequirementsMet(character, "Ki Control", level)).toBe(true);
    expect(kiAbilityNodeStatus(character, "Ki Control", level, 100)).toBe("available");
    expect(canLearnKiAbility(character, "Ki Control", level, 100)).toBe(true);

    character = addKiAbility(character, "Ki Control", level);
    expect(kiAbilityNodeStatus(character, "Ki Control", level, 100)).toBe("learned");
    expect(canLearnKiAbility(character, "Ki Control", level, 100)).toBe(false);
  });

  it("marks abilities unaffordable beyond the overspend allowance", () => {
    const character = addKiAbility(createEmptyCharacter(), "Use of Ki", 1);
    expect(kiAbilityNodeStatus(character, "Improvised Combat Techniques", 1, 0)).toBe("available");
    expect(kiAbilityNodeStatus(character, "Improvised Combat Techniques", 1, -1)).toBe("unaffordable");
    expect(canLearnKiAbility(character, "Improvised Combat Techniques", 1, -1)).toBe(false);
  });

  it("stores overspent Ki abilities in level mk and insufficientMartialKnowledge", () => {
    const character = createEmptyCharacter();
    const next = addKiAbility(character, "Use of Ki", 1);
    expect(next.levels[0].mk?.["Use of Ki"]).toBe(40);
    expect(next.insufficientMartialKnowledge).toEqual({ Name: "Use of Ki", Penalty: -2 });
    expect(hasKiAbility(next, "Use of Ki")).toBe(true);
  });

  it("repairs missing mk records for forced-learn Ki abilities", () => {
    const character = createEmptyCharacter();
    character.insufficientMartialKnowledge = { Name: "Use of Ki", Penalty: -2 };
    character.levels[0].mk = {};
    const repaired = repairInsufficientMkPurchase(character);
    expect(repaired.levels[0].mk?.["Use of Ki"]).toBe(40);
    expect(mkPurchasesForLevel(repaired, 0).some((entry) => entry.name === "Use of Ki")).toBe(true);
  });

  it("clears insufficientMartialKnowledge when removing a forced-learn Ki ability", () => {
    let character = addKiAbility(createEmptyCharacter(), "Use of Ki", 1);
    character = removeKiAbility(character, "Use of Ki", 1);
    expect(character.insufficientMartialKnowledge).toBeUndefined();
    expect(hasKiAbility(character, "Use of Ki")).toBe(false);
  });

  it("computes the Pow check penalty for insufficient MK", () => {
    expect(insufficientMkPenalty(50, 20)).toBe(-3);
    expect(insufficientMkPenalty(40, 40)).toBe(0);
  });

  it("collects prerequisite paths back toward the forest root", () => {
    const graph = buildKiForestGraph();
    const path = kiAbilityPrerequisitePath(graph, "Ki Control");
    expect(path.nodes.has("Use of Ki")).toBe(true);
    expect(path.nodes.has("Ki Control")).toBe(true);
    expect(path.nodes.has("Presence Extrusion")).toBe(false);
    expect(path.edges.has(kiAbilityEdgeKey({ from: "Use of Ki", to: "Ki Control" }))).toBe(true);
  });

  it("includes every direct prerequisite branch for multi-requirement abilities", () => {
    const graph = buildKiForestGraph();
    const path = kiAbilityPrerequisitePath(graph, "Age Control");
    expect(path.nodes.has("Use of Ki")).toBe(true);
    expect(path.nodes.has("Ki Control")).toBe(true);
    expect(path.nodes.has("Physical Dominion")).toBe(true);
    expect(path.nodes.has("Age Control")).toBe(true);
    expect(path.edges.has(kiAbilityEdgeKey({ from: "Use of Ki", to: "Ki Control" }))).toBe(true);
    expect(path.edges.has(kiAbilityEdgeKey({ from: "Ki Control", to: "Physical Dominion" }))).toBe(true);
    expect(path.edges.has(kiAbilityEdgeKey({ from: "Physical Dominion", to: "Age Control" }))).toBe(true);
  });
});
