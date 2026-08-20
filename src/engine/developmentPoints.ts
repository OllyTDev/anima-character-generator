import { abilities } from "../data/abilities";
import { classes } from "../data/classes";
import { combatModules } from "../data/combatModules";
import { essentialAbilities } from "../data/essentialAbilities";
import { martialArts } from "../data/martialArts";
import { powers } from "../data/powers";
import { primaries } from "../data/primaries";
import type { PrimaryCategory } from "../data/types";
import type { CharacterDocument } from "../schema/character";
import { cloneCharacter } from "../schema/character";
import { characterLevel, intersection, isSpirit, asNumber, asStringArray } from "./helpers";

export function bonusDpFromGnosis(gnosis: number | undefined): number {
  if (typeof gnosis !== "number") return 0;
  if (gnosis >= 50) return 750;
  if (gnosis >= 45) return 500;
  if (gnosis >= 40) return 300;
  if (gnosis >= 35) return 150;
  if (gnosis >= 30) return 50;
  return 0;
}

export function classChangeDp(character: CharacterDocument, level: number): number {
  if (level < 2) return 0;
  const thisClass = character.levels[level - 1].class;
  const lastClass = character.levels[level - 2].class;
  if (thisClass === lastClass) return 0;
  const thisTypes = classes[thisClass].Archetypes;
  const lastTypes = classes[lastClass].Archetypes;
  let cost = 60;
  if (thisClass === "Freelancer" || lastClass === "Freelancer") cost = 20;
  else if (thisTypes.length === 1 && lastTypes.length === 1 && thisTypes[0] === lastTypes[0]) cost = 20;
  else if (intersection([...thisTypes], [...lastTypes]).length > 0) cost = 40;
  if ("Versatile" in character.advantages) cost /= 2;
  return cost;
}

export function dpCost(character: CharacterDocument, abilityName: string, className: string, degree?: string): number {
  if (abilityName.startsWith("Save ")) return 1;
  if (abilityName in essentialAbilities.advantages) return essentialAbilities.advantages[abilityName].DP;
  if (abilityName in essentialAbilities.disadvantages) return essentialAbilities.disadvantages[abilityName].DP;
  if (abilityName in combatModules) {
    return className === "Weaponsmaster" ? combatModules[abilityName].WDP : combatModules[abilityName].DP;
  }
  if (abilityName in martialArts) {
    const info = martialArts[abilityName as keyof typeof martialArts] as Record<string, unknown>;
    if ("Arcane" in info) return className === "Tao" ? 20 : 50;
    const reduced = abilityName === character.firstMartialArt;
    if (className === "Tao") {
      if (degree === "Supreme") return reduced ? 10 : 20;
      return reduced ? 5 : 10;
    }
    if (degree === "Base") return reduced ? 10 : 20;
    if (degree === "Advanced") return reduced ? 15 : 30;
    return reduced ? 25 : 50;
  }
  const ability = abilities[abilityName];
  const cls = classes[className];
  let result: number;
  if (cls.reduced[abilityName]) result = cls.reduced[abilityName];
  else if (ability?.Field) result = cls[ability.Field];
  else result = (cls as Record<string, unknown>)[abilityName] as number;
  if (ability?.Field) {
    if (character.advantages["Aptitude in a Field"] === ability.Field) result -= 1;
    const subject = character.advantages["Aptitude in a Subject"] as { Ability?: string; Points?: number } | undefined;
    if (subject?.Ability === abilityName) result -= subject.Points ?? 0;
  }
  if (result < 1) result = 1;
  return result;
}

