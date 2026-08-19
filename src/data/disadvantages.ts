import { tables } from "./tables";
import type { DisadvantageDef } from "./types";

export const disadvantages: Record<string, DisadvantageDef> = {
  "Action Requirement": {
    effect: "Effect not yet documented.", Category: "Magic", Benefit: 1, Options: [], Option_Title: "Enter the type of action required" },
  "Addiction or Serious Vice": {
    effect: "Effect not yet documented.", Benefit: 1, Options: [], Option_Title: "Enter an addiction or serious vice" },
  "Atrophied Limb": {
    effect: "-80 to anything using that limb",
    Benefit: 1,
    Options: ["Left leg", "Right leg", "Left arm", "Right arm"],
    Option_Title: "Select a limb",
  },
  "Bad Luck": {
    effect: "fumble range increases by +2", Benefit: 1 },
  Blind: {

    effect: "always blinded penalty", Benefit: 2 },
  "Code of Conduct": {
    effect: "Effect not yet documented.", Category: "Background", Benefit: 1 },
  Cowardice: {

    effect: "Effect not yet documented.", Benefit: 1 },
  Damned: {

    effect: "Effect not yet documented.", Benefit: [1, 2], Options: [], Option_Title: "Describe the effect" },
  Deafness: {

    effect: "cannot use any ability based on hearing", Benefit: 1 },
  Debts: {

    effect: "Effect not yet documented.", Category: "Background", Benefit: 1 },
  "Deduct Two Points from a Characteristic": {
    effect: "Effect not yet documented.",
    Benefit: 1,
    Options: [...tables.characteristics],
    Option_Title: "Select the characteristic to deduct from",
  },
  "Deep Sleeper": {
    effect: "-200 to perception checks, -40 all actions ten turns on waking", Benefit: 1 },
  "Dirty Little Secret": {
    effect: "Effect not yet documented.", Category: "Background", Benefit: 1 },
  "Easily Possessed": {
    effect: "-50 to PhR/MR against domination/possession attempts", Benefit: 1 },
  "Exclusive Weapon": {
    effect: "Effect not yet documented.", Benefit: 1, Options: [], Option_Title: "Which weapon?" },
  Exhausted: {

    effect: "reduce base fatigue by 1, double penalties", Benefit: 1 },
  Feeble: {

    effect: "-30 all action penalty when below 1/3 of total LP", Benefit: 1 },
  Insufferable: {

    effect: "Effect not yet documented.", Benefit: 1 },
  Klutzy: {

    effect: "Effect not yet documented.", Benefit: 1 },
  Nearsighted: {

    effect: "Effect not yet documented.", Benefit: 1 },
  "Magical Blockage": {
    effect: "cannot be comined with Slow Recovery.  character cannot regen zeon at all.", Category: "Magic", Benefit: 2 },
  "Magical Exhaustion": {
    effect: "1fatigue point lost per 100/200/300 potential of spell.", Category: "Magic", Benefit: 1 },
  "Magical Ties": {
    effect: "Effect not yet documented.", Category: "Magic", Benefit: 1 },
  Mute: {

    effect: "Effect not yet documented.", Benefit: 1 },
  "No Concentration": {
    effect: "no bonus for concentrating", Category: "Psychic", Benefit: 1 },
  "One Power at a Time": {
    effect: "Effect not yet documented.", Category: "Psychic", Benefit: 1 },
  "Oral Requirement": {
    effect: "Effect not yet documented.", Category: "Magic", Benefit: 1 },
  Pariah: {

    effect: "Effect not yet documented.", Category: "Background", Benefit: 1 },
  "Physical Weakness": {
    effect: "PhR reduced by half", Benefit: 1 },
  "Powerful Enemy": {
    effect: "Effect not yet documented.", Category: "Background", Benefit: [1, 2], Options: [], Option_Title: "Enter powerful enemy" },
  "Psychic Consumption": {
    effect: "lose LP equal to the fail amount", Category: "Psychic", Benefit: 2 },
  "Psychic Exhaustion": {
    effect: "doubles fatigue points indicated when using psychic", Category: "Psychic", Benefit: 1 },
  "Require Gestures": {
    effect: "Effect not yet documented.", Category: "Magic", Benefit: 1 },
  Rookie: {

    effect: "Effect not yet documented.", Benefit: 1 },
  "Serious Illness": {
    effect: "you will die. -10 all actions every month cumulative", Benefit: 2, Options: [], Option_Title: "Describe the illness" },
  "Severe Allergy": {
    effect: "Effect not yet documented.", Benefit: 1, Options: [], Option_Title: "Describe the allergy" },
  "Severe Phobia": {
    effect: "Effect not yet documented.", Benefit: 1, Options: [], Option_Title: "Describe the phobia" },
  Shamanism: {

    effect: "Effect not yet documented.", Category: "Magic", Benefit: 2 },
  Sickly: {

    effect: "Effect not yet documented.", Benefit: 1 },
  "Slow Healer": {
    effect: "heals received are 1/2 strength regardless of supernatural/natural", Benefit: 1 },
  "Slow Learner": {
    effect: "-4 or -8 penalty to xp per session", Benefit: [1, 2] },
  "Slow Reactions": {
    effect: "-30/-60 to initiative", Benefit: [1, 2] },
  "Slow Recovery of Magic": {
    effect: "zeon regen cut by 1/2", Category: "Magic", Benefit: 1 },
  "Susceptible to Magic": {
    effect: "MR reduced by 1/2", Benefit: 1 },
  "Susceptible to Poisons": {
    effect: "VR reduced by 1/2", Benefit: 1 },
  Unattractive: {

    effect: "reduce appearance by 2. Minimum 7", Benefit: 1 },
  Unfortunate: {

    effect: "why does it all have to be me?", Benefit: 1 },
  "Unlucky Destiny": {
    effect: "no open rolls", Benefit: 2 },
  "Vulnerable to Heat/Cold": {
    effect: "-80 resistance against chosen element -30 all actions in extreme climates", Benefit: 1, Options: ["Heat", "Cold"], Option_Title: "Select a vulnerability" },
  "Vulnerable to Pain": {
    effect: "doubles any pain penalty", Benefit: 1 },
  "Without any Natural Bonus": {
    effect: "no natural bonuses apply when levelling", Benefit: 1 },
};

export function disadvantageBenefits(name: string): number[] {
  const benefit = disadvantages[name].Benefit;
  return typeof benefit === "number" ? [benefit] : [...benefit];
}
