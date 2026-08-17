import { abilities, secondaryAbilitiesGrouped } from "../data/abilities";
import { tables } from "../data/tables";
import type { Characteristic } from "../data/types";
import { modifier } from "../engine/characteristics";
import type { CharacterDocument } from "../schema/character";
import { useEffect, useState } from "react";

type NaturalBonusDialogProps = {
  character: CharacterDocument;
  level: number;
  open: boolean;
  onClose: () => void;
  onSelect: (abilityName: string) => void;
};

export function NaturalBonusDialog({ character, level, open, onClose, onSelect }: NaturalBonusDialogProps) {
  const [showCharacteristics, setShowCharacteristics] = useState(false);

  useEffect(() => {
    if (open) setShowCharacteristics(false);
  }, [open]);

  if (!open) return null;

  const grouped = secondaryAbilitiesGrouped(character.settings.ollyTRules);

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog natural-bonus-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="natural-bonus-title"
        aria-modal="true"
      >
        <header className="dialog-header natural-bonus-dialog-header">
          <div className="natural-bonus-dialog-header-top">
            <h2 id="natural-bonus-title">Choose a natural bonus</h2>
            <label className="checkbox-label natural-bonus-toggle">
              <input
                type="checkbox"
                checked={showCharacteristics}
                onChange={(event) => setShowCharacteristics(event.target.checked)}
              />
              <span>Show characteristics</span>
            </label>
          </div>
          <p className="muted">Level {level}. Pick one secondary ability to improve at this level.</p>
        </header>
        <div className="natural-bonus-fields">
          {tables.fields.map((field) => {
            const items = grouped[field];
            if (!items.length) return null;
            return (
              <section key={field} className="natural-bonus-field">
                <h3>{field}</h3>
                <ul className="natural-bonus-list">
                  {items.map((item) => {
                    const bonus = modifier(character, item.characteristic as Characteristic, level);
                    const selected = character.levels[level - 1]?.naturalBonus === item.name;
                    const label = formatAbilityLabel(item.name, item.characteristic, bonus, showCharacteristics);
                    return (
                      <li key={item.name}>
                        {bonus <= 0 ? (
                          <span className="natural-bonus-item natural-bonus-item--disabled">{label}</span>
                        ) : (
                          <button
                            type="button"
                            className={`natural-bonus-item ${selected ? "natural-bonus-item--selected" : ""}`}
                            onClick={() => {
                              onSelect(item.name);
                              onClose();
                            }}
                          >
                            {label}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
        <footer className="dialog-footer">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          {character.levels[level - 1]?.naturalBonus ? (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                onSelect("");
                onClose();
              }}
            >
              Clear selection
            </button>
          ) : null}
        </footer>
      </div>
    </div>
  );
}

function formatAbilityLabel(name: string, characteristic: string, bonus: number, showCharacteristic: boolean): string {
  const bonusText = `(+${bonus})`;
  if (!showCharacteristic) return `${name} ${bonusText}`;
  return `${name} (${characteristic}) ${bonusText}`;
}

export function naturalBonusAmount(character: CharacterDocument, abilityName: string, level: number): number {
  const def = abilities[abilityName];
  if (!def?.Field) return 0;
  return modifier(character, def.Characteristic, level);
}
