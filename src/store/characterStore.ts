import { create } from "zustand";
import { deriveSheet } from "../engine/derived";
import { syncLevels } from "../engine/helpers";
import {
  downloadCharacter,
  loadFromLocalStorage,
  parseCharacter,
  saveToLocalStorage,
  serializeCharacter,
} from "../persist/save";
import { createEmptyCharacter, type CharacterDocument } from "../schema/character";

export type WizardStep = "type" | "creature" | "essentials" | "basics" | "points" | "abilities" | "sheet";

type Store = {
  character: CharacterDocument;
  step: WizardStep;
  loadError: string | null;
  setCharacter: (character: CharacterDocument) => void;
  patch: (updater: (character: CharacterDocument) => CharacterDocument) => void;
  setStep: (step: WizardStep) => void;
  reset: () => void;
  exportJson: () => string;
  importJson: (text: string) => void;
  download: () => void;
};

function persist(character: CharacterDocument): CharacterDocument {
  const synced = syncLevels(character);
  if (typeof localStorage !== "undefined") saveToLocalStorage(synced);
  return synced;
}

function initialCharacter(): CharacterDocument {
  if (typeof localStorage === "undefined") return createEmptyCharacter();
  return loadFromLocalStorage() ?? createEmptyCharacter();
}

export const useCharacterStore = create<Store>((set, get) => ({
  character: initialCharacter(),
  step: "type",
  loadError: null,
  setCharacter: (character) => set({ character: persist(character), loadError: null }),
  patch: (updater) => set({ character: persist(updater(get().character)), loadError: null }),
  setStep: (step) => set({ step }),
  reset: () => set({ character: persist(createEmptyCharacter()), step: "type", loadError: null }),
  exportJson: () => serializeCharacter(get().character),
  importJson: (text) => {
    try {
      const character = parseCharacter(text);
      set({ character: persist(character), loadError: null, step: "abilities" });
    } catch (error) {
      set({ loadError: error instanceof Error ? error.message : "Invalid character JSON" });
    }
  },
  download: () => downloadCharacter(get().character),
}));

export function useSheet() {
  return deriveSheet(useCharacterStore((state) => state.character));
}