function spentForItem(character: CharacterDocument, item: string, value: unknown, className: string): number {
  if (item in martialArts) {
    const degrees = asStringArray(value);
    return degrees.reduce((sum, degree) => sum + dpCost(character, item, className, degree), 0);
  }
  if (item in powers) {
    const power = powers[item as keyof typeof powers] as { Options?: unknown };
    const options = power.Options;
    if (Array.isArray(options) && options[0] && typeof options[0] === "object" && "DP" in options[0]) {
      return Number((options[0] as { DP: number }).DP);
    }
    return 0;
  }
  const cost = dpCost(character, item, className);
  if (item in combatModules) {
    const module = combatModules[item];
    if (module.Option_Title) return asStringArray(value).length * cost;
    return cost;
  }
  if (item === "Accumulation Multiple" || item === "Ki") {
    const entry = (value ?? {}) as Record<string, number>;
    return Object.values(entry).reduce((sum, amount) => sum + amount * cost, 0);
  }
  if (item.includes("Attribute Increased")) return asStringArray(value).length * cost;
  if (item === "Fatigue Resistance") return asNumber(value) * cost;
  if (item in essentialAbilities.advantages || item in essentialAbilities.disadvantages) return cost;
  return asNumber(value) * cost;
}

export type DpRemaining = Record<string, number>;

const DP_CATEGORY_KEYS = new Set<PrimaryCategory | "Total">([
  "Combat",
  "Psychic",
  "Supernatural",
  "Other",
  "Powers",
  "Total",
]);

function num(row: Record<string, number>, key: string): number {
  return row[key] ?? 0;
}

export function dpRemainingForLevel(character: CharacterDocument, level: number): DpRemaining {
  const index = level === 0 ? 0 : level - 1;
  return dpRemaining(character)[index] ?? {};
}

/** Remaining DP at a level as if an existing purchase were removed (for editing). */
export function dpRemainingForLevelExcluding(
  character: CharacterDocument,
  level: number,
  purchaseName: string,
): DpRemaining {
  const index = level === 0 ? 0 : level - 1;
  if (!(purchaseName in (character.levels[index]?.dp ?? {}))) {
    return dpRemainingForLevel(character, level);
  }
  const next = cloneCharacter(character);
  delete next.levels[index].dp[purchaseName];
  return dpRemainingForLevel(next, level);
}

export function dpSpentForPurchase(
  character: CharacterDocument,
  name: string,
  value: unknown,
  className: string,
): number {
  return spentForItem(character, name, value, className);
}

export function maxDpForPurchase(remaining: DpRemaining, abilityName: string): number {
  const primary = primaries.forAbility(abilityName);
  let max = Math.min(num(remaining, "Total"), num(remaining, primary));
  if (
    abilityName in remaining &&
    !DP_CATEGORY_KEYS.has(abilityName as PrimaryCategory | "Total") &&
    !abilityName.startsWith("Save ") &&
    abilityName !== "Class_Change"
  ) {
    max = Math.min(max, num(remaining, abilityName));
  }
  return Math.max(0, Math.floor(max));
}

/** Largest affordable DP spend, rounded down to a whole number of units. */
export function maxAffordableDpSpend(maxDp: number, unitCost: number): number {
  if (unitCost <= 0) return 0;
  return Math.floor(maxDp / unitCost) * unitCost;
}

/** Convert a DP spend amount to the stored purchase value (units). */
export function unitsFromDpSpend(dpAmount: number, unitCost: number): number {
  if (unitCost <= 0) return 0;
  return dpAmount / unitCost;
}

