import { tables } from "../data/tables";
import type { CharacterDocument, LevelRecord } from "../schema/character";
import { cloneCharacter } from "../schema/character";

export function levelFromXp(xp: number): number {
  const chart = tables.xp_chart;
  if (xp >= 4125) return 16;
  for (let i = 0; i < 16; i++) {
    if (xp < chart[i]) return i;
  }
  return 16;
}

export function xpFromLevel(level: number): number {
  const chart = tables.xp_chart;
  if (level <= 0) return -100;
  if (level >= 16) return chart[15] ?? 4125;
  return chart[level - 1] ?? 0;
}

export const MAX_CHARACTER_LEVEL = 16;

export function characterLevel(character: CharacterDocument): number {
  return levelFromXp(character.xp);
}

export function levelIndex(level: number): number {
  return level === 0 ? 0 : level - 1;
}

export function levelCount(level: number | undefined, character: CharacterDocument): number {
  if (typeof level === "undefined") return character.levels.length;
  return level === 0 ? 1 : Math.min(level, character.levels.length);
}

export function presence(character: CharacterDocument): number {
  return characterLevel(character) * 5 + 25;
}

export function isSpirit(character: CharacterDocument): boolean {
  return (character.type ?? "").includes("Spirit");
}

export function isCorporealUndead(character: CharacterDocument): boolean {
  return (character.type ?? "").includes("Between Worlds, Undead");
}

export function isHumanType(character: CharacterDocument): boolean {
  return !character.type || character.type === "Human";
}

export function elementAllowed(character: CharacterDocument): boolean {
  return character.type === "Between Worlds" || character.type === "Spirit";
}

export function hasGift(character: CharacterDocument): boolean {
  return (
    "The Gift" in character.advantages ||
    "Incomplete Gift" in character.advantages ||
    "Gift" in character.levels[0].dp
  );
}

export function intersection<T>(a: readonly T[], b: readonly T[]): T[] {
  return a.filter((item) => b.includes(item));
}

export function asNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value) || 0;
}

export function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

export function syncLevels(character: CharacterDocument): CharacterDocument {
  const next = cloneCharacter(character);
  const current = characterLevel(next);
  while (next.levels.length > current && next.levels.length > 1) {
    next.levels.pop();
  }
  while (next.levels.length < current) {
    const previous = next.levels[next.levels.length - 1];
    next.levels.push({ class: previous.class, dp: {} });
  }
  return next;
}

export function levelInfo(character: CharacterDocument, level: number): LevelRecord {
  return character.levels[levelIndex(level)] ?? character.levels[0];
}

export function firstDp(character: CharacterDocument): Record<string, unknown> {
  return character.levels[0]?.dp ?? {};
}
