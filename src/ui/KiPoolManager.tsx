import {
  addKiGeneration,
  clampKiPoolValue,
  emptyKiPools,
  kiPoolDefinitions,
  maxKiCapacity,
  totalKiInPools,
  type KiPoolDefinition,
} from "../engine/kiPools";
import type { DerivedSheet } from "../engine/derived";
import { useEffect, useMemo, useState } from "react";
import { NumberInput } from "./NumberInput";

type KiPoolManagerProps = {
  sheet: DerivedSheet;
};

export function KiPoolManager({ sheet }: KiPoolManagerProps) {
  const definitions = useMemo(() => kiPoolDefinitions(sheet), [sheet]);
  const [pools, setPools] = useState(() => emptyKiPools(definitions));

  useEffect(() => {
    setPools(emptyKiPools(definitions));
  }, [definitions]);

  const poolTotal = totalKiInPools(pools, definitions);
  const capacity = maxKiCapacity(definitions);

  const generate = (mode: "full" | "half") => {
    setPools((current) => addKiGeneration(current, definitions, mode));
  };

  const resetPools = () => {
    setPools(emptyKiPools(definitions));
  };

  const setPoolValue = (id: string, value: number | null) => {
    const def = definitions.find((entry) => entry.id === id);
    if (!def) return;
    setPools((current) => ({
      ...current,
      [id]: clampKiPoolValue(value, def.max),
    }));
  };

  return (
    <details className="ki-pool-manager">
      <summary className="ki-pool-toggle sheet-subtitle">Ki pools</summary>
      <div className="ki-pool-manager-body">
        <p className="ki-pool-hint muted">Edit each pool to spend Ki (e.g. 2 STR and 1 DEX for a technique).</p>
        <div className={`ki-pool-grid${definitions.length === 1 ? " ki-pool-grid--combined" : ""}`}>
          {definitions.map((def) => (
            <KiPoolCard
              key={def.id}
              definition={def}
              current={pools[def.id] ?? 0}
              onChange={(value) => setPoolValue(def.id, value)}
            />
          ))}
        </div>
        <p className="ki-pool-summary muted">
          Total in pools: {poolTotal} / {capacity}
        </p>
        <div className="ki-pool-actions">
          <button type="button" onClick={() => generate("half")}>
            Half generation
          </button>
          <button type="button" onClick={() => generate("full")}>
            Full generation
          </button>
          <button type="button" className="secondary" onClick={resetPools}>
            Reset pools
          </button>
        </div>
      </div>
    </details>
  );
}

function KiPoolCard({
  definition,
  current,
  onChange,
}: {
  definition: KiPoolDefinition;
  current: number;
  onChange: (value: number | null) => void;
}) {
  return (
    <div className="ki-pool-card">
      <strong className="ki-pool-card-name">{definition.label}</strong>
      <label className="ki-pool-card-value">
        Pool
        <span className="ki-pool-card-input">
          <NumberInput min={0} max={definition.max} value={current} onChange={onChange} />
          <span className="ki-pool-card-max">/ {definition.max}</span>
        </span>
      </label>
      <p className="ki-pool-card-rate muted">Per turn: {definition.perTurn}</p>
    </div>
  );
}
