import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KiGraph } from "../engine/kiAbilityGraph";
import {
  kiAbilityEdgeKey,
  kiAbilityNodeStatus,
  kiAbilityPrerequisitePath,
  missingKiAbilityRequirements,
} from "../engine/kiAbilityGraph";
import { KI_TREE_NODE_HEIGHT, KI_TREE_NODE_WIDTH, layoutKiGraph } from "../engine/kiAbilityLayout";
import type { CharacterDocument } from "../schema/character";
import { abbreviateKiAbilityName, KiAbilityTreeNode } from "./KiAbilityTreeNode";
import { kiAbilityDisplayCost, KiAbilityTreeTooltip } from "./KiAbilityTreeTooltip";

type KiAbilityTreeProps = {
  title: string;
  graph: KiGraph;
  character: CharacterDocument;
  level: number;
  mkRemaining: number;
  selectedName: string | null;
  expanded: boolean;
  onToggleExpand: () => void;
  onSelect: (name: string) => void;
};

type TooltipState = {
  name: string;
  x: number;
  y: number;
} | null;

export function KiAbilityTree({
  title,
  graph,
  character,
  level,
  mkRemaining,
  selectedName,
  expanded,
  onToggleExpand,
  onSelect,
}: KiAbilityTreeProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 16, y: 16 });
  const [scale, setScale] = useState(1);
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const dragState = useRef<{ active: boolean; x: number; y: number }>({ active: false, x: 0, y: 0 });

  const layout = useMemo(() => layoutKiGraph(graph), [graph]);
  const nodeMap = useMemo(() => new Map(layout.nodes.map((node) => [node.id, node])), [layout.nodes]);

  const pathTarget = useMemo(() => {
    if (tooltip?.name && graph.nodes.includes(tooltip.name)) return tooltip.name;
    if (selectedName && graph.nodes.includes(selectedName)) return selectedName;
    return null;
  }, [graph.nodes, selectedName, tooltip?.name]);

  const prerequisitePath = useMemo(
    () => (pathTarget ? kiAbilityPrerequisitePath(graph, pathTarget) : null),
    [graph, pathTarget],
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rankYs = [...new Set(layout.nodes.map((node) => node.y))].sort((a, b) => a - b);
    const topRankYs = new Set(rankYs.slice(0, 2));
    const focusNodes = layout.nodes.filter((node) => topRankYs.has(node.y));
    if (!focusNodes.length) return;

    const minX = Math.min(...focusNodes.map((node) => node.x));
    const maxX = Math.max(...focusNodes.map((node) => node.x + node.width));
    const focusCenterX = (minX + maxX) / 2;
    const focusMinY = Math.min(...focusNodes.map((node) => node.y));

    setPan({
      x: viewport.clientWidth / 2 - focusCenterX,
      y: Math.max(16, viewport.clientHeight * 0.08 - focusMinY),
    });
    setScale(1);
  }, [layout, title, expanded]);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    setScale((current) => Math.min(2, Math.max(0.45, current * (event.deltaY > 0 ? 0.92 : 1.08))));
  }, []);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest(".ki-tree-node")) return;
    dragState.current = { active: true, x: event.clientX - pan.x, y: event.clientY - pan.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [pan.x, pan.y]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    setPan({ x: event.clientX - dragState.current.x, y: event.clientY - dragState.current.y });
  }, []);

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    dragState.current.active = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  const handleHover = useCallback((name: string | null, event?: React.MouseEvent | React.FocusEvent) => {
    if (!name || !event) {
      setTooltip(null);
      return;
    }
    if ("clientX" in event) {
      setTooltip({ name, x: event.clientX, y: event.clientY });
      return;
    }
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    setTooltip({ name, x: rect.right, y: rect.top });
  }, []);

  const tooltipName = tooltip?.name ?? "";
  const tooltipStatus = tooltipName
    ? kiAbilityNodeStatus(character, tooltipName, level, mkRemaining)
    : "locked";
  const tooltipMissing = tooltipName
    ? missingKiAbilityRequirements(character, tooltipName, level)
    : [];

  return (
    <section className="ki-tree-panel">
      <div className="ki-tree-panel-header">
        <h3>{title}</h3>
        <button type="button" className="secondary ki-tree-expand" onClick={onToggleExpand}>
          {expanded ? "Show both trees" : "Expand"}
        </button>
      </div>
      <div
        ref={viewportRef}
        className={`ki-tree-viewport${prerequisitePath ? " ki-tree-viewport--path-active" : ""}`}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="ki-tree-canvas"
          style={{
            width: layout.width + 48,
            height: layout.height + 48,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          <svg
            className="ki-tree-edges"
            width={layout.width + 48}
            height={layout.height + 48}
            aria-hidden="true"
          >
            {layout.edges.map((edge) => {
              const from = nodeMap.get(edge.from);
              const to = nodeMap.get(edge.to);
              if (!from || !to) return null;
              const x1 = from.x + from.width / 2;
              const y1 = from.y + from.height;
              const x2 = to.x + to.width / 2;
              const y2 = to.y;
              const midY = (y1 + y2) / 2;
              const edgeKey = kiAbilityEdgeKey(edge);
              const onPath = prerequisitePath?.edges.has(edgeKey) ?? false;
              return (
                <path
                  key={edgeKey}
                  className={`ki-tree-edge${onPath ? " ki-tree-edge--path" : ""}`}
                  d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                />
              );
            })}
          </svg>
          <div className="ki-tree-nodes">
            {layout.nodes.map((node) => (
              <KiAbilityTreeNode
                key={node.id}
                name={node.id}
                label={abbreviateKiAbilityName(node.id)}
                cost={kiAbilityDisplayCost(node.id, character.settings.ollyTRules)}
                status={kiAbilityNodeStatus(character, node.id, level, mkRemaining)}
                selected={selectedName === node.id}
                onPath={prerequisitePath?.nodes.has(node.id) ?? false}
                pathTarget={pathTarget === node.id}
                x={node.x}
                y={node.y}
                width={node.width ?? KI_TREE_NODE_WIDTH}
                height={node.height ?? KI_TREE_NODE_HEIGHT}
                onSelect={onSelect}
                onHover={handleHover}
              />
            ))}
          </div>
        </div>
      </div>
      {tooltip ? (
        <KiAbilityTreeTooltip
          name={tooltipName}
          cost={kiAbilityDisplayCost(tooltipName, character.settings.ollyTRules)}
          ollyTRules={character.settings.ollyTRules}
          status={tooltipStatus}
          missingRequirements={tooltipMissing}
          visible={Boolean(tooltipName)}
          x={tooltip.x}
          y={tooltip.y}
        />
      ) : null}
    </section>
  );
}
