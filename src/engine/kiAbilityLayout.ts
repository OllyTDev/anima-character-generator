import { kiAbilities } from "../data/kiAbilities";
import type { KiGraph } from "./kiAbilityGraph";

export const KI_TREE_NODE_WIDTH = 120;
export const KI_TREE_NODE_HEIGHT = 48;

const NODE_SEP = 32;
const RANK_SEP = 56;
const MARGIN = 24;

export type LayoutNode = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LayoutEdge = {
  from: string;
  to: string;
};

export type KiGraphLayout = {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
};

type GraphIndexes = {
  nodeSet: Set<string>;
  requirements: Map<string, string[]>;
  ranks: Map<string, number>;
};

function buildGraphIndexes(graph: KiGraph): GraphIndexes {
  const nodeSet = new Set(graph.nodes);
  const requirements = new Map<string, string[]>();
  for (const node of graph.nodes) {
    const reqs = (kiAbilities[node].Requirements ?? []).filter((req) => nodeSet.has(req));
    requirements.set(node, reqs);
  }

  const ranks = new Map<string, number>();
  function rankFor(node: string): number {
    const cached = ranks.get(node);
    if (cached !== undefined) return cached;
    const reqs = requirements.get(node) ?? [];
    const rank = reqs.length === 0 ? 0 : 1 + Math.max(...reqs.map(rankFor));
    ranks.set(node, rank);
    return rank;
  }
  for (const node of graph.nodes) rankFor(node);

  return { nodeSet, requirements, ranks };
}

/** Deepest direct prerequisite; ties broken by catalog order in Requirements. */
export function primaryKiAbilityPrerequisite(graph: KiGraph, name: string): string | null {
  const { requirements, ranks } = buildGraphIndexes(graph);
  const reqs = requirements.get(name) ?? [];
  if (!reqs.length) return null;

  return reqs.reduce((best, req) => {
    const bestRank = ranks.get(best) ?? 0;
    const reqRank = ranks.get(req) ?? 0;
    if (reqRank > bestRank) return req;
    if (reqRank < bestRank) return best;
    return reqs.indexOf(req) < reqs.indexOf(best) ? req : best;
  });
}

function collectSubtreeNodes(graph: KiGraph, anchor: string): string[] {
  const result = [anchor];
  const stack = [anchor];
  while (stack.length) {
    const node = stack.pop()!;
    for (const edge of graph.edges) {
      if (edge.from === node && !result.includes(edge.to)) {
        result.push(edge.to);
        stack.push(edge.to);
      }
    }
  }
  return result;
}

function estimateSubtreeWidth(
  graph: KiGraph,
  anchor: string,
  indexes: GraphIndexes,
  nodeWidth: number,
  nodeSep: number,
): number {
  const anchorRank = indexes.ranks.get(anchor) ?? 0;
  const breadthByRelativeRank = new Map<number, number>();
  for (const node of collectSubtreeNodes(graph, anchor)) {
    const relativeRank = (indexes.ranks.get(node) ?? 0) - anchorRank;
    breadthByRelativeRank.set(relativeRank, (breadthByRelativeRank.get(relativeRank) ?? 0) + 1);
  }
  const maxBreadth = Math.max(1, ...breadthByRelativeRank.values());
  return maxBreadth * nodeWidth + Math.max(maxBreadth - 1, 0) * nodeSep;
}

export function partitionRootChildren(
  children: string[],
  graph: KiGraph,
  indexes: GraphIndexes,
  nodeWidth: number,
  nodeSep: number,
): { left: string[]; right: string[] } {
  const weighted = children
    .map((name) => ({
      name,
      weight: estimateSubtreeWidth(graph, name, indexes, nodeWidth, nodeSep),
    }))
    .sort((a, b) => b.weight - a.weight || a.name.localeCompare(b.name));

  const left: string[] = [];
  const right: string[] = [];
  let leftWeight = 0;
  let rightWeight = 0;
  for (const item of weighted) {
    if (leftWeight <= rightWeight) {
      left.push(item.name);
      leftWeight += item.weight;
    } else {
      right.push(item.name);
      rightWeight += item.weight;
    }
  }
  return { left, right };
}