export function dpRemaining(character: CharacterDocument): DpRemaining[] {
  const categories = ["Combat", "Psychic", "Supernatural", "Other", "Powers"] as const;
  const results: DpRemaining[] = [];
  const savedRows: Record<string, number>[] = [];
  const costs = { Attack: 2, Block: 2, Dodge: 2 };
  const scores = { Attack: 0, Block: 0, Dodge: 0 };
  const totals: Record<string, number> = {
    Attack: 0,
    Block: 0,
    Dodge: 0,
    DP: 0,
    "Magic Projection": 0,
    Powers: 0,
    Psychic: 0,
    "Psychic Projection": 0,
    Supernatural: 0,
    "Martial Knowledge": 0,
    "Magic Level": 0,
  };
  const gnosis = character.gnosis || 0;
  const racialLevel = character.racialLevel || 0;
  const level = characterLevel(character);
  let mk = 0;
  let ml = 0;
  let newDp = 600;

  for (let i = 0; i < character.levels.length; i++) {
    const result: DpRemaining = {};
    results.push(result);
    const className = character.levels[i].class;
    const classInfo = classes[className];
    if (i === 0 && level === 0) newDp = 400;
    else if (i > 0) newDp = 100;
    else newDp = 600;
    totals.DP += newDp;
    totals.Psychic += (classInfo.Psychic * newDp) / 100;
    totals.Supernatural += (classInfo.Supernatural * newDp) / 100;
    result.Total = newDp;
    result.Combat = (classInfo.Combat * newDp) / 100;
    result.Psychic = (classInfo.Psychic * newDp) / 100;
    result.Supernatural = (classInfo.Supernatural * newDp) / 100;
    if (i === 0 || i < racialLevel || gnosis >= 25) {
      totals.Powers += newDp / 2;
      result.Powers = newDp / 2;
    } else {
      result.Powers = 0;
    }
    if (i === 0) {
      const bonus = bonusDpFromGnosis(character.gnosis);
      result.Powers += bonus;
      result.Total += bonus;
      if (isSpirit(character)) {
        result.Powers -= 100;
        result.Total -= 100;
      }
      savedRows.push({ Combat: 0, Psychic: 0, Supernatural: 0, Powers: 0, Other: 0 });
    } else {
      savedRows.push({ ...savedRows[i - 1] });
    }
    mk += newDp / 10;
    ml += newDp / 10;
    result["Martial Knowledge"] = mk;
    result["Magic Level"] = ml;
    result.Other = newDp;
    result["Magic Projection"] = totals.Supernatural / 2 - totals["Magic Projection"];
    result["Psychic Projection"] = totals.Psychic / 2 - totals["Psychic Projection"];

    for (const [item, value] of Object.entries(character.levels[i].dp)) {
      const spent = spentForItem(character, item, value, className);
      result.Total -= spent;
      const primary = primaries.forAbility(item);
      result[primary] = num(result, primary) - spent;
      if (item.startsWith("Save ")) savedRows[i][primary] = (savedRows[i][primary] ?? 0) + spent;
      if (item in result) {
        result[item] -= spent;
        if (item === "Magic Level") ml -= spent;
        if (item === "Martial Knowledge") mk -= spent;
      }
      if (item in scores) {
        costs[item as keyof typeof costs] = dpCost(character, item, className);
        scores[item as keyof typeof scores] += asNumber(value);
      }
      if (item in totals) totals[item] += spent;
    }

    const attack = scores.Attack;
    const spentCombat = totals.Attack + totals.Block + totals.Dodge;
    const defense = Math.max(scores.Block, scores.Dodge);
    const count = totals.DP / 2 - spentCombat;
    const quarter = totals.DP / 4;
    result.Attack = Math.min(count, Math.max((defense + 50 - attack) * costs.Attack, quarter - totals.Attack));
    if (character.damageResistance) {
      result.Block = 0;
      result.Dodge = 0;
    } else {
      result.Block = Math.min(count, Math.max((attack + 50 - scores.Block) * costs.Block, quarter - totals.Block));
      result.Dodge = Math.min(count, Math.max((attack + 50 - scores.Dodge) * costs.Dodge, quarter - totals.Dodge));
    }
    const changeCost = classChangeDp(character, level === 0 ? 0 : i + 1);
    if (changeCost > 0) {
      result.Other -= changeCost;
      result.Total -= changeCost;
      result.Class_Change = changeCost;
    }
    for (const primary of categories) {
      const remaining = num(result, primary);
      if (remaining < 0) {
        result[primary] = 0;
        for (let k = 0; k <= i; k++) {
          savedRows[k][primary] = Math.max((savedRows[k][primary] ?? 0) + remaining, 0);
        }
      } else {
        result[primary] = Math.min(remaining, result.Total);
      }
    }
  }

  for (let i = 0; i < character.levels.length; i++) {
    const result = results[i];
    const saved = savedRows[i];
    for (const primary of categories) {
      const saveName = `Save ${primary === "Other" ? "generic" : primary} DP for later`;
      let previousSaved = saved[primary] ?? 0;
      if (saveName in character.levels[i].dp) previousSaved -= asNumber(character.levels[i].dp[saveName]);
      result[saveName] = num(result, primary);
      result[primary] = num(result, primary) + previousSaved;
      result.Total += previousSaved;
    }
  }

  const last = results.at(-1) ?? {};
  const pinch: Record<string, number> = {
    Attack: last.Attack ?? 0,
    Block: last.Block ?? 0,
    Dodge: last.Dodge ?? 0,
    "Magic Projection": last["Magic Projection"] ?? 0,
    "Psychic Projection": last["Psychic Projection"] ?? 0,
    "Martial Knowledge": last["Martial Knowledge"] ?? 0,
    "Magic Level": last["Magic Level"] ?? 0,
  };
  for (let i = character.levels.length - 1; i >= 0; i--) {
    const result = results[i];
    for (const item of Object.keys(pinch)) {
      const limited = Math.min(num(result, item), pinch[item]);
      pinch[item] = limited;
      const primary = primaries.forAbility(item);
      result[item] = Math.min(limited, num(result, primary));
    }
  }
  return results;
}

