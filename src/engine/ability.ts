import { abilities, resolveSpecializationChoice } from "../data/abilities";
import { classes } from "../data/classes";
import { culturalRoots } from "../data/culturalRoots";
import { tables } from "../data/tables";
import type { Characteristic } from "../data/types";
import type { CharacterDocument } from "../schema/character";
import { cloneCharacter } from "../schema/character";
import { modifier } from "./characteristics";
import { asNumber, characterLevel, levelCount } from "./helpers";

const culturalAliases: Record<string, string> = {
  "Slight of Hand": "Sleight of Hand",
  "Resist Pain": "Withstand Pain",
  "Atheticism": "Athleticism",
  Initimidate: "Intimidate",
  Tracking: "Track",
  Herbalism: "Herbal Lore",
};

function canonicalAbility(name: string): string {
  return culturalAliases[name] ?? name;
}

export function setSpecialization(
  character: CharacterDocument,
  abilityName: string,
  specialization: string,
): CharacterDocument {
  const next = cloneCharacter(character);
  const trimmed = specialization.trim();
  if (!trimmed) {
    if (next.specializations) {
      const { [abilityName]: _removed, ...rest } = next.specializations;
      next.specializations = Object.keys(rest).length > 0 ? rest : undefined;
    }
  } else {
    next.specializations = {
      ...next.specializations,
      [abilityName]: resolveSpecializationChoice(abilityName, trimmed),
    };
  }
  return next;
}

function specializationBonusApplies(
  character: CharacterDocument,
  abilityName: string,
  specialty?: string,
): boolean {
  const stored = character.specializations?.[abilityName];
  if (!stored) return false;
  if (!specialty) return true;
  return specialty.toLowerCase() === stored.toLowerCase();
}

function culturalBonus(
  background: Record<string, unknown>,
  abilityName: string,
  specialty?: string,
  choices: string[] = [],
): number {
  let amount: unknown;
  for (const [key, value] of Object.entries(background)) {
    if (key === "choices" || key === "choice") continue;
    if (canonicalAbility(key) === abilityName) {
      amount = value;
      break;
    }
  }
  if (amount === undefined && choices.includes(abilityName)) {
    const forks = (background.choices ?? background.choice) as unknown;
    if (Array.isArray(forks)) {
      for (const fork of forks) {
        if (fork && typeof fork === "object") {
          for (const [key, value] of Object.entries(fork as Record<string, unknown>)) {
            if (canonicalAbility(key) === abilityName) amount = value;
          }
        }
      }
    }
  }
  if (amount === undefined) return 0;
  if (typeof amount === "number") return amount;
  if (amount && typeof amount === "object") {
    const spec = Object.keys(amount as Record<string, number>)[0];
    if (specialty && spec.toLowerCase() === specialty.toLowerCase()) {
      return (amount as Record<string, number>)[spec];
    }
  }
  return 0;
}

export function secondaryDpSpent(character: CharacterDocument, name: string, atLevel?: number): number {
  const count = levelCount(atLevel, character);
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += asNumber(character.levels[i].dp[name]);
  }
  return total;
}

export function secondaryHasInvestment(character: CharacterDocument, name: string, atLevel?: number): boolean {
  if (secondaryDpSpent(character, name, atLevel) > 0) return true;
  const count = levelCount(atLevel, character);
  for (let i = 0; i < count; i++) {
    if (character.levels[i].freelancer?.includes(name)) return true;
  }
  return false;
}

export function ability(character: CharacterDocument, name: string, specialty?: string, atLevel?: number): number {
  const def = abilities[name];
  if (!def) return 0;

  if (def.Field && !secondaryHasInvestment(character, name, atLevel)) {
    if ("Jack of All Trades" in character.advantages) return 10;
    return -30;
  }

  const count = levelCount(atLevel, character);
  const totLevel = characterLevel(character);
  const charName = def.Characteristic as Characteristic;
  let total = 0;
  let bonuses = 0;
  let eachLevel = 0;
  let nbMultiplier = 1;

  const learner = character.advantages["Natural Learner"] as { Ability?: string; Points?: number } | undefined;
  if (learner?.Ability === name) eachLevel += (learner.Points ?? 0) * 10;
  const fieldLearner = character.advantages["Natural Learner, Field"] as { Field?: string; Points?: number } | undefined;
  if (fieldLearner && fieldLearner.Field === def.Field) eachLevel += ((fieldLearner.Points ?? 0) - 1) * 5;

  const roots = character.advantages["Cultural Roots"];
  if (roots) {
    let backgroundName = "";
    let choices: string[] = [];
    if (typeof roots === "string") backgroundName = roots;
    else {
      const params = roots as { Background?: string; Choices?: string[] };
      backgroundName = params.Background ?? "";
      choices = params.Choices ?? [];
    }
    const background = culturalRoots[backgroundName as keyof typeof culturalRoots] as Record<string, unknown> | undefined;
    if (background) bonuses += culturalBonus(background, name, specialty, choices);
  }

  if ("Increased Natural Bonus" in character.advantages) nbMultiplier = 2;
  if ("Without any Natural Bonus" in character.disadvantages) nbMultiplier = 0;

  const combatSenses = character.advantages["Combat Senses"];
  const useOfArmor = name === "Wear Armor" ? asNumber(character.advantages["Use of Armor"]) : 0;

  for (let i = 0; i < count; i++) {
    const info = character.levels[i];
    const cls = classes[info.class];
    total += asNumber(info.dp[name]);
    if (info.freelancer?.includes(name)) {
      total += totLevel === 0 ? 5 : 10;
    }
    const classBonus = cls.bonuses[name];
    if (classBonus) bonuses += totLevel === 0 ? Math.floor(classBonus / 2) : classBonus;
    if (combatSenses === name) bonuses += 5;
    else if (useOfArmor) bonuses += useOfArmor * 5;
    if (info.naturalBonus === name) {
      bonuses += modifier(character, charName, i + 1) * nbMultiplier;
    }
    bonuses += eachLevel;
  }

  if (def.Field) {
    if ("Jack of All Trades" in character.advantages) total += 10;
    else if (total < 5) total -= 30;
  }
  if (bonuses > 50 && (tables.primary_combat_abilities as readonly string[]).includes(name)) {
    bonuses = 50;
  }
  if ("Acute Senses" in character.advantages && (name === "Notice" || name === "Search")) {
    bonuses += 30;
  }
  if ("Klutzy" in character.disadvantages && (tables.klutzy as readonly string[]).includes(name)) {
    total -= 30;
  }
  if ("Psychic Immunity" in character.advantages && name === "Composure") bonuses += 60;
  if ("Seducer" in character.advantages && name === "Persuasion" && specialty?.toLowerCase() === "seduction") {
    bonuses += 60;
  }
  if ("Talented" in character.advantages && name === "Sleight of Hand") bonuses += 30;
  if (character.race === "Devah Nephilim" && (name === "Banish" || name === "Bind")) bonuses += 10;
  if (specializationBonusApplies(character, name, specialty)) bonuses += 40;

  return total + bonuses + modifier(character, charName, atLevel);
}
