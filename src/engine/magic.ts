import { classes } from "../data/classes";
import { tables } from "../data/tables";
import type { CharacterDocument } from "../schema/character";
import { ability } from "./ability";
import { characteristic, modifier } from "./characteristics";
import { hasModule } from "./developmentPoints";
import { firstDp, hasGift } from "./helpers";
import {
  canSpendPsychicPoints,
  learnedPowers,
  powerPotential,
  psychicAccessMode,
} from "./psychicSpending";

export function ma(character: CharacterDocument): number {
  const base = tables.base_ma[characteristic(character, "POW")] ?? 0;
  let total = base;
  for (const level of character.levels) {
    const multiples = Number(level.dp["MA Multiple"] ?? 0);
    if (multiples) total += multiples * base;
  }
  return total;
}

export function magicLevel(character: CharacterDocument): number {
  let total = tables.magic_level[characteristic(character, "INT")] ?? 0;
  const gradual = "Gradual Magic Learning" in character.advantages;
  for (const level of character.levels) {
    total += Number(level.dp["Magic Level"] ?? 0) * 5;
    if (gradual) total += 5;
  }
  return total;
}

export function magicProjectionImbalances(character: CharacterDocument): (number | undefined)[] {
  let developed = false;
  let lastValue = 0;
  const result: (number | undefined)[] = [];
  for (const level of character.levels) {
    const imbalance = level.magicProjectionImbalance;
    const mp = level.dp["Magic Projection"];
    if (!mp && !developed) {
      result.push(undefined);
    } else if (mp && !developed) {
      developed = true;
      const value = Math.max(Math.min(typeof imbalance === "number" ? imbalance : 0, 30), -30);
      result.push(value);
      lastValue = value;
    } else {
      let value = typeof imbalance === "number" ? imbalance : lastValue;
      value = Math.max(value, lastValue - 10);
      value = Math.min(value, lastValue + 10);
      value = Math.max(Math.min(value, 30), -30);
      result.push(value);
      lastValue = value;
    }
  }
  return result;
}

export function magicProjectionOffense(character: CharacterDocument): number {
  const imbalances = magicProjectionImbalances(character);
  let normal = ability(character, "Magic Projection");
  const imbalance = imbalances[imbalances.length - 1];
  if (imbalance) normal += imbalance;
  let module = -50;
  if (hasModule(character, "Magic Projection as an Attack")) {
    module = modifier(character, "DEX");
    for (const level of character.levels) module += Number(level.dp.Attack ?? 0);
  }
  return Math.max(module, normal);
}

export function magicProjectionDefense(character: CharacterDocument): number {
  const imbalances = magicProjectionImbalances(character);
  let normal = ability(character, "Magic Projection");
  const imbalance = imbalances[imbalances.length - 1];
  if (imbalance) normal -= imbalance;
  let module = -50;
  if (hasModule(character, "Magic Projection as a Defense")) {
    let block = modifier(character, "DEX");
    let dodge = modifier(character, "AGI");
    for (const level of character.levels) {
      block += Number(level.dp.Block ?? 0);
      dodge += Number(level.dp.Dodge ?? 0);
    }
    module = Math.max(block, dodge);
  }
  return Math.max(module, normal);
}

export function usesZeon(character: CharacterDocument): boolean {
  if (hasGift(character)) return true;
  const pow = modifier(character, "POW");
  if (ability(character, "Summon") > pow) return true;
  if (ability(character, "Banish") > pow) return true;
  if (ability(character, "Bind") > pow) return true;
  return ability(character, "Control") > modifier(character, "WP");
}

export function zeon(character: CharacterDocument): number {
  let total = tables.base_zeon[characteristic(character, "POW")] ?? 0;
  const magicNature = Number(character.advantages["Magic Nature"] ?? 0);
  for (const level of character.levels) {
    total += Number(level.dp.Zeon ?? 0) * 5;
    const bonus = classes[level.class].bonuses.Zeon;
    if (bonus) total += bonus;
    if (magicNature) total += magicNature * 50;
  }
  return total;
}

