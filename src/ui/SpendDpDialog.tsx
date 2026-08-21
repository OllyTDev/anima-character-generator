import {
  buildSpendTabs,
  findSpendOption,
  martialArtDegrees,
  spendTabIds,
  type SpendOption,
  type SpendTabId,
} from "../engine/spendOptions";
import { combatModules } from "../data/combatModules";
import {
  dpCost,
  dpRemainingForLevel,
  dpRemainingForLevelExcluding,
  dpSpentForPurchase,
  maxAffordableDpSpend,
  maxDpForPurchase,
  spendDp,
  unitsFromDpSpend,
} from "../engine/developmentPoints";
import type { CharacterDocument } from "../schema/character";
import { useEffect, useMemo, useState } from "react";
import { DialogBackdrop } from "./DialogBackdrop";
import { NumberInput } from "./NumberInput";

type SpendDpEdit = {
  name: string;
  value: unknown;
};

type SpendDpDialogProps = {
  character: CharacterDocument;
  level: number;
  className: string;
  open: boolean;
  editPurchase?: SpendDpEdit | null;
  onClose: () => void;
  onSpend: (character: CharacterDocument) => void;
};

function categoryRemainingLabel(tab: SpendTabId, remaining: Record<string, number>): string {
  const value = Math.floor(remaining[tab] ?? 0);
  return `${tab} ${value}`;
}

function isValidDpSpend(dpToSpend: number | null, unitCost: number, maxDp: number): boolean {
  if (dpToSpend === null || dpToSpend < unitCost || dpToSpend > maxDp) return false;
  return dpToSpend % unitCost === 0;
}

