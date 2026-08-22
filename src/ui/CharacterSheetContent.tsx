import { tables } from "../data/tables";
import { useMemo, useState } from "react";
import type { DerivedSheet } from "../engine/derived";
import { KiPoolManager } from "./KiPoolManager";
import { PsychicSheetManager } from "./PsychicSheetManager";

type CharacterSheetContentProps = {
  sheet: DerivedSheet;
  variant: "sidebar" | "full";
  showTitle?: boolean;
};

export function CharacterSheetContent({ sheet, variant, showTitle = true }: CharacterSheetContentProps) {
  const full = variant === "full";
  const resistanceMods = Object.entries(sheet.resistanceModifiers)
    .map(([name, value]) => `${value > 0 ? "+" : ""}${value} ${name}`)
    .join(", ");

  return (
    <div className={`sheet-content ${full ? "sheet-content--full" : "sheet-content--sidebar"}`}>
      {showTitle ? <h1 className="sheet-title">Anima Character Generator</h1> : null}
      <header className="sheet-header">
        <p className="sheet-summary">
          <strong>{sheet.summary}</strong>
          {sheet.typeAndGnosis ? <span className="muted"> {sheet.typeAndGnosis}</span> : null}
        </p>
        {full ? (
          <div className="sheet-meta">
            <MetaItem label="Level" value={sheet.level} />
            <MetaItem label="Presence" value={sheet.presence} />
            <MetaItem label="Size" value={`${sheet.size} (${sheet.sizeCategory})`} />
            <MetaItem label="MV" value={sheet.movementValue} />
          </div>
        ) : null}
      </header>

      <section className="sheet-section">
        <h2>Vitals</h2>
        <div className={`stat-grid ${full ? "stat-grid--wide" : ""}`}>
          <Stat label="LP" value={sheet.lifePoints} />
          <Stat label="Appearance" value={sheet.appearance} />
          <Stat label="Initiative" value={sheet.initiative} />
          <Stat label="Fatigue" value={sheet.fatigue} />
          <Stat label="Regeneration" value={sheet.regeneration} />
        </div>
      </section>

      <section className="sheet-section">
        <h2>Characteristics</h2>
        <div className="char-grid">
          {Object.entries(sheet.characteristics).map(([name, value]) => (
            <Stat key={name} label={name} value={value} />
          ))}
        </div>
      </section>

      <section className="sheet-section">
        <h2>Resistances</h2>
        <div className="res-grid">
          {Object.entries(sheet.resistances).map(([name, value]) => (
            <Stat key={name} label={name} value={value} />
          ))}
        </div>
        {resistanceMods ? <p className="muted sheet-note">{resistanceMods}</p> : null}
      </section>

      <section className="sheet-section">
        <h2>Combat</h2>
        <div className={`stat-grid ${full ? "stat-grid--wide" : ""}`}>
          <Stat label="Attack" value={sheet.attack} />
          <Stat label="Block" value={sheet.block} />
          <Stat label="Dodge" value={sheet.dodge} />
          <Stat label="Wear Armor" value={sheet.wearArmor} />
          {sheet.damageBarrier ? <Stat label="Damage Barrier" value={sheet.damageBarrier} /> : null}
          {sheet.damageReduction ? <Stat label="Damage Reduction" value={sheet.damageReduction} /> : null}
        </div>
        <div className="sheet-subsection">
          <h4 className="sheet-subtitle">Unarmed</h4>
          <p className="muted">
            Attack {sheet.unarmedAttack}, Block {sheet.unarmedBlock}, Dodge {sheet.unarmedDodge}, Initiative{" "}
            {sheet.unarmedInitiative}, Damage {sheet.unarmedDamage}
          </p>
        </div>
        {sheet.martialArtsAdvantages.length ? (
          <div className="sheet-subsection">
            <h3>Martial Arts</h3>
            <ul className="sheet-list">
              {sheet.martialArtsAdvantages.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {(sheet.usesZeon || sheet.hasGift) && (
        <section className="sheet-section">
          <h2>Magic</h2>
          <div className={`stat-grid ${full ? "stat-grid--wide" : ""}`}>
            <Stat label="Zeon" value={sheet.zeon} />
            <Stat label="MA" value={sheet.ma} />
            <Stat label="Zeon Recovery" value={sheet.zeonRecovery} />
            <Stat label="Magic Level" value={sheet.magicLevel} />
            <Stat label="Magic Projection (Attack)" value={sheet.magicProjectionOffense} />
            <Stat label="Magic Projection (Defense)" value={sheet.magicProjectionDefense} />
          </div>
        </section>
      )}

      {sheet.hasGift && (
      <section className="sheet-section">
        <h2>Summoning</h2>
        <div className="stat-grid stat-grid--wide">
          <Stat label="Summon" value={sheet.summon} />
          <Stat label="Control" value={sheet.control} />
          <Stat label="Bind" value={sheet.bind} />
          <Stat label="Banish" value={sheet.banish} />
        </div>
      </section>
      )}

      {sheet.showsPsychicStats && (
        <section className="sheet-section">
          <h2>Psychic</h2>
          <div className="stat-grid stat-grid--wide">
            <Stat label="PP total" value={sheet.psychicPointsTotal} />
            <Stat label="PP spent" value={sheet.psychicPointsSpent} />
            <Stat label="PP free" value={sheet.psychicPointsFree} />
            <Stat label="Global potential" value={`+${sheet.psychicGlobalPotentialBonus}`} />
            <Stat label="Innate slots" value={sheet.psychicInnateSlots} />
            <Stat label="Projection (Attack)" value={sheet.psychicProjectionOffense} />
            <Stat label="Projection (Defense)" value={sheet.psychicProjectionDefense} />
          </div>
          {sheet.psychicDisciplines.length ? (
            <div className="sheet-subsection">
              <h4 className="sheet-subtitle">Disciplines</h4>
              <p>{sheet.psychicDisciplines.join(", ")}</p>
            </div>
          ) : null}
          {Object.keys(sheet.psychicNaturalPowers).length ? (
            <div className="sheet-subsection">
              <h4 className="sheet-subtitle">Natural powers</h4>
              <ul className="sheet-list">
                {Object.entries(sheet.psychicNaturalPowers).map(([name, potential]) => (
                  <li key={name}>
                    {name} (potential {potential})
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {sheet.psychicPowers.length ? (
            <div className="sheet-subsection">
              <h4 className="sheet-subtitle">Learned powers</h4>
              <table className="sheet-table">
                <thead>
                  <tr>
                    <th>Power</th>
                    <th>Potential</th>
                    <th>Level</th>
                    <th>Investment</th>
                    <th>Maint.</th>
                    {full && sheet.psychicInnateSlots > 0 ? <th>Innate</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {sheet.psychicPowers.map((power) => (
                    <tr key={power.name}>
                      <td>{power.name}{power.discipline ? ` (${power.discipline})` : power.isMatrix ? " (Matrix)" : ""}</td>
                      <td>{power.potential}</td>
                      <td>{power.level}</td>
                      <td>{power.powerInvestment}</td>
                      <td>{power.maintenance ? "Yes" : "—"}</td>
                      {full && sheet.psychicInnateSlots > 0 ? (
                        <td>
                          {sheet.psychicInnateAssignments.includes(power.name) ? "Assigned" : "—"}
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {full ? <PsychicSheetManager sheet={sheet} /> : null}
          {!full && sheet.psychicTempSpends.length ? (
            <details className="sheet-subsection">
              <summary>Temporary PP spends ({sheet.psychicTempSpends.length})</summary>
              <ul className="sheet-list">
                {sheet.psychicTempSpends.map((item) => (
                  <li key={item.id}>
                    {item.effect}
                    {item.power ? ` — ${item.power}` : ""} ({item.pp} PP)
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </section>
      )}

      {sheet.usesKi && (
      <section className="sheet-section">
        <h2>Ki</h2>
        {full ? (
          <div className="sheet-subsection">
            <h4 className="sheet-subtitle">Ki Passive Stats</h4>
            <div className="stat-grid stat-grid--wide">
              <Stat label="Ki Concealment" value={sheet.kiConcealment} />
              <Stat label="Ki Detection" value={sheet.kiDetection} />
            </div>
          </div>
        ) : null}
        <div className="sheet-subsection">
          <h4 className="sheet-subtitle">Ki accumulation</h4>
          <div className={`ki-grid${sheet.kiGenerationMode === "combined" ? " ki-grid--combined" : ""}`}>
            {sheet.kiGenerationMode === "combined" && sheet.kiCombined ? (
              <KiStat name="Combined" max={sheet.kiCombined.max} perTurn={sheet.kiCombined.perTurn} />
            ) : (
              Object.entries(sheet.ki).map(([name, value]) => (
                <KiStat key={name} name={name} max={value.points} perTurn={value.accumulation} />
              ))
            )}
          </div>
        </div>
        {sheet.kiAbilities.length ? (
          <div className="sheet-subsection">
            <h4 className="sheet-subtitle">Ki Abilities</h4>
            <p className="sheet-note">{sheet.kiAbilities.join(", ")}</p>
          </div>
        ) : null}
        {full ? <KiPoolManager sheet={sheet} /> : null}
        {Object.keys(sheet.dominionTechniques).length ? (
          <div className="sheet-subsection">
            <h3>Dominion Techniques</h3>
            {Object.entries(sheet.dominionTechniques).map(([tree, techniques]) => (
              <p key={tree}>
                <strong>{tree}:</strong> {techniques.join(", ")}
              </p>
            ))}
          </div>
        ) : null}
      </section>
      )}

      {sheet.racialAbilities ? (
        <section className="sheet-section">
          <h2>Racial Abilities</h2>
          <p>{sheet.racialAbilities}</p>
        </section>
      ) : null}

      <SecondaryAbilitiesSection sheet={sheet} full={full} />

      {(sheet.advantages.length > 0 || sheet.disadvantages.length > 0) && (
        <section className="sheet-section">
          <h2>Creation Points</h2>
          {sheet.advantages.length ? (
            <div className="sheet-subsection">
              <h3>Advantages</h3>
              <ul className="sheet-list">
                {sheet.advantages.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {sheet.disadvantages.length ? (
            <div className="sheet-subsection">
              <h3>Disadvantages</h3>
              <ul className="sheet-list">
                {sheet.disadvantages.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {full ? (
            <p className="muted sheet-note">
              CP remaining: {sheet.cp.remaining} (common {sheet.cp.common}, background {sheet.cp.background}, magic{" "}
              {sheet.cp.magic}, psychic {sheet.cp.psychic})
            </p>
          ) : null}
        </section>
      )}
    </div>
  );
}

function SecondaryAbilitiesSection({ sheet, full }: { sheet: DerivedSheet; full: boolean }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const grouped = useMemo(() => {
    const byField = Object.fromEntries(tables.fields.map((field) => [field, [] as typeof sheet.secondaries])) as Record<
      string,
      typeof sheet.secondaries
    >;
    for (const item of sheet.secondaries) {
      byField[item.field]?.push(item);
    }
    for (const field of tables.fields) {
      byField[field].sort((a, b) => a.name.localeCompare(b.name));
    }
    return byField;
  }, [sheet.secondaries]);

  const trained = useMemo(() => sheet.secondaries.filter((item) => item.trained), [sheet.secondaries]);
  const untrained = useMemo(() => sheet.secondaries.filter((item) => !item.trained), [sheet.secondaries]);

  const filteredAlphabetical = useMemo(() => {
    const sorted = [...sheet.secondaries].sort((a, b) => a.name.localeCompare(b.name));
    if (!normalizedQuery) return sorted;
    return sorted.filter((item) => item.name.toLowerCase().includes(normalizedQuery));
  }, [normalizedQuery, sheet.secondaries]);

  const trainedByField = useMemo(() => {
    const byField = Object.fromEntries(tables.fields.map((field) => [field, [] as typeof trained])) as Record<
      string,
      typeof trained
    >;
    for (const item of trained) {
      byField[item.field]?.push(item);
    }
    for (const field of tables.fields) {
      byField[field].sort((a, b) => a.name.localeCompare(b.name));
    }
    return byField;
  }, [trained]);

  if (full) {
    const searching = normalizedQuery.length > 0;

    return (
      <section className="sheet-section sheet-section--secondaries-full">
        <h2>Secondary Abilities</h2>
        <label className="secondary-search">
          Search abilities
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type to filter..."
          />
        </label>
        {searching ? (
          filteredAlphabetical.length ? (
            <div className="sec-grid sec-grid--full">
              {filteredAlphabetical.map((item) => (
                <Stat key={item.name} label={secondaryAbilityLabel(item.name, item.specialization)} value={item.score} />
              ))}
            </div>
          ) : (
            <p className="muted">No abilities match your search.</p>
          )
        ) : (
          <>
            {trained.length ? (
              tables.fields.map((field) => {
                const items = trainedByField[field];
                if (!items.length) return null;
                return (
                  <div key={field} className="sheet-subsection">
                    <h4 className="sheet-subtitle">{field}</h4>
                    <div className="sec-grid sec-grid--full">
                      {items.map((item) => (
                        <Stat
                          key={item.name}
                          label={secondaryAbilityLabel(item.name, item.specialization)}
                          value={item.score}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="muted sheet-note">No secondary abilities have development points spent yet.</p>
            )}
            {untrained.length ? (
              <details className="secondary-untrained">
                <summary className="secondary-untrained-toggle sheet-subtitle">
                  Untrained abilities ({untrained.length})
                </summary>
                <div className="secondary-untrained-body">
                  <div className="sec-grid sec-grid--full">
                    {untrained.map((item) => (
                      <Stat key={item.name} label={secondaryAbilityLabel(item.name, item.specialization)} value={item.score} />
                    ))}
                  </div>
                </div>
              </details>
            ) : null}
          </>
        )}
      </section>
    );
  }

  return (
    <section className="sheet-section">
      <h2>Secondary Abilities</h2>
      {tables.fields.map((field) => {
        const items = grouped[field];
        if (!items.length) return null;
        return (
          <div key={field} className="sheet-subsection">
            <h3>{field}</h3>
            <div className="sec-grid">
              {items.map((item) => (
                <Stat
                  key={item.name}
                  label={secondaryAbilityLabel(item.name, item.specialization)}
                  value={item.score}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function secondaryAbilityLabel(name: string, specialization?: string): string {
  return specialization ? `${name} (${specialization})` : name;
}

function KiStat({ name, max, perTurn }: { name: string; max: number; perTurn: number }) {
  return (
    <div className="ki-stat">
      <strong className="ki-stat-name">{name}</strong>
      <div className="ki-stat-detail">
        <span className="ki-stat-line">Per Turn: {perTurn}</span>
        <span className="ki-stat-line">Max: {max}</span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="meta-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
