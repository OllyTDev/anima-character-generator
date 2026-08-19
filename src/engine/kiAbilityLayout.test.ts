import { describe, expect, it } from "vitest";
import { buildKiForestGraph } from "./kiAbilityGraph";
import { layoutKiGraph, primaryKiAbilityPrerequisite } from "./kiAbilityLayout";

function layoutX(graph: ReturnType<typeof buildKiForestGraph>, name: string): number {
  const layout = layoutKiGraph(graph);
  const node = layout.nodes.find((entry) => entry.id === name);
  if (!node) throw new Error(`Missing layout node: ${name}`);
  return node.x + node.width / 2;
}

describe("kiAbilityLayout", () => {
  it("uses the deepest listed requirement as the primary prerequisite", () => {
    const graph = buildKiForestGraph();
    expect(primaryKiAbilityPrerequisite(graph, "Ki Control")).toBe("Use of Ki");
    expect(primaryKiAbilityPrerequisite(graph, "Physical Dominion")).toBe("Ki Control");
    expect(primaryKiAbilityPrerequisite(graph, "Age Control")).toBe("Physical Dominion");
  });

  it("places children nearer their primary prerequisite than distant ancestors", () => {
    const graph = buildKiForestGraph();
    const ageControlX = layoutX(graph, "Age Control");
    const physicalDominionX = layoutX(graph, "Physical Dominion");
    const useOfKiX = layoutX(graph, "Use of Ki");

    expect(Math.abs(ageControlX - physicalDominionX)).toBeLessThan(Math.abs(ageControlX - useOfKiX));
  });

  it("aligns deeper abilities under their primary parent branch", () => {
    const graph = buildKiForestGraph();
    const physicalDominionX = layoutX(graph, "Physical Dominion");
    const kiControlX = layoutX(graph, "Ki Control");

    expect(Math.abs(physicalDominionX - kiControlX)).toBeLessThan(400);
  });

  it("assigns non-overlapping horizontal positions within each rank", () => {
    const graph = buildKiForestGraph();
    const layout = layoutKiGraph(graph);
    const byRank = new Map<number, typeof layout.nodes>();

    for (const node of layout.nodes) {
      const bucket = byRank.get(node.y) ?? [];
      bucket.push(node);
      byRank.set(node.y, bucket);
    }

    for (const rankNodes of byRank.values()) {
      const sorted = [...rankNodes].sort((a, b) => a.x - b.x);
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].x).toBeGreaterThanOrEqual(sorted[i - 1].x + sorted[i - 1].width);
      }
    }
  });

  it("centers the root within the top two ranks", () => {
    const graph = buildKiForestGraph();
    const layout = layoutKiGraph(graph);
    const rankYs = [...new Set(layout.nodes.map((node) => node.y))].sort((a, b) => a - b);
    const topNodes = layout.nodes.filter((node) => node.y === rankYs[0] || node.y === rankYs[1]);
    const minX = Math.min(...topNodes.map((node) => node.x));
    const maxX = Math.max(...topNodes.map((node) => node.x + node.width));
    const topCenterX = (minX + maxX) / 2;
    const useOfKi = layout.nodes.find((node) => node.id === "Use of Ki")!;
    const rootCenterX = useOfKi.x + useOfKi.width / 2;

    expect(Math.abs(rootCenterX - topCenterX)).toBeLessThan(useOfKi.width);
  });

  it("splits heavy root branches to opposite sides of Use of Ki", () => {
    const graph = buildKiForestGraph();
    const rootX = layoutX(graph, "Use of Ki");
    const necessaryX = layoutX(graph, "Use of Necessary Energy");
    const weightX = layoutX(graph, "Weight Elimination");
    const presenceX = layoutX(graph, "Presence Extrusion");

    const necessarySide = necessaryX < rootX ? "left" : "right";
    const weightSide = weightX < rootX ? "left" : "right";
    const presenceSide = presenceX < rootX ? "left" : "right";

    expect(necessarySide).toBe(weightSide);
    expect(necessarySide).not.toBe(presenceSide);
  });
});
