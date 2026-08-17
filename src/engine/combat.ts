import { martialArts } from "../data/martialArts";
import type { CharacterDocument } from "../schema/character";
import { ability } from "./ability";
import { modifier, size } from "./characteristics";
import { hasKiAbility } from "./martialKnowledge";
import { initiative } from "./movement";
import { presence } from "./helpers";
import { classes } from "../data/classes";
import { characterLevel, levelCount } from "./helpers";

function degreeIndex(degree: string): number {
  if (degree === "Base") return 0;
  if (degree === "Supreme") return 2;
  return 1;
}

export type MartialArtInfo = { Degree: string; Type: "Basic" | "Advanced" };

export function knownMartialArts(character: CharacterDocument, atLevel?: number): Record<string, MartialArtInfo> {
  const count = levelCount(atLevel, character);
  const result: Record<string, MartialArtInfo> = {};
  for (let i = 0; i < count; i++) {
    for (const [name, value] of Object.entries(character.levels[i].dp)) {
      if (!(name in martialArts)) continue;
      const degrees = value as string[];
      const degree = degrees[degrees.length - 1];
      if (name in result) {
        if (degreeIndex(degree) > degreeIndex(result[name].Degree)) result[name].Degree = degree;
      } else {
        const style = martialArts[name as keyof typeof martialArts];
        result[name] = { Degree: degree, Type: "Arcane" in style ? "Advanced" : "Basic" };
      }
    }
  }
  return result;
}

export function martialArtDamage(
  character: CharacterDocument,
  martialArt: string,
  degree: string,
  arts?: Record<string, MartialArtInfo>,
): number {
  const known = arts ?? knownMartialArts(character);
  if (martialArt === "Exelion") return presence(character) * 2 + modifier(character, "POW");
  const style = martialArts[martialArt as keyof typeof martialArts] as Record<string, { Damage?: unknown }>;
  let current = degree;
  let data = style[current];
  while (data && !data.Damage) {
    if (current === "Supreme") current = "Advanced";
    else if (current === "Base") break;
    else current = "Base";
    data = style[current];
  }
  const hasTaiChiSupreme = known["Tai Chi"]?.Degree === "Supreme";
  if ("Arcane" in style) {
    let result = 0;
    for (const [name, art] of Object.entries(known)) {
      if (art.Type === "Advanced") continue;
      result = Math.max(result, martialArtDamage(character, name, art.Degree, known));
    }
    if (data?.Damage !== undefined) {
      result += typeof data.Damage === "number" ? data.Damage : modifier(character, data.Damage as "STR");
    }
    return result;
  }
  const formula = data?.Damage;
  let result = 0;
  if (typeof formula === "number") result = formula + modifier(character, "STR");
  else if (formula && typeof formula === "object") {
    const typed = formula as { Characteristic?: string; Multiplier?: number; Base: number };
    const value = modifier(character, (typed.Characteristic as "STR") ?? "STR");
    result = typed.Base + value * (typed.Multiplier ?? 1);
  }
  if (hasTaiChiSupreme && martialArt !== "Tai Chi") result += modifier(character, "POW");
  return result;
}

export function unarmedAbility(
  character: CharacterDocument,
  name: "Attack" | "Block" | "Dodge" | "Initiative",
  atLevel?: number,
): number {
  const arts = knownMartialArts(character, atLevel);
  let classBonus = 0;
  let masterBonus = 0;
  let limit = 50;
  for (const [martialArt, art] of Object.entries(arts)) {
    const style = martialArts[martialArt as keyof typeof martialArts] as unknown as Record<
      string,
      { Bonus?: Record<string, number>; "Master Bonus"?: Record<string, number> }
    >;
    const data = style[art.Degree];
    if (data?.["Master Bonus"]?.[name]) masterBonus = Math.max(masterBonus, data["Master Bonus"][name]);
    if (data?.Bonus?.[name]) classBonus += data.Bonus[name];
    if (art.Degree === "Supreme" && style.Advanced?.Bonus?.[name]) classBonus += style.Advanced.Bonus[name];
    if (art.Degree !== "Base" && style.Base?.Bonus?.[name]) classBonus += style.Base.Bonus[name];
  }
  let result: number;
  if (name === "Initiative") result = initiative(character, atLevel) + 20;
  else {
    result = ability(character, name, undefined, atLevel);
    const count = levelCount(atLevel, character);
    const level = characterLevel(character);
    const combatSenses = character.advantages["Combat Senses"];
    for (let i = 0; i < count; i++) {
      const data = classes[character.levels[i].class].bonuses[name];
      if (data) limit -= level === 0 ? Math.floor(data / 2) : data;
      if (combatSenses === name) limit -= 5;
    }
    if (classBonus > limit) classBonus = limit;
  }
  if ("Asakusen" in arts) result += 10;
  return result + classBonus + masterBonus;
}

export function unarmedDamage(character: CharacterDocument): number {
  const arts = knownMartialArts(character);
  let result = 0;
  for (const [name, art] of Object.entries(arts)) {
    result = Math.max(result, martialArtDamage(character, name, art.Degree, arts));
  }
  const characterSize = size(character);
  if (result === 0) {
    const nw = character.levels.some((level) => "Natural Weapons" in level.dp);
    if (characterSize < 4) result = nw ? 20 : 5;
    else if (characterSize < 9) result = nw ? 30 : 10;
    else if (characterSize < 23) result = nw ? 40 : 10;
    else if (characterSize < 25) result = nw ? 60 : 20;
    else if (characterSize < 29) result = nw ? 100 : 30;
    else if (characterSize < 34) result = nw ? 120 : 40;
    else result = nw ? 140 : 60;
    result += modifier(character, "STR");
  }
  if ("Asakusen" in arts) result += 10;
  if (hasKiAbility(character, "Increased Damage") && !("Exelion" in arts)) result += 10;
  return result;
}

export function martialArtsAdvantages(character: CharacterDocument): string[] {
  const arts = knownMartialArts(character);
  const result: string[] = [];
  for (const [name, art] of Object.entries(arts)) {
    const style = martialArts[name as keyof typeof martialArts] as Record<string, { Advantages?: string[]; Replace?: boolean }>;
    let collected: string[] = [];
    if (art.Degree !== "Base" && style.Base?.Advantages) collected = collected.concat(style.Base.Advantages);
    if (art.Degree === "Supreme" && style.Advanced?.Advantages) {
      collected = style.Advanced.Replace ? style.Advanced.Advantages : collected.concat(style.Advanced.Advantages);
    }
    const current = style[art.Degree];
    if (current?.Advantages) {
      collected = current.Replace ? current.Advantages : collected.concat(current.Advantages);
    }
    result.push(...collected);
  }
  return result;
}