export function zeonRecovery(character: CharacterDocument): number {
  const base = tables.base_ma[characteristic(character, "POW")] ?? 0;
  const dp = firstDp(character);
  if (character.advantages["Magical Blockage"] || dp["Magic Blockage"]) return 0;
  let total = ma(character);
  for (const level of character.levels) {
    const multiples = Number(level.dp["Zeon Regeneration Multiple"] ?? 0);
    if (multiples) total += multiples * base;
  }
  const superior = Number(character.advantages["Superior Magic Recovery"] ?? 0);
  if (superior) total *= superior + 1;
  else if (dp["Superior Magic Recovery"]) total *= 2;
  if (character.disadvantages["Slow Recovery of Magic"] || dp["Slow Recovery of Magic"]) total /= 2;
  return total;
}

export function psychicPoints(character: CharacterDocument, until?: number): number {
  const count = until ?? character.levels.length;
  const classLevels: Record<string, number> = {};
  let result = 1;
  for (let i = 0; i < count; i++) {
    const cls = character.levels[i].class;
    classLevels[cls] = (classLevels[cls] ?? 0) + 1;
    if (classLevels[cls] % classes[cls]["Innate Psychic Points"] === 0) result += 1;
    result += Number(character.levels[i].dp["Psychic Points"] ?? 0);
  }
  return result;
}

export function naturalPsychicPowers(character: CharacterDocument): Record<string, number> {
  const info = character.advantages["Access to Natural Psychic Powers"] as { Points?: number; Power?: string } | undefined;
  const powers: Record<string, number> = {};
  if (info?.Power) {
    let potential = 120;
    if (info.Points === 2) potential = 140;
    if (info.Points === 3) potential = 180;
    powers[info.Power] = potential;
  }
  return powers;
}

export function psychicPowers(character: CharacterDocument): Record<string, number> {
  const powers = { ...naturalPsychicPowers(character) };
  for (const name of learnedPowers(character)) {
    powers[name] = powerPotential(character, name);
  }
  return powers;
}

export function psychicProjectionOffense(character: CharacterDocument): number {
  const normal = ability(character, "Psychic Projection");
  let module = -50;
  if (hasModule(character, "Psychic Projection Module")) {
    module = modifier(character, "DEX");
    for (const level of character.levels) module += Number(level.dp.Attack ?? 0);
  }
  return Math.max(module, normal);
}

export function psychicProjectionDefense(character: CharacterDocument): number {
  const normal = ability(character, "Psychic Projection");
  let module = -50;
  if (hasModule(character, "Psychic Projection Module")) {
    let block = modifier(character, "DEX");
    let dodge = modifier(character, "AGI");
    for (const level of character.levels) {
      block += Number(level.dp.Block ?? 0);
      dodge += Number(level.dp.Dodge ?? 0);
    }
    module = Math.max(block, dodge);
  }
  return Math.max(module, normal);
}

export function usesPsychic(character: CharacterDocument): boolean {
  return (
    "Access to One Psychic Discipline" in character.advantages ||
    "Free Access to Any Psychic Discipline" in character.advantages ||
    "Access to a Psychic Discipline" in firstDp(character) ||
    "Access to Psychic Disciplines" in firstDp(character) ||
    "Access to Natural Psychic Powers" in character.advantages ||
    character.levels.some((level) => "Psychic Points" in level.dp || "Psychic Projection" in level.dp)
  );
}

function hasPsychicInvestments(character: CharacterDocument): boolean {
  const psychic = character.psychic;
  if (!psychic) return false;
  return (
    (psychic.masteredDisciplines?.length ?? 0) > 0 ||
    (psychic.learnedPowers?.length ?? 0) > 0 ||
    (psychic.globalPotentialTier ?? 0) > 0 ||
    Object.keys(psychic.powerInvestment ?? {}).length > 0 ||
    (psychic.innateSlots ?? 0) > 0 ||
    (psychic.tempSpends?.length ?? 0) > 0
  );
}

/** Whether psychic stats should appear on the character sheet. */
export function showsPsychicStats(character: CharacterDocument): boolean {
  const mode = psychicAccessMode(character);
  if (mode !== "none") return true;
  return usesPsychic(character) || hasPsychicInvestments(character);
}

/** Whether the character has the advantage that unlocks PP spending in Development. */
export function hasFreePsychicDisciplineAccess(character: CharacterDocument): boolean {
  return "Free Access to Any Psychic Discipline" in character.advantages;
}

/** Whether the Supernatural development tab should appear (psychic PP and/or magic spending). */
export function canAccessSupernaturalDevelopment(character: CharacterDocument): boolean {
  return hasFreePsychicDisciplineAccess(character) || hasGift(character);
}

export { canSpendPsychicPoints as canUsePsychicSpending };
