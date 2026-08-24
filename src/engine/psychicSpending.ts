import {
  cumulativePPForTier,
  DISCIPLINE_MASTER_COST,
  globalPotentialBonusForTier,
  INNATE_SLOT_COST,
  incrementalPPForNextTier,
  MAX_GLOBAL_POTENTIAL_TIER,
  MAX_POWER_INVESTMENT,
  MATRIX_DISCIPLINE,
  POWER_INVESTMENT_COST,
  POWER_LEARN_COST,
  powersInDiscipline,
  psychicPowerDef,
  TEMP_PSYCHIC_EFFECTS,
  type TempPsychicEffectId,
} from "../data/psychicSpending";
import type { CharacterDocument, PsychicDevelopment } from "../schema/character";
import { cloneCharacter, emptyPsychicDevelopment } from "../schema/character";
import { characteristic } from "./characteristics";
import { firstDp } from "./helpers";
import { psychicPoints } from "./magic";

export type PsychicAccessMode = "none" | "natural" | "one-free" | "free-access";

export function normalizePsychic(character: CharacterDocument): PsychicDevelopment {
  return character.psychic ?? emptyPsychicDevelopment();
}

function withPsychic(character: CharacterDocument, psychic: PsychicDevelopment): CharacterDocument {
  const next = cloneCharacter(character);
  next.psychic = psychic;
  return next;
}

export function psychicAccessMode(character: CharacterDocument): PsychicAccessMode {
  if ("Access to Natural Psychic Powers" in character.advantages) return "natural";
  if (typeof character.advantages["Access to One Psychic Discipline"] === "string") return "one-free";
  const dp = firstDp(character);
  if (typeof dp["Access to a Psychic Discipline"] === "string") return "one-free";
  if ("Free Access to Any Psychic Discipline" in character.advantages) return "free-access";
  if ("Access to Psychic Disciplines" in dp) return "free-access";
  return "none";
}

export function grantedDisciplines(character: CharacterDocument): string[] {
  const one = character.advantages["Access to One Psychic Discipline"];
  if (typeof one === "string" && one) return [one];
  const dp = firstDp(character);
  const essentialOne = dp["Access to a Psychic Discipline"];
  if (typeof essentialOne === "string" && essentialOne) return [essentialOne];
  return [];
}

export function ppPurchasedDisciplines(character: CharacterDocument): string[] {
  return [...(normalizePsychic(character).masteredDisciplines ?? [])];
}

