import { classes } from "../data/classes";
import { tables } from "../data/tables";
import type { Characteristic } from "../data/types";
import type { CharacterDocument } from "../schema/character";
import { characterLevel, firstDp, asNumber, isCorporealUndead, isSpirit } from "./helpers";

function listed(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function characteristic(character: CharacterDocument, name: Characteristic, atLevel?: number): number {
  let total = character.characteristics[name] ?? 5;
  const until = atLevel ?? characterLevel(character);
  const advantages = character.advantages;
  const dp = firstDp(character);

  for (const item of listed(advantages["Increase One Characteristic to Nine"])) {
    if (item === name) total = 9;
  }

  for (const reroll of listed(advantages["Repeat a Characteristics Roll"])) {
    const entry = reroll as { Characteristic?: string; Roll?: number };
    if (entry.Characteristic === name && typeof entry.Roll === "number") {
      total = entry.Roll;
    }
  }

  for (const item of listed(advantages["Add One Point to a Characteristic"])) {
    if (item === name) total += 1;
  }

  for (const item of listed(dp["Attribute Increased +1"])) {
    if (item === name) total += 1;
  }
  for (const item of listed(dp["Attribute Increased +2"])) {
    if (item === name) total += 2;
  }
  const plus3 = listed(dp["Attribute Increased +3"]);
  const plus3Count = plus3.filter((item) => item === name).length;
  if (plus3Count) total += plus3Count + 2;

  if (character.disadvantages["Deduct Two Points from a Characteristic"] === name) {
    total -= 2;
  }
  if (character.race === "Jayan Nephilim" && name === "STR") {
    total += 1;
  }
  for (let i = 0; i < until && i < character.levels.length; i++) {
    if (character.levels[i].characteristic === name) total += 1;
  }
  return Math.min(total, 20);
}

export function modifier(character: CharacterDocument, name: Characteristic, atLevel?: number): number {
  const score = characteristic(character, name, atLevel);
  return tables.modifiers[score] ?? 0;
}

export function appearance(character: CharacterDocument): number {
  let total = character.appearance ?? 5;
  if (character.race === "D'Anjayni Nephilim") {
    total = Math.min(7, Math.max(3, total));
  }
  if ("Unattractive" in character.disadvantages) {
    total = 2;
  }
  return total;
}

export function size(character: CharacterDocument): number {
  let total = characteristic(character, "STR") + characteristic(character, "CON");
  if (character.race === "Daimah Nephilim") total -= 1;
  if (character.race === "Jayan Nephilim") total += 2;
  const uncommon = asNumber(character.advantages["Uncommon Size"]);
  const unnatural = asNumber(firstDp(character)["Unnatural Size"]);
  if (uncommon) total += uncommon;
  if (unnatural) total += unnatural;
  return total;
}

export function sizeCategory(character: CharacterDocument): string {
  const value = size(character);
  if (value <= 3) return "Miniscule";
  if (value <= 8) return "Small";
  if (value <= 22) return "Medium";
  if (value <= 24) return "Big";
  if (value <= 28) return "Enormous";
  if (value <= 33) return "Giant";
  return "Colossal";
}

export function damageResistanceMultiple(character: CharacterDocument): number {
  const value = size(character);
  if (value < 4) return 1;
  if (value < 9) return 2;
  if (value < 25) return 5;
  if (value < 29) return 10;
  if (value < 34) return 15;
  return 20;
}

export function lifePoints(character: CharacterDocument): number {
  const level = characterLevel(character);
  const conOrPow = isSpirit(character) ? characteristic(character, "POW") : characteristic(character, "CON");
  let result = tables.base_lp[conOrPow] ?? 0;
  const hardToKill = asNumber(character.advantages["Hard to Kill"]);
  for (const info of character.levels) {
    const cls = classes[info.class];
    if (level > 0) result += cls.LP;
    const multiple = asNumber(info.dp["Life Point Multiple"]);
    if (multiple) result += multiple * characteristic(character, "CON");
    const resistanceLp = asNumber(info.dp["Life Points"]);
    if (resistanceLp) result += resistanceLp * damageResistanceMultiple(character);
    if (hardToKill) result += hardToKill * 10;
  }
  return result;
}

export function fatigue(character: CharacterDocument): number | "N/A" {
  const dp = firstDp(character);
  if ("Tireless" in dp || "Physical Exemption" in dp) return "N/A";
  let total = characteristic(character, "CON");
  if (character.race === "Jayan Nephilim") total += 1;
  const untiring = asNumber(character.advantages.Untiring);
  if (untiring) total += untiring * 3;
  const resistance = asNumber(dp["Fatigue Resistance"]);
  if (resistance) total += 2 * resistance;
  if ("Exhausted" in character.disadvantages) total -= 1;
  return total;
}

export function regeneration(character: CharacterDocument): number {
  let total: number = tables.regeneration[characteristic(character, "CON")] ?? 0;
  if (["Duk'zarist Nephilim", "Sylvain Nephilim", "Vetala Nephilim"].includes(character.race)) {
    total += 1;
  }
  const advantage = asNumber(character.advantages.Regeneration);
  if (advantage) total += advantage * 2;
  if (isCorporealUndead(character)) total = 0;
  const gnosis = character.gnosis || 0;
  if (total > 18 && gnosis < 40) total = 18;
  else if (total > 19 && gnosis < 45) total = 19;
  else if (total > 20) total = 20;
  return total;
}

export function racialAbilities(character: CharacterDocument): string {
  switch (character.race) {
    case "D'Anjayni Nephilim":
      return "Pass Without Trace, Forgetfulness, +30 to Resistance vs. detection, Silent Whisper, -3 XP";
    case "Daimah Nephilim":
      return "See the Essence, Sense the Forest, +3 Regeneration in thick forest or jungle, Movement in the Forest, -2 XP";
    case "Devah Nephilim":
      return "+10 to Resistances vs. mind reading and emotion alteration, The Eye of the Soul, +10 Bind and Banish, -10 PhR and DR, -3 XP";
    case "Duk'zarist Nephilim":
      return "+10 to Resistances vs. Dark, Automatically pass between life and death PhR checks, Limited Needs, Sense Light and Dark, Night Vision, Allergic to Metal, -5 XP";
    case "Ebudan Nephilim":
      return "+30 to Resistance vs. Forgetfulness and Emotional Control OR (Immune to attacks that cannot damage Energy, Flight Value 12), -3 XP";
    case "Jayan Nephilim":
      return "Spiritual Vision, -3 XP";
    case "Sylvain Nephilim":
      return "+10 to Resistances vs. Light, Sense Light and Dark, Limited Needs, -4 XP";
    case "Vetala Nephilim":
      return "+50 PhR vs. Criticals, Blood Ecstasy, +1 Regeneration, Photosensitive Skin, Blood Obsession, -20 DR, -3 XP";
    default:
      return "";
  }
}

export function summary(character: CharacterDocument): string {
  const classLevels: Record<string, number> = {};
  const order: string[] = [];
  for (const level of character.levels) {
    if (!(level.class in classLevels)) {
      order.push(level.class);
      classLevels[level.class] = 0;
    }
    classLevels[level.class] += 1;
  }
  const parts = order.map((name) => `${name} ${classLevels[name]}`);
  const prefix = character.name ? `${character.name} ` : "";
  return `${prefix}(${parts.join(", ")})`;
}

/** Point-buy weight for a base characteristic (10 counts as 11). */
export function characteristicPointValue(value: number): number {
  return value === 10 ? 11 : value;
}

/** Sum of the eight primary characteristics using point-buy weighting. */
export function characteristicTotal(character: CharacterDocument): number {
  return tables.characteristics.reduce(
    (sum, name) => sum + characteristicPointValue(character.characteristics[name as Characteristic]),
    0,
  );
}
