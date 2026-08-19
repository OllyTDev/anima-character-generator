import { tables } from "./tables";
import type { KiAbilityDef } from "./types";

export const kiAbilities: Record<string, KiAbilityDef> = {
  "Absorption of Energy": {
    effect: "Effect not yet documented.", MK: 30, OTMK: 30, Requirements: ["Use of Ki", "Presence Extrusion"] },
  "Age Control": {
    effect: "Effect not yet documented.", MK: 20, OTMK: 20, Requirements: ["Use of Ki", "Ki Control", "Physical Dominion"] },
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
    effect: "Effect not yet documented.",
    MK: 10,
    OTMK: 10,
    Requirements: ["Use of Ki", "Presence Extrusion", "Energy Armor", "Armor of Greater Energy"],
  },
  "Armor of Emptiness": {
    effect: "Effect not yet documented.", MK: 20, OTMK: 20, Requirements: ["Use of Nemesis"] },
  "Armor of Greater Energy": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki", "Presence Extrusion", "Energy Armor"] },
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
    effect: "Effect not yet documented.",
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
    effect: "Effect not yet documented.", MK: 50, OTMK: 50, Requirements: ["Use of Ki", "Ki Control"] },
  "Technique Pushing": {
    effect: "Effect not yet documented.", MK: 20, OTMK: 20, Requirements: ["Use of Ki"] },
  Undetectable: {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Nemesis"] },
  "Use of Ki": {
    effect: "Effect not yet documented.", MK: 40, OTMK: 0 },
  "Use of Necessary Energy": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki"] },
  "Use of Nemesis": {
    effect: "Effect not yet documented.", MK: 70, OTMK: 70 },
  "Weight Elimination": {
    effect: "Effect not yet documented.", MK: 10, OTMK: 10, Requirements: ["Use of Ki"] },
  Zen: {
    effect: "Effect not yet documented.", MK: 50, OTMK: 50, Requirements: ["Use of Ki", "Inhumanity"] },
  "Zen (Nemesis)": {
    effect: "Effect not yet documented.", MK: 40, OTMK: 40, Requirements: ["Use of Nemesis", "Inhuman (Nemesis)"] },
};

export function kiAbilityCost(name: string, ollyTRules: boolean): number {
  const ability = kiAbilities[name];
  return ollyTRules ? ability.OTMK : ability.MK;
}
