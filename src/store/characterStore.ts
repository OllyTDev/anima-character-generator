import { create } from "zustand";
import { deriveSheet } from "../engine/derived";
import { syncLevels } from "../engine/helpers";
import { repairInsufficientMkPurchase } from "../engine/martialKnowledge";
import {
  downloadCharacter,
  LEGACY_MIGRATION_NOTICE,
  loadFromLocalStorage,
  parseCharacterDocument,
  saveToLocalStorage,
  serializeCharacter,
} from "../persist/save";
import { createEmptyCharacter, type CharacterDocument } from "../schema/character";

export type WizardStep = "type" | "creature" | "essentials" | "basics" | "points" | "abilities" | "sheet";

type Store = {
  character: CharacterDocument;
  step: WizardStep;
  loadError: string | null;
  migrationNotice: string | null;
  setCharacter: (character: CharacterDocument) => void;
  patch: (updater: (character: CharacterDocument) => CharacterDocument) => void;
  setStep: (step: WizardStep) => void;
  reset: () => void;
  exportJson: () => string;
  importJson: (text: string) => void;
  download: () => void;
  dismissMigrationNotice: () => void;
};

function persist(character: CharacterDocument): CharacterDocument {
  const synced = repairInsufficientMkPurchase(syncLevels(character));
  if (typeof localStorage !== "undefined") saveToLocalStorage(synced);
  return synced;
}

function initialState(): Pick<Store, "character" | "migrationNotice"> {
  if (typeof localStorage === "undefined") {
    return { character: createEmptyCharacter(), migrationNotice: null };
  }
  const loaded = loadFromLocalStorage();
  if (!loaded) return { character: createEmptyCharacter(), migrationNotice: null };
  if (loaded.migrated) {
    saveToLocalStorage(loaded.character);
  }
  return {
    character: loaded.character,
    migrationNotice: loaded.migrated ? LEGACY_MIGRATION_NOTICE : null,
  };
}

export const useCharacterStore = create<Store>((set, get) => ({
  ...initialState(),
  step: "type",
  loadError: null,
  setCharacter: (character) => set({ character: persist(character), loadError: null }),
  patch: (updater) => set({ character: persist(updater(get().character)), loadError: null }),
  setStep: (step) => set({ step }),
  reset: () => set({ character: persist(createEmptyCharacter()), step: "type", loadError: null, migrationNotice: null }),
  exportJson: () => serializeCharacter(get().character),
  importJson: (text) => {
    try {
      const { character, migrated } = parseCharacterDocument(text);
      set({
        character: persist(character),
        loadError: null,
        migrationNotice: migrated ? LEGACY_MIGRATION_NOTICE : null,
        step: "abilities",
      });
    } catch (error) {
      set({ loadError: error instanceof Error ? error.message : "Invalid character JSON" });
    }
  },
  download: () => {
    downloadCharacter(get().character);
    set({ migrationNotice: null });
  },
  dismissMigrationNotice: () => set({ migrationNotice: null }),
}));

export function useSheet() {
  return deriveSheet(useCharacterStore((state) => state.character));
}
