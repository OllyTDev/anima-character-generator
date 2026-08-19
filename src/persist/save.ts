import { characterSchema, type CharacterDocument } from "../schema/character";
import { parseCharacterDocument, type CharacterParseResult } from "./legacyMigration";

const STORAGE_KEY = "anima-character-v1";

export { LEGACY_MIGRATION_NOTICE, parseCharacterDocument } from "./legacyMigration";
export type { CharacterParseResult } from "./legacyMigration";

export function serializeCharacter(character: CharacterDocument): string {
  return JSON.stringify(character, null, 2);
}

export function parseCharacter(text: string): CharacterDocument {
  return parseCharacterDocument(text).character;
}

export function saveToLocalStorage(character: CharacterDocument): void {
  localStorage.setItem(STORAGE_KEY, serializeCharacter(character));
}

export function loadFromLocalStorage(): CharacterParseResult | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return parseCharacterDocument(raw);
  } catch {
    return null;
  }
}

export function downloadCharacter(character: CharacterDocument): void {
  const blob = new Blob([serializeCharacter(character)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const slug = (character.name || "character").replace(/[^\w-]+/g, "-").toLowerCase();
  link.href = url;
  link.download = `${slug}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function isValidCharacterDocument(data: unknown): data is CharacterDocument {
  return characterSchema.safeParse(data).success;
}
