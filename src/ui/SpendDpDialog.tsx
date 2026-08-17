import { buildSpendOptions, martialArtDegrees, spendCategories, type SpendOption } from "../engine/spendOptions";
import { combatModules } from "../data/combatModules";
import { dpCost, spendDp } from "../engine/developmentPoints";
import type { CharacterDocument } from "../schema/character";
import { useEffect, useMemo, useState } from "react";

type SpendDpDialogProps = {
  character: CharacterDocument;
  level: number;
  className: string;
  open: boolean;
  onClose: () => void;
  onSpend: (character: CharacterDocument) => void;
};

export function SpendDpDialog({ character, level, className, open, onClose, onSpend }: SpendDpDialogProps) {
  const [selected, setSelected] = useState<SpendOption | null>(null);
  const [amount, setAmount] = useState(10);
  const grouped = useMemo(() => buildSpendOptions(character, className), [character, className]);

  useEffect(() => {
    if (open) {
      setSelected(null);
      setAmount(10);
    }
  }, [open]);

  if (!open) return null;

  const applySpend = (next: CharacterDocument) => {
    onSpend(next);
    onClose();
  };

  const confirmSimpleSpend = () => {
    if (!selected) return;
    if (selected.kind === "dp") {
      applySpend(spendDp(character, level || 1, selected.name, amount));
      return;
    }
    if (selected.kind === "module") {
      const module = combatModules[selected.name];
      applySpend(spendDp(character, level || 1, selected.name, module.Option_Title ? ["Any"] : 1));
    }
  };

  const confirmMartialDegree = (degree: string) => {
    if (!selected || selected.kind !== "martial-art") return;
    applySpend(spendDp(character, level || 1, selected.name, [degree]));
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog spend-dp-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="spend-dp-title"
        aria-modal="true"
      >
        <header className="dialog-header natural-bonus-dialog-header">
          <div className="natural-bonus-dialog-header-top">
            <h2 id="spend-dp-title">Spend development points</h2>
          </div>
          <p className="muted">Level {level} ({className}). Select an ability, module, or martial art.</p>
        </header>

        <div className="natural-bonus-fields spend-dp-fields">
          {spendCategories.map((category) => {
            const items = grouped[category];
            if (!items.length) return null;
            return (
              <section key={category} className="natural-bonus-field">
                <h3>{category}</h3>
                <ul className="natural-bonus-list">
                  {items.map((item) => (
                    <li key={`${item.kind}-${item.name}`}>
                      <button
                        type="button"
                        className={`natural-bonus-item ${selected?.name === item.name && selected.kind === item.kind ? "natural-bonus-item--selected" : ""}`}
                        onClick={() => {
                          setSelected(item);
                          if (item.kind === "dp") setAmount(item.cost);
                        }}
                      >
                        {item.name} ({item.cost} {item.unit})
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
            <p className="muted spend-dp-hint">Select an option above to spend.</p>
          ) : selected.kind === "dp" ? (
            <div className="spend-dp-confirm">
              <label>
                {selected.name} — {selected.cost} DP each
                <input
                  type="number"
                  min={selected.cost}
                  step={selected.cost}
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value))}
                />
              </label>
              <button type="button" onClick={confirmSimpleSpend}>
                Spend {amount} DP on {selected.name}
              </button>
            </div>
          ) : selected.kind === "module" ? (
            <div className="spend-dp-confirm">
              <p>
                Add <strong>{selected.name}</strong> ({selected.cost} DP)
                {selected.detail ? <span className="muted"> — {selected.detail}</span> : null}
              </p>
              <button type="button" onClick={confirmSimpleSpend}>
                Add module
              </button>
            </div>
          ) : selected.kind === "martial-art" ? (
            <div className="spend-dp-confirm">
              <p>
                Learn <strong>{selected.name}</strong>
              </p>
              <div className="spend-dp-degrees">
                {martialArtDegrees(selected.name).map((degree) => (
                  <button key={degree} type="button" onClick={() => confirmMartialDegree(degree)}>
                    {degree} ({dpCost(character, selected.name, className, degree)} DP)
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
}
