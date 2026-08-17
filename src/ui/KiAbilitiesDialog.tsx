import { kiAbilityGroups, type KiAbilityOption } from "../engine/kiAbilityOptions";
import { addKiAbility } from "../engine/martialKnowledge";
import type { CharacterDocument } from "../schema/character";
import { useEffect, useMemo, useState } from "react";

type KiAbilitiesDialogProps = {
  character: CharacterDocument;
  level: number;
  mkRemaining: number;
  open: boolean;
  onClose: () => void;
  onLearn: (character: CharacterDocument) => void;
};

export function KiAbilitiesDialog({ character, level, mkRemaining, open, onClose, onLearn }: KiAbilitiesDialogProps) {
  const [selected, setSelected] = useState<KiAbilityOption | null>(null);
  const [option, setOption] = useState("");
  const grouped = useMemo(() => kiAbilityGroups(character), [character]);

  useEffect(() => {
    if (open) {
      setSelected(null);
      setOption("");
    }
  }, [open]);

  if (!open) return null;

  const confirmLearn = () => {
    if (!selected) return;
    onLearn(addKiAbility(character, selected.name, level, selected.options ? option : undefined));
    onClose();
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog spend-dp-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="ki-abilities-title"
        aria-modal="true"
      >
        <header className="dialog-header natural-bonus-dialog-header">
          <div className="natural-bonus-dialog-header-top">
            <h2 id="ki-abilities-title">Ki abilities</h2>
          </div>
          <p className="muted">
            Level {level}. MK remaining {mkRemaining}. Select a Ki or Nemesis ability to learn.
          </p>
        </header>

        <div className="natural-bonus-fields spend-dp-fields">
          {Object.entries(grouped).map(([group, items]) => {
            if (!items.length) return null;
            return (
              <section key={group} className="natural-bonus-field">
                <h3>{group}</h3>
                <ul className="natural-bonus-list">
                  {items.map((item) => (
                    <li key={item.name}>
                      <button
                        type="button"
                        className={`natural-bonus-item ${selected?.name === item.name ? "natural-bonus-item--selected" : ""}`}
                        onClick={() => {
                          setSelected(item);
                          setOption(item.options?.[0] ?? "");
                        }}
                      >
                        {item.name} ({item.cost} MK)
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <footer className="dialog-footer spend-dp-footer">
          {!selected ? (
            <p className="muted spend-dp-hint">Select a Ki ability above to learn.</p>
          ) : (
            <div className="spend-dp-confirm">
              <p>
                Learn <strong>{selected.name}</strong> ({selected.cost} MK)
                {selected.optionTitle ? <span className="muted"> — {selected.optionTitle}</span> : null}
              </p>
              {selected.options ? (
                <label>
                  {selected.optionTitle ?? "Option"}
                  <select value={option} onChange={(event) => setOption(event.target.value)}>
                    {selected.options.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <button type="button" onClick={confirmLearn}>
                Learn Ki ability
              </button>
            </div>
          )}
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
}
