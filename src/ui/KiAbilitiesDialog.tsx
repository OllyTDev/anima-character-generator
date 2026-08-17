import { buildKiForestGraph, buildNemesisForestGraph, canLearnKiAbility, missingKiAbilityRequirements } from "../engine/kiAbilityGraph";
import { buildKiAbilityOptions, kiAbilityGroups, type KiAbilityOption } from "../engine/kiAbilityOptions";
import { addKiAbility, hasKiAbility } from "../engine/martialKnowledge";
import type { CharacterDocument } from "../schema/character";
import { useEffect, useMemo, useState } from "react";
import { KiAbilityTree } from "./KiAbilityTree";

type KiAbilitiesDialogProps = {
  character: CharacterDocument;
  level: number;
  mkRemaining: number;
  open: boolean;
  onClose: () => void;
  onLearn: (character: CharacterDocument) => void;
};

type KiDialogTab = "tree" | "list";
type ExpandedTree = "ki" | "nemesis" | null;

function findKiAbilityOption(options: KiAbilityOption[], name: string): KiAbilityOption | undefined {
  return options.find((item) => item.name === name);
}

export function KiAbilitiesDialog({ character, level, mkRemaining, open, onClose, onLearn }: KiAbilitiesDialogProps) {
  const [tab, setTab] = useState<KiDialogTab>("tree");
  const [expandedTree, setExpandedTree] = useState<ExpandedTree>(null);
  const [selected, setSelected] = useState<KiAbilityOption | null>(null);
  const [option, setOption] = useState("");
  const [search, setSearch] = useState("");
  const grouped = useMemo(() => kiAbilityGroups(character), [character]);
  const allOptions = useMemo(() => buildKiAbilityOptions(character), [character]);
  const kiGraph = useMemo(() => buildKiForestGraph(), []);
  const nemesisGraph = useMemo(() => buildNemesisForestGraph(), []);

  useEffect(() => {
    if (open) {
      setTab("tree");
      setExpandedTree(null);
      setSelected(null);
      setOption("");
      setSearch("");
    }
  }, [open]);

  if (!open) return null;

  const selectAbility = (name: string) => {
    const item = findKiAbilityOption(allOptions, name);
    if (!item) return;
    setSelected(item);
    setOption(item.options?.find((value) => !hasKiAbility(character, name, value)) ?? item.options?.[0] ?? "");
  };

  const selectedStatus = selected
    ? canLearnKiAbility(character, selected.name, level, mkRemaining)
    : false;
  const missingRequirements = selected
    ? missingKiAbilityRequirements(character, selected.name, level)
    : [];

  const confirmLearn = () => {
    if (!selected || !selectedStatus) return;
    onLearn(addKiAbility(character, selected.name, level, selected.options ? option : undefined));
    onClose();
  };

  const filteredGroups = Object.entries(grouped).map(([group, items]) => [
    group,
    items.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase())),
  ] as const);

  return (
    <div className="dialog-backdrop dialog-backdrop--fullscreen" onClick={onClose}>
      <div
        className="dialog spend-dp-dialog ki-tree-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="ki-abilities-title"
        aria-modal="true"
      >
        <header className="dialog-header natural-bonus-dialog-header">
          <div className="natural-bonus-dialog-header-top">
            <h2 id="ki-abilities-title">Ki abilities</h2>
          </div>
          <p className="muted">
            Level {level}. MK remaining {mkRemaining}. Select a Ki or Nemesis ability to learn.
          </p>
        </header>

        <div className="spend-dp-tabs" role="tablist" aria-label="Ki ability views">
          <button type="button" className={tab === "tree" ? "active" : ""} onClick={() => setTab("tree")}>
            Tree
          </button>
          <button type="button" className={tab === "list" ? "active" : ""} onClick={() => setTab("list")}>
            List
          </button>
        </div>

        {tab === "tree" ? (
          <div className={`ki-tree-tab-panel${expandedTree ? " ki-tree-tab-panel--single" : ""}`}>
            {(expandedTree === null || expandedTree === "ki") && (
              <KiAbilityTree
                title="Ki"
                graph={kiGraph}
                character={character}
                level={level}
                mkRemaining={mkRemaining}
                selectedName={selected?.name ?? null}
                expanded={expandedTree === "ki"}
                onToggleExpand={() => setExpandedTree(expandedTree === "ki" ? null : "ki")}
                onSelect={selectAbility}
              />
            )}
            {(expandedTree === null || expandedTree === "nemesis") && (
              <KiAbilityTree
                title="Nemesis"
                graph={nemesisGraph}
                character={character}
                level={level}
                mkRemaining={mkRemaining}
                selectedName={selected?.name ?? null}
                expanded={expandedTree === "nemesis"}
                onToggleExpand={() => setExpandedTree(expandedTree === "nemesis" ? null : "nemesis")}
                onSelect={selectAbility}
              />
            )}
          </div>
        ) : (
          <div className="spend-dp-tab-panel">
            <label className="ki-list-search">
              Search
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Filter by ability name"
              />
            </label>
            <div className="natural-bonus-fields spend-dp-fields">
              {filteredGroups.map(([group, items]) => {
                if (!items.length) return null;
                return (
                  <section key={group} className="natural-bonus-field">
                    <h3>{group}</h3>
                    <ul className="natural-bonus-list">
                      {items.map((item) => (
                        <li key={item.name}>
                          <button
                            type="button"
                            className={`natural-bonus-item ${selected?.name === item.name ? "natural-bonus-item--selected" : ""}`}
                            onClick={() => selectAbility(item.name)}
                          >
                            {item.name} ({item.cost} MK)
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          </div>
        )}

        <footer className="dialog-footer spend-dp-footer">
          {!selected ? (
            <p className="muted spend-dp-hint">Select a Ki ability above to learn.</p>
          ) : (
            <div className="spend-dp-confirm">
              <p>
                Learn <strong>{selected.name}</strong> ({selected.cost} MK)
                {selected.optionTitle ? <span className="muted"> — {selected.optionTitle}</span> : null}
              </p>
              {!selectedStatus && missingRequirements.length ? (
                <p className="ki-tree-footer-warning">
                  Missing requirements: {missingRequirements.join(", ")}
                </p>
              ) : null}
              {!selectedStatus && !missingRequirements.length ? (
                <p className="ki-tree-footer-warning">This ability has already been learned.</p>
              ) : null}
              {selected.options && selectedStatus ? (
                <label>
                  {selected.optionTitle ?? "Option"}
                  <select value={option} onChange={(event) => setOption(event.target.value)}>
                    {selected.options.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <button type="button" onClick={confirmLearn} disabled={!selectedStatus}>
                Learn Ki ability
              </button>
            </div>
          )}
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
}