function placeBalancedRootChildren(
  rootId: string,
  children: string[],
  y: number,
  positions: Map<string, { x: number; y: number }>,
  graph: KiGraph,
  indexes: GraphIndexes,
  nodeWidth: number,
  nodeSep: number,
) {
  const rootPos = positions.get(rootId);
  if (!rootPos) return;

  const rootCenter = rootPos.x + nodeWidth / 2;
  const { left, right } = partitionRootChildren(children, graph, indexes, nodeWidth, nodeSep);
  const sortByWeight = (names: string[]) =>
    [...names].sort(
      (a, b) =>
        estimateSubtreeWidth(graph, b, indexes, nodeWidth, nodeSep) -
          estimateSubtreeWidth(graph, a, indexes, nodeWidth, nodeSep) ||
        a.localeCompare(b),
    );

  let cursor = rootCenter + nodeWidth / 2 + nodeSep;
  for (const name of sortByWeight(right)) {
    const laneWidth = estimateSubtreeWidth(graph, name, indexes, nodeWidth, nodeSep);
    positions.set(name, { x: cursor + laneWidth / 2 - nodeWidth / 2, y });
    cursor += laneWidth + nodeSep;
  }

  cursor = rootCenter - nodeWidth / 2 - nodeSep;
  for (const name of sortByWeight(left)) {
    const laneWidth = estimateSubtreeWidth(graph, name, indexes, nodeWidth, nodeSep);
    cursor -= laneWidth;
    positions.set(name, { x: cursor + laneWidth / 2 - nodeWidth / 2, y });
    cursor -= nodeSep;
  }
}

/** Push apart overlapping nodes without snapping the whole rank to the left margin. */
function resolveRankOverlaps(
  nodes: string[],
  positions: Map<string, { x: number; y: number }>,
  nodeWidth: number,
  nodeSep: number,
) {
  const sorted = [...nodes].sort(
    (a, b) => (positions.get(a)?.x ?? 0) - (positions.get(b)?.x ?? 0),
  );
  for (let i = 1; i < sorted.length; i++) {
    const previous = sorted[i - 1];
    const current = sorted[i];
    const previousPos = positions.get(previous);
    const currentPos = positions.get(current);
    if (!previousPos || !currentPos) continue;
    const minX = previousPos.x + nodeWidth + nodeSep;
    if (currentPos.x < minX) {
      currentPos.x = minX;
    }
  }
}

