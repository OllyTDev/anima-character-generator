import { abilities, secondaryAbilities } from "../data/abilities";
import { advantageCosts, advantages } from "../data/advantages";
import { classNames } from "../data/classes";
import { combatModules } from "../data/combatModules";
import { disadvantages } from "../data/disadvantages";
import { essentialAbilities } from "../data/essentialAbilities";
import { kiAbilities } from "../data/kiAbilities";
import { creatureTypes, genders, races } from "../data/lists";
import { martialArts } from "../data/martialArts";
import { primaries } from "../data/primaries";
import { tables } from "../data/tables";
import {
  addAdvantage,
  addDisadvantage,
  advantageAllowed,
  disadvantageAllowed,
  removeAdvantage,
  removeDisadvantage,
} from "../engine/creationPoints";
import { changeClass, dpCost, dpRemaining, removeDp, setEvenLevelCharacteristic, setNaturalBonus, spendDp } from "../engine/developmentPoints";
import { characterLevel } from "../engine/helpers";
import { addKiAbility, mkRemaining, removeKiAbility } from "../engine/martialKnowledge";
import type { Characteristic } from "../data/types";
import { useCharacterStore, useSheet, type WizardStep } from "../store/characterStore";
import { useState } from "react";

const steps: { id: WizardStep; label: string }[] = [
  { id: "type", label: "Type" },
  { id: "creature", label: "Creature" },
  { id: "essentials", label: "Essential Abilities" },
  { id: "basics", label: "Characteristics" },
  { id: "points", label: "Creation Points" },
  { id: "abilities", label: "Development" },
];

