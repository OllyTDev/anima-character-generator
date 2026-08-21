import { tables } from "./tables";
import type { KiAbilityDef } from "./types";

export const kiAbilities: Record<string, KiAbilityDef> = {
  "Absorption of Energy": {
    effect: "Use your inner energy to absorb supernatural power. Instead of losing Life Points when suffering supernatual or energy damage, you may spend Ki at a rate of 1 generic point for each 5 damage recieved. Does not work against damage inflicted following a resistance check.", MK: 30, OTMK: 30, Requirements: ["Use of Ki", "Presence Extrusion"] },
  "Age Control": {
    effect: "Influence the effects of time on the body, slowing its effects. Increase the life expectancy of the user by thee or four times. Reduces any physical penalty caused by aging by half.", MK: 20, OTMK: 20, Requirements: ["Use of Ki", "Ki Control", "Physical Dominion"] },
  "Arcane Magnitude": {
    effect: "Effect not yet documented.",
    MK: 40,
    OTMK: 40,
    Requirements: ["Use of Ki", "Ki Control", "Physical Dominion", "Multiplication of Bodies", "Magnitude"],
  },
  "Arcane Multiplication of Bodies": {
    effect: "Effect not yet documented.",
    MK: 40,
    OTMK: 40,
    Requirements: ["Use of Ki", "Ki Control", "Physical Dominion", "Multiplication of Bodies", "Greater Multiplication of Bodies"],
  },
  "Armor of Arcane Energy": {
    effect: "Gain an Energy AT of 4 without a maintenance cost. This effect can be increased up to an AT of 6 at the cost of 1 Ki point every 5 turns. This does not impact Initiative calculation.",
    MK: 10,
    OTMK: 10,
    Requirements: ["Use of Ki", "Presence Extrusion", "Energy Armor", "Armor of Greater Energy"],
  },
  "Armor of Emptiness": {
    effect: "Gain a barrier of emptiness that reduces any incoming attack's base damage by 10.", MK: 20, OTMK: 20, Requirements: ["Use of Nemesis"] },
  "Armor of Greater Energy": {
    effect: "Gain an Energy AT of 4 without at the cost of 1 generic Ki point every 5 turn. This does not impact Initiative calculation.", MK: 10, OTMK: 10, Requirements: ["Use of Ki", "Presence Extrusion", "Energy Armor"] },
  "Aura Extension": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki", "Presence Extrusion"] },
  "Aura of Concealment": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki", "Use of Necessary Energy", "Ki Concealment"] },
  "Aura of Emptiness": {
    effect: "Effect not yet documented.", MK: 30, OTMK: 30, Requirements: ["Use of Nemesis"] },
  "Binding Cancellation": {
    effect: "Effect not yet documented.", MK: 30, OTMK: 30, Requirements: ["Use of Nemesis"] },
  "Body of Emptiness": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Nemesis"] },
  "Characteristic Augmentation": {
    effect: "Effect not yet documented.", MK: 20, OTMK: 20, Requirements: ["Use of Ki", "Use of Necessary Energy"] },
  "Combat Aura": {
    effect: "Effect not yet documented.", MK: 40, OTMK: 40, Requirements: ["Use of Ki", "Ki Control"] },
  "Destruction By Ki": {
    effect: "Effect not yet documented.", MK: 20, OTMK: 20, Requirements: ["Use of Ki", "Presence Extrusion"] },
  "Elemental Attack": {
    effect: "Effect not yet documented.",
    MK: 10,
    OTMK: 10,
    Requirements: ["Use of Ki", "Presence Extrusion", "Aura Extension"],
    Options: [...tables.elements],
    Option_Title: "Select an element",
  },
  "Elemental Immunity: Cold": {
    effect: "Effect not yet documented.",
    MK: 20,
    OTMK: 20,
    Requirements: ["Use of Ki", "Use of Necessary Energy", "Elimination of Necessities"],
  },
  "Elemental Immunity: Electricity": {
    effect: "Effect not yet documented.",
    MK: 20,
    OTMK: 20,
    Requirements: ["Use of Ki", "Use of Necessary Energy", "Elimination of Necessities"],
  },
  "Elemental Immunity: Fire": {
    effect: "This ability confers an innate resistance to against an equivalent of five intensities of fire, although they can increase that value by investing a generic Ki point for each intensity greater than five that the source of heat has. That is to say, to be immune to flames equivalent to 15 intensities, a character would have to spend 10 Kipoints. The increased cost must be maintained each turn. Anyone naturally vulnerable to heat or fire cannot choose this ability.",
    MK: 20,
    OTMK: 20,
    Requirements: ["Use of Ki", "Use of Necessary Energy", "Elimination of Necessities"],
  },
  "Elimination of Necessities": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki", "Use of Necessary Energy"] },
  "Emptiness Extrusion": {
    effect: "Effect not yet documented.", MK: 30, OTMK: 30, Requirements: ["Use of Nemesis"] },
  "Energy Armor": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki", "Presence Extrusion"] },
  Erudition: {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki", "Ki Control", "Ki Detection"] },
  "Essence of Emptiness": {
    effect: "Effect not yet documented.", MK: 20, OTMK: 20, Requirements: ["Use of Nemesis", "Body of Emptiness"] },
  "False Death": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki", "Use of Necessary Energy", "Ki Concealment"] },
  Flight: {
    effect: "Effect not yet documented.", MK: 20, OTMK: 20, Requirements: ["Use of Ki", "Weight Elimination", "Levitation"] },
  "Form of Emptiness": {
    effect: "Effect not yet documented.", MK: 30, OTMK: 30, Requirements: ["Use of Nemesis", "Body of Emptiness", "Emptiness Extrusion"] },
  "Greater Ki Cancellation": {
    effect: "Effect not yet documented.", MK: 20, OTMK: 20, Requirements: ["Use of Nemesis", "Ki Cancellation"] },
  "Greater Magic Cancellation": {
    effect: "Effect not yet documented.", MK: 20, OTMK: 20, Requirements: ["Use of Nemesis", "Magic Cancellation"] },
  "Greater Matrices Cancellation": {
    effect: "Effect not yet documented.", MK: 20, OTMK: 20, Requirements: ["Use of Nemesis", "Matrices Cancellation"] },
  "Greater Multiplication of Bodies": {
    effect: "Effect not yet documented.",
    MK: 30,
    OTMK: 30,
    Requirements: ["Use of Ki", "Ki Control", "Physical Dominion", "Multiplication of Bodies"],
  },
  "Improvised Combat Techniques": {
    effect: "Effect not yet documented.", MK: 50, OTMK: 50, Requirements: ["Use of Ki"] },
  "Increased Damage": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki", "Presence Extrusion", "Aura Extension"] },
  "Increased Reach": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki", "Presence Extrusion", "Aura Extension"] },
  "Increased Speed": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki", "Presence Extrusion", "Aura Extension"] },
  "Inhuman (Nemesis)": {
    effect: "Effect not yet documented.", MK: 20, OTMK: 20, Requirements: ["Use of Nemesis"] },
  Inhumanity: {
    effect: "Effect not yet documented.", MK: 30, OTMK: 30, Requirements: ["Use of Ki"] },
  "Ki Cancellation": {
    effect: "Effect not yet documented.", MK: 30, OTMK: 30, Requirements: ["Use of Nemesis"] },
  "Ki Concealment": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki", "Use of Necessary Energy"] },
  "Ki Control": {
    effect: "Effect not yet documented.", MK: 30, OTMK: 30, Requirements: ["Use of Ki"] },
  "Ki Detection": {
    effect: "Effect not yet documented.", MK: 20, OTMK: 20, Requirements: ["Use of Ki", "Ki Control"] },
  "Ki Healing": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki", "Ki Transmission"] },
  "Ki Transmission": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki"] },
  Levitation: {
    effect: "Effect not yet documented.", MK: 20, OTMK: 20, Requirements: ["Use of Ki", "Weight Elimination"] },
  "Life Sacrifice": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki", "Ki Transmission"] },
  "Magic Cancellation": {
    effect: "Effect not yet documented.", MK: 30, OTMK: 30, Requirements: ["Use of Nemesis"] },
  Magnitude: {
    effect: "Effect not yet documented.", MK: 30, OTMK: 30, Requirements: ["Use of Ki", "Ki Control", "Physical Dominion", "Multiplication of Bodies"] },
  "Mass Movement": {
    effect: "Effect not yet documented.", MK: 20, OTMK: 20, Requirements: ["Use of Ki", "Weight Elimination", "Levitation", "Object Motion"] },
  "Matrices Cancellation": {
    effect: "Effect not yet documented.", MK: 30, OTMK: 30, Requirements: ["Use of Nemesis"] },
  "Movement of Emptiness": {
    effect: "Effect not yet documented.", MK: 20, OTMK: 20, Requirements: ["Use of Nemesis", "Body of Emptiness"] },
  "Multiplication of Bodies": {
    effect: "Effect not yet documented.", MK: 30, OTMK: 30, Requirements: ["Use of Ki", "Ki Control", "Physical Dominion"] },
  "No Needs": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Nemesis", "Body of Emptiness"] },
  Noht: {
    effect: "Effect not yet documented.", MK: 30, OTMK: 30, Requirements: ["Use of Nemesis"] },
  "Object Motion": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki", "Weight Elimination", "Levitation"] },
  "One with the Nothing": {
    effect: "Effect not yet documented.", MK: 40, OTMK: 40, Requirements: ["Use of Nemesis", "Body of Emptiness"] },
  "Penalty Reduction": {
    effect: "Effect not yet documented.", MK: 20, OTMK: 20, Requirements: ["Use of Ki", "Use of Necessary Energy"] },
  "Physical Change": {
    effect: "Effect not yet documented.", MK: 30, OTMK: 30, Requirements: ["Use of Ki", "Ki Control", "Physical Dominion"] },
  "Physical Dominion": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki", "Ki Control"] },
  "Physical Shield": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki", "Presence Extrusion"] },
  "Presence Extrusion": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki"] },
  Recovery: {
    effect: "Effect not yet documented.", MK: 20, OTMK: 20, Requirements: ["Use of Ki", "Use of Necessary Energy", "Penalty Reduction"] },
  "Restore Others": {
    effect: "Effect not yet documented.",
    MK: 10,
    OTMK: 10,
    Requirements: ["Use of Ki", "Use of Necessary Energy", "Penalty Reduction", "Recovery"],
  },
  Stabilize: {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki", "Ki Transmission", "Ki Healing"] },
  "Superior Change": {
    effect: "Effect not yet documented.", MK: 20, OTMK: 20, Requirements: ["Use of Ki", "Ki Control", "Physical Dominion", "Physical Change"] },
  "Superior Characteristic Augmentation": {
    effect: "Effect not yet documented.",
    MK: 20,
    OTMK: 20,
    Requirements: ["Use of Ki", "Use of Necessary Energy", "Characteristic Augmentation"],
  },
  "Superior Healing": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki", "Ki Transmission", "Ki Healing"] },
  "Technique Imitation": {
    effect: "After whitnessing or experiening a Technique, the character gains the ability to learn it if they have sufficient free MK to spend at that moment. The Technique is at a reduced cost (10 MK for level 1, 20 MK at level 2, 30 MK for level 3) and do not contribute to the ability to develop higher level techniques.", MK: 50, OTMK: 50, Requirements: ["Use of Ki", "Ki Control"] },
  "Technique Pushing": {
    effect: "Enhance your Ki Techniques with greater Ki investment. At the cost of double the required Ki accumulation, Techniques gain 50% greater effectiveness rounded down (e.g a +50 becomes a +75, limited attack 5 becomes limited attack 7). Does not apply to maintained effects.", MK: 20, OTMK: 20, Requirements: ["Use of Ki"] },
  Undetectable: {
    effect: "Through Emptiness, cover your presence and become extremely difficult to percieve through supernatural means. Gain double your presence to MR and PSR against detection effects, and Ki Detection tests to find you suffer a penalty equal to double your presence.", MK: 10, OTMK: 10, Requirements: ["Use of Nemesis"] },
  "Use of Ki": {
    effect: "Foundation of Ki, allowing a character to awaken their inner energy and use it subconsiously. This ability is a prerequisite to all other Ki abilities", MK: 40, OTMK: 0 },
  "Use of Necessary Energy": {
    effect: "This ability allows the user to run or carry out sustained effort for days without suffering exhaustion, multiplying the required action before suffering the loss of a Fatigue point by a factor of 10. Additionally, you gain the ability to spend a maximum of 5 Fatigue points on an action, rather than the conventional 2.", MK: 10, OTMK: 10, Requirements: ["Use of Ki"] },
  "Use of Nemesis": {
    effect: "Foundation of Nemesis, allowing a character to utilize existential emptiness. This ability is a prerequisite to all other Nemesis abilities.", MK: 70, OTMK: 70 },
  "Weight Elimination": {
    effect: "While using this ability, gain the ability to run on walls, or even water. You can move across any surface at their full movement speed. This effect may be extended at the cost of 1 generic Ki point every round..", MK: 10, OTMK: 10, Requirements: ["Use of Ki"] },
  Zen: {
    effect: "Effect not yet documented.", MK: 50, OTMK: 50, Requirements: ["Use of Ki", "Inhumanity"] },
  "Zen (Nemesis)": {
    effect: "", MK: 40, OTMK: 40, Requirements: ["Use of Nemesis", "Inhuman (Nemesis)"] },
};

export function kiAbilityCost(name: string, ollyTRules: boolean): number {
  const ability = kiAbilities[name];
  return ollyTRules ? ability.OTMK : ability.MK;
}
