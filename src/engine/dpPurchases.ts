import { combatModules } from "../data/combatModules";
import { essentialAbilities } from "../data/essentialAbilities";
import { martialArts } from "../data/martialArts";
import { primaries } from "../data/primaries";
import { asKiStatRecord, isKiStatDpPurchase } from "./developmentPoints";

export const dpDisplayCategories = ["Combat", "Supernatural", "Psychic", "Other", "MK"] as const;
export type DpDisplayCategory = (typeof dpDisplayCategories)[number];

export function dpDisplayCategoryLabel(category: DpDisplayCategory): string {
  return category === "MK" ? "Martial Knowledge" : category;
}

export function dpPurchaseCategory(name: string): DpDisplayCategory {
  const category = primaries.forAbility(name);
  return category === "Powers" ? "Other" : category;
}

export function groupDpPurchaseNames(names: string[]): Record<DpDisplayCategory, string[]> {
  const grouped: Record<DpDisplayCategory, string[]> = {
    Combat: [],
    MK: [],
    Supernatural: [],
    Psychic: [],
    Other: [],
  };
  for (const name of names) {
    grouped[dpPurchaseCategory(name)].push(name);
  }
  for (const category of dpDisplayCategories) {
    grouped[category].sort((a, b) => a.localeCompare(b));
  }
  return grouped;
}

export function isEditableDpPurchase(name: string, value: unknown): value is number {
  if (isKiStatDpPurchase(name)) return Object.keys(asKiStatRecord(value)).length > 0;
  if (typeof value !== "number") return false;
  if (name in combatModules) return false;
  if (name in martialArts) return false;
  if (name in essentialAbilities.advantages || name in essentialAbilities.disadvantages) return false;
  return true;
}

export function hasEditableOption(name: string): boolean {
  if (name in martialArts) return false;
  const module = combatModules[name as keyof typeof combatModules];
  return Boolean(module?.Option_Title);
}

export function optionTitleForPurchase(name: string): string {
  const module = combatModules[name as keyof typeof combatModules];
  return module?.Option_Title ?? "Details";
}

export function optionTextFromValue(value: unknown): string {
  if (!Array.isArray(value)) return "";
  const first = value[0];
  if (first === "Any" || first == null) return "";
  return String(first);
}

export function formatDpPurchaseLabel(name: string, value: unknown): string {
  if (isKiStatDpPurchase(name)) {
    const record = asKiStatRecord(value);
    const parts = Object.entries(record)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([stat, units]) => `${stat} +${units}`)
      .join(", ");
    return parts ? `${name}: ${parts}` : name;
  }
  if (hasEditableOption(name)) {
    const text = optionTextFromValue(value);
    return text ? `${name}: ${text}` : name;
  }
  if (name in combatModules && !Array.isArray(value)) return name;
  if (typeof value === "number") return `${name}: ${value}`;
  return `${name}: ${JSON.stringify(value)}`;
}
