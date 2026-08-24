import { psychicDisciplines } from "./psychicDisciplines";

export const DISCIPLINE_MASTER_COST = 1;
export const POWER_LEARN_COST = 1;
export const POWER_INVESTMENT_COST = 1;
export const MAX_POWER_INVESTMENT = 10;
export const INNATE_SLOT_COST = 2;
export const MATRIX_DISCIPLINE = "__matrix__";

/** Cumulative PP spent to reach each tier (index 0 = tier 1). */
export const GLOBAL_POTENTIAL_CUMULATIVE_PP = [1, 3, 6, 10, 15, 21, 28, 36, 45, 55] as const;

/** Bonus at each tier (index 0 = tier 1 → +10). */
export const GLOBAL_POTENTIAL_BONUSES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

export const MAX_GLOBAL_POTENTIAL_TIER = GLOBAL_POTENTIAL_BONUSES.length;

export const tempPsychicEffectIds = [
  "improve-projection",
  "increase-potential",
  "eliminate-fatigue",
  "temporary-power",
  "improve-innate",
] as const;

export type TempPsychicEffectId = (typeof tempPsychicEffectIds)[number];

export type TempPsychicEffectDef = {
  id: TempPsychicEffectId;
  label: string;
  desc: string;
  pp: number;
  needsPower: boolean;
};

/** Placeholder costs — tune in data when book values are confirmed. */
export const TEMP_PSYCHIC_EFFECTS: TempPsychicEffectDef[] = [
  { id: "improve-projection", label: "Improve Psychic Projection", desc:"Improves projection for 1 turn by 10 per pp spend. Max 5.", pp: 1, needsPower: false },
  { id: "increase-potential", label: "Increase Psychic Potential", desc:"Improves potential for 1 turn by 20 per pp spend. Max 5.", pp: 1, needsPower: false },
  { id: "eliminate-fatigue", label: "Eliminate fatigue", desc:"On failure, many psychic abilities induce fatigue. Spending 1 free PP will eliminate this consequence.", pp: 1, needsPower: false },
  { id: "temporary-power", label: "Temporary access to a power", desc:"Temporarily gain access to a power from a discipline you already have. Temporary powers cannot be maintained in innate slots.", pp: 1, needsPower: true },
  { id: "improve-innate", label: "Improve innate power", desc:"Spend PP to improve the power of an innate slot. Each point gives +20 potential. Max 5.", pp: 1, needsPower: true },
];

export type PsychicPowerDef = {
  name: string;
  discipline: string;
  level: number;
  minimum: string;
  maintenance: boolean;
  isMatrix: boolean;
};

const powerIndex = new Map<string, PsychicPowerDef>();

function indexPowers(): void {
  if (powerIndex.size > 0) return;
  for (const [discipline, powers] of Object.entries(psychicDisciplines.disciplines)) {
    for (const [name, def] of Object.entries(powers)) {
      powerIndex.set(name, {
        name,
        discipline,
        level: def.Level,
        minimum: def.Minimum,
        maintenance: def.Maintenance,
        isMatrix: false,
      });
    }
  }
  for (const [name, def] of Object.entries(psychicDisciplines.matrix_powers)) {
    powerIndex.set(name, {
      name,
      discipline: MATRIX_DISCIPLINE,
      level: def.Level,
      minimum: def.Minimum,
      maintenance: def.Maintenance,
      isMatrix: true,
    });
  }
}

export function psychicPowerDef(name: string): PsychicPowerDef | undefined {
  indexPowers();
  return powerIndex.get(name);
}

export function allPsychicPowerNames(): string[] {
  indexPowers();
  return [...powerIndex.keys()].sort((a, b) => a.localeCompare(b));
}

export function psychicDisciplineNames(): string[] {
  return Object.keys(psychicDisciplines.disciplines).sort((a, b) => a.localeCompare(b));
}

export function powersInDiscipline(discipline: string): PsychicPowerDef[] {
  indexPowers();
  return [...powerIndex.values()]
    .filter((p) => p.discipline === discipline)
    .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
}

export function matrixPowerDefs(): PsychicPowerDef[] {
  return powersInDiscipline(MATRIX_DISCIPLINE);
}

export function globalPotentialBonusForTier(tier: number): number {
  if (tier <= 0) return 0;
  return GLOBAL_POTENTIAL_BONUSES[Math.min(tier, MAX_GLOBAL_POTENTIAL_TIER) - 1] ?? 0;
}

export function cumulativePPForTier(tier: number): number {
  if (tier <= 0) return 0;
  return GLOBAL_POTENTIAL_CUMULATIVE_PP[Math.min(tier, MAX_GLOBAL_POTENTIAL_TIER) - 1] ?? 0;
}

export function incrementalPPForNextTier(currentTier: number): number {
  if (currentTier >= MAX_GLOBAL_POTENTIAL_TIER) return 0;
  const next = currentTier + 1;
  return cumulativePPForTier(next) - cumulativePPForTier(currentTier);
}
