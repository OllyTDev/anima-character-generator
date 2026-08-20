import type { AbilityDef } from "./types";
import { tables } from "./tables";

export const abilities: Record<string, AbilityDef> = {
  Attack: { Characteristic: "DEX" },
  Block: { Characteristic: "DEX" },
  Dodge: { Characteristic: "AGI" },
  "Wear Armor": { Characteristic: "STR" },
  "Magic Projection": { Characteristic: "DEX" },
  "Psychic Projection": { Characteristic: "DEX" },
  Summon: { Characteristic: "POW", Summoning: true },
  Control: { Characteristic: "WP", Summoning: true },
  Bind: { Characteristic: "POW", Summoning: true },
  Banish: { Characteristic: "POW", Summoning: true },
  Acrobatics: { Field: "Athletics", Characteristic: "AGI" },
  Athleticism: { Field: "Athletics", Characteristic: "AGI" },
  Climb: { Field: "Athletics", Characteristic: "AGI" },
  Jump: { Field: "Athletics", Characteristic: "STR" },
  Ride: { Field: "Athletics", Characteristic: "AGI" },
  Swim: { Field: "Athletics", Characteristic: "AGI" },
  Alchemy: { Field: "Creative", Characteristic: "INT" },
  Animism: { Field: "Creative", Characteristic: "POW" },
  Art: { Field: "Creative", Characteristic: "POW", specializations: ["Painting", "Sculpture"] },
  Cookery: { Field: "Creative", Characteristic: "DEX", specializations: ["Baking"], OllyTRule: true },
  Dance: { Field: "Creative", Characteristic: "AGI", knowledge: true, specializations: ["Ballroom dancing"] },
  Forging: {
    Field: "Creative",
    Characteristic: "DEX",
    knowledge: true,
    specializations: ["Firearms", "Ghestal wood", "Heavy armor", "Kitchen utensils", "Swords"],
  },
  Jewelry: { Field: "Creative", Characteristic: "DEX", specializations: ["Carving wood", "Shaping glass"] },
  Music: {
    Field: "Creative",
    Characteristic: "POW",
    knowledge: true,
    specializations: ["Drums", "Fiddle", "Guitar", "Singing"],
  },
  "Ritual Calligraphy": { Field: "Creative", Characteristic: "DEX" },
  Runes: { Field: "Creative", Characteristic: "DEX" },
  "Sleight of Hand": {
    Field: "Creative",
    Characteristic: "DEX",
    specializations: ["Juggling", "Prestidigitation", "Reloading"],
  },
  Tailoring: { Field: "Creative", Characteristic: "DEX" },
  Insight: { Field: "Perceptive", Characteristic: "POW", OllyTRule: true },
  Notice: { Field: "Perceptive", Characteristic: "PER", passive: true },
  Search: { Field: "Perceptive", Characteristic: "PER" },
  Track: { Field: "Perceptive", Characteristic: "PER" },
  Etiquette: { Field: "Social", Characteristic: "INT" },
  Intimidate: { Field: "Social", Characteristic: "WP" },
  Leadership: { Field: "Social", Characteristic: "POW", passive: true },
  Persuasion: { Field: "Social", Characteristic: "INT", specializations: ["Deception", "Debate", "Seduction"] },
  Streetwise: { Field: "Social", Characteristic: "INT" },
  Style: { Field: "Social", Characteristic: "POW", passive: true },
  Trading: {
    Field: "Social",
    Characteristic: "INT",
    specializations: [
      "Armor",
      "Artifacts",
      "Clothing",
      "Firearms",
      "Gems",
      "Jewelry",
      "Livestock",
      "Paintings",
      "Perfume",
      "Poison",
      "Sculpture",
      "Swords",
      "Wine",
    ],
  },
  Disguise: { Field: "Subterfuge", Characteristic: "DEX" },
  Hide: { Field: "Subterfuge", Characteristic: "PER" },
  "Lock Picking": { Field: "Subterfuge", Characteristic: "DEX" },
  Poisons: { Field: "Subterfuge", Characteristic: "INT", knowledge: true },
  Theft: { Field: "Subterfuge", Characteristic: "DEX" },
  Stealth: { Field: "Subterfuge", Characteristic: "AGI" },
  "Trap Lore": { Field: "Subterfuge", Characteristic: "DEX" },
  Animals: {
    Field: "Intellectual",
    Characteristic: "INT",
    knowledge: true,
    specializations: ["Bears", "Cats", "Dogs", "Horses", "Lions", "Tigers", "Wolves"],
  },
  Agriculture: { Field: "Intellectual", Characteristic: "INT", OllyTRule: true },
  Appraisal: { Field: "Intellectual", Characteristic: "INT", knowledge: true },
  "Herbal Lore": { Field: "Intellectual", Characteristic: "INT", knowledge: true },
  History: { Field: "Intellectual", Characteristic: "INT", knowledge: true, specializations: ["Christian", "Local"] },
  Law: { Field: "Intellectual", Characteristic: "INT" },
  Memorize: { Field: "Intellectual", Characteristic: "INT" },
  "Magic Appraisal": { Field: "Intellectual", Characteristic: "POW", knowledge: true, passive: true },
  Medicine: { Field: "Intellectual", Characteristic: "INT", knowledge: true, specializations: ["First aid", "Surgery"] },
  Navigation: { Field: "Intellectual", Characteristic: "INT", knowledge: true },
  Occult: {
    Field: "Intellectual",
    Characteristic: "INT",
    knowledge: true,
    specializations: ["Artifacts", "Ki", "Local myths", "Magic", "Psychic abilities", "Religion", "Supernatural creatures"],
  },
  Science: { Field: "Intellectual", Characteristic: "INT", knowledge: true },
  Tactics: { Field: "Intellectual", Characteristic: "INT" },
  Composure: { Field: "Vigor", Characteristic: "WP", passive: true },
  "Feats of Strength": { Field: "Vigor", Characteristic: "STR" },
  "Withstand Pain": { Field: "Vigor", Characteristic: "WP" },
};