export function masteredDisciplines(character: CharacterDocument): string[] {
  const set = new Set([...grantedDisciplines(character), ...ppPurchasedDisciplines(character)]);
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function hasDiscipline(character: CharacterDocument, discipline: string): boolean {
  return masteredDisciplines(character).includes(discipline);
}

export function canBuyDisciplinesWithPP(character: CharacterDocument): boolean {
  const mode = psychicAccessMode(character);
  return mode === "free-access";
}

export function canSpendPsychicPoints(character: CharacterDocument): boolean {
  const mode = psychicAccessMode(character);
  if (mode === "natural") return false;
  if (mode === "none") {
    return totalPsychicPoints(character) > 0 || Boolean(character.psychic?.learnedPowers?.length);
  }
  return true;
}

export function learnedPowers(character: CharacterDocument): string[] {
  return [...(normalizePsychic(character).learnedPowers ?? [])];
}

export function knowsPower(character: CharacterDocument, powerName: string): boolean {
  return learnedPowers(character).includes(powerName);
}

export function totalPsychicPoints(character: CharacterDocument): number {
  return psychicPoints(character);
}

export function tempPPSpent(character: CharacterDocument): number {
  return (normalizePsychic(character).tempSpends ?? []).reduce((sum, item) => sum + item.pp, 0);
}

export function permanentPPSpent(character: CharacterDocument): number {
  const psychic = normalizePsychic(character);
  let spent = ppPurchasedDisciplines(character).length * DISCIPLINE_MASTER_COST;
  spent += (psychic.learnedPowers ?? []).length * POWER_LEARN_COST;
  spent += cumulativePPForTier(psychic.globalPotentialTier ?? 0);
  spent += Object.values(psychic.powerInvestment ?? {}).reduce((sum, n) => sum + n, 0) * POWER_INVESTMENT_COST;
  spent += (psychic.innateSlots ?? 0) * INNATE_SLOT_COST;
  return spent;
}

export function freePPRemaining(character: CharacterDocument): number {
  return totalPsychicPoints(character) - permanentPPSpent(character) - tempPPSpent(character);
}

export function globalPotentialBonus(character: CharacterDocument): number {
  return globalPotentialBonusForTier(normalizePsychic(character).globalPotentialTier ?? 0);
}

/** Base psychic potential for a power with no per-power investment (WP×10 + global). */
export function basePsychicPotential(character: CharacterDocument): number {
  return characteristic(character, "WP") * 10 + globalPotentialBonus(character);
}

export function powerPotential(character: CharacterDocument, powerName: string): number {
  const base = characteristic(character, "WP") * 10;
  const investment = normalizePsychic(character).powerInvestment?.[powerName] ?? 0;
  return base + globalPotentialBonus(character) + investment * 10;
}

/** Potential for a power maintained in an innate slot, including temporary improve-innate spends. */
export function innateSlotPotential(character: CharacterDocument, powerName: string): number {
  const base = powerPotential(character, powerName);
  const bonus = (normalizePsychic(character).tempSpends ?? [])
    .filter((item) => item.effect === "improve-innate" && item.power === powerName)
    .reduce((sum, item) => sum + item.pp * 20, 0);
  return base + bonus;
}

function hasLevelGateMet(character: CharacterDocument, powerName: string): boolean {
  const def = psychicPowerDef(powerName);
  if (!def || def.level <= 1) return true;
  const group = def.isMatrix ? MATRIX_DISCIPLINE : def.discipline;
  const learned = learnedPowers(character);
  const hasPriorLevel = learned.some((name) => {
    const other = psychicPowerDef(name);
    return other && (other.isMatrix ? MATRIX_DISCIPLINE : other.discipline) === group && other.level === def.level - 1;
  });
  return hasPriorLevel;
}

export function canMasterDiscipline(character: CharacterDocument, discipline: string): boolean {
  if (!canBuyDisciplinesWithPP(character)) return false;
  if (hasDiscipline(character, discipline)) return false;
  return freePPRemaining(character) >= DISCIPLINE_MASTER_COST;
}

export function masterDiscipline(character: CharacterDocument, discipline: string): CharacterDocument {
  if (!canMasterDiscipline(character, discipline)) return character;
  const psychic = normalizePsychic(character);
  psychic.masteredDisciplines = [...ppPurchasedDisciplines(character), discipline].sort((a, b) => a.localeCompare(b));
  return withPsychic(character, psychic);
}

export function canLearnPower(character: CharacterDocument, powerName: string): boolean {
  if (knowsPower(character, powerName)) return false;
  const def = psychicPowerDef(powerName);
  if (!def) return false;
  if (def.isMatrix) {
    if (!canSpendPsychicPoints(character)) return false;
  } else if (!hasDiscipline(character, def.discipline)) {
    return false;
  }
  if (!hasLevelGateMet(character, powerName)) return false;
  return freePPRemaining(character) >= POWER_LEARN_COST;
}

export function learnPower(character: CharacterDocument, powerName: string): CharacterDocument {
  if (!canLearnPower(character, powerName)) return character;
  const psychic = normalizePsychic(character);
  psychic.learnedPowers = [...learnedPowers(character), powerName].sort((a, b) => a.localeCompare(b));
  return withPsychic(character, psychic);
}

export function canRaiseGlobalPotential(character: CharacterDocument): boolean {
  const tier = normalizePsychic(character).globalPotentialTier ?? 0;
  if (tier >= MAX_GLOBAL_POTENTIAL_TIER) return false;
  return freePPRemaining(character) >= incrementalPPForNextTier(tier);
}

export function raiseGlobalPotential(character: CharacterDocument): CharacterDocument {
  if (!canRaiseGlobalPotential(character)) return character;
  const psychic = normalizePsychic(character);
  psychic.globalPotentialTier = (psychic.globalPotentialTier ?? 0) + 1;
  return withPsychic(character, psychic);
}

export function canInvestInPower(character: CharacterDocument, powerName: string): boolean {
  if (!knowsPower(character, powerName)) return false;
  const current = normalizePsychic(character).powerInvestment?.[powerName] ?? 0;
  if (current >= MAX_POWER_INVESTMENT) return false;
  return freePPRemaining(character) >= POWER_INVESTMENT_COST;
}

export function investInPower(character: CharacterDocument, powerName: string): CharacterDocument {
  if (!canInvestInPower(character, powerName)) return character;
  const psychic = normalizePsychic(character);
  psychic.powerInvestment = { ...psychic.powerInvestment, [powerName]: (psychic.powerInvestment?.[powerName] ?? 0) + 1 };
  return withPsychic(character, psychic);
}

export function canBuyInnateSlot(character: CharacterDocument): boolean {
  if (!canSpendPsychicPoints(character)) return false;
  return freePPRemaining(character) >= INNATE_SLOT_COST;
}

export function buyInnateSlot(character: CharacterDocument): CharacterDocument {
  if (!canBuyInnateSlot(character)) return character;
  const psychic = normalizePsychic(character);
  psychic.innateSlots = (psychic.innateSlots ?? 0) + 1;
  psychic.innateSlotAssignments = [...innateSlotAssignments({ ...character, psychic }), ""];
  return withPsychic(character, psychic);
}

export function innateSlotAssignments(character: CharacterDocument): string[] {
  const psychic = normalizePsychic(character);
  const count = psychic.innateSlots ?? 0;
  const assignments = [...(psychic.innateSlotAssignments ?? [])];
  while (assignments.length < count) assignments.push("");
  return assignments.slice(0, count);
}

export function maintainableLearnedPowers(character: CharacterDocument): string[] {
  return learnedPowers(character)
    .filter((name) => psychicPowerDef(name)?.maintenance)
    .sort((a, b) => a.localeCompare(b));
}

/** Unlearned powers from disciplines the character already has (excludes matrix). */
export function unlearnedPowersInAccessibleDisciplines(character: CharacterDocument): string[] {
  const learned = new Set(learnedPowers(character));
  const names: string[] = [];
  for (const discipline of masteredDisciplines(character)) {
    for (const def of powersInDiscipline(discipline)) {
      if (!learned.has(def.name)) names.push(def.name);
    }
  }
  return names.sort((a, b) => a.localeCompare(b));
}

export function setInnateSlotAssignment(
  character: CharacterDocument,
  slotIndex: number,
  powerName: string,
): CharacterDocument {
  const psychic = normalizePsychic(character);
  const count = psychic.innateSlots ?? 0;
  if (slotIndex < 0 || slotIndex >= count) return character;

  const nextPower = powerName.trim();
  if (nextPower) {
    const def = psychicPowerDef(nextPower);
    if (!def?.maintenance || !knowsPower(character, nextPower)) return character;
    const current = innateSlotAssignments(character);
    if (current.some((assigned, index) => index !== slotIndex && assigned === nextPower)) return character;
  }

  const assignments = innateSlotAssignments(character);
  assignments[slotIndex] = nextPower;
  psychic.innateSlotAssignments = assignments;
  return withPsychic(character, psychic);
}

function clearInnateAssignmentsForPower(psychic: PsychicDevelopment, powerName: string): void {
  psychic.innateSlotAssignments = (psychic.innateSlotAssignments ?? []).map((name) =>
    name === powerName ? "" : name,
  );
}

export function canEditPsychicDevelopment(character: CharacterDocument): boolean {
  return character.created !== true;
}

function learnedPowersInDiscipline(character: CharacterDocument, discipline: string): string[] {
  return learnedPowers(character).filter((name) => {
    const def = psychicPowerDef(name);
    return def && !def.isMatrix && def.discipline === discipline;
  });
}

function wouldBreakLevelGateIfPowerRemoved(character: CharacterDocument, powerName: string): boolean {
  const def = psychicPowerDef(powerName);
  if (!def) return false;
  const group = def.isMatrix ? MATRIX_DISCIPLINE : def.discipline;
  const remaining = learnedPowers(character).filter((name) => name !== powerName);
  for (const name of remaining) {
    const other = psychicPowerDef(name);
    if (!other || (other.isMatrix ? MATRIX_DISCIPLINE : other.discipline) !== group) continue;
    if (other.level <= def.level) continue;
    const hasPrior = remaining.some((priorName) => {
      const prior = psychicPowerDef(priorName);
      return prior && (prior.isMatrix ? MATRIX_DISCIPLINE : prior.discipline) === group && prior.level === other.level - 1;
    });
    if (!hasPrior) return true;
  }
  return false;
}

export function canUnmasterDiscipline(character: CharacterDocument, discipline: string): boolean {
  if (!canEditPsychicDevelopment(character)) return false;
  if (!ppPurchasedDisciplines(character).includes(discipline)) return false;
  return learnedPowersInDiscipline(character, discipline).length === 0;
}

export function unmasterDiscipline(character: CharacterDocument, discipline: string): CharacterDocument {
  if (!canUnmasterDiscipline(character, discipline)) return character;
  const psychic = normalizePsychic(character);
  psychic.masteredDisciplines = ppPurchasedDisciplines(character).filter((name) => name !== discipline);
  return withPsychic(character, psychic);
}

export function canUnlearnPower(character: CharacterDocument, powerName: string): boolean {
  if (!canEditPsychicDevelopment(character)) return false;
  if (!knowsPower(character, powerName)) return false;
  return !wouldBreakLevelGateIfPowerRemoved(character, powerName);
}

export function unlearnPower(character: CharacterDocument, powerName: string): CharacterDocument {
  if (!canUnlearnPower(character, powerName)) return character;
  const psychic = normalizePsychic(character);
  psychic.learnedPowers = learnedPowers(character).filter((name) => name !== powerName);
  if (psychic.powerInvestment?.[powerName]) {
    const { [powerName]: _removed, ...rest } = psychic.powerInvestment;
    psychic.powerInvestment = rest;
  }
  clearInnateAssignmentsForPower(psychic, powerName);
  return withPsychic(character, psychic);
}

export function canLowerGlobalPotential(character: CharacterDocument): boolean {
  if (!canEditPsychicDevelopment(character)) return false;
  return (normalizePsychic(character).globalPotentialTier ?? 0) > 0;
}

export function lowerGlobalPotential(character: CharacterDocument): CharacterDocument {
  if (!canLowerGlobalPotential(character)) return character;
  const psychic = normalizePsychic(character);
  psychic.globalPotentialTier = Math.max(0, (psychic.globalPotentialTier ?? 0) - 1);
  return withPsychic(character, psychic);
}

export function canRemovePowerInvestment(character: CharacterDocument, powerName: string): boolean {
  if (!canEditPsychicDevelopment(character)) return false;
  return (normalizePsychic(character).powerInvestment?.[powerName] ?? 0) > 0;
}

export function removePowerInvestment(character: CharacterDocument, powerName: string): CharacterDocument {
  if (!canRemovePowerInvestment(character, powerName)) return character;
  const psychic = normalizePsychic(character);
  const current = psychic.powerInvestment?.[powerName] ?? 0;
  if (current <= 1) {
    const { [powerName]: _removed, ...rest } = psychic.powerInvestment ?? {};
    psychic.powerInvestment = rest;
  } else {
    psychic.powerInvestment = { ...psychic.powerInvestment, [powerName]: current - 1 };
  }
  return withPsychic(character, psychic);
}

export function canRemoveInnateSlot(character: CharacterDocument): boolean {
  if (!canEditPsychicDevelopment(character)) return false;
  return (normalizePsychic(character).innateSlots ?? 0) > 0;
}

export function removeInnateSlot(character: CharacterDocument): CharacterDocument {
  if (!canRemoveInnateSlot(character)) return character;
  const psychic = normalizePsychic(character);
  psychic.innateSlots = Math.max(0, (psychic.innateSlots ?? 0) - 1);
  psychic.innateSlotAssignments = innateSlotAssignments(character).slice(0, psychic.innateSlots);
  return withPsychic(character, psychic);
}

export function canRemovePsychicDevelopmentEntry(character: CharacterDocument, entryId: string): boolean {
  if (entryId.startsWith("disc-")) return canUnmasterDiscipline(character, entryId.slice(5));
  if (entryId.startsWith("power-")) return canUnlearnPower(character, entryId.slice(6));
  if (entryId === "global-potential") return canLowerGlobalPotential(character);
  if (entryId.startsWith("invest-")) return canRemovePowerInvestment(character, entryId.slice(7));
  if (entryId === "innate-slots") return canRemoveInnateSlot(character);
  if ((normalizePsychic(character).tempSpends ?? []).some((item) => item.id === entryId)) return canEditPsychicDevelopment(character);
  return false;
}

export function removePsychicDevelopmentEntry(character: CharacterDocument, entryId: string): CharacterDocument {
  if (!canRemovePsychicDevelopmentEntry(character, entryId)) return character;
  if (entryId.startsWith("disc-")) return unmasterDiscipline(character, entryId.slice(5));
  if (entryId.startsWith("power-")) return unlearnPower(character, entryId.slice(6));
  if (entryId === "global-potential") return lowerGlobalPotential(character);
  if (entryId.startsWith("invest-")) return removePowerInvestment(character, entryId.slice(7));
  if (entryId === "innate-slots") return removeInnateSlot(character);
  return undoTempSpend(character, entryId);
}

function unmasterDisciplineBlockedReason(character: CharacterDocument, discipline: string): string | undefined {
  if (!canEditPsychicDevelopment(character)) return "Character is locked";
  if (!ppPurchasedDisciplines(character).includes(discipline)) return undefined;
  const blocking = learnedPowersInDiscipline(character, discipline);
  if (blocking.length > 0) return `Remove learned powers first (${blocking.join(", ")})`;
  return undefined;
}

function unlearnPowerBlockedReason(character: CharacterDocument, powerName: string): string | undefined {
  if (!canEditPsychicDevelopment(character)) return "Character is locked";
  if (!knowsPower(character, powerName)) return undefined;
  if (wouldBreakLevelGateIfPowerRemoved(character, powerName)) {
    return "Remove higher-level powers in this discipline first";
  }
  return undefined;
}

export function canTempSpend(character: CharacterDocument, effectId: TempPsychicEffectId, power?: string): boolean {
  const def = TEMP_PSYCHIC_EFFECTS.find((item) => item.id === effectId);
  if (!def) return false;
  if (def.needsPower && !power) return false;
  if (def.needsPower && power) {
    if (!psychicPowerDef(power)) return false;
    if (effectId === "temporary-power" && !unlearnedPowersInAccessibleDisciplines(character).includes(power)) {
      return false;
    }
    if (effectId === "improve-innate" && !maintainableLearnedPowers(character).includes(power)) return false;
  }
  return freePPRemaining(character) >= def.pp;
}

export function tempSpend(
  character: CharacterDocument,
  effectId: TempPsychicEffectId,
  power?: string,
): CharacterDocument {
  if (!canTempSpend(character, effectId, power)) return character;
  const def = TEMP_PSYCHIC_EFFECTS.find((item) => item.id === effectId)!;
  const psychic = normalizePsychic(character);
  psychic.tempSpends = [
    ...(psychic.tempSpends ?? []),
    {
      id: crypto.randomUUID(),
      effect: effectId,
      pp: def.pp,
      power: power || undefined,
      at: new Date().toISOString(),
    },
  ];
  return withPsychic(character, psychic);
}

export function undoTempSpend(character: CharacterDocument, spendId: string): CharacterDocument {
  const psychic = normalizePsychic(character);
  if (!(psychic.tempSpends ?? []).some((item) => item.id === spendId)) return character;
  psychic.tempSpends = (psychic.tempSpends ?? []).filter((item) => item.id !== spendId);
  return withPsychic(character, psychic);
}

export type LearnedPowerSummary = {
  name: string;
  potential: number;
  maintenance: boolean;
  level: number;
  discipline?: string;
  powerInvestment: number;
  isMatrix: boolean;
  isNatural: boolean;
};

export function learnedPowerSummaries(character: CharacterDocument): LearnedPowerSummary[] {
  return learnedPowers(character).map((name) => {
    const def = psychicPowerDef(name)!;
    return {
      name,
      potential: powerPotential(character, name),
      maintenance: def.maintenance,
      level: def.level,
      discipline: def.isMatrix ? undefined : def.discipline,
      powerInvestment: normalizePsychic(character).powerInvestment?.[name] ?? 0,
      isMatrix: def.isMatrix,
      isNatural: false,
    };
  });
}

export type PsychicDevelopmentEntry = {
  id: string;
  label: string;
  pp: number;
  removable: boolean;
  removeBlockedReason?: string;
};

export function psychicDevelopmentEntries(character: CharacterDocument): PsychicDevelopmentEntry[] {
  const psychic = normalizePsychic(character);
  const entries: PsychicDevelopmentEntry[] = [];

  for (const discipline of ppPurchasedDisciplines(character)) {
    const blocked = unmasterDisciplineBlockedReason(character, discipline);
    entries.push({
      id: `disc-${discipline}`,
      label: `Master ${discipline}`,
      pp: DISCIPLINE_MASTER_COST,
      removable: !blocked,
      removeBlockedReason: blocked,
    });
  }
  for (const power of psychic.learnedPowers ?? []) {
    const blocked = unlearnPowerBlockedReason(character, power);
    entries.push({
      id: `power-${power}`,
      label: `Learn ${power}`,
      pp: POWER_LEARN_COST,
      removable: !blocked,
      removeBlockedReason: blocked,
    });
  }
  if ((psychic.globalPotentialTier ?? 0) > 0) {
    const locked = !canEditPsychicDevelopment(character);
    entries.push({
      id: "global-potential",
      label: `Global potential tier ${psychic.globalPotentialTier} (+${globalPotentialBonus(character)})`,
      pp: cumulativePPForTier(psychic.globalPotentialTier ?? 0),
      removable: !locked,
      removeBlockedReason: locked ? "Character is locked" : undefined,
    });
  }
  for (const [power, investment] of Object.entries(psychic.powerInvestment ?? {})) {
    if (investment > 0) {
      const locked = !canEditPsychicDevelopment(character);
      entries.push({
        id: `invest-${power}`,
        label: `Invest in ${power} (×${investment})`,
        pp: investment * POWER_INVESTMENT_COST,
        removable: !locked,
        removeBlockedReason: locked ? "Character is locked" : undefined,
      });
    }
  }
  if ((psychic.innateSlots ?? 0) > 0) {
    const locked = !canEditPsychicDevelopment(character);
    entries.push({
      id: "innate-slots",
      label: `Innate slots (×${psychic.innateSlots})`,
      pp: (psychic.innateSlots ?? 0) * INNATE_SLOT_COST,
      removable: !locked,
      removeBlockedReason: locked ? "Character is locked" : undefined,
    });
  }
  for (const temp of psychic.tempSpends ?? []) {
    const effectLabel = TEMP_PSYCHIC_EFFECTS.find((item) => item.id === temp.effect)?.label ?? temp.effect;
    const locked = !canEditPsychicDevelopment(character);
    entries.push({
      id: temp.id,
      label: `${effectLabel}${temp.power ? ` — ${temp.power}` : ""} (temporary)`,
      pp: temp.pp,
      removable: !locked,
      removeBlockedReason: locked ? "Character is locked" : undefined,
    });
  }
  return entries;
}

export function hasPsychicDevelopment(character: CharacterDocument): boolean {
  return psychicDevelopmentEntries(character).length > 0;
}
