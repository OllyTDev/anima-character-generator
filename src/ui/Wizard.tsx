import {
  advantageSummary,
  disadvantageSummary,
  removeAdvantage,
  removeDisadvantage,
} from "../engine/creationPoints";
import { classNames } from "../data/classes";
import { essentialAbilities } from "../data/essentialAbilities";
import { generationMethods } from "../data/generationMethods";
import { KI_GENERATION_MODE_EXPLANATION, kiGenerationModes } from "../data/kiGenerationModes";
import { levelModes } from "../data/levelModes";
import { creatureTypes, genders, races } from "../data/lists";
import { tables } from "../data/tables";
import { changeClass, classChangeAtLevel, dpRemaining, formatClassChangeLabel, removeDp, setEvenLevelCharacteristic, setNaturalBonus, spendDp } from "../engine/developmentPoints";
import { setSpecialization } from "../engine/ability";
import { hasEditableOption, dpDisplayCategories, dpDisplayCategoryLabel, groupDpPurchaseNames } from "../engine/dpPurchases";
import { characteristicTotal } from "../engine/characteristics";
import { characteristicPointLimit } from "../data/generationMethods";
import { characterLevel, MAX_CHARACTER_LEVEL, xpFromLevel } from "../engine/helpers";
import { mkPurchasesForLevel, mkRemaining, removeKiAbility } from "../engine/martialKnowledge";
import type { Characteristic } from "../data/types";
import type { CharacterDocument, LevelRecord } from "../schema/character";
import { useCharacterStore, useSheet, type WizardStep } from "../store/characterStore";
import { useEffect, useMemo, useRef, useState } from "react";
import { creationPointTabIds, groupCreationPointsByCategory } from "../engine/creationPointOptions";
import { ChangeClassDialog } from "./ChangeClassDialog";
import { CreationPointDialog } from "./CreationPointDialog";
import { DialogBackdrop } from "./DialogBackdrop";
import { DpPurchaseItem } from "./DpPurchaseItem";
import { FullCharacterSheet } from "./FullCharacterSheet";
import { KiAbilitiesDialog } from "./KiAbilitiesDialog";
import { NaturalBonusDialog, naturalBonusAmount } from "./NaturalBonusDialog";
import { NumberInput } from "./NumberInput";
import { SpendDpDialog } from "./SpendDpDialog";

const steps: { id: WizardStep; label: string }[] = [
  { id: "type", label: "Generation Options" },
  { id: "creature", label: "Creature" },
  { id: "essentials", label: "Essential Abilities" },
  { id: "basics", label: "Characteristics" },
  { id: "points", label: "Creation Points" },
  { id: "abilities", label: "Development" },
  { id: "sheet", label: "Full Character Sheet" },
];