export function abilitySupportsSpecialization(name: string): boolean {
  const def = abilities[name];
  return Boolean(def?.specializations?.length);
}

export function specializationSuggestions(name: string): readonly string[] {
  return abilities[name]?.specializations ?? [];
}

/** Map stored text to a canonical suggestion when it matches case-insensitively. */
export function resolveSpecializationChoice(name: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const match = specializationSuggestions(name).find((item) => item.toLowerCase() === trimmed.toLowerCase());
  return match ?? trimmed;
}

export function specializationSelectValue(name: string, stored: string | undefined): string {
  if (!stored?.trim()) return "";
  return resolveSpecializationChoice(name, stored);
}

export function secondaryAbilities(ollyTRules: boolean): string[] {
  return Object.keys(abilities).filter((name) => {
    const ability = abilities[name];
    if (!ability.Field) return false;
    if (ability.OllyTRule && !ollyTRules) return false;
    return true;
  });
}

export type SecondaryAbilityInfo = {
  name: string;
  field: string;
  characteristic: string;
};

export function secondaryAbilitiesGrouped(ollyTRules: boolean): Record<(typeof tables.fields)[number], SecondaryAbilityInfo[]> {
  const grouped = Object.fromEntries(tables.fields.map((field) => [field, [] as SecondaryAbilityInfo[]])) as Record<
    (typeof tables.fields)[number],
    SecondaryAbilityInfo[]
  >;

  for (const name of secondaryAbilities(ollyTRules)) {
    const ability = abilities[name];
    if (!ability?.Field) continue;
    grouped[ability.Field as (typeof tables.fields)[number]].push({
      name,
      field: ability.Field,
      characteristic: ability.Characteristic,
    });
  }

  for (const field of tables.fields) {
    grouped[field].sort((a, b) => a.name.localeCompare(b.name));
  }

  return grouped;
}

export function secondaryAbilitiesSorted(ollyTRules: boolean): SecondaryAbilityInfo[] {
  return secondaryAbilities(ollyTRules)
    .map((name) => {
      const ability = abilities[name];
      return {
        name,
        field: ability.Field!,
        characteristic: ability.Characteristic,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function primaryAbilities(): string[] {
  return Object.keys(abilities).filter((name) => !abilities[name].Field);
}
