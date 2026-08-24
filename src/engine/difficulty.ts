import { DIFFICULTY_TIERS } from "../data/difficulty";

export type PotentialDifficulty = {
  basePotential: number;
  roundedPotential: number;
  tierName: string | null;
};

/** Round potential down to the highest difficulty threshold it reaches. */
export function potentialToDifficulty(potential: number): PotentialDifficulty {
  let tierName: string | null = null;
  let roundedPotential = 0;

  for (const tier of DIFFICULTY_TIERS) {
    if (potential >= tier.threshold) {
      tierName = tier.name;
      roundedPotential = tier.threshold;
    } else {
      break;
    }
  }

  return { basePotential: potential, roundedPotential, tierName };
}
