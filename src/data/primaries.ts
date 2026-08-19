import { abilities } from "./abilities";
import { combatModules } from "./combatModules";
import { essentialAbilities } from "./essentialAbilities";
import { martialArts } from "./martialArts";
import { powers } from "./powers";
import type { PrimaryCategory } from "./types";

const combat = [
  "Attack",
  "Block",
  "Dodge",
  "Wear Armor",
  "Ki",
  "Accumulation Multiple",
  "Martial Knowledge",
  "Save Combat DP for later",
];

const supernatural = [
  "Zeon",
  "MA Multiple",
  "Zeon Regeneration Multiple",
  "Magic Projection",
  "Summon",
  "Control",
  "Bind",
  "Banish",
  "Magic Level",
  "Save Supernatural DP for later",
];

const psychic = ["Psychic Points", "Psychic Projection", "Save Psychic DP for later"];

const other = [
  ...Object.keys(abilities).filter((name) => abilities[name].Field),
  "Life Point Multiple",
  "Life Points",
  "Save generic DP for later",
];

const reverseLookup: Record<string, PrimaryCategory> = {};

for (const name of combat) reverseLookup[name] = "Combat";
for (const name of supernatural) reverseLookup[name] = "Supernatural";
for (const name of psychic) reverseLookup[name] = "Psychic";
for (const name of other) reverseLookup[name] = "Other";
for (const name of Object.keys(essentialAbilities.advantages)) reverseLookup[name] = "Other";
for (const name of Object.keys(essentialAbilities.disadvantages)) reverseLookup[name] = "Other";
for (const name of Object.keys(martialArts)) reverseLookup[name] = "Combat";
for (const [name, module] of Object.entries(combatModules)) {
  reverseLookup[name] = module.Primary;
}
for (const name of Object.keys(powers)) reverseLookup[name] = "Powers";

export const primaries = {
  Combat: combat,
  Supernatural: supernatural,
  Psychic: psychic,
  Other: other,
  forAbility(name: string): PrimaryCategory {
    return reverseLookup[name] ?? "Other";
  },
};
