import { secondaryAbilities } from "../data/abilities";
import { combatModules } from "../data/combatModules";
import { martialArts } from "../data/martialArts";
import { primaries } from "../data/primaries";
import type { PrimaryCategory } from "../data/types";
import type { CharacterDocument } from "../schema/character";
import { dpCost } from "./developmentPoints";

export type SpendOptionKind = "dp" | "module" | "martial-art";
export type SpendOption = {
  name: string;
  category: PrimaryCategory;
  kind: SpendOptionKind;
  cost: number;
  unit: "DP";
  detail?: string;
};
const martialDegrees = ["Base", "Advanced", "Supreme"] as const;

export const spendCategories: PrimaryCategory[] = ["Combat", "Supernatural", "Psychic", "Other"];
export function martialArtDegrees(artName: string): string[] {
  const art = martialArts[artName as keyof typeof martialArts] as Record<string, unknown> | undefined;
  if (!art) return [];
  return martialDegrees.filter((degree) => degree in art);
}

export function buildSpendOptions(character: CharacterDocument, className: string): Record<PrimaryCategory, SpendOption[]> {
  const grouped: Record<PrimaryCategory, SpendOption[]> = {
    Combat: [],
    Supernatural: [],
    Psychic: [],
    Other: [],
    Powers: [],
  };

  const add = (option: SpendOption) => {
    grouped[option.category].push(option);
  };

  for (const name of primaries.Combat) {
    if (name.startsWith("Save ")) continue;
    add({
      name,
      category: "Combat",
      kind: "dp",
      cost: dpCost(character, name, className),
      unit: "DP",
    });
  }

  for (const name of Object.keys(combatModules)) {
    const module = combatModules[name];
    add({
      name,
      category: module.Primary,
      kind: "module",
      cost: dpCost(character, name, className),
      unit: "DP",
      detail: module.Option_Title ?? module.Notes,
    });
  }

  for (const name of Object.keys(martialArts)) {
    add({
      name,
      category: "Combat",
      kind: "martial-art",
      cost: dpCost(character, name, className, "Base"),
      unit: "DP",
      detail: "Choose degree when spending",
    });
  }

  for (const name of primaries.Supernatural) {
    if (name.startsWith("Save ")) continue;
    add({
      name,
      category: "Supernatural",
      kind: "dp",
      cost: dpCost(character, name, className),
      unit: "DP",
    });
  }

  for (const name of primaries.Psychic) {
    if (name.startsWith("Save ")) continue;
    add({
      name,
      category: "Psychic",
      kind: "dp",
      cost: dpCost(character, name, className),
      unit: "DP",
    });
  }

  for (const name of secondaryAbilities(character.settings.ollyTRules)) {
    add({
      name,
      category: "Other",
      kind: "dp",
      cost: dpCost(character, name, className),
      unit: "DP",
    });
  }

  for (const name of ["Life Point Multiple", "Life Points"]) {
    add({
      name,
      category: "Other",
      kind: "dp",
      cost: dpCost(character, name, className),
      unit: "DP",
    });
  }

  for (const category of Object.keys(grouped) as PrimaryCategory[]) {
    grouped[category].sort((a, b) => a.name.localeCompare(b.name));
  }

  return grouped;
}
