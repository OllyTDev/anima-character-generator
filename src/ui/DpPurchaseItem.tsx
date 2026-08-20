import {
  formatDpPurchaseLabel,
  hasEditableOption,
  isEditableDpPurchase,
  optionTextFromValue,
  optionTitleForPurchase,
} from "../engine/dpPurchases";
import { useEffect, useState } from "react";

type DpPurchaseItemProps = {
  name: string;
  value: unknown;
  onRemove: () => void;
  onEdit?: () => void;
  onUpdate?: (value: unknown) => void;
};

export function DpPurchaseItem({ name, value, onRemove, onEdit, onUpdate }: DpPurchaseItemProps) {
  const editableAmount = isEditableDpPurchase(name, value);
  const editableOption = hasEditableOption(name);
  const [optionText, setOptionText] = useState(() => optionTextFromValue(value));

  useEffect(() => {
    setOptionText(optionTextFromValue(value));
  }, [name, value]);

  const saveOption = () => {
    onUpdate?.([optionText.trim()]);
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
      <span>{formatDpPurchaseLabel(name, value)}</span>
      <div className="list-item-actions">
        {editableAmount && onEdit ? (
          <button className="secondary" type="button" onClick={onEdit}>
            Edit
          </button>
        ) : null}
        <button className="secondary" type="button" onClick={onRemove}>
          Remove
        </button>
      </div>
    </div>
  );
}
