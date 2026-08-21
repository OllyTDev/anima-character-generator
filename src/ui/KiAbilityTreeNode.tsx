import type { FocusEvent, MouseEvent } from "react";
import type { KiAbilityNodeStatus } from "../engine/kiAbilityGraph";

type KiAbilityTreeNodeProps = {
  name: string;
  label: string;
  cost: number;
  status: KiAbilityNodeStatus;
  selected: boolean;
  onPath: boolean;
  pathTarget: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  onSelect: (name: string, event?: MouseEvent<HTMLButtonElement>) => void;
  onHover: (name: string | null, event?: MouseEvent | FocusEvent) => void;
};

export function KiAbilityTreeNode({
  name,
  label,
  cost,
  status,
  selected,
  onPath,
  pathTarget,
  x,
  y,
  width,
  height,
  onSelect,
  onHover,
}: KiAbilityTreeNodeProps) {
  const classes = [
    "ki-tree-node",
    `ki-tree-node--${status}`,
    selected ? "ki-tree-node--selected" : "",
    onPath ? "ki-tree-node--path" : "",
    pathTarget ? "ki-tree-node--path-target" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      style={{ left: x, top: y, width, height }}
      aria-label={`${name}, ${cost} MK, ${status}`}
      aria-pressed={selected}
      onClick={(event) => onSelect(name, event)}
      onMouseEnter={(event) => onHover(name, event)}
      onMouseLeave={() => onHover(null)}
      onFocus={(event) => onHover(name, event)}
      onBlur={() => onHover(null)}
    >
      <span className="ki-tree-node-label">{label}</span>
      <span className={`ki-tree-node-cost${status === "unaffordable" ? " ki-tree-node-cost--warning" : ""}`}>
        {cost}
      </span>
    </button>
  );
}

export function abbreviateKiAbilityName(name: string, maxLength = 16): string {
  if (name.length <= maxLength) return name;
  return `${name.slice(0, maxLength - 1)}…`;
}
