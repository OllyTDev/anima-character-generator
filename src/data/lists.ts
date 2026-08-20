export const SCHEMA_VERSION = 1 as const;

export const races = [
  "Human",
  "Other",
  "D'Anjayni Nephilim",
  "Daimah Nephilim",
  "Devah Nephilim",
  "Duk'zarist Nephilim",
  "Ebudan Nephilim",
  "Jayan Nephilim",
  "Sylvain Nephilim",
  "Vetala Nephilim",
] as const;

export const creatureTypes = [
  "Human",
  "Natural",
  "Between Worlds",
  "Between Worlds (Construct)",
  "Between Worlds, Undead",
  "Between Worlds, Undead (Construct)",
  "Spirit",
  "Spirit, Undead",
] as const;

export const genders = ["Female", "Male", "Non-Binary", "Other"] as const;

export const kiCharacteristics = ["STR", "DEX", "AGI", "CON", "POW", "WP"] as const;
