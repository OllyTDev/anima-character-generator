import { classes } from "../data/classes";
import type { CharacterDocument } from "../schema/character";
import { hasKiAbility } from "./martialKnowledge";
import { characteristic, modifier, size } from "./characteristics";
import { firstDp, levelCount } from "./helpers";

export function initiative(character: CharacterDocument, atLevel?: number): number {
  const length = levelCount(atLevel, character);
  let total = modifier(character, "AGI") + modifier(character, "DEX");
  if (character.type === "Human") total += 20;
  else {
    const value = size(character);
    if (value < 4) total += 40;
    else if (value < 9) total += 30;
    else if (value < 23) total += 20;
    else if (value < 25) total += 10;
    else if (value > 33) total -= 20;
    else if (value > 28) total -= 10;
  }
  const qr = character.advantages["Quick Reflexes"];
  if (qr === 1) total += 25;
  else if (qr === 2) total += 45;
  else if (qr) total += 60;
  const sr = character.disadvantages["Slow Reactions"];
  if (typeof sr === "number") total -= sr * 30;
  let increasedReaction = 0;
  for (let i = 0; i < length; i++) {
    total += classes[character.levels[i].class].Initiative;
    const value = character.levels[i].dp["Increased Reaction"];
    if (typeof value === "string") increasedReaction = Number(value.slice(1, 3)) || 0;
  }
  total += increasedReaction;
  if (hasKiAbility(character, "Increased Speed", undefined, atLevel)) total += 10;
  return total;
}

export function movementValue(character: CharacterDocument): number {
  const hasMoe = hasKiAbility(character, "Movement of Emptiness");
  let result = hasMoe ? Math.max(characteristic(character, "AGI"), characteristic(character, "POW")) : characteristic(character, "AGI");
  if (character.type !== "Human") {
    const value = size(character);
    if (value < 4) result -= 4;
    else if (value < 9) result -= 2;
    else if (value > 33) result += 3;
    else if (value > 28) result += 2;
    else if (value > 24) result += 1;
  }
  if (firstDp(character)["Atrophied Members"] === "Legs") result -= 6;
  let increased = 0;
  for (const level of character.levels) {
    const value = level.dp["Increased Movement"];
    if (typeof value === "string") increased = Number(value.slice(-1)) || 0;
  }
  result += increased;
  if (result > 10 && !hasMoe && !hasKiAbility(character, "Inhumanity") && !hasKiAbility(character, "Inhuman (Nemesis)")) {
    const dp = firstDp(character);
    if (!("Inhumanity" in dp) && !("Zen" in dp)) result = 10;
  }
  return result;
}
