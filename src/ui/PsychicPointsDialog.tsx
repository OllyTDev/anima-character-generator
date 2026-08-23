import {
  cumulativePPForTier,
  GLOBAL_POTENTIAL_BONUSES,
  GLOBAL_POTENTIAL_CUMULATIVE_PP,
  incrementalPPForNextTier,
  MAX_POWER_INVESTMENT,
  matrixPowerDefs,
  psychicDisciplineNames,
  powersInDiscipline,
  psychicPowerDef,
} from "../data/psychicSpending";
import {
  buyInnateSlot,
  canBuyDisciplinesWithPP,
  canBuyInnateSlot,
  canInvestInPower,
  canLearnPower,
  canMasterDiscipline,
  canRaiseGlobalPotential,
  freePPRemaining,
  globalPotentialBonus,
  grantedDisciplines,
  hasDiscipline,
  investInPower,
  learnedPowers,
  learnPower,
  masterDiscipline,
  normalizePsychic,
  permanentPPSpent,
  ppPurchasedDisciplines,
  powerPotential,
  psychicAccessMode,
  raiseGlobalPotential,
  totalPsychicPoints,
} from "../engine/psychicSpending";
import type { CharacterDocument } from "../schema/character";
import { useEffect, useMemo, useState } from "react";
import { DialogBackdrop } from "./DialogBackdrop";
import { useMediaQuery } from "./useMediaQuery";

type PsychicPointsDialogProps = {
  character: CharacterDocument;
  open: boolean;
  onClose: () => void;
  onApply: (character: CharacterDocument) => void;
};

type PsychicTab = "disciplines" | "powers" | "global" | "investment" | "innate";

const tabs: { id: PsychicTab; label: string }[] = [
  { id: "disciplines", label: "Disciplines" },
  { id: "powers", label: "Powers" },
  { id: "global", label: "Global potential" },
  { id: "investment", label: "Power investment" },
  { id: "innate", label: "Innate slots" },
];

