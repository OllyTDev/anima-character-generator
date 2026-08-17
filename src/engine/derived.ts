import { abilities, secondaryAbilities } from "../data/abilities";
import { kiCharacteristics } from "../data/lists";
import { tables } from "../data/tables";
import type { Characteristic } from "../data/types";
import type { CharacterDocument } from "../schema/character";
import { ability } from "./ability";
import {
  appearance,
  characteristic,
  fatigue,
  lifePoints,
  racialAbilities,
  regeneration,
  size,
  sizeCategory,
  summary,
} from "./characteristics";
import { martialArtsAdvantages, unarmedAbility, unarmedDamage } from "./combat";
import { advantageSummary, cpRemaining, cpTotal, disadvantageSummary, disciplineAccess } from "./creationPoints";
import { dpRemaining } from "./developmentPoints";
import { characterLevel, hasGift, isHumanType, presence } from "./helpers";
import {
  ma,
  magicLevel,
  magicProjectionDefense,
  magicProjectionOffense,
  psychicPoints,
  psychicPowers,
  psychicProjectionDefense,
  psychicProjectionOffense,
  usesPsychic,
  usesZeon,
  zeon,
  zeonRecovery,
} from "./magic";
import {
  dominionTechniques,
  kiAccumulation,
  kiConcealment,
  kiDetection,
  kiPoints,
  listedKiAbilities,
  mkRemaining,
  mkTotals,
} from "./martialKnowledge";
import { initiative, movementValue } from "./movement";
import { armorType, damageBarrier, damageReduction, resistance, resistanceModifiers } from "./resistances";

export type DerivedSheet = ReturnType<typeof deriveSheet>;

export function deriveSheet(character: CharacterDocument) {
  const remaining = dpRemaining(character);
  const currentDp = remaining[remaining.length - 1];
  const mkLeft = mkRemaining(character);

  return {
    summary: summary(character),
    typeAndGnosis: typeAndGnosis(character),
    level: characterLevel(character),
    presence: presence(character),
    appearance: appearance(character),
    lifePoints: lifePoints(character),
    fatigue: fatigue(character),
    regeneration: regeneration(character),
    size: size(character),
    sizeCategory: sizeCategory(character),
    racialAbilities: racialAbilities(character),
    characteristics: Object.fromEntries(
      tables.characteristics.map((name) => [name, characteristic(character, name as Characteristic)]),
    ) as Record<Characteristic, number>,
    resistances: {
      PhR: resistance(character, "PhR"),
      MR: resistance(character, "MR"),
      PsR: resistance(character, "PsR"),
      VR: resistance(character, "VR"),
      DR: resistance(character, "DR"),
    },
    resistanceModifiers: resistanceModifiers(character),
    initiative: initiative(character),
    attack: ability(character, "Attack"),
    block: ability(character, "Block"),
    dodge: ability(character, "Dodge"),
    unarmedAttack: unarmedAbility(character, "Attack"),
    unarmedBlock: unarmedAbility(character, "Block"),
    unarmedDodge: unarmedAbility(character, "Dodge"),
    unarmedInitiative: unarmedAbility(character, "Initiative"),
    unarmedDamage: unarmedDamage(character),
    martialArtsAdvantages: martialArtsAdvantages(character),
    wearArmor: ability(character, "Wear Armor"),
    armor: {
      Cut: armorType(character, "Cut"),
      Impact: armorType(character, "Impact"),
      Thrust: armorType(character, "Thrust"),
      Heat: armorType(character, "Heat"),
      Electricity: armorType(character, "Electricity"),
      Energy: armorType(character, "Energy"),
    },
    damageBarrier: damageBarrier(character),
    damageReduction: damageReduction(character),
    movementValue: movementValue(character),
    summon: ability(character, "Summon"),
    control: ability(character, "Control"),
    bind: ability(character, "Bind"),
    banish: ability(character, "Banish"),
    usesZeon: usesZeon(character),
    hasGift: hasGift(character),
    zeon: zeon(character),
    ma: ma(character),
    zeonRecovery: zeonRecovery(character),
    magicProjectionOffense: magicProjectionOffense(character),
    magicProjectionDefense: magicProjectionDefense(character),
    magicLevel: magicLevel(character),
    usesPsychic: usesPsychic(character),
    psychicPoints: psychicPoints(character),
    psychicProjectionOffense: psychicProjectionOffense(character),
    psychicProjectionDefense: psychicProjectionDefense(character),
    psychicPowers: psychicPowers(character),
    disciplineAccess: disciplineAccess(character),
    ki: Object.fromEntries(
      kiCharacteristics.map((name) => [
        name,
        { points: kiPoints(character, name), accumulation: kiAccumulation(character, name) },
      ]),
    ),
    kiAbilities: listedKiAbilities(character),
    kiConcealment: kiConcealment(character),
    kiDetection: kiDetection(character),
    dominionTechniques: dominionTechniques(character),
    secondaries: secondaryAbilities(character.settings.ollyTRules).map((name) => ({
      name,
      field: abilities[name].Field!,
      score: ability(character, name),
    })),
    advantages: Object.keys(character.advantages).map((name) => advantageSummary(character, name)),
    disadvantages: Object.keys(character.disadvantages).map((name) => disadvantageSummary(character, name)),
    cp: {
      total: cpTotal(character),
      remaining: cpRemaining(character),
      common: cpRemaining(character, "Common"),
      background: cpRemaining(character, "Background"),
      magic: cpRemaining(character, "Magic"),
      psychic: cpRemaining(character, "Psychic"),
    },
    dp: currentDp,
    mk: {
      total: mkTotals(character).at(-1) ?? 0,
      remaining: mkLeft.at(-1) ?? 0,
    },
    isHuman: isHumanType(character),
  };
}

function typeAndGnosis(character: CharacterDocument): string {
  if (!character.type || character.type === "Human") return "";
  let result = character.type;
  if (character.element) result += ", Elemental";
  if (typeof character.gnosis === "number") result += ` ${character.gnosis}`;
  return result;
}
