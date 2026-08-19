import {
  formatDpPurchaseLabel,
  hasEditableOption,
  isEditableDpPurchase,
  optionTextFromValue,
  optionTitleForPurchase,
} from "../engine/dpPurchases";
import { useEffect, useState } from "react";
import { NumberInput } from "./NumberInput";

type DpPurchaseItemProps = {
  name: string;
  value: unknown;
  onRemove: () => void;
  onUpdate: (value: unknown) => void;
};

export function DpPurchaseItem({ name, value, onRemove, onUpdate }: DpPurchaseItemProps) {
  const [editing, setEditing] = useState(false);
  const editableAmount = isEditableDpPurchase(name, value);
  const editableOption = hasEditableOption(name);
  const [draft, setDraft] = useState<number | null>(editableAmount ? value : null);
  const [optionText, setOptionText] = useState(() => optionTextFromValue(value));

  useEffect(() => {
    setOptionText(optionTextFromValue(value));
  }, [name, value]);

  const startEdit = () => {
    if (!editableAmount) return;
    setDraft(value);
    setEditing(true);
  };

  const saveAmount = () => {
    if (draft === null) return;
    onUpdate(draft);
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft(editableAmount ? value : null);
    setEditing(false);
  };

  const saveOption = () => {
    onUpdate([optionText.trim()]);
  };

  if (editableOption) {
    return (
      <div className="list-item">
        <label className="purchase-option">
          <span>{name}</span>
          <input
            type="text"
            value={optionText}
            placeholder={optionTitleForPurchase(name)}
            onChange={(event) => setOptionText(event.target.value)}
            onBlur={saveOption}
          />
        </label>
        <div className="list-item-actions">
          <button className="secondary" type="button" onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="list-item">
      {editing && editableAmount ? (
        <>
          <label className="purchase-edit">
            <span>{name}</span>
            <NumberInput value={value} onChange={setDraft} min={0} />
          </label>
          <div className="list-item-actions">
            <button type="button" disabled={draft === null} onClick={saveAmount}>
              Save
            </button>
            <button className="secondary" type="button" onClick={cancelEdit}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <span>{formatDpPurchaseLabel(name, value)}</span>
          <div className="list-item-actions">
            {editableAmount ? (
              <button className="secondary" type="button" onClick={startEdit}>
                Edit
              </button>
            ) : null}
            <button className="secondary" type="button" onClick={onRemove}>
              Remove
            </button>
          </div>
        </>
      )}
    </div>
  );
}
