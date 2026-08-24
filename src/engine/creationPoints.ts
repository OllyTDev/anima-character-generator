import { advantageCosts, advantages } from "../data/advantages";
import { classes } from "../data/classes";
import { disadvantages } from "../data/disadvantages";
import type { CharacterDocument } from "../schema/character";
import { cloneCharacter } from "../schema/character";
import { characteristic } from "./characteristics";
import { hasGift, intersection } from "./helpers";
import { masteredDisciplines } from "./psychicSpending";

export function disciplineAccess(character: CharacterDocument): string[] {
  return masteredDisciplines(character);
}

export function advantageCost(character: CharacterDocument, name: string): number {
  const params = character.advantages[name];
  if (params && typeof params === "object" && "Points" in (params as object)) {
    return Number((params as { Points: number }).Points);
  }
  if (Array.isArray(params)) {
    const base = advantages[name].Cost;
    const unit = typeof base === "number" ? base : base[0];
    return unit * params.length;
  }
  if (name === "Uncommon Size") return 1;
  const parsed = parseInt(String(params), 10);
  if (!Number.isNaN(parsed)) return parsed;
  const cost = advantages[name].Cost;
  return typeof cost === "number" ? cost : cost[0];
}

export function disadvantageBenefit(character: CharacterDocument, name: string): number {
  const params = character.disadvantages[name];
  if (params && typeof params === "object" && "Points" in (params as object)) {
    return Number((params as { Points: number }).Points);
  }
  const parsed = parseInt(String(params), 10);
  if (!Number.isNaN(parsed)) return parsed;
  const benefit = disadvantages[name].Benefit;
  return typeof benefit === "number" ? benefit : benefit[0];
}

export function cpTotal(character: CharacterDocument): number {
  let total = 3;
  for (const name of Object.keys(character.disadvantages)) {
    total += disadvantageBenefit(character, name);
  }
  return total;
}

export function cpRemaining(character: CharacterDocument, category?: string): number {
  const other = { Background: 0, Magic: 0, Psychic: 0 };
  let total = !category || category === "Common" ? 3 : 0;
  for (const name of Object.keys(character.disadvantages)) {
    const amount = disadvantageBenefit(character, name);
    if (!category) {
      total += amount;
      continue;
    }
    const def = disadvantages[name];
    if (!def.Category) {
      if (category === "Common") total += amount;
    } else if (def.Category === category) {
      total += amount;
    } else if (category === "Common") {
      other[def.Category] += amount;
    }
  }
  for (const name of Object.keys(character.advantages)) {
    let amount = advantageCost(character, name);
    if (!category) {
      total -= amount;
      continue;
    }
    const def = advantages[name];
    if (!def.Category) {
      if (category === "Common") total -= amount;
    } else if (def.Category === category) {
      total -= amount;
    } else if (category === "Common") {
      while (amount > 0 && other[def.Category] > 0) {
        amount--;
        other[def.Category]--;
      }
      total -= amount;
    }
  }
  return Math.max(total, 0);
}

