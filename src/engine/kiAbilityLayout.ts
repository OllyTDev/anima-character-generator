import dagre from "@dagrejs/dagre";
import type { KiGraph } from "./kiAbilityGraph";

export const KI_TREE_NODE_WIDTH = 120;
export const KI_TREE_NODE_HEIGHT = 48;

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

export function layoutKiGraph(
  graph: KiGraph,
  nodeWidth = KI_TREE_NODE_WIDTH,
  nodeHeight = KI_TREE_NODE_HEIGHT,
): KiGraphLayout {
  const layoutGraph = new dagre.graphlib.Graph();
  layoutGraph.setGraph({ rankdir: "TB", nodesep: 32, ranksep: 56, marginx: 24, marginy: 24 });
  layoutGraph.setDefaultEdgeLabel(() => ({}));

  for (const id of graph.nodes) {
    layoutGraph.setNode(id, { width: nodeWidth, height: nodeHeight });
  }
  for (const edge of graph.edges) {
    layoutGraph.setEdge(edge.from, edge.to);
  }

  dagre.layout(layoutGraph);

  const nodes = graph.nodes.map((id) => {
    const position = layoutGraph.node(id);
    return {
      id,
      x: position.x - nodeWidth / 2,
      y: position.y - nodeHeight / 2,
      width: nodeWidth,
      height: nodeHeight,
    };
  });

  const graphMeta = layoutGraph.graph();
  return {
    nodes,
    edges: graph.edges,
    width: Math.max(graphMeta.width ?? 0, nodeWidth),
    height: Math.max(graphMeta.height ?? 0, nodeHeight),
  };
}
