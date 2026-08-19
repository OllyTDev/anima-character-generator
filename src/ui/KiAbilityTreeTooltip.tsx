import { kiAbilities, kiAbilityCost } from "../data/kiAbilities";
import type { KiAbilityNodeStatus } from "../engine/kiAbilityGraph";
import { kiAbilityEffectText } from "../engine/kiAbilityGraph";

type KiAbilityTreeTooltipProps = {
  name: string;
  cost: number;
  ollyTRules: boolean;
  status: KiAbilityNodeStatus;
  missingRequirements: string[];
  visible: boolean;
  x: number;
  y: number;
};

export function KiAbilityTreeTooltip({
  name,
  cost,
  ollyTRules,
  status,
  missingRequirements,
  visible,
  x,
  y,
}: KiAbilityTreeTooltipProps) {
  if (!visible) return null;

  const def = kiAbilities[name];
  const baseCost = def.MK;
  const ollyCost = def.OTMK;
  const showOllyNote = ollyTRules && baseCost !== ollyCost;

  return (
    <div
      className="ki-tree-tooltip"
      style={{ left: x + 12, top: y + 12 }}
      role="tooltip"
    >
      <strong>{name}</strong>
      <p className="ki-tree-tooltip-cost">
        {cost} MK
        {showOllyNote ? <span className="muted"> (standard {baseCost} MK)</span> : null}
      </p>
      <p className="ki-tree-tooltip-effect">{kiAbilityEffectText(name)}</p>
      {def.Option_Title ? (
        <p className="muted ki-tree-tooltip-note">Requires choosing {def.Option_Title.toLowerCase()} when purchased.</p>
      ) : null}
      {status === "locked" && missingRequirements.length ? (
        <div className="ki-tree-tooltip-reqs">
          <span>Missing requirements:</span>
          <ul>
            {missingRequirements.map((req) => (
              <li key={req}>{req}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {status === "unaffordable" ? (
        <p className="ki-tree-tooltip-warning">Costs more MK than remaining (overspend penalty may apply).</p>
      ) : null}
    </div>
  );
}

export function kiAbilityDisplayCost(name: string, ollyTRules: boolean): number {
  return kiAbilityCost(name, ollyTRules);
}