export function advantageAllowed(character: CharacterDocument, name: string, parameter?: unknown): boolean {
  const advantage = advantages[name];
  let remaining = cpRemaining(character, "Common");
  if (advantage.Category) remaining += cpRemaining(character, advantage.Category);
  const costs = advantageCosts(name, character.settings.ollyTRules);
  if (costs[0] > remaining) return false;

  if (name === "Access to One Psychic Discipline" && parameter) {
    if (character.race === "Duk'zarist Nephilim" && parameter !== "Pyrokinesis") return false;
  }
  if (name === "Elemental Compatibility" && parameter) {
    if (character.race === "Duk'zarist Nephilim" && parameter === "Light") return false;
    if (character.race === "Sylvain Nephilim" && parameter === "Darkness") return false;
  }
  if (name === "Psychic Immunity") {
    if (
      "Addiction or Serious Vice" in character.disadvantages ||
      "Cowardice" in character.disadvantages ||
      "Severe Phobia" in character.disadvantages
    ) {
      return false;
    }
  }
  if (name === "Psychic Inclination" && parameter) {
    if (!disciplineAccess(character).includes(String(parameter))) return false;
  }
  if (name === "Supernatural Immunity") {
    if (hasGift(character) || "See Supernatural" in character.advantages) return false;
    if (["Sylvain", "Duk'zarist", "Daimah"].some((race) => character.race.includes(race))) return false;
  }
  if (["The Gift", "Incomplete Gift", "See Supernatural"].includes(name) && "Supernatural Immunity" in character.advantages) {
    return false;
  }
  if (name === "Uncommon Size" && character.race === "Jayan Nephilim" && parameter !== undefined && Number(parameter) < 1) {
    return false;
  }
  if (advantage.Category === "Magic" && !hasGift(character)) return false;
  if (
    advantage.Category === "Psychic" &&
    !("Free Access to Any Psychic Discipline" in character.advantages) &&
    !("Access to One Psychic Discipline" in character.advantages)
  ) {
    return false;
  }
  if (name === "Add One Point to a Characteristic") {
    if (!parameter) return true;
    const value = characteristic(character, parameter as "STR");
    if (value > 13) return false;
    if (value > 11 && ["STR", "DEX", "AGI", "CON"].includes(String(parameter))) return false;
    return true;
  }
  if (["Increase One Characteristic to Nine", "Repeat a Characteristics Roll"].includes(name)) return true;
  if (name in character.advantages) return false;
  return true;
}

export function disadvantageAllowed(character: CharacterDocument, name: string, parameter?: unknown): boolean {
  if (name in character.disadvantages) return false;
  if (Object.keys(character.disadvantages).length > 2) return false;
  if (name === "Deduct Two Points from a Characteristic") {
    if (!parameter) {
      return ["STR", "DEX", "AGI", "CON", "INT", "POW", "WP", "PER"].some(
        (item) => characteristic(character, item as "STR") > 4,
      );
    }
    if (characteristic(character, parameter as "STR") < 5) return false;
    if (character.race === "Jayan Nephilim" && parameter === "STR") return false;
  }
  if (name === "Exclusive Weapon") {
    const types = ["Domine", "Fighter", "Novel", "Prowler"];
    if (intersection(types, [...classes[character.levels[0].class].Archetypes]).length < 1) return false;
  }
  if (name === "Slow Recovery of Magic" && "Magical Blockage" in character.disadvantages) return false;
  if (name === "Magical Blockage" && "Slow Recovery of Magic" in character.disadvantages) return false;
  if (name === "Unattractive" && appearanceProxy(character) < 7) return false;
  if (["Addiction or Serious Vice", "Cowardice", "Severe Phobia"].includes(name) && "Psychic Immunity" in character.advantages) {
    return false;
  }
  const def = disadvantages[name];
  if (def.Category === "Magic" && !hasGift(character)) return false;
  if (
    def.Category === "Psychic" &&
    !("Free Access to Any Psychic Discipline" in character.advantages) &&
    !("Access to One Psychic Discipline" in character.advantages)
  ) {
    return false;
  }
  if (character.race === "Duk'zarist Nephilim") {
    if (
      [
        "Atrophied Limb",
        "Blind",
        "Deafness",
        "Mute",
        "Nearsighted",
        "Physical Weakness",
        "Serious Illness",
        "Sickly",
        "Susceptible to Poisons",
      ].includes(name)
    ) {
      return false;
    }
  }
  if (character.race === "Sylvain Nephilim") {
    if (["Sickly", "Serious Illness", "Susceptible to Magic"].includes(name)) return false;
  }
  return true;
}

function appearanceProxy(character: CharacterDocument): number {
  return character.appearance ?? 5;
}

