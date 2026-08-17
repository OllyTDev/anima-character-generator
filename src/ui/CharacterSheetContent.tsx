import type { DerivedSheet } from "../engine/derived";

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
          <h3>Unarmed</h3>
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
            <Stat label="Magic Projection (Off)" value={sheet.magicProjectionOffense} />
            <Stat label="Magic Projection (Def)" value={sheet.magicProjectionDefense} />
          </div>
        </section>
      )}

      <section className="sheet-section">
        <h2>Summoning</h2>
        <div className="stat-grid stat-grid--wide">
          <Stat label="Summon" value={sheet.summon} />
          <Stat label="Control" value={sheet.control} />
          <Stat label="Bind" value={sheet.bind} />
          <Stat label="Banish" value={sheet.banish} />
        </div>
      </section>

      {sheet.usesPsychic && (
        <section className="sheet-section">
          <h2>Psychic</h2>
          <div className="stat-grid stat-grid--wide">
            <Stat label="Psychic Points" value={sheet.psychicPoints} />
            <Stat label="Projection (Off)" value={sheet.psychicProjectionOffense} />
            <Stat label="Projection (Def)" value={sheet.psychicProjectionDefense} />
          </div>
          {Object.keys(sheet.psychicPowers).length ? (
            <ul className="sheet-list">
              {Object.entries(sheet.psychicPowers).map(([name, potential]) => (
                <li key={name}>
                  {name} (potential {potential})
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      )}

      <section className="sheet-section">
        <h2>Ki</h2>
        <div className="ki-grid">
          {Object.entries(sheet.ki).map(([name, value]) => (
            <Stat key={name} label={name} value={`${value.points} / ${value.accumulation}`} />
          ))}
        </div>
        {sheet.kiAbilities.length ? <p className="sheet-note">{sheet.kiAbilities.join(", ")}</p> : null}
        {full ? (
          <div className="stat-grid stat-grid--wide">
            <Stat label="Ki Concealment" value={sheet.kiConcealment} />
            <Stat label="Ki Detection" value={sheet.kiDetection} />
          </div>
        ) : null}
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

      {sheet.racialAbilities ? (
        <section className="sheet-section">
          <h2>Racial Abilities</h2>
          <p>{sheet.racialAbilities}</p>
        </section>
      ) : null}

      <section className="sheet-section">
        <h2>Secondary Abilities</h2>
        <div className={`sec-grid ${full ? "sec-grid--full" : ""}`}>
          {sheet.secondaries.map((item) => (
            <Stat key={item.name} label={item.name} value={item.score} />
          ))}
        </div>
      </section>

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
