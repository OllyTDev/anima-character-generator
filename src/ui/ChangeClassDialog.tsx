import { classNames } from "../data/classes";
import {
  classChangeAffordable,
  classChangeAtLevel,
  classChangeCostBetween,
} from "../engine/developmentPoints";
import type { CharacterDocument } from "../schema/character";
import { useEffect, useState } from "react";
import { DialogBackdrop } from "./DialogBackdrop";

type ChangeClassDialogProps = {
  character: CharacterDocument;
  level: number;
  otherDpRemaining: number;
  open: boolean;
  onClose: () => void;
  onApply: (className: string) => void;
};

export function ChangeClassDialog({
  character,
  level,
  otherDpRemaining,
  open,
  onClose,
  onApply,
}: ChangeClassDialogProps) {
  const previousClass = level >= 2 ? character.levels[level - 2]?.class : "";
  const currentClass = character.levels[level - 1]?.class ?? character.levels[0].class;
  const [selectedClass, setSelectedClass] = useState(currentClass);

  useEffect(() => {
    if (open) setSelectedClass(currentClass);
  }, [open, currentClass]);

  if (!open || level < 2 || !previousClass) return null;

  const currentChange = classChangeAtLevel(character, level);
  const nextCost = classChangeCostBetween(character, previousClass, selectedClass);
  const currentCost = currentChange?.cost ?? 0;
  const costDelta = nextCost - currentCost;
  const sameAsPrevious = selectedClass === previousClass;
  const unchanged = selectedClass === currentClass;
  const affordable = classChangeAffordable(character, level, selectedClass, otherDpRemaining);
  const canConfirm = !unchanged && affordable;

  return (
    <DialogBackdrop onDismiss={onClose}>
      <div className="dialog change-class-dialog" role="dialog" aria-labelledby="change-class-title" aria-modal="true">
        <header className="dialog-header">
          <h2 id="change-class-title">Change class at level {level}</h2>
          <p className="muted">
            Multiclassing spends Other DP for this level only. Previous level class: <strong>{previousClass}</strong>.
          </p>
        </header>
        <div className="change-class-body">
          <label>
            Class at this level
            <select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)}>
              {classNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          {sameAsPrevious ? (
            <p className="muted change-class-cost">Continuing as {previousClass} — no class-change cost.</p>
          ) : (
            <p className="change-class-cost">
              Class change cost: <strong>{nextCost} DP</strong> from Other
              {currentCost > 0 && nextCost !== currentCost ? (
                <span className="muted">
                  {" "}
                  ({costDelta > 0 ? "+" : ""}
                  {costDelta} DP vs current choice)
                </span>
              ) : null}
            </p>
          )}
          {!affordable && !unchanged ? (
            <p className="error">
              Not enough Other DP (need {Math.max(0, costDelta)} more; {Math.floor(otherDpRemaining)} available).
            </p>
          ) : null}
        </div>
        <footer className="dialog-footer">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" disabled={!canConfirm} onClick={() => onApply(selectedClass)}>
            Confirm class change
          </button>
        </footer>
      </div>
    </DialogBackdrop>
  );
}
