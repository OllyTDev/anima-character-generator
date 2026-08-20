import { z } from "zod";
import { characteristics } from "../data/types";
import type { Characteristic } from "../data/types";
import { generationMethods, type GenerationMethod } from "../data/generationMethods";
import { levelModes, type LevelMode } from "../data/levelModes";
import { kiGenerationModes, type KiGenerationMode } from "../data/kiGenerationModes";

export const SCHEMA_VERSION = 1 as const;

export const characteristicSchema = z.enum(characteristics);

export const generationMethodSchema = z.enum(generationMethods.map((item) => item.id) as [
  GenerationMethod,
  ...GenerationMethod[],
]);

export const levelModeSchema = z.enum(levelModes.map((item) => item.id) as [LevelMode, ...LevelMode[]]);

export const kiGenerationModeSchema = z.enum(kiGenerationModes.map((item) => item.id) as [
  KiGenerationMode,
  ...KiGenerationMode[],
]);

export const settingsSchema = z.object({
  ollyTRules: z.boolean(),
  generationMethod: generationMethodSchema.default("open"),
  levelMode: levelModeSchema.default("xp"),
  kiGenerationMode: kiGenerationModeSchema.default("separated"),
});

export const levelSchema = z.object({
  class: z.string(),
  dp: z.record(z.string(), z.unknown()),
  mk: z.record(z.string(), z.unknown()).optional(),
  characteristic: characteristicSchema.optional(),
  naturalBonus: z.string().optional(),
  freelancer: z.array(z.string()).optional(),
  magicProjectionImbalance: z.number().optional(),
});

export const characterSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  settings: settingsSchema,
  name: z.string(),
  race: z.string(),
  gender: z.string(),
  type: z.string(),
  element: z.string().optional(),
  gnosis: z.number(),
  xp: z.number(),
  created: z.boolean().optional(),
  damageResistance: z.boolean().optional(),
  racialLevel: z.number().optional(),
  appearance: z.number(),
  characteristics: z.object({
    STR: z.number(),
    DEX: z.number(),
    AGI: z.number(),
    CON: z.number(),
    INT: z.number(),
    POW: z.number(),
    WP: z.number(),
    PER: z.number(),
  }),
  advantages: z.record(z.string(), z.unknown()),
  disadvantages: z.record(z.string(), z.unknown()),
  specializations: z.record(z.string(), z.string()).optional(),
  firstMartialArt: z.string().optional(),
  insufficientMartialKnowledge: z.unknown().optional(),
  levels: z.array(levelSchema).min(1),
});

export type CharacterDocument = z.infer<typeof characterSchema>;
export type LevelRecord = z.infer<typeof levelSchema>;
export type CharacterSettings = z.infer<typeof settingsSchema>;

export function emptyCharacteristics(): Record<Characteristic, number> {
  return { STR: 5, DEX: 5, AGI: 5, CON: 5, INT: 5, POW: 5, WP: 5, PER: 5 };
}

export function createEmptyCharacter(): CharacterDocument {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: { ollyTRules: false, generationMethod: "open", levelMode: "xp", kiGenerationMode: "separated" },
    name: "",
    race: "Human",
    gender: "",
    type: "Human",
    gnosis: 0,
    xp: 0,
    appearance: 5,
    characteristics: emptyCharacteristics(),
    advantages: {},
    disadvantages: {},
    levels: [{ class: "Freelancer", dp: {} }],
  };
}

export function cloneCharacter(character: CharacterDocument): CharacterDocument {
  return structuredClone(character);
}
