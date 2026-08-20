import {
  formatDpPurchaseLabel,
  hasEditableOption,
  isEditableDpPurchase,
  optionTextFromValue,
  optionTitleForPurchase,
} from "../engine/dpPurchases";
import {
  abilitySupportsSpecialization,
  specializationSelectValue,
  specializationSuggestions,
} from "../data/abilities";
import { useEffect, useMemo, useState } from "react";

type DpPurchaseItemProps = {
  name: string;
  value: unknown;
  specialization?: string;
  onRemove: () => void;
  onEdit?: () => void;
  onUpdate?: (value: unknown) => void;
  onSpecializationChange?: (value: string) => void;
};

export function DpPurchaseItem({
  name,
  value,
  specialization = "",
  onRemove,
  onEdit,
  onUpdate,
  onSpecializationChange,
}: DpPurchaseItemProps) {
  const editableAmount = isEditableDpPurchase(name, value);
  const editableOption = hasEditableOption(name);
  const supportsSpecialization = abilitySupportsSpecialization(name);
  const [optionText, setOptionText] = useState(() => optionTextFromValue(value));
  const suggestions = useMemo(() => specializationSuggestions(name), [name]);
  const selectedSpecialization = specializationSelectValue(name, specialization);
  const customSpecialization = useMemo(() => {
    if (!selectedSpecialization) return null;
    if (suggestions.some((item) => item.toLowerCase() === selectedSpecialization.toLowerCase())) return null;
    return selectedSpecialization;
  }, [selectedSpecialization, suggestions]);

  useEffect(() => {
    setOptionText(optionTextFromValue(value));
  }, [name, value]);

  const saveOption = () => {
    onUpdate?.([optionText.trim()]);
  };

  const specializationField = supportsSpecialization ? (
    <label className="purchase-specialization">
      Specialization
      <select
        value={customSpecialization ?? selectedSpecialization}
        onChange={(event) => onSpecializationChange?.(event.target.value)}
      >
        <option value="">None</option>
        {suggestions.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
        {customSpecialization ? (
          <option value={customSpecialization}>{customSpecialization}</option>
        ) : null}
      </select>
    </label>
  ) : null;

  if (editableOption) {
    return (
      <div className="list-item list-item--stacked">
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
        {specializationField}
        <div className="list-item-actions">
          <button className="secondary" type="button" onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`list-item${supportsSpecialization ? " list-item--stacked" : ""}`}>
      <div className="purchase-main">
        <span>{formatDpPurchaseLabel(name, value)}</span>
        {specializationField}
      </div>
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
