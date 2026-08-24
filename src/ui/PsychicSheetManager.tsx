import { TEMP_PSYCHIC_EFFECTS, type TempPsychicEffectId } from "../data/psychicSpending";
import type { DerivedSheet } from "../engine/derived";
import { potentialToDifficulty } from "../engine/difficulty";
import {
  canTempSpend,
  freePPRemaining,
  innateSlotAssignments,
  innateSlotPotential,
  maintainableLearnedPowers,
  psychicAccessMode,
  setInnateSlotAssignment,
  tempSpend,
  totalPsychicPoints,
  undoTempSpend,
  unlearnedPowersInAccessibleDisciplines,
} from "../engine/psychicSpending";
import type { CharacterDocument } from "../schema/character";
import { useCharacterStore } from "../store/characterStore";
import { useMemo, useState } from "react";
import { FloatingTooltip } from "./FloatingTooltip";

type PsychicSheetManagerProps = {
  sheet: DerivedSheet;
};

function InnateSlotPotential({ powerName, character }: { powerName: string; character: CharacterDocument }) {
  const result = useMemo(() => potentialToDifficulty(innateSlotPotential(character, powerName)), [character, powerName]);
  const tooltip =
    result.tierName === null
      ? `Base potential ${result.basePotential} — below Routine (20)`
      : result.basePotential === result.roundedPotential
        ? `Potential ${result.basePotential} (${result.tierName})`
        : `Base potential ${result.basePotential} → rounded to ${result.roundedPotential} (${result.tierName})`;

  return (
    <FloatingTooltip tooltip={tooltip} className="psychic-innate-potential">
      <span className="psychic-innate-potential-value">
        {result.tierName ? (
          <>
            {result.roundedPotential} · {result.tierName}
          </>
        ) : (
          <>{result.basePotential} · below Routine</>
        )}
      </span>
    </FloatingTooltip>
  );
}

export function PsychicSheetManager({ sheet }: PsychicSheetManagerProps) {
  const { character, patch } = useCharacterStore();
  const [tempEffect, setTempEffect] = useState<TempPsychicEffectId>("eliminate-fatigue");
  const [tempPower, setTempPower] = useState("");

  const maintainable = useMemo(() => maintainableLearnedPowers(character), [character]);
  const tempAccessibleUnlearned = useMemo(() => unlearnedPowersInAccessibleDisciplines(character), [character]);
  const assignments = useMemo(() => innateSlotAssignments(character), [character]);
  const tempPowerChoices = useMemo(() => {
    if (tempEffect === "temporary-power") return tempAccessibleUnlearned;
    if (tempEffect === "improve-innate") return maintainable;
    return [];
  }, [tempEffect, tempAccessibleUnlearned, maintainable]);

  const selectedTempEffect = TEMP_PSYCHIC_EFFECTS.find((item) => item.id === tempEffect);
  const accessMode = psychicAccessMode(character);
  const showFreePp = sheet.showsPsychicStats && accessMode !== "natural";
  const showInnate = sheet.psychicInnateSlots > 0;

  if (!showFreePp && !showInnate) return null;

  return (
    <div className="psychic-sheet-manager">
      {showFreePp ? (
        <details className="psychic-sheet-panel" open>
          <summary className="sheet-subtitle">Free Psychic Points</summary>
          <div className="psychic-sheet-panel-body">
            <h2>
              Free PP {Math.floor(freePPRemaining(character))} of {Math.floor(totalPsychicPoints(character))}
            </h2>
            <span className="muted">  
              Spend for a temporary effect. Recovers at a rate of 1 per hour.
            </span>
            <div className="psychic-sheet-free-form">
              <label>
                Effect
                <select
                  value={tempEffect}
                  onChange={(event) => {
                    setTempEffect(event.target.value as TempPsychicEffectId);
                    setTempPower("");
                  }}
                >
                  {TEMP_PSYCHIC_EFFECTS.map((effect) => (
                    <option key={effect.id} value={effect.id}>
                      {effect.label} ({effect.pp} PP)
                    </option>
                  ))}
                </select>
              </label>
              {selectedTempEffect?.needsPower ? (
                <label>
                  Power
                  <select value={tempPower} onChange={(event) => setTempPower(event.target.value)}>
                    <option value="">Select…</option>
                    {tempPowerChoices.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <button
                type="button"
                disabled={!canTempSpend(character, tempEffect, tempPower || undefined)}
                onClick={() => patch((current) => tempSpend(current, tempEffect, tempPower || undefined))}
              >
                Spend free PP
              </button>
            </div>
            {sheet.psychicTempSpends.length > 0 ? (
              <ul className="psychic-sheet-list">
                {sheet.psychicTempSpends.map((item) => {
                  const label = TEMP_PSYCHIC_EFFECTS.find((effect) => effect.id === item.effect)?.label ?? item.effect;
                  const desc = TEMP_PSYCHIC_EFFECTS.find((effect) => effect.id === item.effect)?.desc ?? item.effect;
                  return (
                    <li key={item.id} className="list-item">
                      <span>
                        {label}
                        {item.power ? ` — ${item.power}` : ""} ({item.pp} PP)
                      </span>
                      <span className="muted">  
                      {desc} 
                      </span>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => patch((current) => undoTempSpend(current, item.id))}
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="muted">No temporary PP effects active.</p>
            )}
          </div>
        </details>
      ) : null}

      {showInnate ? (
        <details className="psychic-sheet-panel" open>
          <summary className="sheet-subtitle">Innate slot assignments</summary>
          <div className="psychic-sheet-panel-body">
            <p className="muted">
              Assign each innate slot to a maintenance power you are sustaining. Each power can only fill one slot.
            </p>
            {maintainable.length === 0 ? (
              <p className="muted">Learn a maintenance power to assign innate slots.</p>
            ) : (
              <div className="psychic-innate-slots">
                {assignments.map((assigned, index) => {
                  const taken = new Set(assignments.filter((name, slot) => slot !== index && name));
                  return (
                    <label key={index} className="psychic-innate-slot-row">
                      <span className="psychic-innate-slot-label">Slot {index + 1}</span>
                      <select
                        value={assigned}
                        onChange={(event) =>
                          patch((current) => setInnateSlotAssignment(current, index, event.target.value))
                        }
                      >
                        <option value="">— Unassigned —</option>
                        {maintainable.map((power) => (
                          <option key={power} value={power} disabled={taken.has(power) && assigned !== power}>
                            {power}
                          </option>
                        ))}
                      </select>
                      {assigned ? <InnateSlotPotential powerName={assigned} character={character} /> : null}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </details>
      ) : null}
    </div>
  );
}
