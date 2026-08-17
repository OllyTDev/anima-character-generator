import { useSheet } from "../store/characterStore";

export function StatBlock() {
  const sheet = useSheet();
  const resistanceMods = Object.entries(sheet.resistanceModifiers)
    .map(([name, value]) => `${value > 0 ? "+" : ""}${value} ${name}`)
    .join(", ");

  return (
    <aside className="sheet">
      <h1>Anima Character Generator</h1>
      <p>
        <strong>{sheet.summary}</strong>
        {sheet.typeAndGnosis ? <span className="muted"> {sheet.typeAndGnosis}</span> : null}
      </p>
      <div className="stat">
        <span>LP</span>
        <strong>{sheet.lifePoints}</strong>
      </div>
      <div className="stat">
        <span>Appearance</span>
        <strong>{sheet.appearance}</strong>
      </div>
      <div className="char-grid" style={{ marginTop: "0.75rem" }}>
        {Object.entries(sheet.characteristics).map(([name, value]) => (
          <div className="stat" key={name}>
            <span>{name}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="res-grid" style={{ marginTop: "0.75rem" }}>
        {Object.entries(sheet.resistances).map(([name, value]) => (
          <div className="stat" key={name}>
            <span>{name}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      {resistanceMods ? <p className="muted">{resistanceMods}</p> : null}
      <div className="stat">
        <span>Initiative</span>
        <strong>{sheet.initiative}</strong>
      </div>
      <div className="stat">
        <span>Attack</span>
        <strong>{sheet.attack}</strong>
      </div>
      <div className="stat">
        <span>Block / Dodge</span>
        <strong>
          {sheet.block} / {sheet.dodge}
        </strong>
      </div>
      <div className="stat">
        <span>Wear Armor</span>
        <strong>{sheet.wearArmor}</strong>
      </div>
      {sheet.damageBarrier ? (
        <div className="stat">
          <span>Damage Barrier</span>
          <strong>{sheet.damageBarrier}</strong>
        </div>
      ) : null}
      {sheet.damageReduction ? (
        <div className="stat">
          <span>Damage reduction</span>
          <strong>{sheet.damageReduction}</strong>
        </div>
      ) : null}
      {sheet.usesZeon || sheet.hasGift ? (
        <>
          <div className="stat">
            <span>Zeon / MA</span>
            <strong>
              {sheet.zeon} / {sheet.ma} (rec {sheet.zeonRecovery})
            </strong>
          </div>
          <div className="stat">
            <span>Magic Projection</span>
            <strong>
              {sheet.magicProjectionOffense} / {sheet.magicProjectionDefense}
            </strong>
          </div>
          <div className="stat">
            <span>Magic Level</span>
            <strong>{sheet.magicLevel}</strong>
          </div>
        </>
      ) : null}
      <div className="stat">
        <span>Summon / Control</span>
        <strong>
          {sheet.summon} / {sheet.control}
        </strong>
      </div>
      <div className="stat">
        <span>Bind / Banish</span>
        <strong>
          {sheet.bind} / {sheet.banish}
        </strong>
      </div>
      {sheet.usesPsychic ? (
        <>
          <div className="stat">
            <span>Psychic Projection</span>
            <strong>
              {sheet.psychicProjectionOffense} / {sheet.psychicProjectionDefense}
            </strong>
          </div>
          <div className="stat">
            <span>Psychic Points</span>
            <strong>{sheet.psychicPoints}</strong>
          </div>
        </>
      ) : null}
      {sheet.racialAbilities ? (
        <p>
          <strong>Racial:</strong> {sheet.racialAbilities}
        </p>
      ) : null}
      <h2>Ki</h2>
      <div className="ki-grid">
        {Object.entries(sheet.ki).map(([name, value]) => (
          <div className="stat" key={name}>
            <span>{name}</span>
            <strong>
              {value.points} / {value.accumulation}
            </strong>
          </div>
        ))}
      </div>
      {sheet.kiAbilities.length ? <p>{sheet.kiAbilities.join(", ")}</p> : null}
      <h2>Unarmed</h2>
      <p className="muted">
        Atk {sheet.unarmedAttack}, Blk {sheet.unarmedBlock}, Ddg {sheet.unarmedDodge}, Init {sheet.unarmedInitiative},
        Dam {sheet.unarmedDamage}
      </p>
      <h2>Secondaries</h2>
      <div className="sec-grid">
        {sheet.secondaries.map((item) => (
          <FragmentStat key={item.name} name={item.name} value={item.score} />
        ))}
      </div>
      {sheet.advantages.length ? (
        <p>
          <strong>Advantages:</strong> {sheet.advantages.join("; ")}
        </p>
      ) : null}
      {sheet.disadvantages.length ? (
        <p>
          <strong>Disadvantages:</strong> {sheet.disadvantages.join("; ")}
        </p>
      ) : null}
    </aside>
  );
}

function FragmentStat({ name, value }: { name: string; value: number }) {
  return (
    <>
      <span>{name}</span>
      <strong>{value}</strong>
    </>
  );
}