export function hasModule(character: CharacterDocument, name: string, option?: string): boolean {
  for (const level of character.levels) {
    if (!(name in level.dp)) continue;
    if (!combatModules[name].Option_Title) return true;
    if (option && asStringArray(level.dp[name]).includes(option)) return true;
  }
  return false;
}

export function spendDp(character: CharacterDocument, level: number, name: string, value: unknown): CharacterDocument {
  const next = cloneCharacter(character);
  const index = level === 0 ? 0 : level - 1;
  next.levels[index].dp[name] = value;
  if (name in martialArts && !next.firstMartialArt) next.firstMartialArt = name;
  return next;
}

export function removeDp(character: CharacterDocument, level: number, name: string): CharacterDocument {
  const next = cloneCharacter(character);
  const index = level === 0 ? 0 : level - 1;
  delete next.levels[index].dp[name];
  return next;
}

export function changeClass(character: CharacterDocument, level: number, className: string): CharacterDocument {
  const next = cloneCharacter(character);
  const index = level > 0 ? level - 1 : 0;
  next.levels[index].class = className;
  if (next.levels.length > index + 1 && !("Versatile" in next.advantages)) {
    next.levels[index + 1].class = className;
  }
  return next;
}

export function setNaturalBonus(character: CharacterDocument, level: number, name: string): CharacterDocument {
  const next = cloneCharacter(character);
  if (level < 1 || level > next.levels.length) return next;
  if (name) next.levels[level - 1].naturalBonus = name;
  else delete next.levels[level - 1].naturalBonus;
  return next;
}

export function setFreelancerBonus(
  character: CharacterDocument,
  level: number,
  name: string,
  previous?: string,
): CharacterDocument {
  const next = cloneCharacter(character);
  const index = level === 0 ? 0 : level - 1;
  const list = next.levels[index].freelancer ?? [];
  if (previous) {
    const at = list.indexOf(previous);
    if (at >= 0) list[at] = name;
  } else if (list.length < 5) {
    list.push(name);
  }
  next.levels[index].freelancer = list;
  return next;
}

export function setEvenLevelCharacteristic(
  character: CharacterDocument,
  level: number,
  name: CharacterDocument["levels"][0]["characteristic"],
): CharacterDocument {
  const next = cloneCharacter(character);
  const index = level === 0 ? 0 : level - 1;
  next.levels[index].characteristic = name;
  return next;
}