export function SpendDpDialog({
  character,
  level,
  className,
  open,
  editPurchase = null,
  onClose,
  onSpend,
}: SpendDpDialogProps) {
  const [activeTab, setActiveTab] = useState<SpendTabId>("Combat");
  const [selected, setSelected] = useState<SpendOption | null>(null);
  const [dpToSpend, setDpToSpend] = useState<number | null>(null);
  const tabs = useMemo(() => buildSpendTabs(character, className), [character, className]);
  const editingName = editPurchase?.name ?? null;
  const usesEditBudget = editingName !== null && selected?.name === editingName;
  const levelRemaining = useMemo(() => {
    if (usesEditBudget) {
      return dpRemainingForLevelExcluding(character, level, editingName);
    }
    return dpRemainingForLevel(character, level);
  }, [character, level, editingName, usesEditBudget]);

  useEffect(() => {
    if (!open) return;
    if (editPurchase) {
      const found = findSpendOption(tabs, editPurchase.name);
      if (found) {
        setActiveTab(found.tab);
        setSelected(found.option);
        if (found.option.kind === "dp") {
          setDpToSpend(dpSpentForPurchase(character, editPurchase.name, editPurchase.value, className));
        } else {
          setDpToSpend(null);
        }
        return;
      }
    }
    setActiveTab("Combat");
    setSelected(null);
    setDpToSpend(null);
  }, [open, editPurchase, tabs, character, className]);

  if (!open) return null;

  const isEditing = editPurchase !== null;
  const totalRemaining = Math.floor(levelRemaining.Total ?? 0);
  const tabRemaining = Math.floor(levelRemaining[activeTab] ?? 0);
  const selectedMaxDp = selected ? maxDpForPurchase(levelRemaining, selected.name) : 0;
  const selectedMaxAffordable =
    selected?.kind === "dp" ? maxAffordableDpSpend(selectedMaxDp, selected.cost) : 0;
  const canAffordSelected =
    selected !== null &&
    (selected.kind === "dp"
      ? isValidDpSpend(dpToSpend, selected.cost, selectedMaxDp)
      : selected.cost <= selectedMaxDp);

  const applySpend = (next: CharacterDocument) => {
    onSpend(next);
    onClose();
  };

  const confirmSimpleSpend = () => {
    if (!selected || !canAffordSelected) return;
    if (selected.kind === "dp") {
      const units = unitsFromDpSpend(dpToSpend!, selected.cost);
      applySpend(spendDp(character, level || 1, selected.name, units));
      return;
    }
    if (selected.kind === "module") {
      const module = combatModules[selected.name];
      applySpend(spendDp(character, level || 1, selected.name, module.Option_Title ? [""] : 1));
    }
  };

  const confirmMartialDegree = (degree: string) => {
    if (!selected || selected.kind !== "martial-art") return;
    const cost = dpCost(character, selected.name, className, degree);
    if (cost > maxDpForPurchase(levelRemaining, selected.name)) return;
    applySpend(spendDp(character, level || 1, selected.name, [degree]));
  };

  const selectOption = (item: SpendOption) => {
    setSelected(item);
    if (item.kind === "dp") setDpToSpend(item.cost);
  };

  return (
    <DialogBackdrop onDismiss={onClose}>
      <div
        className="dialog spend-dp-dialog"
        role="dialog"
        aria-labelledby="spend-dp-title"
        aria-modal="true"
      >
        <header className="dialog-header natural-bonus-dialog-header">
          <div className="natural-bonus-dialog-header-top">
            <h2 id="spend-dp-title">
              {isEditing ? `Edit ${editPurchase.name}` : "Spend development points"}
            </h2>
          </div>
          <p className="muted">
            Level {level} ({className}). Total DP remaining {totalRemaining} (
            {spendTabIds.map((tab) => categoryRemainingLabel(tab, levelRemaining)).join(", ")}).
            {usesEditBudget ? " Current spend on this purchase is excluded from the totals above." : null}
          </p>
        </header>

        {!isEditing ? (
          <>
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
                    setDpToSpend(null);
                  }}
                >
                  {tab} ({Math.floor(levelRemaining[tab] ?? 0)})
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
                        const itemMaxDp = maxDpForPurchase(levelRemaining, item.name);
                        const affordable = itemMaxDp >= item.cost;
                        return (
                          <tr
                            key={`${item.kind}-${item.name}`}
                            className={`${isSelected ? "spend-dp-row--selected" : ""}${affordable ? "" : " spend-dp-row--disabled"}`}
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
                            <td data-label="Name">{item.name}</td>
                            <td data-label="Cost">
                              {item.cost} {item.unit}
                              {!affordable ? <span className="muted"> — insufficient DP</span> : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </section>
              ))}
            </div>
          </>
        ) : null}

        <footer className="dialog-footer spend-dp-footer">
          {!selected ? (
            <p className="muted spend-dp-hint">
              {activeTab} DP remaining: {tabRemaining}. Select an option above to spend.
            </p>
          ) : selected.kind === "dp" ? (
            <div className="spend-dp-confirm">
              <p className="muted">
                Up to {selectedMaxAffordable} DP available for {selected.name} ({selected.cost} DP per point).
              </p>
              <label>
                DP to spend
                <NumberInput
                  min={selected.cost}
                  max={selectedMaxAffordable || undefined}
                  step={selected.cost}
                  value={dpToSpend}
                  onChange={setDpToSpend}
                />
              </label>
              {dpToSpend !== null && dpToSpend > selectedMaxDp ? (
                <p className="ki-tree-footer-warning">
                  Not enough DP. You entered {dpToSpend} DP but only {selectedMaxDp} DP are available.
                </p>
              ) : dpToSpend !== null && dpToSpend % selected.cost !== 0 ? (
                <p className="ki-tree-footer-warning">
                  Spend must be in increments of {selected.cost} DP.
                </p>
              ) : null}
              <button type="button" disabled={!canAffordSelected} onClick={confirmSimpleSpend}>
                {isEditing ? "Update" : "Spend"} {dpToSpend ?? 0} DP on {selected.name}
              </button>
            </div>
          ) : selected.kind === "module" ? (
            <div className="spend-dp-confirm">
              <p>
                Add <strong>{selected.name}</strong> ({selected.cost} DP)
                {selected.detail ? <span className="muted"> — {selected.detail}</span> : null}
              </p>
              <p className="muted">Up to {selectedMaxDp} DP available for this purchase.</p>
              {selected.cost > selectedMaxDp ? (
                <p className="ki-tree-footer-warning">
                  Not enough DP. This module costs {selected.cost} DP but only {selectedMaxDp} DP are available.
                </p>
              ) : null}
              <button type="button" disabled={!canAffordSelected} onClick={confirmSimpleSpend}>
                Add module ({selected.cost} DP)
              </button>
            </div>
          ) : selected.kind === "martial-art" ? (
            <div className="spend-dp-confirm">
              <p>
                Learn <strong>{selected.name}</strong>
              </p>
              <p className="muted">Up to {selectedMaxDp} DP available for this purchase.</p>
              <div className="spend-dp-degrees">
                {martialArtDegrees(selected.name).map((degree) => {
                  const cost = dpCost(character, selected.name, className, degree);
                  const affordable = cost <= selectedMaxDp;
                  return (
                    <button
                      key={degree}
                      type="button"
                      disabled={!affordable}
                      onClick={() => confirmMartialDegree(degree)}
                    >
                      {degree} ({cost} DP)
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </footer>
      </div>
    </DialogBackdrop>
  );
}
