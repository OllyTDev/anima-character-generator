import { kiAbilities, kiAbilityCost } from "../data/kiAbilities";
import type { CharacterDocument } from "../schema/character";

export type KiAbilityOption = {
  name: string;
  cost: number;
  optionTitle?: string;
  options?: readonly string[];
};

export function buildKiAbilityOptions(character: CharacterDocument): KiAbilityOption[] {
  return Object.keys(kiAbilities)
    .map((name) => ({
      name,
      cost: kiAbilityCost(name, character.settings.ollyTRules),
      optionTitle: kiAbilities[name].Option_Title,
      options: kiAbilities[name].Options,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function kiAbilityGroups(character: CharacterDocument): Record<string, KiAbilityOption[]> {
  const options = buildKiAbilityOptions(character);
  const coreNames = new Set(["Use of Ki", "Use of Nemesis", "Use of Necessary Energy"]);
  const core = options.filter((item) => coreNames.has(item.name));
  const nemesis = options.filter(
    (item) =>
      !coreNames.has(item.name) &&
      (item.name.includes("Nemesis") ||
        kiAbilities[item.name].Requirements?.some((req) => req.includes("Nemesis"))),
  );
  const ki = options.filter((item) => !coreNames.has(item.name) && !nemesis.some((entry) => entry.name === item.name));
  return { Core: core, Ki: ki, Nemesis: nemesis };
}
