import type { DerivedSheet } from "./derived";

export type KiPoolDefinition = {
  id: string;
  label: string;
  max: number;
  perTurn: number;
};

export function kiPoolDefinitions(sheet: DerivedSheet): KiPoolDefinition[] {
  if (sheet.kiGenerationMode === "combined" && sheet.kiCombined) {
    return [
      {
        id: "combined",
        label: "Combined",
        max: sheet.kiCombined.max,
        perTurn: sheet.kiCombined.perTurn,
      },
    ];
  }
  return Object.entries(sheet.ki).map(([name, value]) => ({
    id: name,
    label: name,
    max: value.points,
    perTurn: value.accumulation,
  }));
}

export function emptyKiPools(definitions: KiPoolDefinition[]): Record<string, number> {
  return Object.fromEntries(definitions.map((def) => [def.id, 0]));
}

export function halfKiGeneration(perTurn: number): number {
  return Math.max(1, Math.floor(perTurn / 2));
}

export function addKiGeneration(
  pools: Record<string, number>,
  definitions: KiPoolDefinition[],
  mode: "full" | "half",
): Record<string, number> {
  const next = { ...pools };
  for (const def of definitions) {
    const gain = mode === "full" ? def.perTurn : halfKiGeneration(def.perTurn);
    next[def.id] = Math.min(def.max, (next[def.id] ?? 0) + gain);
  }
  return next;
}

export function totalKiInPools(pools: Record<string, number>, definitions: KiPoolDefinition[]): number {
  return definitions.reduce((sum, def) => sum + (pools[def.id] ?? 0), 0);
}

export function maxKiCapacity(definitions: KiPoolDefinition[]): number {
  return definitions.reduce((sum, def) => sum + def.max, 0);
}

export function clampKiPoolValue(value: number | null, max: number): number {
  if (value === null || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(max, Math.floor(value)));
}