export function Wizard() {
  const { character, step, setStep, patch, reset, exportJson, importJson, download, loadError, migrationNotice, dismissMigrationNotice } =
    useCharacterStore();
  const [newCharacterOpen, setNewCharacterOpen] = useState(false);
  const human = character.type === "Human";
  const visibleSteps = steps.filter((item) => {
    if (item.id === "sheet") return true;
    if (human && item.id === "essentials") return false;
    return true;
  });

  return (
    <main className="wizard">
      <nav className="steps">
        {visibleSteps.map((item) => (
          <button key={item.id} className={step === item.id ? "active" : ""} onClick={() => setStep(item.id)} type="button">
            {item.label}
          </button>
        ))}
      </nav>
      {migrationNotice ? (
        <div className="migration-notice" role="status">
          <p>{migrationNotice}</p>
          <div className="migration-notice-actions">
            <button type="button" onClick={download}>
              Download converted JSON
            </button>
            <button type="button" className="secondary" onClick={dismissMigrationNotice}>
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
      {step === "type" && <TypeStep />}
      {step === "creature" && <CreatureStep />}
      {step === "essentials" && <EssentialStep />}
      {step === "basics" && <BasicsStep />}
      {step === "points" && <PointsStep />}
      {step === "abilities" && <DevelopmentStep />}
      {step === "sheet" && <FullCharacterSheet />}
      {step !== "sheet" && (
      <section className="wizard-persist">
      <h2>Save / Load</h2>
      <p className="muted">Versioned JSON (schemaVersion 1). Autosaved in this browser; export to keep a copy.</p>
      <textarea
        defaultValue={exportJson()}
        key={JSON.stringify(character)}
        onBlur={(event) => {
          if (event.target.value.trim()) importJson(event.target.value);
        }}
      />
      {loadError ? <p className="error">{loadError}</p> : null}
      <div className="actions">
        <button type="button" onClick={download}>
          Download JSON
        </button>
        <button className="secondary" type="button" onClick={() => setNewCharacterOpen(true)}>
          New character
        </button>
      </div>
      </section>
      )}
      {newCharacterOpen ? (
        <DialogBackdrop onDismiss={() => setNewCharacterOpen(false)}>
          <div
            className="dialog"
            role="alertdialog"
            aria-labelledby="new-character-title"
            aria-describedby="new-character-message"
            aria-modal="true"
          >
            <header className="dialog-header">
              <h2 id="new-character-title">Start a new character?</h2>
            </header>
            <p id="new-character-message" className="ki-overspend-message">
              This will clear the current character and return to the start of the wizard. Export or download your JSON
              first if you want to keep a copy.
            </p>
            <footer className="dialog-footer">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setNewCharacterOpen(false);
                }}
              >
                New character
              </button>
              <button type="button" className="secondary" onClick={() => setNewCharacterOpen(false)}>
                Cancel
              </button>
            </footer>
          </div>
        </DialogBackdrop>
      ) : null}
    </main>
  );
}

function TypeStep() {
  const { character, patch, setStep } = useCharacterStore();
  return (
    <section>
      <h2>Generation Options</h2>
      <div className="form-stack">
        <label>
          Choose a generation method.
          <select
            value={character.settings.generationMethod}
            onChange={(event) =>
              patch((current) => ({
                ...current,
                settings: {
                  ...current.settings,
                  generationMethod: event.target.value as typeof current.settings.generationMethod,
                },
              }))
            }
          >
            {generationMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          How should character level be handled?
          <select
            value={character.settings.levelMode}
            onChange={(event) =>
              patch((current) => ({
                ...current,
                settings: {
                  ...current.settings,
                  levelMode: event.target.value as typeof current.settings.levelMode,
                },
              }))
            }
          >
            {levelModes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.label}
              </option>
            ))}
          </select>
        </label>
        <p className="muted">
          {character.settings.levelMode === "xp"
            ? "Set XP on the Characteristics step; level is derived from the XP chart."
            : "Choose a level on the Characteristics step; XP is set automatically from that level."}
        </p>
        <label>
          Ki generation
          <select
            value={character.settings.kiGenerationMode}
            onChange={(event) =>
              patch((current) => ({
                ...current,
                settings: {
                  ...current.settings,
                  kiGenerationMode: event.target.value as typeof current.settings.kiGenerationMode,
                },
              }))
            }
          >
            {kiGenerationModes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.label}
              </option>
            ))}
          </select>
        </label>
        <p className="muted">{KI_GENERATION_MODE_EXPLANATION}</p>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={character.settings.ollyTRules}
            onChange={(event) =>
              patch((current) => ({
                ...current,
                settings: { ...current.settings, ollyTRules: event.target.checked },
              }))
            }
          />
          <span>OllyT house rules</span>
        </label>
      </div>
      <WizardContinueButton onClick={() => setStep(character.type === "Human" ? "basics" : "creature")} />
    </section>
  );
}

