import { advantageCosts, advantages } from "../data/advantages";
import { disadvantageBenefits, disadvantages } from "../data/disadvantages";
import { advantageAllowed, disadvantageAllowed } from "./creationPoints";
import type { CharacterDocument } from "../schema/character";

export const CREATION_POINT_EFFECT_PLACEHOLDER = "Effect not yet documented.";

export type CreationPointTabId = "Common" | "Magic" | "Psychic" | "Background";

export const creationPointTabIds: CreationPointTabId[] = ["Common", "Magic", "Psychic", "Background"];

export type CreationPointOption = {
  kind: "advantage" | "disadvantage";
  name: string;
  values: number[];
  unit: string;
  effect: string;
  allowed: boolean;
};

export function advantageEffectText(name: string): string {
  return advantages[name].effect ?? CREATION_POINT_EFFECT_PLACEHOLDER;
}

export function disadvantageEffectText(name: string): string {
  return disadvantages[name].effect ?? CREATION_POINT_EFFECT_PLACEHOLDER;
}

function tabForCategory(category?: string): CreationPointTabId {
  if (category === "Magic" || category === "Psychic" || category === "Background") return category;
  return "Common";
}

function formatValues(values: number[], unit: string): string {
  if (values.length === 1) return `${values[0]} ${unit}`;
  return `${values[0]}-${values.at(-1)} ${unit}`;
}

function visibleAdvantageNames(character: CharacterDocument): string[] {
  return Object.keys(advantages).filter(
    (name) => !advantages[name].OllyTCost || character.settings.ollyTRules || name !== "Familiar",
  );
}

export function buildAdvantageOptions(character: CharacterDocument): Record<CreationPointTabId, CreationPointOption[]> {
  const tabs: Record<CreationPointTabId, CreationPointOption[]> = {
    Common: [],
    Magic: [],
    Psychic: [],
    Background: [],
  };

  for (const name of visibleAdvantageNames(character)) {
    const def = advantages[name];
    const values = advantageCosts(name, character.settings.ollyTRules);
    tabs[tabForCategory(def.Category)].push({
      kind: "advantage",
      name,
      values,
      unit: "CP",
      effect: advantageEffectText(name),
      allowed: advantageAllowed(character, name),
    });
  }

  for (const tab of creationPointTabIds) {
    tabs[tab].sort((left, right) => left.name.localeCompare(right.name));
  }

  return tabs;
}

export function buildDisadvantageOptions(character: CharacterDocument): Record<CreationPointTabId, CreationPointOption[]> {
  const tabs: Record<CreationPointTabId, CreationPointOption[]> = {
    Common: [],
    Magic: [],
    Psychic: [],
    Background: [],
  };

  for (const name of Object.keys(disadvantages)) {
    const def = disadvantages[name];
    const values = disadvantageBenefits(name);
    tabs[tabForCategory(def.Category)].push({
      kind: "disadvantage",
      name,
      values,
      unit: "CP",
      effect: disadvantageEffectText(name),
      allowed: disadvantageAllowed(character, name),
    });
  }

  for (const tab of creationPointTabIds) {
    tabs[tab].sort((left, right) => left.name.localeCompare(right.name));
  }

  return tabs;
}

export function creationPointCostLabel(option: CreationPointOption): string {
  return formatValues(option.values, option.unit);
}

export function creationPointCategory(kind: "advantage" | "disadvantage", name: string): CreationPointTabId {
  const def = kind === "advantage" ? advantages[name] : disadvantages[name];
  return tabForCategory(def?.Category);
}

export function groupCreationPointsByCategory(
  names: string[],
  kind: "advantage" | "disadvantage",
): Partial<Record<CreationPointTabId, string[]>> {
  const grouped: Partial<Record<CreationPointTabId, string[]>> = {};
  for (const name of names) {
    const tab = creationPointCategory(kind, name);
    grouped[tab] ??= [];
    grouped[tab]!.push(name);
  }
  for (const tab of creationPointTabIds) {
    grouped[tab]?.sort((left, right) => left.localeCompare(right));
  }
  return grouped;
}
