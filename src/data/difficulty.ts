export type DifficultyTier = {
  name: string;
  threshold: number;
};

/** Psychic/magic difficulty tiers in ascending threshold order. */
export const DIFFICULTY_TIERS: DifficultyTier[] = [
  { name: "Routine", threshold: 20 },
  { name: "Easy", threshold: 40 },
  { name: "Moderate", threshold: 80 },
  { name: "Difficult", threshold: 120 },
  { name: "Very Difficult", threshold: 140 },
  { name: "Absurd", threshold: 180 },
  { name: "Almost Impossible", threshold: 240 },
  { name: "Impossible", threshold: 280 },
  { name: "Inhuman", threshold: 320 },
  { name: "Zen", threshold: 440 },
];
