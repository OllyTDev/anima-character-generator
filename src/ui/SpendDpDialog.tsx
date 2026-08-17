import {
  buildSpendTabs,
  martialArtDegrees,
  spendTabIds,
  type SpendOption,
  type SpendTabId,
} from "../engine/spendOptions";
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
  const [activeTab, setActiveTab] = useState<SpendTabId>("Combat");
  const [selected, setSelected] = useState<SpendOption | null>(null);
  const [amount, setAmount] = useState(10);
  const tabs = useMemo(() => buildSpendTabs(character, className), [character, className]);

  useEffect(() => {
    if (open) {
      setActiveTab("Combat");
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

  const selectOption = (item: SpendOption) => {
    setSelected(item);
    if (item.kind === "dp") setAmount(item.cost);
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
          <p className="muted">Level {level} ({className}). Choose a category, then select what to buy.</p>
        </header>

        <nav className="spend-dp-tabs" role="tablist" aria-label="DP categories">
          {spendTabIds.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => {
                setActiveTab(tab);
                setSelected(null);
              }}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="spend-dp-fields spend-dp-tab-panel" role="tabpanel">
          {tabs[activeTab].map((spendSection) => (
            <section key={spendSection.id} className="spend-dp-section">
              <h3>{spendSection.label}</h3>
              <table className="spend-dp-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {spendSection.items.map((item) => {
                    const isSelected = selected?.name === item.name && selected.kind === item.kind;
                    return (
                      <tr
                        key={`${item.kind}-${item.name}`}
                        className={isSelected ? "spend-dp-row--selected" : ""}
                        onClick={() => selectOption(item)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            selectOption(item);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-pressed={isSelected}
                      >
                        <td>{item.name}</td>
                        <td>
                          {item.cost} {item.unit}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          ))}
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