export function Wizard() {
  const { character, step, setStep, patch, reset, exportJson, importJson, download, loadError } = useCharacterStore();
  const human = character.type === "Human";
  const visibleSteps = steps.filter((item) => {
    if (human && (item.id === "creature" || item.id === "essentials")) return false;
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
        <button className="secondary" type="button" onClick={reset}>
          New character
        </button>
        <button
          className="secondary"
          type="button"
          onClick={() =>
            patch((current) => ({
              ...current,
              settings: { ollyTRules: !current.settings.ollyTRules },
            }))
          }
        >
          OllyT rules: {character.settings.ollyTRules ? "on" : "off"}
        </button>
      </div>
    </main>
  );
}

function TypeStep() {
  const { character, patch, setStep } = useCharacterStore();
  return (
    <section>
      <h2>Creature type</h2>
      <div className="form-grid">
        <label>
          Type
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
          <span>OllyT house rules</span>
          <input
            type="checkbox"
            checked={character.settings.ollyTRules}
            onChange={(event) =>
              patch((current) => ({ ...current, settings: { ollyTRules: event.target.checked } }))
            }
          />
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
          Gnosis
          <input
            type="number"
            value={character.gnosis}
            onChange={(event) => patch((current) => ({ ...current, gnosis: Number(event.target.value) }))}
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
  return (
    <section>
      <h2>Characteristics</h2>
      <div className="form-grid">
        {tables.characteristics.map((name) => (
          <label key={name}>
            {name}
            <input
              type="number"
              min={1}
              max={20}
              value={character.characteristics[name as Characteristic]}
              onChange={(event) =>
                patch((current) => ({
                  ...current,
                  characteristics: {
                    ...current.characteristics,
                    [name]: Number(event.target.value),
                  },
                }))
              }
            />
          </label>
        ))}
        <label>
          Appearance
          <input
            type="number"
            value={character.appearance}
            onChange={(event) => patch((current) => ({ ...current, appearance: Number(event.target.value) }))}
          />
        </label>
        <label>
          Name
          <input value={character.name} onChange={(event) => patch((current) => ({ ...current, name: event.target.value }))} />
        </label>
        <label>
          Gender
          <select value={character.gender} onChange={(event) => patch((current) => ({ ...current, gender: event.target.value }))}>
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
          <input
            type="number"
            min={0}
            value={character.xp}
            onChange={(event) => patch((current) => ({ ...current, xp: Number(event.target.value) }))}
          />
        </label>
      </div>
      <div className="actions">
        <button type="button" onClick={() => setStep(character.type === "Human" ? "points" : "abilities")}>
          Continue
        </button>
      </div>
    </section>
  );
}

function PointsStep() {
  const { character, patch, setStep } = useCharacterStore();
  const [advantage, setAdvantage] = useState("Quick Reflexes");
  const [disadvantage, setDisadvantage] = useState("Klutzy");
  const [option, setOption] = useState("");
  const costs = advantageCosts(advantage, character.settings.ollyTRules);
  const [cost, setCost] = useState(costs[0]);
  const advDef = advantages[advantage];
  const disDef = disadvantages[disadvantage];

  return (
    <section>
      <h2>Creation Points</h2>
      <CpSummary />
      <div className="form-grid">
        <label>
          Advantage
          <select
            value={advantage}
            onChange={(event) => {
              setAdvantage(event.target.value);
              setCost(advantageCosts(event.target.value, character.settings.ollyTRules)[0]);
              setOption("");
            }}
          >
            {Object.keys(advantages)
              .filter((name) => !advantages[name].OllyTCost || character.settings.ollyTRules || name !== "Familiar")
              .map((name) => (
                <option key={name}>{name}</option>
              ))}
          </select>
        </label>
        {costs.length > 1 ? (
          <label>
            Cost
            <select value={cost} onChange={(event) => setCost(Number(event.target.value))}>
              {costs.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {advDef.Options ? (
          <label>
            {advDef.Option_Title ?? "Option"}
            {advDef.Options.length ? (
              <select value={option} onChange={(event) => setOption(event.target.value)}>
                <option value="">Select</option>
                {advDef.Options.filter((item) => !String(item).startsWith("------------")).map((item) => (
                  <option key={String(item)}>{String(item)}</option>
                ))}
              </select>
            ) : (
              <input value={option} onChange={(event) => setOption(event.target.value)} />
            )}
          </label>
        ) : null}
      </div>
      <div className="actions">
        <button
          type="button"
          onClick={() => {
            if (!advantageAllowed(character, advantage, option || undefined)) return;
            patch((current) => addAdvantage(current, advantage, cost, option || undefined));
          }}
        >
          Add advantage
        </button>
      </div>
      <div className="list">
        {Object.keys(character.advantages).map((name) => (
          <div className="list-item" key={name}>
            <span>{name}</span>
            <button className="secondary" type="button" onClick={() => patch((current) => removeAdvantage(current, name))}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="form-grid">
        <label>
          Disadvantage
          <select value={disadvantage} onChange={(event) => setDisadvantage(event.target.value)}>
            {Object.keys(disadvantages).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        {disDef.Options ? (
          <label>
            {disDef.Option_Title ?? "Option"}
            {disDef.Options.length ? (
              <select value={option} onChange={(event) => setOption(event.target.value)}>
                <option value="">Select</option>
                {disDef.Options.map((item) => (
                  <option key={String(item)}>{String(item)}</option>
                ))}
              </select>
            ) : (
              <input value={option} onChange={(event) => setOption(event.target.value)} />
            )}
          </label>
        ) : null}
      </div>
      <div className="actions">
        <button
          type="button"
          onClick={() => {
            if (!disadvantageAllowed(character, disadvantage, option || undefined)) return;
            patch((current) => addDisadvantage(current, disadvantage, Array.isArray(disDef.Benefit) ? disDef.Benefit[0] : disDef.Benefit, option || undefined));
          }}
        >
          Add disadvantage
        </button>
      </div>
      <div className="list">
        {Object.keys(character.disadvantages).map((name) => (
          <div className="list-item" key={name}>
            <span>{name}</span>
            <button className="secondary" type="button" onClick={() => patch((current) => removeDisadvantage(current, name))}>
              Remove
            </button>
          </div>
        ))}
      </div>
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
  const level = characterLevel(character);
  const [abilityName, setAbilityName] = useState("Attack");
  const [amount, setAmount] = useState(10);
  const [moduleName, setModuleName] = useState(Object.keys(combatModules)[0]);
  const [artName, setArtName] = useState("Aikido");
  const [kiName, setKiName] = useState("Use of Ki");
  const remaining = dpRemaining(character);
  const current = remaining[remaining.length - 1];
  const mkLeft = mkRemaining(character).at(-1) ?? 0;
  const className = character.levels[character.levels.length - 1].class;
  const cost = dpCost(character, abilityName, className);
  const spendables = [
    ...Object.keys(abilities),
    "Ki",
    "Accumulation Multiple",
    "Martial Knowledge",
    "Zeon",
    "MA Multiple",
    "Zeon Regeneration Multiple",
    "Magic Level",
    "Psychic Points",
    "Life Point Multiple",
  ];

  return (
    <section>
      <h2>Development Points</h2>
      <p>
        Level {level}. DP left: total {Math.floor(current?.Total ?? 0)}, combat {Math.floor(current?.Combat ?? 0)},
        supernatural {Math.floor(current?.Supernatural ?? 0)}, psychic {Math.floor(current?.Psychic ?? 0)}, other{" "}
        {Math.floor(current?.Other ?? 0)}. MK remaining {mkLeft}.
      </p>
      <div className="form-grid">
        <label>
          Ability
          <select value={abilityName} onChange={(event) => setAbilityName(event.target.value)}>
            {spendables.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <label>
          Points (cost {cost} DP each)
          <input type="number" min={0} value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
        </label>
      </div>
      <div className="actions">
        <button type="button" onClick={() => patch((currentChar) => spendDp(currentChar, level || 1, abilityName, amount))}>
          Spend DP
        </button>
      </div>
      {level > 0 && level % 2 === 0 ? (
        <label>
          Even-level characteristic
          <select
            value={character.levels[level - 1]?.characteristic ?? ""}
            onChange={(event) =>
              patch((currentChar) => setEvenLevelCharacteristic(currentChar, level, event.target.value as Characteristic))
            }
          >
            <option value="">None</option>
            {tables.characteristics.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
      ) : null}
      {level > 0 ? (
        <label>
          Natural bonus
          <select
            value={character.levels[level - 1]?.naturalBonus ?? ""}
            onChange={(event) => patch((currentChar) => setNaturalBonus(currentChar, level, event.target.value))}
          >
            <option value="">None</option>
            {secondaryAbilities(character.settings.ollyTRules).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
      ) : null}
      <h2>Combat modules</h2>
      <div className="form-grid">
        <label>
          Module
          <select value={moduleName} onChange={(event) => setModuleName(event.target.value)}>
            {Object.keys(combatModules).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="actions">
        <button
          type="button"
          onClick={() =>
            patch((currentChar) =>
              spendDp(currentChar, level || 1, moduleName, combatModules[moduleName].Option_Title ? ["Any"] : 1),
            )
          }
        >
          Add module ({dpCost(character, moduleName, className)} DP, {primaries.forAbility(moduleName)})
        </button>
      </div>
      <h2>Martial arts</h2>
      <div className="form-grid">
        <label>
          Art
          <select value={artName} onChange={(event) => setArtName(event.target.value)}>
            {Object.keys(martialArts).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="actions">
        <button type="button" onClick={() => patch((currentChar) => spendDp(currentChar, level || 1, artName, ["Base"]))}>
          Learn base degree
        </button>
      </div>
      <h2>Ki abilities</h2>
      <div className="form-grid">
        <label>
          Ki / Nemesis
          <select value={kiName} onChange={(event) => setKiName(event.target.value)}>
            {Object.keys(kiAbilities).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="actions">
        <button type="button" onClick={() => patch((currentChar) => addKiAbility(currentChar, kiName, level || 0))}>
          Learn Ki ability
        </button>
      </div>
      <h2>Purchases this character</h2>
      {character.levels.map((info, index) => (
        <div key={index}>
          <h3>
            {info.class} {index === 0 && level === 0 ? "(level 0)" : `level ${index + 1}`}
          </h3>
          {Object.keys(info.dp).map((name) => (
            <div className="list-item" key={name}>
              <span>
                {name}: {JSON.stringify(info.dp[name])}
              </span>
              <button className="secondary" type="button" onClick={() => patch((currentChar) => removeDp(currentChar, index === 0 ? 0 : index + 1, name))}>
                Remove
              </button>
            </div>
          ))}
          {info.mk
            ? Object.keys(info.mk).map((name) => (
                <div className="list-item" key={name}>
                  <span>MK {name}</span>
                  <button className="secondary" type="button" onClick={() => patch((currentChar) => removeKiAbility(currentChar, name, index === 0 ? 0 : index + 1))}>
                    Remove
                  </button>
                </div>
              ))
            : null}
        </div>
      ))}
    </section>
  );
}
