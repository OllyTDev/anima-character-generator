export const characteristics = [
  "STR",
  "DEX",
  "AGI",
  "CON",
  "INT",
  "POW",
  "WP",
  "PER",
] as const;

export type Characteristic = (typeof characteristics)[number];

export type AbilityField =
  | "Athletics"
  | "Creative"
  | "Intellectual"
  | "Perceptive"
  | "Social"
  | "Subterfuge"
  | "Vigor";

export type AbilityDef = {
  Characteristic: Characteristic;
  Field?: AbilityField;
  Summoning?: boolean;
  specializations?: readonly string[];
  knowledge?: boolean;
  passive?: boolean;
  OllyTRule?: boolean;
};

export type CostValue = number | readonly number[];

export type AdvantageDef = {
  Cost: CostValue;
  OllyTCost?: readonly number[];
  Category?: "Magic" | "Psychic" | "Background";
  Options?: readonly (string | number)[];
  Option_Title?: string;
  Multiple?: boolean;
  effect?: string;
};

export type DisadvantageDef = {
  Benefit: CostValue;
  Category?: "Magic" | "Psychic" | "Background";
  Options?: readonly (string | number)[];
  Option_Title?: string;
  effect?: string;
};

export type ClassDef = {
  Archetypes: readonly string[];
  "Life Point Multiple": number;
  "Life Points": number;
  LP: number;
  Initiative: number;
  MK: number;
  "Innate Psychic Points": number;
  Combat: number;
  Attack: number;
  Block: number;
  Dodge: number;
  "Wear Armor": number;
  Ki: number;
  "Accumulation Multiple": number;
  "Martial Knowledge": number;
  Supernatural: number;
  Zeon: number;
  "MA Multiple": number;
  "Zeon Regeneration Multiple": number;
  "Magic Projection": number;
  Summon: number;
  Control: number;
  Bind: number;
  Banish: number;
  "Magic Level": number;
  Psychic: number;
  "Psychic Points": number;
  "Psychic Projection": number;
  Athletics: number;
  Social: number;
  Perceptive: number;
  Intellectual: number;
  Vigor: number;
  Subterfuge: number;
  Creative: number;
  reduced: Record<string, number>;
  bonuses: Record<string, number>;
};

export type CombatModuleDef = {
  Primary: "Combat" | "Supernatural" | "Psychic";
  DP: number;
  WDP: number;
  Options?: readonly string[];
  Option_Title?: string;
  Notes?: string;
};

export type KiAbilityDef = {
  MK: number;
  OTMK: number;
  Requirements?: readonly string[];
  Options?: readonly string[];
  Option_Title?: string;
  /** Rules text shown in Ki ability tree tooltips; omit until documented. */
  effect?: string;
};

export type EssentialAbilityDef = {
  DP: number;
  Gnosis: number;
  Category?: "Magic" | "Psychic";
  Options?: readonly (string | number)[];
  Option_Title?: string;
  Incompatible?: readonly string[];
  Alternatives?: readonly string[];
  Multiple?: boolean;
};

export type PrimaryCategory = "Combat" | "Supernatural" | "Psychic" | "Other" | "Powers";