export function PsychicPointsDialog({ character, open, onClose, onApply }: PsychicPointsDialogProps) {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [tab, setTab] = useState<PsychicTab>("disciplines");
  const [search, setSearch] = useState("");

  const total = totalPsychicPoints(character);
  const spent = permanentPPSpent(character);
  const free = freePPRemaining(character);
  const accessMode = psychicAccessMode(character);
  const tier = normalizePsychic(character).globalPotentialTier ?? 0;
  const innateSlots = normalizePsychic(character).innateSlots ?? 0;
  const learned = learnedPowers(character);

  useEffect(() => {
    if (!open) return;
    setTab("disciplines");
    setSearch("");
    // Reset form state only when the dialog opens, not on each character update.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: avoid tab reset while spending
  }, [open]);

  const filteredDisciplines = useMemo(() => {
    const query = search.trim().toLowerCase();
    return psychicDisciplineNames()
      .map((discipline) => {
        const allPowers = powersInDiscipline(discipline);
        const nameMatch = !query || discipline.toLowerCase().includes(query);
        const powers = nameMatch
          ? allPowers
          : allPowers.filter(
              (power) =>
                power.name.toLowerCase().includes(query) || power.minimum.toLowerCase().includes(query),
            );
        if (!query || nameMatch || powers.length > 0) {
          return { discipline, powers };
        }
        return null;
      })
      .filter((entry): entry is { discipline: string; powers: ReturnType<typeof powersInDiscipline> } => entry !== null);
  }, [search]);

  const globalPotentialRows = useMemo(
    () =>
      GLOBAL_POTENTIAL_BONUSES.map((bonus, index) => {
        const tierNumber = index + 1;
        const cumulative = GLOBAL_POTENTIAL_CUMULATIVE_PP[index];
        const incremental =
          index === 0 ? cumulative : cumulative - GLOBAL_POTENTIAL_CUMULATIVE_PP[index - 1];
        return { tierNumber, bonus, cumulative, incremental };
      }),
    [],
  );

  const powerGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    const groups: { title: string; powers: ReturnType<typeof powersInDiscipline> }[] = [];
    for (const discipline of psychicDisciplineNames()) {
      if (!hasDiscipline(character, discipline)) continue;
      const powers = powersInDiscipline(discipline).filter(
        (p) => !query || p.name.toLowerCase().includes(query) || discipline.toLowerCase().includes(query),
      );
      if (powers.length) groups.push({ title: discipline, powers });
    }
    const matrix = matrixPowerDefs().filter((p) => !query || p.name.toLowerCase().includes(query));
    if (matrix.length && accessMode !== "natural") groups.push({ title: "Matrix powers", powers: matrix });
    return groups;
  }, [character, search, accessMode]);

  if (!open) return null;

  const apply = (next: CharacterDocument) => onApply(next);

  const disciplineStatus = (discipline: string) => {
    if (grantedDisciplines(character).includes(discipline)) return "Granted";
    if (ppPurchasedDisciplines(character).includes(discipline)) return "Mastered";
    if (!canBuyDisciplinesWithPP(character)) return "Locked (Access to One)";
    if (canMasterDiscipline(character, discipline)) return "Available (1 PP)";
    return "Need 1 PP";
  };

  const powerBlockedReason = (powerName: string): string => {
    if (learned.includes(powerName)) return "Learned";
    const def = psychicPowerDef(powerName);
    if (!def) return "Unknown power";
    if (!def.isMatrix && !hasDiscipline(character, def.discipline)) return "Need discipline";
    if (!canLearnPower(character, powerName)) {
      if (freePPRemaining(character) < 1) return "Need 1 PP";
      if (def.level > 1) return `Need level ${def.level - 1} power first`;
    }
    return "Unavailable";
  };

  const nextTierCost = incrementalPPForNextTier(tier);
  const nextTierBonus = tier < GLOBAL_POTENTIAL_BONUSES.length ? GLOBAL_POTENTIAL_BONUSES[tier] : null;

  return (
    <DialogBackdrop className="dialog-backdrop dialog-backdrop--fullscreen" onDismiss={onClose}>
      <div className="dialog spend-dp-dialog ki-tree-dialog" role="dialog" aria-labelledby="psychic-pp-title" aria-modal="true">
        <header className="dialog-header natural-bonus-dialog-header">
          <div className="natural-bonus-dialog-header-top">
            <h2 id="psychic-pp-title">Spend Psychic Points</h2>
          </div>
          <p className="muted">
            Total {total} · Spent {spent} · Free {free}
            {accessMode === "natural" ? " · Natural powers only (no PP spending)" : ""}
          </p>
        </header>

        <div className="spend-dp-tabs spend-dp-tabs--wrap" role="tablist" aria-label="Psychic spending">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tab === item.id ? "active" : ""}
              onClick={() => setTab(item.id)}
            >
              {isMobile ? item.label.split(" ")[0] : item.label}
            </button>
          ))}
        </div>

        {(tab === "disciplines" || tab === "powers") && (
          <label className="spend-dp-search">
            Search
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter…" />
          </label>
        )}

        <div className="spend-dp-tab-panel psychic-pp-panel">
          {tab === "disciplines" && (
            <div className="psychic-pp-discipline-list">
              {filteredDisciplines.length === 0 ? (
                <p className="muted">No disciplines match your search.</p>
              ) : (
                filteredDisciplines.map(({ discipline, powers }) => {
                  const status = disciplineStatus(discipline);
                  const canBuy = canMasterDiscipline(character, discipline);
                  const mastered = hasDiscipline(character, discipline);
                  const granted = grantedDisciplines(character).includes(discipline);
                  return (
                    <details
                      key={discipline}
                      className={[
                        "psychic-pp-discipline",
                        mastered ? "psychic-pp-discipline--mastered" : "psychic-pp-discipline--unmastered",
                      ].join(" ")}
                      open={Boolean(search.trim())}
                    >
                      <summary className="psychic-pp-discipline-summary">
                        <span className="psychic-pp-discipline-heading">
                          <strong>{discipline}</strong>
                          {mastered ? (
                            <span className="psychic-pp-discipline-badge">
                              {granted ? "Granted" : "Mastered"}
                            </span>
                          ) : null}
                          <span className="muted psychic-pp-discipline-status"> — {status}</span>
                          <span className="muted psychic-pp-discipline-count"> · {powers.length} powers</span>
                        </span>
                      </summary>
                      <div className="psychic-pp-discipline-body">
                        {canBuy ? (
                          <button type="button" onClick={() => apply(masterDiscipline(character, discipline))}>
                            Master discipline (1 PP)
                          </button>
                        ) : null}
                        <ul className="psychic-pp-discipline-powers">
                          {powers.map((power) => {
                            const known = learned.includes(power.name);
                            return (
                              <li key={power.name} className={known ? "psychic-pp-power-known" : undefined}>
                                <strong>{power.name}</strong>
                                <span className="muted">
                                  {" "}
                                  · Level {power.level} · {power.minimum}
                                  {power.maintenance ? " · Maintenance" : ""}
                                  {known ? " · Learned" : mastered ? "" : " · Requires discipline"}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </details>
                  );
                })
              )}
            </div>
          )}

          {tab === "powers" && (
            <div className="psychic-pp-power-groups">
              {powerGroups.length === 0 ? (
                <p className="muted">Master a discipline or unlock matrix powers to learn abilities.</p>
              ) : (
                powerGroups.map((group) => {
                  const groupLearnedCount = group.powers.filter((power) => learned.includes(power.name)).length;
                  const groupMastered =
                    group.title === "Matrix powers"
                      ? groupLearnedCount > 0
                      : hasDiscipline(character, group.title);
                  return (
                  <section
                    key={group.title}
                    className={[
                      "psychic-pp-power-group",
                      groupMastered ? "psychic-pp-power-group--mastered" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <h3 className="psychic-pp-power-group-title">
                      {group.title}
                      {groupLearnedCount > 0 ? (
                        <span className="psychic-pp-discipline-badge">
                          {groupLearnedCount} learned
                        </span>
                      ) : null}
                    </h3>
                    <ul className="psychic-pp-power-rows">
                      {group.powers.map((power) => {
                        const known = learned.includes(power.name);
                        const canBuy = canLearnPower(character, power.name);
                        const meta = (
                          <>
                            Level {power.level}
                            {power.maintenance ? " · Maintenance" : ""}
                            {known ? ` · Potential ${powerPotential(character, power.name)}` : ""}
                            {!known && !canBuy ? ` · ${powerBlockedReason(power.name)}` : ""}
                          </>
                        );
                        return (
                          <li key={power.name}>
                            {canBuy ? (
                              <button
                                type="button"
                                className="psychic-pp-power-row psychic-pp-power-row--learnable"
                                onClick={() => apply(learnPower(character, power.name))}
                              >
                                <span className="psychic-pp-power-row-main">
                                  <span className="psychic-pp-power-name">{power.name}</span>
                                  <span className="psychic-pp-power-meta muted">{meta}</span>
                                </span>
                                <span className="psychic-pp-power-cta">Learn · 1 PP</span>
                              </button>
                            ) : (
                              <div
                                className={[
                                  "psychic-pp-power-row",
                                  known ? "psychic-pp-power-row--learned" : "psychic-pp-power-row--blocked",
                                ].join(" ")}
                              >
                                <span className="psychic-pp-power-row-main">
                                  <span className="psychic-pp-power-name">
                                    {power.name}
                                    {known ? (
                                      <span className="psychic-pp-discipline-badge psychic-pp-power-badge">
                                        Learned
                                      </span>
                                    ) : null}
                                  </span>
                                  <span className="psychic-pp-power-meta muted">{meta}</span>
                                </span>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                  );
                })
              )}
            </div>
          )}

          {tab === "global" && (
            <div className="psychic-pp-summary psychic-pp-global">
              <p className="psychic-pp-global-intro">
                You are at tier <strong>{tier}</strong> with <strong>+{globalPotentialBonus(character)}</strong> to all
                power potentials ({cumulativePPForTier(tier)} PP spent on global potential
                {tier < GLOBAL_POTENTIAL_BONUSES.length
                  ? ` · next tier costs ${nextTierCost} PP`
                  : " · maximum tier reached"}
                ).
              </p>
              <div className="psychic-pp-tier-table-wrap">
                <table className="psychic-pp-tier-table">
                  <thead>
                    <tr>
                      <th>Tier</th>
                      <th>Bonus</th>
                      <th>Cumulative PP</th>
                      <th>Incremental PP</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      className={[
                        "psychic-pp-tier-row",
                        tier === 0 ? "psychic-pp-tier-row--current" : "psychic-pp-tier-row--achieved",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <td>0</td>
                      <td>+0</td>
                      <td>0</td>
                      <td>—</td>
                      <td>{tier === 0 ? <span className="psychic-pp-tier-marker">You are here</span> : "—"}</td>
                    </tr>
                    {globalPotentialRows.map((row) => {
                      const isCurrent = tier === row.tierNumber;
                      const isAchieved = tier > row.tierNumber;
                      const isNext = tier + 1 === row.tierNumber;
                      const rowClass = [
                        "psychic-pp-tier-row",
                        isCurrent ? "psychic-pp-tier-row--current" : "",
                        isAchieved ? "psychic-pp-tier-row--achieved" : "",
                        isNext ? "psychic-pp-tier-row--next" : "",
                      ]
                        .filter(Boolean)
                        .join(" ");
                      let statusLabel = "—";
                      if (isCurrent) statusLabel = "You are here";
                      else if (isNext) statusLabel = "Next tier";
                      else if (isAchieved) statusLabel = "Achieved";

                      return (
                        <tr key={row.tierNumber} className={rowClass}>
                          <td>{row.tierNumber}</td>
                          <td>+{row.bonus}</td>
                          <td>{row.cumulative}</td>
                          <td>{row.incremental}</td>
                          <td>
                            {statusLabel !== "—" ? (
                              <span
                                className={
                                  isCurrent
                                    ? "psychic-pp-tier-marker"
                                    : isNext
                                      ? "psychic-pp-tier-marker psychic-pp-tier-marker--next"
                                      : "psychic-pp-tier-marker psychic-pp-tier-marker--achieved"
                                }
                              >
                                {statusLabel}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {nextTierBonus !== null ? (
                <button
                  type="button"
                  className="psychic-pp-global-buy"
                  disabled={!canRaiseGlobalPotential(character)}
                  onClick={() => apply(raiseGlobalPotential(character))}
                >
                  Raise to tier {tier + 1} (+{nextTierBonus} bonus) — {nextTierCost} PP
                </button>
              ) : (
                <p className="muted">Maximum global potential reached.</p>
              )}
            </div>
          )}

          {tab === "investment" && (
            <div className="psychic-pp-summary psychic-pp-investment">
              {learned.length === 0 ? (
                <p className="muted">Learn a power first to invest PP.</p>
              ) : (
                <>
                  <p className="muted psychic-pp-investment-intro">
                    Invest 1 Psychic Point per power for +10 potential (max {MAX_POWER_INVESTMENT} Psychic Points per power).
                  </p>
                  <div className="psychic-pp-tier-table-wrap">
                    <table className="psychic-pp-tier-table psychic-pp-investment-table">
                      <thead>
                        <tr>
                          <th>Power</th>
                          <th>Investment</th>
                          <th>Potential</th>
                          <th>Spend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {learned.map((powerName) => {
                          const def = psychicPowerDef(powerName);
                          const investment = normalizePsychic(character).powerInvestment?.[powerName] ?? 0;
                          const atMax = investment >= MAX_POWER_INVESTMENT;
                          const canInvest = canInvestInPower(character, powerName);
                          return (
                            <tr
                              key={powerName}
                              className={atMax ? "psychic-pp-investment-row--max" : undefined}
                            >
                              <td>
                                <strong>{powerName}</strong>
                                {def ? (
                                  <span className="muted psychic-pp-investment-power-meta">
                                    {" "}
                                    {def.isMatrix ? "Matrix" : def.discipline ? `${def.discipline}` : ""}
                                  </span>
                                ) : null}
                              </td>
                              <td>
                                {investment} / {MAX_POWER_INVESTMENT} PP
                              </td>
                              <td>{powerPotential(character, powerName)}</td>
                              <td className="psychic-pp-investment-action">
                                {atMax ? (
                                  <span className="psychic-pp-discipline-badge">Max</span>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={!canInvest}
                                    onClick={() => apply(investInPower(character, powerName))}
                                  >
                                    +1 PP
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "innate" && (
            <div className="psychic-pp-summary">
              <span className="muted psychic-pp-innate-slots-intro">
                    Some powers can be maintained. For each maintained power, you need to have a free innate slot.
              </span>
              <h1>
                Innate slots: <strong>{innateSlots}</strong>
              </h1>
              <button type="button" className="wizard-continue" disabled={!canBuyInnateSlot(character)} onClick={() => apply(buyInnateSlot(character))}>
                Buy innate slot (2 PP)
              </button>
            </div>
          )}

        </div>

        <footer className="dialog-footer">
          <button type="button" className="secondary" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </DialogBackdrop>
  );
}
