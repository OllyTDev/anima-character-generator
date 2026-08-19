import {
  advantageSummary,
  disadvantageSummary,
  removeAdvantage,
  removeDisadvantage,
} from "../engine/creationPoints";
import { classNames } from "../data/classes";
import { essentialAbilities } from "../data/essentialAbilities";
import { generationMethods } from "../data/generationMethods";
import { creatureTypes, genders, races } from "../data/lists";
import { tables } from "../data/tables";
import { changeClass, dpRemaining, removeDp, setEvenLevelCharacteristic, setNaturalBonus, spendDp } from "../engine/developmentPoints";
import { characteristicTotal } from "../engine/characteristics";
import { characteristicPointLimit } from "../data/generationMethods";
import { characterLevel } from "../engine/helpers";
import { mkPurchasesForLevel, mkRemaining, removeKiAbility } from "../engine/martialKnowledge";
import type { Characteristic } from "../data/types";
import type { CharacterDocument, LevelRecord } from "../schema/character";
import { useCharacterStore, useSheet, type WizardStep } from "../store/characterStore";
import { useEffect, useState } from "react";
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
  const { character, step, setStep, patch, reset, exportJson, importJson, download, loadError } = useCharacterStore();
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
      {step === "type" && <TypeStep />}
      {step === "creature" && <CreatureStep />}
      {step === "essentials" && <EssentialStep />}
      {step === "basics" && <BasicsStep />}
      {step === "points" && <PointsStep />}
      {step === "abilities" && <DevelopmentStep />}
      {step === "sheet" && <FullCharacterSheet />}
      {step !== "sheet" && (
      <>
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
        <button
          className="secondary"
          type="button"
          onClick={() =>
            patch((current) => ({
              ...current,
              settings: { ...current.settings, ollyTRules: !current.settings.ollyTRules },
            }))
          }
        >
          OllyT rules: {character.settings.ollyTRules ? "on" : "off"}
        </button>
      </div>
      </>
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
      <div className="actions">
        <button type="button" onClick={() => setStep(character.type === "Human" ? "basics" : "creature")}>
          Continue
        </button>
      </div>
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
      <div className="actions">
        <button type="button" onClick={() => setStep("essentials")}>
          Continue
        </button>
      </div>
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
      <div className="actions">
        <button type="button" onClick={() => setStep("basics")}>
          Continue
        </button>
      </div>
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
        <label>
          Class
          <select
            value={character.levels[0].class}
            onChange={(event) => patch((current) => changeClass(current, characterLevel(current) || 1, event.target.value))}
          >
            {classNames.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
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
      </div>
      <div className="actions">
        <button type="button" disabled={overLimit} onClick={() => setStep(character.type === "Human" ? "points" : "abilities")}>
          Continue
        </button>
      </div>
    </section>
  );
}

function PointsStep() {
  const { character, patch, setStep } = useCharacterStore();
  const [advantageOpen, setAdvantageOpen] = useState(false);
  const [disadvantageOpen, setDisadvantageOpen] = useState(false);

  return (
    <section>
      <h2>Creation Points</h2>
      <CpSummary />
      <div className="actions">
        <button type="button" onClick={() => setAdvantageOpen(true)}>
          Add advantage
        </button>
        <button type="button" onClick={() => setDisadvantageOpen(true)}>
          Add disadvantage
        </button>
      </div>
      <div className="list">
        {Object.keys(character.advantages).map((name) => (
          <div className="list-item" key={name}>
            <span>{advantageSummary(character, name)}</span>
            <button className="secondary" type="button" onClick={() => patch((current) => removeAdvantage(current, name))}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="list">
        {Object.keys(character.disadvantages).map((name) => (
          <div className="list-item" key={name}>
            <span>{disadvantageSummary(character, name)}</span>
            <button className="secondary" type="button" onClick={() => patch((current) => removeDisadvantage(current, name))}>
              Remove
            </button>
          </div>
        ))}
      </div>
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
      <div className="actions">
        <button type="button" onClick={() => setStep("abilities")}>
          Continue
        </button>
      </div>
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

function DevelopmentStep() {
  const { character, patch } = useCharacterStore();
  const charLevel = characterLevel(character);
  const [selectedLevel, setSelectedLevel] = useState(charLevel);
  const [spendDpOpen, setSpendDpOpen] = useState(false);
  const [kiAbilitiesOpen, setKiAbilitiesOpen] = useState(false);
  const [naturalBonusOpen, setNaturalBonusOpen] = useState(false);
  const remaining = dpRemaining(character);
  const levelIndex = remainingIndexForLevel(selectedLevel);
  const current = remaining[levelIndex];
  const mkLeft = mkRemaining(character)[levelIndex] ?? mkRemaining(character).at(-1) ?? 0;
  const className = character.levels[levelIndex]?.class ?? character.levels[0].class;
  const selectedNaturalBonus = character.levels[levelIndex]?.naturalBonus;

  useEffect(() => {
    setSelectedLevel((level) => Math.min(level, charLevel));
  }, [charLevel]);

  return (
    <section>
      <h2>Purchases for this character</h2>
      {character.levels.map((info, index) => (
        <div key={index} className="level-purchases">
          <h3>{levelLabel(index, charLevel, info.class)}</h3>
          {info.characteristic ? <p className="muted">Characteristic: {info.characteristic}</p> : null}
          {info.naturalBonus ? (
            <p className="muted">
              Natural bonus: {info.naturalBonus} (+
              {naturalBonusAmount(character, info.naturalBonus, engineLevelForIndex(index, charLevel))})
            </p>
          ) : null}
          {!levelHasPurchases(character, info, index) ? <p className="muted">No purchases yet.</p> : null}
          {Object.keys(info.dp).map((name) => (
            <DpPurchaseItem
              key={name}
              name={name}
              value={info.dp[name]}
              onRemove={() => patch((currentChar) => removeDp(currentChar, engineLevelForIndex(index, charLevel), name))}
              onUpdate={(nextValue) =>
                patch((currentChar) => spendDp(currentChar, engineLevelForIndex(index, charLevel), name, nextValue))
              }
            />
          ))}
          {mkPurchasesForLevel(character, index).map((entry) => (
            <div className="list-item" key={entry.name}>
              <span>{entry.label}</span>
              <button
                className="secondary"
                type="button"
                onClick={() =>
                  patch((currentChar) => removeKiAbility(currentChar, entry.name, engineLevelForIndex(index, charLevel)))
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ))}

      <h2>Development Points</h2>
      <div className="form-grid">
        <label>
          Editing level
          <select
            value={selectedLevel}
            onChange={(event) => setSelectedLevel(Number(event.target.value))}
          >
            {charLevel === 0 ? <option value={0}>Level 0</option> : null}
            {Array.from({ length: charLevel }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                Level {index + 1}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p>
        Level {selectedLevel} ({className}). DP left: total {Math.floor(current?.Total ?? 0)}, combat{" "}
        {Math.floor(current?.Combat ?? 0)}, supernatural {Math.floor(current?.Supernatural ?? 0)}, psychic{" "}
        {Math.floor(current?.Psychic ?? 0)}, other {Math.floor(current?.Other ?? 0)}. MK remaining {mkLeft}.
      </p>

      <div className="development-actions">
        <button type="button" onClick={() => setSpendDpOpen(true)}>
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

      {selectedLevel > 0 && selectedNaturalBonus ? (
        <p className="muted">
          Natural bonus: <strong>{selectedNaturalBonus}</strong> (+
          {naturalBonusAmount(character, selectedNaturalBonus, selectedLevel)})
        </p>
      ) : null}

      <SpendDpDialog
        character={character}
        level={selectedLevel}
        className={className}
        open={spendDpOpen}
        onClose={() => setSpendDpOpen(false)}
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
      <NaturalBonusDialog
        character={character}
        level={selectedLevel}
        open={naturalBonusOpen}
        onClose={() => setNaturalBonusOpen(false)}
        onSelect={(name) => patch((currentChar) => setNaturalBonus(currentChar, selectedLevel, name))}
      />

      {selectedLevel > 0 && selectedLevel % 2 === 0 ? (
        <label>
          Even-level characteristic
          <select
            value={character.levels[levelIndex]?.characteristic ?? ""}
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
    </section>
  );
}

function engineLevelForIndex(index: number, charLevel: number): number {
  return charLevel === 0 ? 0 : index + 1;
}

function remainingIndexForLevel(selectedLevel: number): number {
  return selectedLevel === 0 ? 0 : selectedLevel - 1;
}

function levelLabel(index: number, charLevel: number, className: string): string {
  if (charLevel === 0 && index === 0) return `${className} (level 0)`;
  return `${className} level ${index + 1}`;
}

function levelHasPurchases(character: CharacterDocument, info: LevelRecord, levelIndex: number): boolean {
  if (Object.keys(info.dp).length > 0) return true;
  if (mkPurchasesForLevel(character, levelIndex).length > 0) return true;
  return false;
}