export function addAdvantage(
  character: CharacterDocument,
  name: string,
  cost: number,
  params?: unknown,
): CharacterDocument {
  const next = cloneCharacter(character);
  const my = next.advantages;
  if (name === "Access to Natural Psychic Powers") {
    my[name] = { Points: cost, Power: params };
  } else if (name === "Aptitude in a Subject" || name === "Natural Learner") {
    my[name] = { Points: cost, Ability: params };
  } else if (name === "Cultural Roots") {
    const value = params as { Background: string; Choices: string[] };
    my[name] = value.Choices.length === 0 ? value.Background : value;
  } else if (name === "Natural Learner, Field") {
    my[name] = { Points: cost, Field: params };
  } else if (["Add One Point to a Characteristic", "Increase One Characteristic to Nine", "Repeat a Characteristics Roll"].includes(name)) {
    const existing = Array.isArray(my[name]) ? [...(my[name] as unknown[])] : [];
    existing.push(params);
    my[name] = existing;
  } else if (["Artifact", "Contacts", "Elan", "Powerful Ally"].includes(name)) {
    my[name] = { Points: cost, Name: params };
  } else if (name === "Uncommon Size") {
    my[name] = Number(params);
  } else {
    const def = advantages[name];
    if (Array.isArray(def.Cost) || Array.isArray(def.OllyTCost)) my[name] = cost;
    else if (def.Options) my[name] = params ?? def.Cost;
    else my[name] = def.Cost;
  }
  if (name === "Been Around") next.xp = cost * 50;
  return next;
}

export function addDisadvantage(
  character: CharacterDocument,
  name: string,
  benefit: number,
  param?: unknown,
): CharacterDocument {
  const next = cloneCharacter(character);
  const def = disadvantages[name];
  if (name === "Damned") next.disadvantages[name] = { Points: benefit, Effect: param };
  else if (name === "Powerful Enemy") next.disadvantages[name] = { Points: benefit, Name: param };
  else if (Array.isArray(def.Benefit)) next.disadvantages[name] = benefit;
  else if (def.Options) next.disadvantages[name] = param ?? def.Benefit;
  else next.disadvantages[name] = def.Benefit;
  if (name === "Without any Natural Bonus") {
    for (const level of next.levels) delete level.naturalBonus;
  }
  if (name === "Rookie") next.xp -= 100;
  return next;
}

export function removeAdvantage(character: CharacterDocument, name: string): CharacterDocument {
  const next = cloneCharacter(character);
  delete next.advantages[name];
  return next;
}

export function removeDisadvantage(character: CharacterDocument, name: string): CharacterDocument {
  const next = cloneCharacter(character);
  delete next.disadvantages[name];
  return next;
}

export function advantageSummary(character: CharacterDocument, name: string): string {
  const params = character.advantages[name];
  let result = name;
  const def = advantages[name];
  if (Array.isArray(def.Cost)) result += ` (${advantageCost(character, name)})`;
  if (!def.Options) return result;
  result += ": ";
  if (name === "Access to Natural Psychic Powers") result += (params as { Power: string }).Power;
  else if (name === "Aptitude in a Subject") result += (params as { Ability: string }).Ability;
  else if (["Artifact", "Contacts", "Elan", "Powerful Ally"].includes(name)) result += (params as { Name: string }).Name;
  else if (name === "Cultural Roots") {
    result += typeof params === "string" ? params : (params as { Background: string }).Background;
  } else if (name === "Natural Learner") result += (params as { Ability: string }).Ability;
  else if (name === "Natural Learner, Field") result += (params as { Field: string }).Field;
  else if (Array.isArray(params)) result += params.join(", ");
  else result += String(params);
  return result;
}

export function disadvantageSummary(character: CharacterDocument, name: string): string {
  const def = disadvantages[name];
  const params = character.disadvantages[name];
  let result = name;
  if (Array.isArray(def.Benefit)) result += ` (${disadvantageBenefit(character, name)})`;
  if (def.Options) {
    result += ": ";
    if (name === "Damned") result += (params as { Effect: string }).Effect;
    else if (name === "Powerful Enemy") result += (params as { Name: string }).Name;
    else result += String(params);
  }
  return result;
}
