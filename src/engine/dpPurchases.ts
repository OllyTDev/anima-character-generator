import { combatModules } from "../data/combatModules";
import { essentialAbilities } from "../data/essentialAbilities";
import { martialArts } from "../data/martialArts";

export function isEditableDpPurchase(name: string, value: unknown): value is number {
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
  if (hasEditableOption(name)) {
    const text = optionTextFromValue(value);
    return text ? `${name}: ${text}` : name;
  }
  if (name in combatModules && !Array.isArray(value)) return name;
  if (typeof value === "number") return `${name}: ${value}`;
  return `${name}: ${JSON.stringify(value)}`;
}