function layoutPass(
  graph: KiGraph,
  indexes: GraphIndexes,
  rootStartX: number,
  nodeWidth: number,
  nodeHeight: number,
): LayoutNode[] {
  const { ranks } = indexes;
  const positions = new Map<string, { x: number; y: number }>();
  const rootSet = new Set(
    graph.nodes.filter((node) => (ranks.get(node) ?? 0) === 0),
  );

  const nodesByRank = new Map<number, string[]>();
  for (const node of graph.nodes) {
    const rank = ranks.get(node) ?? 0;
    const bucket = nodesByRank.get(rank) ?? [];
    bucket.push(node);
    nodesByRank.set(rank, bucket);
  }

  const maxRank = Math.max(0, ...[...ranks.values()]);
  const roots = nodesByRank.get(0) ?? [];
  roots.sort((a, b) => a.localeCompare(b));

  let rootX = rootStartX;
  for (const root of roots) {
    positions.set(root, { x: rootX, y: MARGIN });
    rootX += nodeWidth + NODE_SEP;
  }

  for (let rank = 1; rank <= maxRank; rank++) {
    const rankNodes = nodesByRank.get(rank) ?? [];
    if (!rankNodes.length) continue;

    const groups = new Map<string, string[]>();
    for (const node of rankNodes) {
      const parent = primaryKiAbilityPrerequisite(graph, node) ?? "";
      const bucket = groups.get(parent) ?? [];
      bucket.push(node);
      groups.set(parent, bucket);
    }

    const y = MARGIN + rank * (nodeHeight + RANK_SEP);
    const placed = new Set<string>();

    for (const [parentId, children] of groups.entries()) {
      if (rank === 1 && rootSet.has(parentId) && rootSet.size === 1) {
        placeBalancedRootChildren(
          parentId,
          children,
          y,
          positions,
          graph,
          indexes,
          nodeWidth,
          NODE_SEP,
        );
        for (const child of children) placed.add(child);
      }
    }

    const orderedGroups = [...groups.entries()]
      .filter(([, children]) => !children.every((child) => placed.has(child)))
      .sort(([parentA], [parentB]) => {
        const xA = parentA ? (positions.get(parentA)?.x ?? 0) : 0;
        const xB = parentB ? (positions.get(parentB)?.x ?? 0) : 0;
        if (xA !== xB) return xA - xB;
        return parentA.localeCompare(parentB);
      });

    let nextFreeX = Number.NEGATIVE_INFINITY;

    for (const [parentId, children] of orderedGroups) {
      const pending = children.filter((child) => !placed.has(child));
      if (!pending.length) continue;

      pending.sort((a, b) => a.localeCompare(b));
      const groupWidth = pending.length * nodeWidth + Math.max(pending.length - 1, 0) * NODE_SEP;
      const parentCenter = parentId
        ? (positions.get(parentId)?.x ?? MARGIN) + nodeWidth / 2
        : rootStartX + nodeWidth / 2;
      let startX = parentCenter - groupWidth / 2;
      if (Number.isFinite(nextFreeX)) {
        startX = Math.max(startX, nextFreeX);
      }

      for (const child of pending) {
        positions.set(child, { x: startX, y });
        placed.add(child);
        startX += nodeWidth + NODE_SEP;
      }
      nextFreeX = startX;
    }

    resolveRankOverlaps(rankNodes, positions, nodeWidth, NODE_SEP);
  }

  return graph.nodes.map((id) => {
    const pos = positions.get(id) ?? { x: MARGIN, y: MARGIN };
    return {
      id,
      x: pos.x,
      y: pos.y,
      width: nodeWidth,
      height: nodeHeight,
    };
  });
}

function normalizeLayoutMinX(layoutNodes: LayoutNode[]) {
  if (!layoutNodes.length) return;
  const minX = Math.min(...layoutNodes.map((node) => node.x));
  const shiftX = MARGIN - minX;
  if (shiftX === 0) return;
  for (const node of layoutNodes) {
    node.x += shiftX;
  }
}

function measureContentWidth(layoutNodes: LayoutNode[]): number {
  const minX = Math.min(...layoutNodes.map((node) => node.x));
  const maxX = Math.max(...layoutNodes.map((node) => node.x + node.width));
  return maxX - minX;
}

function rootGroupStartX(contentWidth: number, rootCount: number, nodeWidth: number): number {
  const rootsWidth = rootCount * nodeWidth + Math.max(rootCount - 1, 0) * NODE_SEP;
  return MARGIN + contentWidth / 2 - rootsWidth / 2;
}

export function layoutKiGraph(
  graph: KiGraph,
  nodeWidth = KI_TREE_NODE_WIDTH,
  nodeHeight = KI_TREE_NODE_HEIGHT,
): KiGraphLayout {
  const indexes = buildGraphIndexes(graph);
  const roots = graph.nodes.filter((node) => (indexes.ranks.get(node) ?? 0) === 0);

  let rootStartX = MARGIN;
  let layoutNodes = layoutPass(graph, indexes, rootStartX, nodeWidth, nodeHeight);
  normalizeLayoutMinX(layoutNodes);

  for (let pass = 0; pass < 2; pass++) {
    const contentWidth = measureContentWidth(layoutNodes);
    rootStartX = rootGroupStartX(contentWidth, roots.length, nodeWidth);
    layoutNodes = layoutPass(graph, indexes, rootStartX, nodeWidth, nodeHeight);
    normalizeLayoutMinX(layoutNodes);
  }

  const minX = Math.min(...layoutNodes.map((node) => node.x));
  const maxX = Math.max(...layoutNodes.map((node) => node.x + node.width));
  const maxY = Math.max(...layoutNodes.map((node) => node.y + nodeHeight));

  return {
    nodes: layoutNodes,
    edges: graph.edges,
    width: maxX - minX + MARGIN,
    height: maxY + MARGIN,
  };
}
