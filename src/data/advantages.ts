import { abilities, secondaryAbilities } from "./abilities";
import { culturalRoots } from "./culturalRoots";
import { magicPaths } from "./magicPaths";
import { psychicDisciplines } from "./psychicDisciplines";
import { tables } from "./tables";
import type { AdvantageDef } from "./types";

function psychicPowerNames(): string[] {
  const names: string[] = [];
  for (const [discipline, powers] of Object.entries(psychicDisciplines.disciplines)) {
    names.push(`------------ ${discipline} ------------`);
    names.push(...Object.keys(powers));
  }
  return names;
}

export const advantages: Record<string, AdvantageDef> = {
  "Access to Natural Psychic Powers": {
    Cost: [1, 2, 3],
    Options: psychicPowerNames(),
    Option_Title: "Select a Power",
  },
  "Access to One Psychic Discipline": {
    Cost: 1,
    Options: Object.keys(psychicDisciplines.disciplines),
    Option_Title: "Select a discipline",
  },
  "Acute Senses": { Cost: 1 },
  "Add One Point to a Characteristic": {
    Cost: 1,
    Options: [...tables.characteristics],
    Option_Title: "Select the characteristic to increase",
  },
  Ambidextrous: { Cost: 1 },
  "Amplify Sustained Power": { Category: "Psychic", Cost: 2 },
  "Animal Affinity": { Cost: 1 },
  "Aptitude in a Field": { Cost: 2, Options: [...tables.fields], Option_Title: "Select a field" },
  "Aptitude in a Subject": {
    Cost: [1, 2],
    Options: secondaryAbilities(true),
    Option_Title: "Select a subject",
  },
  "Aptitude for Magic Development": { Category: "Magic", Cost: 1 },
  Artifact: { Category: "Background", Cost: [1, 2, 3], Options: [], Option_Title: "Enter the name of the artifact" },
  "Artifact Affinity": { Cost: 1 },
  "Been Around": { Category: "Background", Cost: [1, 2, 3] },
  "Born Wizard": { Category: "Magic", Cost: 1 },
  Charm: { Cost: 1 },
  "Combat Senses": {
    Cost: 3,
    Options: [...tables.primary_combat_abilities],
    Option_Title: "Select an ability",
  },
  Contacts: { Category: "Background", Cost: [1, 2, 3], Options: [], Option_Title: "Enter name of organization" },
  "Contested Spell Mastery": { Category: "Magic", Cost: 1 },
  "Cultural Roots": {
    Category: "Background",
    Cost: 1,
    Options: Object.keys(culturalRoots),
    Option_Title: "Select a background",
  },
  "Danger Sense": { Cost: 2 },
  Disquieting: { Cost: 1 },
  "Dual Limit": { Cost: 1 },
  Elan: { Cost: [1, 2, 3], Options: [], Option_Title: "Enter the name of the Beryl or Shajad" },
  "Elemental Compatibility": {
    Category: "Magic",
    Cost: 1,
    Options: [...magicPaths],
    Option_Title: "Select a path",
  },
  "Exceptional Magic Resistance": { Cost: [1, 2] },
  "Exceptional Physical Resistance": { Cost: [1, 2] },
  "Exceptional Psychic Resistance": { Cost: [1, 2] },
  "Extreme Concentration": { Category: "Psychic", Cost: 2 },
  Fame: { Category: "Background", Cost: [1, 2] },
  Familiar: { Cost: [2, 3], OllyTCost: [1, 2, 3] },
  Focus: { Category: "Psychic", Cost: 1 },
  Fortunate: { Cost: 1 },
  "Free Access to Any Psychic Discipline": { Cost: 2 },
  "Free Will": { Cost: 1 },
  "Good Luck": { Cost: 1 },
  "Gradual Magic Learning": { Category: "Magic", Cost: 2 },
  "Half-Attuned to the Tree": { Category: "Magic", Cost: 2 },
  "Hard to Kill": { Cost: [1, 2, 3] },
  "Immunity to Pain and Fatigue": { Cost: 1 },
  "Imperceptible Ki": { Cost: 1 },
  "Improved Innate Spell": { Category: "Magic", Cost: [1, 2, 3] },
  "Incomplete Gift": { Cost: 1, Options: [...tables.theorems], Option_Title: "Select the Theorem used" },
  "Increased Ki Accumulation": { Cost: [1, 2] },
  "Increased Natural Bonus": { Cost: 2 },
  "Increased Psychic Modifiers": { Category: "Psychic", Cost: 1 },
  "Increase One Characteristic to Nine": {
    Cost: 2,
    Options: [...tables.characteristics],
    Option_Title: "Select the characteristic to increase",
  },
  "Jack of All Trades": { Cost: 2 },
  "Ki Perception": { Cost: 1 },
  "Ki Recovery": { Cost: [1, 2, 3] },
  "Light Sleeper": { Cost: 1 },
  Learning: { Cost: [1, 2, 3] },
  "Magic Nature": { Category: "Magic", Cost: [1, 2, 3] },
  "Magical Diction": { Category: "Magic", Cost: 1 },
  "Martial Learning": { Cost: 1 },
  "Martial Mastery": { Cost: [1, 2, 3] },
  "Mass Summoner": { Cost: [1, 2, 3] },
  "Masterful Seals": { Cost: 1 },
  "Mystical Armor": { Cost: 1 },
  "Natural Armor": { Cost: 1 },
  "Natural Knowledge of a Path": {
    Category: "Magic",
    Cost: 1,
    Options: [...magicPaths],
    Option_Title: "Select a path",
  },
  "Natural Learner": {
    Cost: [1, 2, 3],
    Options: Object.keys(abilities).filter((name) => "Field" in abilities[name]),
    Option_Title: "Select an ability",
  },
  "Natural Learner, Field": { Cost: [2, 3], Options: [...tables.fields], Option_Title: "Select a field" },
  "Natural Power": { Category: "Magic", Cost: 1 },
  "Night Vision": { Cost: 1 },
  "No Gestures": { Cost: 1 },
  "Opposite Magic": { Category: "Magic", Cost: 1 },
  "Passive Concentration": { Category: "Psychic", Cost: 2 },
  "Powerful Ally": { Category: "Background", Cost: [1, 2, 3], Options: [], Option_Title: "Enter powerful ally" },
  "Psychic Ambivalence": { Category: "Psychic", Cost: 1 },
  "Psychic Fatigue Resistance": { Category: "Psychic", Cost: 2 },
  "Psychic Immunity": { Cost: 1 },
  "Psychic Inclination": {
    Category: "Psychic",
    Cost: 2,
    Options: Object.keys(psychicDisciplines.disciplines),
    Option_Title: "Select a discipline",
  },
  "Psychic Point Recovery": { Category: "Psychic", Cost: [1, 2, 3] },
  "Quick Reflexes": { Cost: [1, 2, 3] },
  Regeneration: { Cost: [1, 2, 3] },
  "Repeat a Characteristics Roll": {
    Cost: 1,
    Options: [...tables.characteristics],
    Option_Title: "Select the characteristic to reroll",
  },
  Saint: { Category: "Background", Cost: 2 },
  Seducer: { Cost: 1 },
  "See Supernatural": { Cost: 1 },
  "Sheele Essence": { Cost: 1 },
  "Social Position": { Category: "Background", Cost: [1, 2] },
  "Starting Wealth": { Category: "Background", Cost: [1, 2, 3] },
  "Superior Magic Recovery": { Category: "Magic", Cost: [1, 2, 3] },
  "Supernatural Immunity": { Cost: [1, 2, 3] },
  Survivor: { Cost: 1 },
  Talented: { Cost: 1 },
  "To the Limit": { Cost: 1 },
  "Touched by Destiny": { Cost: 1 },
  "Total Accumulation": { Cost: 2 },
  "The Gift": { Cost: 2, Options: [...tables.theorems], Option_Title: "Select the Theorem used" },
  "Uncommon Size": {
    Cost: 1,
    Options: [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5],
    Option_Title: "Select the size modifier to apply",
  },
  "Unconnected Techniques": { Cost: 1 },
  "Unlimited Familiars": { Cost: 2 },
  "Unspoken Casting": { Category: "Magic", Cost: 1 },
  Untiring: { Cost: [1, 2, 3] },
  "Usage Affinity": { Cost: 1 },
  "Use of Armor": { Cost: [1, 2, 3] },
  Versatile: { Cost: 1 },
  "Versatile Metamagic": { Category: "Magic", Cost: 1 },
};

export function advantageCosts(name: string, ollyTRules: boolean): number[] {
  const advantage = advantages[name];
  const cost = ollyTRules && advantage.OllyTCost ? advantage.OllyTCost : advantage.Cost;
  return typeof cost === "number" ? [cost] : [...cost];
}
