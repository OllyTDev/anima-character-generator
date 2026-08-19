import { characteristics, type Characteristic } from "../data/types";
import {
  SCHEMA_VERSION,
  characterSchema,
  createEmptyCharacter,
  emptyCharacteristics,
  type CharacterDocument,
  type LevelRecord,
} from "../schema/character";

export const LEGACY_MIGRATION_NOTICE =
  "Old schema detected! We converted this character to the current format, but some details may not transfer perfectly. Download the JSON to save the new schema and skip this step next time.";

type LegacyRecord = Record<string, unknown>;

function isRecord(value: unknown): value is LegacyRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickValue(data: LegacyRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in data && data[key] !== undefined) return data[key];
  }
  return undefined;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function convertCharacteristics(data: LegacyRecord): Record<Characteristic, number> {
  const result = emptyCharacteristics();
  const nested = asRecord(data.characteristics);
  for (const key of characteristics) {
    const flat = data[key];
    const nestedValue = nested[key];
    if (typeof flat === "number") result[key] = flat;
    else if (typeof nestedValue === "number") result[key] = nestedValue;
  }
  return result;
}

function convertLevel(raw: unknown): LevelRecord {
  const level = asRecord(raw);
  const converted: LevelRecord = {
    class: asString(pickValue(level, "Class", "class"), "Freelancer"),
    dp: asRecord(pickValue(level, "DP", "dp")),
  };

  const mk = pickValue(level, "MK", "mk");
  if (isRecord(mk) && Object.keys(mk).length > 0) converted.mk = mk;

  const naturalBonus = pickValue(level, "Natural Bonus", "naturalBonus");
  if (typeof naturalBonus === "string" && naturalBonus) converted.naturalBonus = naturalBonus;

  const characteristic = pickValue(level, "Characteristic", "characteristic");
  if (typeof characteristic === "string" && characteristics.includes(characteristic as Characteristic)) {
    converted.characteristic = characteristic as Characteristic;
  }

  const freelancer = pickValue(level, "Freelancer", "freelancer");
  if (Array.isArray(freelancer)) converted.freelancer = freelancer.map(String);

  const imbalance = pickValue(level, "Magic Projection Imbalance", "magicProjectionImbalance");
  if (typeof imbalance === "number" && Number.isFinite(imbalance)) {
    converted.magicProjectionImbalance = imbalance;
  }

  return converted;
}

export function isLegacyCharacter(data: unknown): boolean {
  if (!isRecord(data)) return false;
  if (data.schemaVersion === SCHEMA_VERSION) return false;
  if ("Advantages" in data || "Disadvantages" in data || "Name" in data || "XP" in data || "Race" in data) {
    return true;
  }
  if (Array.isArray(data.levels) && data.levels.some((level) => isRecord(level) && ("Class" in level || "DP" in level))) {
    return true;
  }
  return false;
}

export function convertLegacyCharacter(data: unknown): CharacterDocument {
  if (!isRecord(data)) {
    throw new Error("Legacy character JSON must be an object");
  }

  const defaults = createEmptyCharacter();
  const levelsRaw = Array.isArray(data.levels) ? data.levels : [];
  const levels = levelsRaw.length > 0 ? levelsRaw.map(convertLevel) : defaults.levels;

  const converted: CharacterDocument = {
    schemaVersion: SCHEMA_VERSION,
    settings: isRecord(data.settings)
      ? {
          ollyTRules: Boolean(data.settings.ollyTRules),
          generationMethod:
            typeof data.settings.generationMethod === "string"
              ? (data.settings.generationMethod as CharacterDocument["settings"]["generationMethod"])
              : defaults.settings.generationMethod,
        }
      : defaults.settings,
    name: asString(pickValue(data, "Name", "name")),
    race: asString(pickValue(data, "Race", "race"), defaults.race),
    gender: asString(pickValue(data, "Gender", "gender"), defaults.gender),
    type: asString(pickValue(data, "Type", "type"), defaults.type),
    gnosis: asNumber(pickValue(data, "Gnosis", "gnosis"), defaults.gnosis),
    xp: asNumber(pickValue(data, "XP", "xp"), defaults.xp),
    appearance: asNumber(pickValue(data, "Appearance", "appearance"), defaults.appearance),
    characteristics: convertCharacteristics(data),
    advantages: asRecord(pickValue(data, "Advantages", "advantages")),
    disadvantages: asRecord(pickValue(data, "Disadvantages", "disadvantages")),
    levels,
  };

  const element = pickValue(data, "Element", "element");
  if (typeof element === "string" && element) converted.element = element;

  const created = asBoolean(pickValue(data, "Created", "created"));
  if (created !== undefined) converted.created = created;

  const damageResistance = asBoolean(pickValue(data, "Damage Resistance", "damageResistance"));
  if (damageResistance !== undefined) converted.damageResistance = damageResistance;

  const racialLevel = pickValue(data, "Racial Level", "racialLevel");
  if (typeof racialLevel === "number" && Number.isFinite(racialLevel)) converted.racialLevel = racialLevel;

  const specializations = pickValue(data, "Specializations", "specializations");
  if (isRecord(specializations) && Object.keys(specializations).length > 0) {
    converted.specializations = Object.fromEntries(
      Object.entries(specializations).map(([key, value]) => [key, String(value)]),
    );
  }

  const firstMartialArt = pickValue(data, "First Martial Art", "firstMartialArt");
  if (typeof firstMartialArt === "string" && firstMartialArt) converted.firstMartialArt = firstMartialArt;

  const insufficientMartialKnowledge = pickValue(
    data,
    "Insufficient Martial Knowledge",
    "insufficientMartialKnowledge",
  );
  if (insufficientMartialKnowledge !== undefined) {
    converted.insufficientMartialKnowledge = insufficientMartialKnowledge;
  }

  return characterSchema.parse(converted);
}

export type CharacterParseResult = {
  character: CharacterDocument;
  migrated: boolean;
};

export function parseCharacterDocument(text: string): CharacterParseResult {
  const data: unknown = JSON.parse(text);
  if (isLegacyCharacter(data)) {
    return { character: convertLegacyCharacter(data), migrated: true };
  }
  return { character: characterSchema.parse(data), migrated: false };
}
