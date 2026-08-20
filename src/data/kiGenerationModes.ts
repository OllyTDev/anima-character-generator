export const kiGenerationModes = [
  { id: "separated", label: "Separated" },
  { id: "combined", label: "Combined" },
] as const;

export type KiGenerationMode = (typeof kiGenerationModes)[number]["id"];

export const KI_GENERATION_MODE_EXPLANATION =
  "Ki accumulation is normally handled with each stat being its own pool. Combined means your pool becomes one big pool for generation and simplification.";

export function kiGenerationModeLabel(mode: KiGenerationMode): string {
  return kiGenerationModes.find((item) => item.id === mode)?.label ?? "Separated";
}
