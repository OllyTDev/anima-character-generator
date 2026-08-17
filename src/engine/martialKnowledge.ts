import { classes } from "../data/classes";
import { kiAbilities, kiAbilityCost } from "../data/kiAbilities";
import { martialArts } from "../data/martialArts";
import type { CharacterDocument } from "../schema/character";
import { cloneCharacter } from "../schema/character";
import { ability } from "./ability";
import { characteristic } from "./characteristics";
import { characterLevel, levelCount } from "./helpers";

export function hasKiAbility(character: CharacterDocument, name: string, option?: string, level?: number): boolean {
  if (name === "Ki Concealment" && character.race === "D'Anjayni Nephilim") return true;
  const count = levelCount(level, character);
  for (let i = 0; i < count; i++) {
    const mk = character.levels[i].mk;
    if (!mk || !(name in mk)) continue;
    if (!kiAbilities[name]?.Option_Title) return true;
    const entry = mk[name] as { Options?: string[] };
    if (option && entry.Options?.includes(option)) return true;
  }
  return false;
}

export function mkUsed(character: CharacterDocument, level?: number): number {
  const count = levelCount(level, character);
  let used = 0;
  for (let i = 0; i < count; i++) {
    const mk = character.levels[i].mk;
    if (!mk) continue;
    for (const value of Object.values(mk)) {
      if (typeof value === "number") used += value;
      else if (value && typeof value === "object" && "Options" in value) {
        const entry = value as { MK: number; Options: unknown[] };
        used += entry.MK * entry.Options.length;
      } else if (Array.isArray(value)) {
        for (const technique of value as { MK: number }[]) used += technique.MK;
      }
    }
  }
  return used;
}

export function mkTotals(character: CharacterDocument, untilLevel?: number): number[] {
  const count = levelCount(untilLevel, character);
  const level = untilLevel ?? characterLevel(character);
  let total = 0;
  const mastery = character.advantages["Martial Mastery"];
  if (typeof mastery === "number") total += mastery * 40;
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    const info = character.levels[i];
    const classMk = classes[info.class].MK;
    total += level === 0 ? classMk / 2 : classMk;
    for (const [item, value] of Object.entries(info.dp)) {
      if (item === "Martial Knowledge") total += Number(value) * 5;
      else if (item in martialArts) {
        for (const degree of value as string[]) {
          const data = (martialArts[item as keyof typeof martialArts] as Record<string, { MK?: number }>)[degree];
          if (data?.MK) total += data.MK;
        }
      }
    }
    result.push(total);
  }
  return result;
}

export function mkRemaining(character: CharacterDocument): number[] {
  const totals = mkTotals(character);
  const isZero = characterLevel(character) === 0;
  let limit = totals[totals.length - 1] ?? 0;
  const result: number[] = [];
  for (let i = totals.length - 1; i >= 0; i--) {
    const amount = totals[i] - mkUsed(character, isZero ? 0 : i + 1);
    if (amount < limit) limit = amount;
    result[i] = Math.max(Math.min(amount, limit), 0);
  }
  return result;
}

export function kiPoints(character: CharacterDocument, name: "STR" | "DEX" | "AGI" | "CON" | "POW" | "WP"): number {
  let total = characteristic(character, name);
  if (total > 10) total += total - 10;
  for (const level of character.levels) {
    const points = level.dp.Ki as Record<string, number> | undefined;
    if (points?.[name]) total += points[name];
  }
  return total;
}

export function kiAccumulation(character: CharacterDocument, name: "STR" | "DEX" | "AGI" | "CON" | "POW" | "WP"): number {
  const score = characteristic(character, name);
  let total = 1;
  if (score >= 16) total = 4;
  else if (score >= 13) total = 3;
  else if (score >= 10) total = 2;
  for (const level of character.levels) {
    const multiples = level.dp["Accumulation Multiple"] as Record<string, number> | undefined;
    if (multiples?.[name]) total += multiples[name];
  }
  return total;
}

export function kiConcealment(character: CharacterDocument): number {
  const hide = ability(character, "Hide");
  const mk = mkTotals(character).at(-1) ?? 0;
  let total = Math.floor((mk + hide) / 2);
  const level = characterLevel(character);
  for (const info of character.levels) {
    const bonus = classes[info.class].bonuses["Ki Concealment"];
    if (bonus) total += level === 0 ? Math.floor(bonus / 2) : bonus;
    if ("Imperceptible Ki" in character.advantages) total += 10;
  }
  if (character.race === "D'Anjayni Nephilim") total += 30;
  return total;
}

