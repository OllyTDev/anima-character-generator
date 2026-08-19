import { advantages } from "../data/advantages";
import { disadvantages } from "../data/disadvantages";
import {
  addAdvantage,
  addDisadvantage,
  advantageAllowed,
  disadvantageAllowed,
} from "../engine/creationPoints";
import {
  buildAdvantageOptions,
  buildDisadvantageOptions,
  creationPointCostLabel,
  creationPointTabIds,
  type CreationPointOption,
  type CreationPointTabId,
} from "../engine/creationPointOptions";
import type { CharacterDocument } from "../schema/character";
import { useEffect, useMemo, useState } from "react";
import { DialogBackdrop } from "./DialogBackdrop";

type CreationPointDialogProps = {
  character: CharacterDocument;
  kind: "advantage" | "disadvantage";
  open: boolean;
  onClose: () => void;
  onApply: (character: CharacterDocument) => void;
};

export function CreationPointDialog({ character, kind, open, onClose, onApply }: CreationPointDialogProps) {
  const [activeTab, setActiveTab] = useState<CreationPointTabId>("Common");
  const [selected, setSelected] = useState<CreationPointOption | null>(null);
  const [value, setValue] = useState<number>(1);
  const [option, setOption] = useState("");
  const tabs = useMemo(
    () => (kind === "advantage" ? buildAdvantageOptions(character) : buildDisadvantageOptions(character)),
    [character, kind],
  );

  useEffect(() => {
    if (open) {
      setActiveTab("Common");
      setSelected(null);
      setValue(1);
      setOption("");
    }
  }, [open, kind]);

  if (!open) return null;

  const title = kind === "advantage" ? "Add advantage" : "Add disadvantage";
  const selectedDef = selected ? (kind === "advantage" ? advantages[selected.name] : disadvantages[selected.name]) : null;
  const optionTitle = selectedDef && "Option_Title" in selectedDef ? selectedDef.Option_Title : undefined;
  const optionChoices = selectedDef?.Options?.filter((item) => !String(item).startsWith("------------")) ?? [];
  const needsOption = Boolean(selectedDef && selectedDef.Options !== undefined);
  const freeformOption = needsOption && selectedDef!.Options!.length === 0;
  const optionMissing = needsOption && !option.trim();
  const selectedAllowed = selected
    ? kind === "advantage"
      ? advantageAllowed(character, selected.name, option || undefined)
      : disadvantageAllowed(character, selected.name, option || undefined)
    : false;
  const canConfirm = selectedAllowed && !optionMissing;

  const selectItem = (item: CreationPointOption) => {
    setSelected(item);
    setValue(item.values[0]);
    setOption("");
  };

  const confirm = () => {
    if (!selected || !selectedAllowed) return;
    if (kind === "advantage") {
      onApply(addAdvantage(character, selected.name, value, option || undefined));
    } else {
      onApply(addDisadvantage(character, selected.name, value, option || undefined));
    }
    onClose();
  };

  return (
    <DialogBackdrop onDismiss={onClose}>
      <div
        className="dialog spend-dp-dialog creation-point-dialog"
        role="dialog"
        aria-labelledby="creation-point-title"
        aria-modal="true"
      >
        <header className="dialog-header natural-bonus-dialog-header">
          <div className="natural-bonus-dialog-header-top">
            <h2 id="creation-point-title">{title}</h2>
          </div>
          <p className="muted">
            Choose a category, then select {kind === "advantage" ? "an advantage to buy" : "a disadvantage to gain CP from"}.
          </p>
        </header>

        <nav className="spend-dp-tabs" role="tablist" aria-label="Creation point categories">
          {creationPointTabIds.map((tab) => (
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
          <section className="spend-dp-section">
            <h3>{activeTab}</h3>
            <table className="spend-dp-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>{kind === "advantage" ? "Cost" : "Benefit"}</th>
                </tr>
              </thead>
              <tbody>
                {tabs[activeTab].map((item) => {
                  const isSelected = selected?.name === item.name;
                  return (
                    <tr
                      key={item.name}
                      className={`${isSelected ? "spend-dp-row--selected" : ""}${item.allowed ? "" : " spend-dp-row--disabled"}`}
                      onClick={() => selectItem(item)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectItem(item);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={isSelected}
                      aria-disabled={!item.allowed}
                    >
                      <td>{item.name}</td>
                      <td>{creationPointCostLabel(item)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </div>

        <footer className="dialog-footer spend-dp-footer">
          {!selected ? (
            <p className="muted spend-dp-hint">Select an option above to continue.</p>
          ) : (
            <div className="spend-dp-confirm creation-point-confirm">
              <p className="creation-point-effect">{selected.effect}</p>
              {!selectedAllowed ? (
                <p className="ki-tree-footer-warning">This option is not currently available for this character.</p>
              ) : null}
              {selected.values.length > 1 ? (
                <label>
                  {kind === "advantage" ? "Cost" : "Benefit"}
                  <select value={value} onChange={(event) => setValue(Number(event.target.value))}>
                    {selected.values.map((entry) => (
                      <option key={entry} value={entry}>
                        {entry} CP
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              {needsOption ? (
                <label>
                  {optionTitle ?? "Option"}
                  {freeformOption ? (
                    <input value={option} onChange={(event) => setOption(event.target.value)} />
                  ) : (
                    <select value={option} onChange={(event) => setOption(event.target.value)}>
                      <option value="">Select</option>
                      {optionChoices.map((item) => (
                        <option key={String(item)} value={String(item)}>
                          {String(item)}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
              ) : null}
              <button type="button" disabled={!canConfirm} onClick={confirm}>
                {kind === "advantage" ? `Add ${selected.name}` : `Add ${selected.name}`}
              </button>
            </div>
          )}
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </footer>
      </div>
    </DialogBackdrop>
  );
}
