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
    effect: "Effect not yet documented.",
    Cost: [1, 2, 3],
    Options: psychicPowerNames(),
    Option_Title: "Select a Power",
  },
  "Access to One Psychic Discipline": {
    effect: "Effect not yet documented.",
    Cost: 1,
    Options: Object.keys(psychicDisciplines.disciplines),
    Option_Title: "Select a discipline",
  },
  "Acute Senses": {
    effect: "Effect not yet documented.", Cost: 1 },
  "Add One Point to a Characteristic": {
    effect: "Effect not yet documented.",
    Cost: 1,
    Options: [...tables.characteristics],
    Option_Title: "Select the characteristic to increase",
  },
  Ambidextrous: {

    effect: "Effect not yet documented.", Cost: 1 },
  "Amplify Sustained Power": {
    effect: "one difficulty level higher", Category: "Psychic", Cost: 2 },
  "Animal Affinity": {
    effect: "Effect not yet documented.", Cost: 1 },
  "Aptitude in a Field": {
    effect: "Effect not yet documented.", Cost: 2, Options: [...tables.fields], Option_Title: "Select a field" },
  "Aptitude in a Subject": {
    effect: "Effect not yet documented.",
    Cost: [1, 2],
    Options: secondaryAbilities(true),
    Option_Title: "Select a subject",
  },
  "Aptitude for Magic Development": {
    effect: "adds +3 to INT to determine max potential no other ability", Category: "Magic", Cost: 1 },
  Artifact: {

    effect: "Effect not yet documented.", Category: "Background", Cost: [1, 2, 3], Options: [], Option_Title: "Enter the name of the artifact" },
  "Artifact Affinity": {
    effect: "Effect not yet documented.", Cost: 1 },
  "Been Around": {
    effect: "Effect not yet documented.", Category: "Background", Cost: [1, 2, 3] },
  "Born Wizard": {
    effect: "Effect not yet documented.", Category: "Magic", Cost: 1 },
  Charm: {

    effect: "Effect not yet documented.", Cost: 1 },
  "Combat Senses": {
    effect: "Effect not yet documented.",
    Cost: 3,
    Options: [...tables.primary_combat_abilities],
    Option_Title: "Select an ability",
  },
  Contacts: {

    effect: "Effect not yet documented.", Category: "Background", Cost: [1, 2, 3], Options: [], Option_Title: "Enter name of organization" },
  "Contested Spell Mastery": {
    effect: "Effect not yet documented.", Category: "Magic", Cost: 1 },
  "Cultural Roots": {
    effect: "Effect not yet documented.",
    Category: "Background",
    Cost: 1,
    Options: Object.keys(culturalRoots),
    Option_Title: "Select a background",
  },
  "Danger Sense": {
    effect: "Effect not yet documented.", Cost: 2 },
  Disquieting: {

    effect: "Effect not yet documented.", Cost: 1 },
  "Dual Limit": {
    effect: "choose up to 2 limits", Cost: 1 },
  Elan: {

    effect: "Effect not yet documented.", Cost: [1, 2, 3], Options: [], Option_Title: "Enter the name of the Beryl or Shajad" },
  "Elemental Compatibility": {
    effect: "+ 20 MA and +20 MR in one element -20 in opposing. if necro then all.",
    Category: "Magic",
    Cost: 1,
    Options: [...magicPaths],
    Option_Title: "Select a path",
  },
  "Exceptional Magic Resistance": {
    effect: "+25 to MR , +50 to MR", Cost: [1, 2] },
  "Exceptional Physical Resistance": {
    effect: "+25 to PhR/VR/DR , +50 to Phr/VR/DR", Cost: [1, 2] },
  "Exceptional Psychic Resistance": {
    effect: "+25 to PsR , +50 to PsR", Cost: [1, 2] },
  "Extreme Concentration": {
    effect: "doubles the bonus for concentrating", Category: "Psychic", Cost: 2 },
  Fame: {

    effect: "Effect not yet documented.", Category: "Background", Cost: [1, 2] },
  Familiar: {

    effect: "Effect not yet documented.", Cost: [2, 3], OllyTCost: [1, 2, 3] },
  Focus: {

    effect: "psychic points spent to boost projection are +20 instead of +10", Category: "Psychic", Cost: 1 },
  Fortunate: {

    effect: "Effect not yet documented.", Cost: 1 },
  "Free Access to Any Psychic Discipline": {
    effect: "Effect not yet documented.", Cost: 2 },
  "Free Will": {
    effect: "+60 to resist domination or possession", Cost: 1 },
  "Good Luck": {
    effect: "Effect not yet documented.", Cost: 1 },
  "Gradual Magic Learning": {
    effect: "Effect not yet documented.", Category: "Magic", Cost: 2 },
  "Half-Attuned to the Tree": {
    effect: "necromany not allowed.  Like elemental compat, but allows you to choose 1/2 the tree. necro not allowed", Category: "Magic", Cost: 2 },
  "Hard to Kill": {
    effect: "+10 per pt to LP per level", Cost: [1, 2, 3] },
  "Immunity to Pain and Fatigue": {
    effect: "Effect not yet documented.", Cost: 1 },
  "Imperceptible Ki": {
    effect: "+10 to ki concealment per level.  does not grant any benefit without ability ki concealment", Cost: 1 },
  "Improved Innate Spell": {
    effect: "Effect not yet documented.", Category: "Magic", Cost: [1, 2, 3] },
  "Incomplete Gift": {
    effect: "Effect not yet documented.", Cost: 1, Options: [...tables.theorems], Option_Title: "Select the Theorem used" },
  "Increased Ki Accumulation": {
    effect: "Effect not yet documented.", Cost: [1, 2] },
  "Increased Natural Bonus": {
    effect: "twice the  usual bonus to a secondary when levelling", Cost: 2 },
  "Increased Psychic Modifiers": {
    effect: "Effect not yet documented.", Category: "Psychic", Cost: 1 },
  "Increase One Characteristic to Nine": {
    effect: "Effect not yet documented.",
    Cost: 2,
    Options: [...tables.characteristics],
    Option_Title: "Select the characteristic to increase",
  },
  "Jack of All Trades": {
    effect: "Effect not yet documented.", Cost: 2 },
  "Ki Perception": {
    effect: "+10 per level to Ki Detection", Cost: 1 },
  "Ki Recovery": {
    effect: "Effect not yet documented.", Cost: [1, 2, 3] },
  "Light Sleeper": {
    effect: "Effect not yet documented.", Cost: 1 },
  Learning: {

    effect: "Additional +3 xp, +6 xp, +9 xp per session", Cost: [1, 2, 3] },
  "Magic Nature": {
    effect: "+50 +100 +150 zeon per level", Category: "Magic", Cost: [1, 2, 3] },
  "Magical Diction": {
    effect: "no zeon for casting from scroll or grimoire", Category: "Magic", Cost: 1 },
  "Martial Learning": {
    effect: "increases learning level by 2", Cost: 1 },
  "Martial Mastery": {
    effect: "Effect not yet documented.", Cost: [1, 2, 3] },
  "Mass Summoner": {
    effect: "Effect not yet documented.", Cost: [1, 2, 3] },
  "Masterful Seals": {
    effect: "+2 levels for difficulty of setting a seal", Cost: 1 },
  "Mystical Armor": {
    effect: "Effect not yet documented.", Cost: 1 },
  "Natural Armor": {
    effect: "Effect not yet documented.", Cost: 1 },
  "Natural Knowledge of a Path": {
    effect: "Effect not yet documented.",
    Category: "Magic",
    Cost: 1,
    Options: [...magicPaths],
    Option_Title: "Select a path",
  },
  "Natural Learner": {
    effect: "Effect not yet documented.",
    Cost: [1, 2, 3],
    Options: Object.keys(abilities).filter((name) => "Field" in abilities[name]),
    Option_Title: "Select an ability",
  },
  "Natural Learner, Field": {
    effect: "+5 +10, per level additional to specific field", Cost: [2, 3], Options: [...tables.fields], Option_Title: "Select a field" },
  "Natural Power": {
    effect: "maximum spell potential uses POW", Category: "Magic", Cost: 1 },
  "Night Vision": {
    effect: "Effect not yet documented.", Cost: 1 },
  "No Gestures": {
    effect: "no reduction to ki accumulation", Cost: 1 },
  "Opposite Magic": {
    effect: "Effect not yet documented.", Category: "Magic", Cost: 1 },
  "Passive Concentration": {
    effect: "Effect not yet documented.", Category: "Psychic", Cost: 2 },
  "Powerful Ally": {
    effect: "Effect not yet documented.", Category: "Background", Cost: [1, 2, 3], Options: [], Option_Title: "Enter powerful ally" },
  "Psychic Ambivalence": {
    effect: "Effect not yet documented.", Category: "Psychic", Cost: 1 },
  "Psychic Fatigue Resistance": {
    effect: "no fatigue when a power fails.  Does not effect 3rd level powers", Category: "Psychic", Cost: 2 },
  "Psychic Immunity": {
    effect: "Effect not yet documented.", Cost: 1 },
  "Psychic Inclination": {
    effect: "+1 level of greater difficulty for one of his psychic disciplines.",
    Category: "Psychic",
    Cost: 2,
    Options: Object.keys(psychicDisciplines.disciplines),
    Option_Title: "Select a discipline",
  },
  "Psychic Point Recovery": {
    effect: "recover 1pt/10m 1pt/5m  1pt/1minute", Category: "Psychic", Cost: [1, 2, 3] },
  "Quick Reflexes": {
    effect: "+25, +45, +60 to initiative", Cost: [1, 2, 3] },
  Regeneration: {

    effect: "Effect not yet documented.", Cost: [1, 2, 3] },
  "Repeat a Characteristics Roll": {
    effect: "Effect not yet documented.",
    Cost: 1,
    Options: [...tables.characteristics],
    Option_Title: "Select the characteristic to reroll",
  },
  Saint: {

    effect: "Effect not yet documented.", Category: "Background", Cost: 2 },
  Seducer: {

    effect: "+60 to persuasion", Cost: 1 },
  "See Supernatural": {
    effect: "Effect not yet documented.", Cost: 1 },
  "Sheele Essence": {
    effect: "Effect not yet documented.", Cost: 1 },
  "Social Position": {
    effect: "Effect not yet documented.", Category: "Background", Cost: [1, 2] },
  "Starting Wealth": {
    effect: "Effect not yet documented.", Category: "Background", Cost: [1, 2, 3] },
  "Superior Magic Recovery": {
    effect: "x2, x3, x4 magic recovery", Category: "Magic", Cost: [1, 2, 3] },
  "Supernatural Immunity": {
    effect: "cannot access The Gift, See Supernatural with this. Not available to Duk/Dai, Sylvain", Cost: [1, 2, 3] },
  Survivor: {

    effect: "Effect not yet documented.", Cost: 1 },
  Talented: {

    effect: "+30 to sleight of hands +3 to opposed dex checks", Cost: 1 },
  "To the Limit": {
    effect: "+20 all action when below 20% of total LP", Cost: 1 },
  "Touched by Destiny": {
    effect: "Effect not yet documented.", Cost: 1 },
  "Total Accumulation": {
    effect: "Effect not yet documented.", Cost: 2 },
  "The Gift": {
    effect: "+10 to MR, can take magic advantages/disadvantages", Cost: 2, Options: [...tables.theorems], Option_Title: "Select the Theorem used" },
  "Uncommon Size": {
    effect: "Effect not yet documented.",
    Cost: 1,
    Options: [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5],
    Option_Title: "Select the size modifier to apply",
  },
  "Unconnected Techniques": {
    effect: "Effect not yet documented.", Cost: 1 },
  "Unlimited Familiars": {
    effect: "Effect not yet documented.", Cost: 2 },
  "Unspoken Casting": {
    effect: "no reduction to MA when casting unspoken", Category: "Magic", Cost: 1 },
  Untiring: {

    effect: "Effect not yet documented.", Cost: [1, 2, 3] },
  "Usage Affinity": {
    effect: "Effect not yet documented.", Cost: 1 },
  "Use of Armor": {
    effect: "+5/+10/+15 per level to wear armor", Cost: [1, 2, 3] },
  Versatile: {

    effect: "Effect not yet documented.", Cost: 1 },
  "Versatile Metamagic": {
    effect: "Effect not yet documented.", Category: "Magic", Cost: 1 },
};

export function advantageCosts(name: string, ollyTRules: boolean): number[] {
  const advantage = advantages[name];
  const cost = ollyTRules && advantage.OllyTCost ? advantage.OllyTCost : advantage.Cost;
  return typeof cost === "number" ? [cost] : [...cost];
}