export function kiDetection(character: CharacterDocument): number {
  const mk = mkTotals(character).at(-1) ?? 0;
  let total = Math.floor((mk + ability(character, "Notice")) / 2);
  if ("Ki Perception" in character.advantages) total += 10 * character.levels.length;
  return total;
}

export function listedKiAbilities(character: CharacterDocument): string[] {
  const result: string[] = [];
  const haveOptions: Record<string, string[]> = {};
  const imk = character.insufficientMartialKnowledge as { Name?: string; Option?: string; Penalty?: number; Tree?: string } | undefined;
  if (imk && !("Tree" in imk) && imk.Name) {
    result.push(`${imk.Name} (${imk.Option ? `${imk.Option}, ` : ""}POW ${imk.Penalty} check to use)`);
  }
  for (const level of character.levels) {
    if (!level.mk) continue;
    for (const [name, value] of Object.entries(level.mk)) {
      if (!(name in kiAbilities)) continue;
      if (!kiAbilities[name].Option_Title) {
        if (name !== imk?.Name) result.push(name);
      } else {
        const options = (value as { Options: string[] }).Options ?? [];
        haveOptions[name] = (haveOptions[name] ?? []).concat(options);
      }
    }
  }
  for (const [name, options] of Object.entries(haveOptions)) {
    result.push(`${name}(${options.join(", ")})`);
  }
  if (character.race === "D'Anjayni Nephilim") result.push("Ki Concealment");
  return result.sort();
}

export function dominionTechniques(character: CharacterDocument): Record<string, string[]> {
  const trees: Record<string, string[]> = {};
  const imk = character.insufficientMartialKnowledge as { Tree?: string; Name?: string; Penalty?: number } | undefined;
  if (imk?.Tree && imk.Name) {
    trees[imk.Tree] = [`${imk.Name} (POW ${imk.Penalty} check to use)`];
  }
  for (const level of character.levels) {
    if (!level.mk) continue;
    for (const [name, value] of Object.entries(level.mk)) {
      if (name in kiAbilities) continue;
      trees[name] = trees[name] ?? [];
      if (Array.isArray(value)) {
        for (const technique of value as { Name: string }[]) {
          if (name === imk?.Tree && technique.Name === imk.Name) continue;
          trees[name].push(technique.Name);
        }
      }
    }
  }
  for (const names of Object.values(trees)) names.sort();
  return trees;
}

export function addKiAbility(character: CharacterDocument, name: string, level: number, option?: string): CharacterDocument {
  const next = cloneCharacter(character);
  if (hasKiAbility(next, name, option)) return next;
  const index = level === 0 ? 0 : level - 1;
  const cost = kiAbilityCost(name, next.settings.ollyTRules);
  const remaining = mkRemaining(next)[index] ?? 0;
  if (cost > remaining + 50 || next.insufficientMartialKnowledge) return next;
  next.levels[index].mk = next.levels[index].mk ?? {};
  const mk = next.levels[index].mk;
  if (kiAbilities[name].Option_Title) {
    const existing = mk[name] as { MK: number; Options: string[] } | undefined;
    if (existing) {
      existing.MK += cost;
      existing.Options.push(option ?? "");
      existing.Options.sort();
    } else {
      mk[name] = { MK: cost, Options: [option ?? ""] };
    }
  } else {
    mk[name] = cost;
  }
  if (cost > remaining) {
    next.insufficientMartialKnowledge = {
      Name: name,
      Penalty: -Math.floor((cost - remaining) / 10),
      ...(option ? { Option: option } : {}),
    };
  }
  return next;
}

export function removeKiAbility(character: CharacterDocument, name: string, level: number): CharacterDocument {
  const next = cloneCharacter(character);
  const index = level === 0 ? 0 : level - 1;
  if (next.levels[index].mk) delete next.levels[index].mk[name];
  return next;
}

export function addDominionTechnique(
  character: CharacterDocument,
  tree: string,
  name: string,
  techniqueLevel: number,
  mkCost: number,
  atLevel: number,
): CharacterDocument {
  const next = cloneCharacter(character);
  const index = atLevel === 0 ? 0 : atLevel - 1;
  const remaining = mkRemaining(next)[index] ?? 0;
  if (mkCost > remaining + 50 || next.insufficientMartialKnowledge) return next;
  next.levels[index].mk = next.levels[index].mk ?? {};
  const mk = next.levels[index].mk;
  const list = Array.isArray(mk[tree]) ? [...(mk[tree] as object[])] : [];
  list.push({ Name: name, Level: techniqueLevel, MK: mkCost });
  mk[tree] = list;
  if (mkCost > remaining) {
    next.insufficientMartialKnowledge = {
      Tree: tree,
      Name: name,
      Penalty: -Math.floor((mkCost - remaining) / 10),
    };
  }
  return next;
}