function CreatureStep() {
  const { character, patch, setStep } = useCharacterStore();
  return (
    <section>
      <h2>Gnosis and nature</h2>
      <div className="form-grid">
        <label>
          Creature type
          <select
            value={character.type}
            onChange={(event) => patch((current) => ({ ...current, type: event.target.value }))}
          >
            {creatureTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>
          Gnosis
          <NumberInput
            value={character.gnosis}
            onChange={(value) => {
              if (value === null) return;
              patch((current) => ({ ...current, gnosis: value }));
            }}
          />
        </label>
        <label>
          Element
          <select
            value={character.element ?? ""}
            onChange={(event) =>
              patch((current) => ({ ...current, element: event.target.value || undefined }))
            }
          >
            <option value="">None</option>
            {tables.elements.map((element) => (
              <option key={element}>{element}</option>
            ))}
          </select>
        </label>
        <label>
          Damage Resistance
          <input
            type="checkbox"
            checked={Boolean(character.damageResistance)}
            onChange={(event) => patch((current) => ({ ...current, damageResistance: event.target.checked }))}
          />
        </label>
      </div>
      <WizardContinueButton onClick={() => setStep("essentials")} />
    </section>
  );
}

function EssentialStep() {
  const { character, patch, setStep } = useCharacterStore();
  const [selected, setSelected] = useState(Object.keys(essentialAbilities.advantages)[0]);
  const dp = character.levels[0].dp;
  return (
    <section>
      <h2>Essential Abilities</h2>
      <p className="muted">Creature advantages and disadvantages from Core Chapter 26. Spent from level 0 DP.</p>
      <div className="form-grid">
        <label>
          Add
          <select value={selected} onChange={(event) => setSelected(event.target.value)}>
            <optgroup label="Advantages">
              {Object.keys(essentialAbilities.advantages).map((name) => (
                <option key={name}>{name}</option>
              ))}
            </optgroup>
            <optgroup label="Disadvantages">
              {Object.keys(essentialAbilities.disadvantages).map((name) => (
                <option key={`d-${name}`}>{name}</option>
              ))}
            </optgroup>
          </select>
        </label>
      </div>
      <div className="actions">
        <button type="button" onClick={() => patch((current) => spendDp(current, 0, selected, 1))}>
          Add selected
        </button>
      </div>
      <div className="list">
        {Object.keys(dp)
          .filter((name) => name in essentialAbilities.advantages || name in essentialAbilities.disadvantages)
          .map((name) => (
            <div className="list-item" key={name}>
              <span>{name}</span>
              <button className="secondary" type="button" onClick={() => patch((current) => removeDp(current, 0, name))}>
                Remove
              </button>
            </div>
          ))}
      </div>
      <WizardContinueButton onClick={() => setStep("basics")} />
    </section>
  );
}

function BasicsStep() {
  const { character, patch, setStep } = useCharacterStore();
  const total = characteristicTotal(character);
  const limit = characteristicPointLimit(character.settings.generationMethod);
  const overLimit = limit !== null && total > limit;

  return (
    <section>
      <h2>Characteristics</h2>

      <div className="form-section">
        <h3>Identity</h3>
        <div className="form-grid">
          <label>
            Name
            <input
              value={character.name}
              onChange={(event) => patch((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label>
            Gender
            <select
              value={character.gender}
              onChange={(event) => patch((current) => ({ ...current, gender: event.target.value }))}
            >
              {genders.map((gender) => (
                <option key={gender}>{gender}</option>
              ))}
            </select>
          </label>
          <label>
            Race
            <select value={character.race} onChange={(event) => patch((current) => ({ ...current, race: event.target.value }))}>
              {races.map((race) => (
                <option key={race}>{race}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="form-section">
        <h3>Primary Characteristics</h3>
        <div className="form-grid">
          {tables.characteristics.map((name) => (
            <label key={name}>
              {name}
              <NumberInput
                min={1}
                max={20}
                value={character.characteristics[name as Characteristic]}
                onChange={(value) => {
                  if (value === null) return;
                  patch((current) => ({
                    ...current,
                    characteristics: {
                      ...current.characteristics,
                      [name]: value,
                    },
                  }));
                }}
              />
            </label>
          ))}
        </div>
        <p className={`characteristic-total ${overLimit ? "characteristic-total--over" : ""}`}>
          <strong>Total:</strong> {total}
          {limit !== null ? <span className="muted"> / {limit}</span> : null}
        </p>
        {overLimit ? (
          <p className="error">Total exceeds the {limit} point limit for this generation method.</p>
        ) : null}
      </div>

      <div className="form-grid">
        <label>
          Appearance
          <NumberInput
            value={character.appearance}
            onChange={(value) => {
              if (value === null) return;
              patch((current) => ({ ...current, appearance: value }));
            }}
          />
        </label>
        {character.settings.levelMode === "milestone" ? (
          <label>
            Level
            <select
              value={characterLevel(character)}
              onChange={(event) => {
                const level = Number(event.target.value);
                patch((current) => ({ ...current, xp: xpFromLevel(level) }));
              }}
            >
              <option value={0}>Level 0</option>
              {Array.from({ length: MAX_CHARACTER_LEVEL }, (_, index) => index + 1).map((level) => (
                <option key={level} value={level}>
                  Level {level}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label>
            XP
            <NumberInput
              min={0}
              value={character.xp}
              onChange={(value) => {
                if (value === null) return;
                patch((current) => ({ ...current, xp: value }));
              }}
            />
          </label>
        )}
      </div>
      <WizardContinueButton disabled={overLimit} onClick={() => setStep(character.type === "Human" ? "points" : "abilities")} />
    </section>
  );
}

function PointsStep() {
  const { character, patch, setStep } = useCharacterStore();
  const [advantageOpen, setAdvantageOpen] = useState(false);
  const [disadvantageOpen, setDisadvantageOpen] = useState(false);
  const advantagesByCategory = useMemo(
    () => groupCreationPointsByCategory(Object.keys(character.advantages), "advantage"),
    [character.advantages],
  );
  const disadvantagesByCategory = useMemo(
    () => groupCreationPointsByCategory(Object.keys(character.disadvantages), "disadvantage"),
    [character.disadvantages],
  );

  return (
    <section>
      <h2>Creation Points</h2>
      <CpSummary />
      <div className="wizard-primary-actions">
        <button type="button" className="wizard-continue" onClick={() => setAdvantageOpen(true)}>
          Add advantage
        </button>
        <button type="button" className="wizard-continue wizard-continue--secondary" onClick={() => setDisadvantageOpen(true)}>
          Add disadvantage
        </button>
      </div>
      {Object.keys(character.advantages).length ? (
        <section className="cp-list-section">
          <h3>Advantages</h3>
          {creationPointTabIds.map((category) => {
            const names = advantagesByCategory[category];
            if (!names?.length) return null;
            return (
              <div key={category} className="cp-list-category sheet-subsection">
                <h4 className="sheet-subtitle">{category}</h4>
                <div className="list">
                  {names.map((name) => (
                    <div className="list-item" key={name}>
                      <span>{advantageSummary(character, name)}</span>
                      <button
                        className="secondary"
                        type="button"
                        onClick={() => patch((current) => removeAdvantage(current, name))}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      ) : null}
      {Object.keys(character.disadvantages).length ? (
        <section className="cp-list-section">
          <h3>Disadvantages</h3>
          {creationPointTabIds.map((category) => {
            const names = disadvantagesByCategory[category];
            if (!names?.length) return null;
            return (
              <div key={category} className="cp-list-category sheet-subsection">
                <h4 className="sheet-subtitle">{category}</h4>
                <div className="list">
                  {names.map((name) => (
                    <div className="list-item" key={name}>
                      <span>{disadvantageSummary(character, name)}</span>
                      <button
                        className="secondary"
                        type="button"
                        onClick={() => patch((current) => removeDisadvantage(current, name))}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      ) : null}
      <CreationPointDialog
        character={character}
        kind="advantage"
        open={advantageOpen}
        onClose={() => setAdvantageOpen(false)}
        onApply={(next) => patch(() => next)}
      />
      <CreationPointDialog
        character={character}
        kind="disadvantage"
        open={disadvantageOpen}
        onClose={() => setDisadvantageOpen(false)}
        onApply={(next) => patch(() => next)}
      />
      <WizardContinueButton onClick={() => setStep("abilities")} />
    </section>
  );
}

function CpSummary() {
  const data = useSheet();
  return (
    <p>
      CP remaining {data.cp.remaining} (common {data.cp.common}, background {data.cp.background}, magic {data.cp.magic},
      psychic {data.cp.psychic})
    </p>
  );
}

function WizardContinueButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <div className="wizard-continue-actions">
      <button type="button" className="wizard-continue" disabled={disabled} onClick={onClick}>
        Continue <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

function levelBlockShouldSelect(event: { target: EventTarget | null }): boolean {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return true;
  return !target.closest("button, a, input, select, textarea, label");
}

function DevelopmentStep() {
  const { character, patch } = useCharacterStore();
  const charLevel = characterLevel(character);
  const defaultLevel = charLevel === 0 ? 0 : 1;
  const [selectedLevel, setSelectedLevel] = useState(defaultLevel);
  const [spendDpOpen, setSpendDpOpen] = useState(false);
  const [spendDpEdit, setSpendDpEdit] = useState<{
    level: number;
    name: string;
    value: unknown;
    className: string;
  } | null>(null);
  const [kiAbilitiesOpen, setKiAbilitiesOpen] = useState(false);
  const [naturalBonusOpen, setNaturalBonusOpen] = useState(false);
  const [changeClassOpen, setChangeClassOpen] = useState(false);
  const levelBlockRefs = useRef(new Map<number, HTMLDivElement>());
  const remaining = dpRemaining(character);
  const mkLeftByLevel = mkRemaining(character);
  const levelIndex = remainingIndexForLevel(selectedLevel);
  const mkLeft = mkRemaining(character)[levelIndex] ?? mkRemaining(character).at(-1) ?? 0;
  const className = character.levels[levelIndex]?.class ?? character.levels[0].class;

  useEffect(() => {
    setSelectedLevel((level) => Math.min(level, charLevel));
  }, [charLevel]);

  const selectLevel = (level: number) => {
    setSelectedLevel(level);
    levelBlockRefs.current.get(level)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section>
      <h2>Development</h2>
      <nav className="level-editor-nav" aria-label="Editing level">
        {charLevel === 0 ? (
          <button
            type="button"
            className={levelPillClassName(
              selectedLevel === 0,
              levelSpendStatus(character, 0, charLevel, remaining[0], mkLeftByLevel[0] ?? 0),
            )}
            onClick={() => selectLevel(0)}
          >
            Level 0
          </button>
        ) : null}
        {Array.from({ length: charLevel }, (_, index) => {
          const level = index + 1;
          return (
            <button
              key={level}
              type="button"
              className={levelPillClassName(
                selectedLevel === level,
                levelSpendStatus(character, index, charLevel, remaining[index], mkLeftByLevel[index] ?? 0),
              )}
              onClick={() => selectLevel(level)}
            >
              Level {level}
            </button>
          );
        })}
      </nav>

      {character.levels.map((info, index) => {
        const level = engineLevelForIndex(index, charLevel);
        const isEditing = level === selectedLevel;
        const blockRemaining = remaining[index];
        const blockMkLeft = mkRemaining(character)[index] ?? 0;
        const blockNaturalBonus = info.naturalBonus;
        const purchasesByCategory = groupDpPurchaseNames(Object.keys(info.dp));
        const mkEntries = mkPurchasesForLevel(character, index);
        const classChange = classChangeAtLevel(character, level);

        return (
          <div
            key={index}
            ref={(node) => {
              if (node) levelBlockRefs.current.set(level, node);
              else levelBlockRefs.current.delete(level);
            }}
            className={`level-purchases${isEditing ? " level-purchases--editing" : " level-purchases--selectable"}`}
            aria-current={isEditing ? "true" : undefined}
            role={isEditing ? undefined : "button"}
            tabIndex={isEditing ? undefined : 0}
            aria-label={isEditing ? undefined : `Edit ${levelLabel(index, charLevel, info.class)}`}
            onClick={(event) => {
              if (isEditing || !levelBlockShouldSelect(event)) return;
              selectLevel(level);
            }}
            onKeyDown={(event) => {
              if (isEditing) return;
              if (event.key !== "Enter" && event.key !== " ") return;
              if (!levelBlockShouldSelect(event)) return;
              event.preventDefault();
              selectLevel(level);
            }}
          >
            <div className="level-purchases-header">
              <h3>{levelLabel(index, charLevel, info.class)}</h3>
              {!isEditing ? <p className="muted level-purchases-select-hint">Click to edit</p> : null}
            </div>

            {isEditing ? (
              <div className="level-editor-panel">
                <p className="level-editor-summary">
                  Editing level {selectedLevel} ({info.class}). DP left: total{" "}
                  {Math.floor(blockRemaining?.Total ?? 0)}, combat {Math.floor(blockRemaining?.Combat ?? 0)},
                  supernatural {Math.floor(blockRemaining?.Supernatural ?? 0)}, psychic{" "}
                  {Math.floor(blockRemaining?.Psychic ?? 0)}, other {Math.floor(blockRemaining?.Other ?? 0)}. MK
                  remaining {Math.floor(blockMkLeft)}.
                </p>
                <div className="development-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setSpendDpEdit(null);
                      setSpendDpOpen(true);
                    }}
                  >
                    Spend DP
                  </button>
                  <button type="button" onClick={() => setKiAbilitiesOpen(true)}>
                    Ki abilities
                  </button>
                  {selectedLevel > 0 ? (
                    <button type="button" onClick={() => setNaturalBonusOpen(true)}>
                      Choose a natural bonus at this level
                    </button>
                  ) : null}
                </div>
                {selectedLevel > 0 && blockNaturalBonus ? (
                  <p className="muted">
                    Natural bonus: <strong>{blockNaturalBonus}</strong> (+
                    {naturalBonusAmount(character, blockNaturalBonus, selectedLevel)})
                  </p>
                ) : null}
                {selectedLevel > 0 && selectedLevel % 2 === 0 ? (
                  <label className="level-editor-characteristic">
                    Even-level characteristic
                    <select
                      value={info.characteristic ?? ""}
                      onChange={(event) =>
                        patch((currentChar) =>
                          setEvenLevelCharacteristic(currentChar, selectedLevel, event.target.value as Characteristic),
                        )
                      }
                    >
                      <option value="">None</option>
                      {tables.characteristics.map((name) => (
                        <option key={name}>{name}</option>
                      ))}
                    </select>
                  </label>
                ) : null}
                {selectedLevel <= 1 ? (
                  <label className="level-editor-class">
                    {charLevel === 0 ? "Class" : "Starting class"}
                    <select
                      value={info.class}
                      onChange={(event) =>
                        patch((currentChar) => changeClass(currentChar, selectedLevel || 1, event.target.value))
                      }
                    >
                      {classNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <div className="level-class-panel">
                    <p>
                      Class at this level: <strong>{info.class}</strong>
                      {classChange ? (
                        <span className="muted">
                          {" "}
                          (changed from {classChange.previousClass}, {classChange.cost} DP from Other)
                        </span>
                      ) : (
                        <span className="muted"> (same as level {selectedLevel - 1})</span>
                      )}
                    </p>
                    <button type="button" onClick={() => setChangeClassOpen(true)}>
                      Change class
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {info.characteristic ? <p className="muted">Characteristic: {info.characteristic}</p> : null}
            {!isEditing && info.naturalBonus ? (
              <p className="muted">
                Natural bonus: {info.naturalBonus} (+
                {naturalBonusAmount(character, info.naturalBonus, level)})
              </p>
            ) : null}
            {!levelHasPurchases(character, info, index, classChange) ? (
              <p className="muted">No purchases yet.</p>
            ) : null}
            {dpDisplayCategories.map((category) => {
              const dpNames = purchasesByCategory[category];
              const categoryMkEntries = category === "MK" ? mkEntries : [];
              const showClassChange = category === "Other" && classChange;
              if (!dpNames.length && !categoryMkEntries.length && !showClassChange) return null;

              return (
                <section key={category} className="level-purchase-category">
                  <h4>{dpDisplayCategoryLabel(category)}</h4>
                  {showClassChange ? (
                    <div className="list-item">
                      <span>{formatClassChangeLabel(classChange)}</span>
                      <div className="list-item-actions">
                        <button
                          className="secondary"
                          type="button"
                          onClick={() =>
                            patch((currentChar) => changeClass(currentChar, level, classChange.previousClass))
                          }
                        >
                          Revert to {classChange.previousClass}
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {dpNames.map((name) => (
                    <DpPurchaseItem
                      key={name}
                      name={name}
                      value={info.dp[name]}
                      specialization={character.specializations?.[name] ?? ""}
                      onRemove={() => patch((currentChar) => removeDp(currentChar, level, name))}
                      onEdit={() => {
                        setSelectedLevel(level);
                        setSpendDpEdit({
                          level,
                          name,
                          value: info.dp[name],
                          className: info.class,
                        });
                        setSpendDpOpen(true);
                      }}
                      onUpdate={
                        hasEditableOption(name)
                          ? (nextValue) => patch((currentChar) => spendDp(currentChar, level, name, nextValue))
                          : undefined
                      }
                      onSpecializationChange={(nextValue) =>
                        patch((currentChar) => setSpecialization(currentChar, name, nextValue))
                      }
                    />
                  ))}
                  {categoryMkEntries.map((entry) => (
                    <div className="list-item" key={entry.name}>
                      <span>{entry.label}</span>
                      <button
                        className="secondary"
                        type="button"
                        onClick={() => patch((currentChar) => removeKiAbility(currentChar, entry.name, level))}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </section>
              );
            })}
          </div>
        );
      })}

      <SpendDpDialog
        character={character}
        level={spendDpEdit?.level ?? selectedLevel}
        className={spendDpEdit?.className ?? className}
        editPurchase={spendDpEdit ? { name: spendDpEdit.name, value: spendDpEdit.value } : null}
        open={spendDpOpen}
        onClose={() => {
          setSpendDpOpen(false);
          setSpendDpEdit(null);
        }}
        onSpend={(next) => patch(() => next)}
      />
      <KiAbilitiesDialog
        character={character}
        level={selectedLevel}
        mkRemaining={Math.floor(mkLeft)}
        open={kiAbilitiesOpen}
        onClose={() => setKiAbilitiesOpen(false)}
        onLearn={(next) => patch(() => next)}
      />
      <ChangeClassDialog
        character={character}
        level={selectedLevel}
        otherDpRemaining={Math.floor(remaining[remainingIndexForLevel(selectedLevel)]?.Other ?? 0)}
        open={changeClassOpen}
        onClose={() => setChangeClassOpen(false)}
        onApply={(className) => {
          patch((currentChar) => changeClass(currentChar, selectedLevel, className));
          setChangeClassOpen(false);
        }}
      />
      <NaturalBonusDialog
        character={character}
        level={selectedLevel}
        open={naturalBonusOpen}
        onClose={() => setNaturalBonusOpen(false)}
        onSelect={(name) => patch((currentChar) => setNaturalBonus(currentChar, selectedLevel, name))}
      />
    </section>
  );
}

function engineLevelForIndex(index: number, charLevel: number): number {
  return charLevel === 0 ? 0 : index + 1;
}

function remainingIndexForLevel(selectedLevel: number): number {
  return selectedLevel === 0 ? 0 : selectedLevel - 1;
}

function levelSpendStatus(
  character: CharacterDocument,
  levelIndex: number,
  charLevel: number,
  levelRemaining: ReturnType<typeof dpRemaining>[number] | undefined,
  mkLeft: number,
): "none" | "partial" | "dp-complete" | "fully-complete" {
  const level = engineLevelForIndex(levelIndex, charLevel);
  const info = character.levels[levelIndex];
  if (!info) return "none";

  const hasSpending = levelHasPurchases(character, info, levelIndex, classChangeAtLevel(character, level));
  if (!hasSpending) return "none";

  const totalLeft = Math.floor(levelRemaining?.Total ?? 0);
  const mkLeftRounded = Math.floor(mkLeft);
  if (totalLeft <= 0 && mkLeftRounded <= 0) return "fully-complete";
  if (totalLeft <= 0) return "dp-complete";
  return "partial";
}

function levelPillClassName(
  active: boolean,
  status: "none" | "partial" | "dp-complete" | "fully-complete",
): string {
  return ["level-pill", `level-pill--${status}`, active ? "active" : ""].filter(Boolean).join(" ");
}

function levelLabel(index: number, charLevel: number, className: string): string {
  if (charLevel === 0 && index === 0) return `${className} (level 0)`;
  return `${className} level ${index + 1}`;
}

function levelHasPurchases(
  character: CharacterDocument,
  info: LevelRecord,
  levelIndex: number,
  classChange: ReturnType<typeof classChangeAtLevel>,
): boolean {
  if (classChange) return true;
  if (Object.keys(info.dp).length > 0) return true;
  if (mkPurchasesForLevel(character, levelIndex).length > 0) return true;
  return false;
}
