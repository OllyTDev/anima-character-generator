export const levelModes = [
  { id: "xp", label: "XP" },
  { id: "milestone", label: "Milestone" },
] as const;

export type LevelMode = (typeof levelModes)[number]["id"];

export function levelModeLabel(mode: LevelMode): string {
  return levelModes.find((item) => item.id === mode)?.label ?? "XP";
}
