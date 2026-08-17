import { tables } from "../data/tables";
import type { CharacterDocument } from "../schema/character";
import { modifier, size } from "./characteristics";
import { firstDp, presence } from "./helpers";
import { hasKiAbility, kiConcealment } from "./martialKnowledge";

export function resistance(character: CharacterDocument, name: "PhR" | "MR" | "PsR" | "VR" | "DR"): number {
  let total = presence(character) + modifier(character, tables.resistances[name]);
  switch (character.race) {
    case "Devah Nephilim":
      if (name === "PhR" || name === "DR") total -= 10;
      break;
    case "Duk'zarist Nephilim":
      if (name === "PhR" && character.gender === "Male") total += 20;
      else if (name === "MR" && character.gender === "Female") total += 20;
      else total += 15;
      break;
    case "Jayan Nephilim":
      if (name === "PhR") total += 15;
      else if (name === "MR") total -= 10;
      break;
    case "Sylvain Nephilim":
      if (name === "MR" || name === "PsR") total += 10;
      else if (name === "DR") total += 20;
      else total += 5;
      break;
    case "Vetala Nephilim":
      if (name === "DR") total -= 20;
      break;
  }
  if (name === "PhR" && hasKiAbility(character, "Physical Dominion")) total += 10;
  if (name === "MR") {
    const points = Number(character.advantages["Exceptional Magic Resistance"] ?? 0);
    if (points) total += points * 25;
    if ("The Gift" in character.advantages) total += 10;
  } else if (name === "PsR") {
    const points = Number(character.advantages["Exceptional Psychic Resistance"] ?? 0);
    if (points) total += points * 25;
  } else if (name === "DR" || name === "PhR" || name === "VR") {
    const points = Number(character.advantages["Exceptional Physical Resistance"] ?? 0);
    if (points) total += points * 25;
  }
  if (hasKiAbility(character, "Body of Emptiness")) total += 20;
  if (
    (name === "DR" && "Sickly" in character.disadvantages) ||
    (name === "MR" && "Susceptible to Magic" in character.disadvantages) ||
    (name === "PhR" && "Physical Weakness" in character.disadvantages) ||
    (name === "VR" && "Susceptible to Poisons" in character.disadvantages)
  ) {
    total = Math.floor(total / 2);
  }
  return total;
}

export function resistanceModifiers(character: CharacterDocument): Record<string, number> {
  const result: Record<string, number> = {};
  const add = (key: string, amount: number) => {
    result[key] = (result[key] ?? 0) + amount;
  };
  if (character.element) {
    add(character.element, 20);
    add(tables.opposite_elements[character.element as keyof typeof tables.opposite_elements], -20);
  }
  const attuned = firstDp(character).Attuned;
  if (typeof attuned === "string" && (tables.elements as readonly string[]).includes(attuned)) add(attuned, 20);
  if (character.race === "D'Anjayni Nephilim") add("supernatural detection", 30);
  else if (character.race === "Devah Nephilim") add("mind reading and emotion alteration", 10);
  else if (character.race === "Duk'zarist Nephilim") add("Darkness", 10);
  else if (character.race === "Sylvain Nephilim") add("Light", 10);
  else if (character.race === "Vetala Nephilim") add("Criticals to vulnerable points", 50);
  if ("Easily Possessed" in character.disadvantages) add("possession or domination", -50);
  else if ("Free Will" in character.advantages) add("possession or domination", 60);
  if (hasKiAbility(character, "Ki Concealment")) add("supernatural detection", Math.floor(kiConcealment(character) / 2));
  else if (hasKiAbility(character, "Undetectable")) add("supernatural detection", presence(character) * 2);
  return result;
}

export function armorType(character: CharacterDocument, type: string): number {
  let total = 0;
  if (character.damageResistance) total = damageResistanceArmorType(character);
  if (type === "Energy") {
    if ("Mystical Armor" in character.advantages) total += 2;
    if (hasKiAbility(character, "Armor of Arcane Energy")) total += 6;
    else if (hasKiAbility(character, "Armor of Greater Energy")) total += 4;
    else if (hasKiAbility(character, "Energy Armor")) total += 2;
  } else if ("Natural Armor" in character.advantages) {
    total += 2;
  }
  return total;
}

export function damageReduction(character: CharacterDocument): number {
  if (hasKiAbility(character, "Noht")) return -30;
  if (hasKiAbility(character, "Armor of Emptiness")) return -10;
  return 0;
}

export function damageBarrier(character: CharacterDocument): number {
  return hasKiAbility(character, "Physical Shield") ? presence(character) : 0;
}

export function damageResistanceArmorType(character: CharacterDocument): number {
  const value = size(character);
  if (value < 4) return 1;
  if (value < 9) return 2;
  if (value < 23) return 3;
  if (value < 25) return 4;
  if (value < 29) return 6;
  if (value < 34) return 8;
  return 10;
}
