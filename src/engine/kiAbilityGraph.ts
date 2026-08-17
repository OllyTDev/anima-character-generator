import { kiAbilities, kiAbilityCost } from "../data/kiAbilities";
import type { CharacterDocument } from "../schema/character";
import { hasKiAbility } from "./martialKnowledge";

export const KI_ABILITY_EFFECT_PLACEHOLDER = "Effect not yet documented.";

const CORE_NAMES = new Set(["Use of Ki", "Use of Nemesis", "Use of Necessary Energy"]);

export type KiAbilityForest = "ki" | "nemesis";

export type KiGraphEdge = { from: string; to: string };

export type KiGraph = {
  nodes: string[];
  edges: KiGraphEdge[];
};

export type KiAbilityNodeStatus = "learned" | "available" | "locked" | "unaffordable";

export function kiAbilityForest(name: string): KiAbilityForest | "core" {
  if (CORE_NAMES.has(name)) return "core";
  const def = kiAbilities[name];
  if (name.includes("Nemesis") || def.Requirements?.some((req) => req.includes("Nemesis"))) {
    return "nemesis";
  }
  return "ki";
}

export function partitionKiAbilities(): { ki: string[]; nemesis: string[]; core: string[] } {
  const ki: string[] = [];
  const nemesis: string[] = [];
  const core: string[] = [];
  for (const name of Object.keys(kiAbilities)) {
    const forest = kiAbilityForest(name);
    if (forest === "core") core.push(name);
    else if (forest === "nemesis") nemesis.push(name);
    else ki.push(name);
  }
  return { ki, nemesis, core };
}

function buildGraphForNodes(nodes: string[]): KiGraph {
  const nodeSet = new Set(nodes);
  const edges: KiGraphEdge[] = [];
  for (const name of nodes) {
    for (const req of kiAbilities[name].Requirements ?? []) {
      if (nodeSet.has(req)) edges.push({ from: req, to: name });
    }
  }
  return { nodes, edges };
}

export function buildKiForestGraph(): KiGraph {
  const { ki, core } = partitionKiAbilities();
  const kiNodes = [...core.filter((name) => name !== "Use of Nemesis"), ...ki];
  return buildGraphForNodes(kiNodes);
}

export function buildNemesisForestGraph(): KiGraph {
  const { nemesis, core } = partitionKiAbilities();
  const nemesisNodes = [...core.filter((name) => name === "Use of Nemesis"), ...nemesis];
  return buildGraphForNodes(nemesisNodes);
}

export function kiAbilityRoots(): string[] {
  return Object.entries(kiAbilities)
    .filter(([, def]) => !def.Requirements?.length)
    .map(([name]) => name);
}

export function kiAbilityRequirementsMet(character: CharacterDocument, name: string, level: number): boolean {
  return missingKiAbilityRequirements(character, name, level).length === 0;
}

export function missingKiAbilityRequirements(
  character: CharacterDocument,
  name: string,
  level: number,
): string[] {
  return (kiAbilities[name].Requirements ?? []).filter((req) => !hasKiAbility(character, req, undefined, level));
}

function optionSlotsRemaining(character: CharacterDocument, name: string): number {
  const def = kiAbilities[name];
  if (!def.Option_Title || !def.Options) return 0;
  return def.Options.filter((option) => !hasKiAbility(character, name, option)).length;
}

function isFullyLearned(character: CharacterDocument, name: string): boolean {
  const def = kiAbilities[name];
  if (def.Option_Title && def.Options) return optionSlotsRemaining(character, name) === 0;
  return hasKiAbility(character, name);
}

export function kiAbilityNodeStatus(
  character: CharacterDocument,
  name: string,
  level: number,
  mkRemaining: number,
): KiAbilityNodeStatus {
  const cost = kiAbilityCost(name, character.settings.ollyTRules);
  const overspendLimit = mkRemaining + 50;

  if (isFullyLearned(character, name)) return "learned";
  if (!kiAbilityRequirementsMet(character, name, level)) return "locked";
  if (cost > overspendLimit) return "unaffordable";
  return "available";
}

export function canLearnKiAbility(
  character: CharacterDocument,
  name: string,
  level: number,
  mkRemaining: number,
): boolean {
  const status = kiAbilityNodeStatus(character, name, level, mkRemaining);
  return status === "available" || status === "unaffordable";
}

export function kiAbilityEffectText(name: string): string {
  return kiAbilities[name].effect ?? KI_ABILITY_EFFECT_PLACEHOLDER;
}

export function hasKiGraphCycle(graph: KiGraph): boolean {
  const visited = new Set<string>();
  const stack = new Set<string>();

  function visit(node: string): boolean {
    if (stack.has(node)) return true;
    if (visited.has(node)) return false;
    visited.add(node);
    stack.add(node);
    for (const edge of graph.edges) {
      if (edge.from === node && visit(edge.to)) return true;
    }
    stack.delete(node);
    return false;
  }

  return graph.nodes.some((node) => visit(node));
}

export type KiAbilityPrerequisitePath = {
  nodes: ReadonlySet<string>;
  edges: ReadonlySet<string>;
};

export function kiAbilityEdgeKey(edge: KiGraphEdge): string {
  return `${edge.from}\0${edge.to}`;
}

/** All prerequisites of `name` within `graph`, plus connecting edges back toward the roots. */
export function kiAbilityPrerequisitePath(graph: KiGraph, name: string): KiAbilityPrerequisitePath {
  if (!graph.nodes.includes(name)) {
    return { nodes: new Set(), edges: new Set() };
  }

  const nodes = new Set<string>([name]);
  const nodeSet = new Set(graph.nodes);
  const requirements = new Map<string, string[]>();
  for (const node of graph.nodes) {
    requirements.set(
      node,
      (kiAbilities[node].Requirements ?? []).filter((req) => nodeSet.has(req)),
    );
  }

  const stack = [name];
  while (stack.length) {
    const current = stack.pop()!;
    for (const req of requirements.get(current) ?? []) {
      if (!nodes.has(req)) {
        nodes.add(req);
        stack.push(req);
      }
    }
  }

  const edges = new Set<string>();
  for (const edge of graph.edges) {
    if (nodes.has(edge.from) && nodes.has(edge.to)) {
      edges.add(kiAbilityEdgeKey(edge));
    }
  }

  return { nodes, edges };
}
