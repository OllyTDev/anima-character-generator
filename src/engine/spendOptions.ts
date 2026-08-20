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

export type SpendSection = {
  id: string;
  label: string;
  items: SpendOption[];
};

export type SpendTabId = "Combat" | "Supernatural" | "Psychic" | "Other";

export const spendTabIds: SpendTabId[] = ["Combat", "Supernatural", "Psychic", "Other"];

const martialDegrees = ["Base", "Advanced", "Supreme"] as const;

const lifePointOptions = ["Life Point Multiple", "Life Points"] as const;

export function martialArtDegrees(artName: string): string[] {
  const art = martialArts[artName as keyof typeof martialArts] as Record<string, unknown> | undefined;
  if (!art) return [];
  return martialDegrees.filter((degree) => degree in art);
}

function dpOption(
  character: CharacterDocument,
  className: string,
  name: string,
  category: PrimaryCategory,
): SpendOption {
  return {
    name,
    category,
    kind: "dp",
    cost: dpCost(character, name, className),
    unit: "DP",
  };
}

function sorted(items: SpendOption[]): SpendOption[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

function section(id: string, label: string, items: SpendOption[]): SpendSection | null {
  if (!items.length) return null;
  return { id, label, items: sorted(items) };
}

export function buildSpendTabs(character: CharacterDocument, className: string): Record<SpendTabId, SpendSection[]> {
  const combatAbilities = primaries.Combat.filter((name) => !name.startsWith("Save ")).map((name) =>
    dpOption(character, className, name, "Combat"),
  );

  const combatModuleItems = Object.keys(combatModules)
    .filter((name) => combatModules[name].Primary === "Combat")
    .map((name) => {
      const module = combatModules[name];
      return {
        name,
        category: "Combat" as PrimaryCategory,
        kind: "module" as const,
        cost: dpCost(character, name, className),
        unit: "DP" as const,
        detail: module.Option_Title ?? module.Notes,
      };
    });

  const supernaturalModuleItems = Object.keys(combatModules)
    .filter((name) => combatModules[name].Primary === "Supernatural")
    .map((name) => {
      const module = combatModules[name];
      return {
        name,
        category: "Supernatural" as PrimaryCategory,
        kind: "module" as const,
        cost: dpCost(character, name, className),
        unit: "DP" as const,
        detail: module.Option_Title ?? module.Notes,
      };
    });

  const psychicModuleItems = Object.keys(combatModules)
    .filter((name) => combatModules[name].Primary === "Psychic")
    .map((name) => {
      const module = combatModules[name];
      return {
        name,
        category: "Psychic" as PrimaryCategory,
        kind: "module" as const,
        cost: dpCost(character, name, className),
        unit: "DP" as const,
        detail: module.Option_Title ?? module.Notes,
      };
    });

  const martialArtItems = Object.keys(martialArts).map((name) => ({
    name,
    category: "Combat" as PrimaryCategory,
    kind: "martial-art" as const,
    cost: dpCost(character, name, className, "Base"),
    unit: "DP" as const,
    detail: "Choose degree when spending",
  }));

  const supernaturalAbilities = primaries.Supernatural.filter((name) => !name.startsWith("Save ")).map((name) =>
    dpOption(character, className, name, "Supernatural"),
  );

  const psychicAbilities = primaries.Psychic.filter((name) => !name.startsWith("Save ")).map((name) =>
    dpOption(character, className, name, "Psychic"),
  );

  const secondaryItems = secondaryAbilities(character.settings.ollyTRules).map((name) =>
    dpOption(character, className, name, "Other"),
  );

  const lifePointItems = lifePointOptions.map((name) => dpOption(character, className, name, "Other"));

  const combatSections = [
    section("combat-abilities", "Combat abilities", combatAbilities),
    section("combat-modules", "Combat modules", combatModuleItems),
    section("martial-arts", "Martial arts", martialArtItems),
  ].filter((entry): entry is SpendSection => entry !== null);

  const supernaturalSections = [
    section("supernatural-abilities", "Supernatural abilities", supernaturalAbilities),
    section("supernatural-modules", "Supernatural modules", supernaturalModuleItems),
  ].filter((entry): entry is SpendSection => entry !== null);

  const psychicSections = [
    section("psychic-abilities", "Psychic abilities", psychicAbilities),
    section("psychic-modules", "Psychic modules", psychicModuleItems),
  ].filter((entry): entry is SpendSection => entry !== null);

  const otherSections = [
    section("secondary-abilities", "Secondary abilities", secondaryItems),
    section("life-points", "Life points", lifePointItems),
  ].filter((entry): entry is SpendSection => entry !== null);

  return {
    Combat: combatSections,
    Supernatural: supernaturalSections,
    Psychic: psychicSections,
    Other: otherSections,
  };
}

export function findSpendOption(
  tabs: Record<SpendTabId, SpendSection[]>,
  name: string,
): { tab: SpendTabId; option: SpendOption } | null {
  for (const tab of spendTabIds) {
    for (const spendSection of tabs[tab]) {
      for (const item of spendSection.items) {
        if (item.name === name) return { tab, option: item };
      }
    }
  }
  return null;
}

/** @deprecated Use buildSpendTabs instead. */
export function buildSpendOptions(character: CharacterDocument, className: string): Record<PrimaryCategory, SpendOption[]> {
  const tabs = buildSpendTabs(character, className);
  const flat: Record<PrimaryCategory, SpendOption[]> = {
    Combat: [],
    Supernatural: [],
    Psychic: [],
    Other: [],
    Powers: [],
  };
  for (const tab of spendTabIds) {
    for (const spendSection of tabs[tab]) {
      for (const item of spendSection.items) {
        flat[item.category].push(item);
      }
    }
  }
  for (const category of Object.keys(flat) as PrimaryCategory[]) {
    flat[category].sort((a, b) => a.name.localeCompare(b.name));
  }
  return flat;
}

export const spendCategories = spendTabIds;
