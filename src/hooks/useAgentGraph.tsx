import chroma from "chroma-js";
import { useMemo } from "react";
import { AgentMap, AgentMapContext, AgentMapIntent } from "./useAgentMap";

type IntentNode = {
  id: string;
  label: string;
  intent: AgentMapIntent;
};

type InputContextNode = {
  id: string;
  label: string;
  shape: "diamond";
  color?: string;
};

export type AgentGraphNode = IntentNode | InputContextNode;

export type AgentGraphEdge = {
  source: string;
  target: string;
  label?: string;
  color?: string;
};

type GraphData = {
  nodes: AgentGraphNode[];
  edges: AgentGraphEdge[];
};

export type AgentGraphMode = "filterIntents" | "traverseFromIntent";

type FilterIntentsOptions = {
  mode: "filterIntents";
  intentLimit: number;
  intentFilter: string;
};

type TraverseFromIntentOptions = {
  mode: "traverseFromIntent";
  startIntent: string;
  depthFromStart: number;
};

export type AgentGraphOptions =
  | FilterIntentsOptions
  | TraverseFromIntentOptions;

type NodeMap = Record<string, AgentGraphNode>;
type EdgeMap = Record<string, AgentGraphEdge>;

export default function useAgentGraph(
  agentMap: AgentMap,
  options?: AgentGraphOptions
): GraphData {
  const mode = options ? options.mode : "filterIntents";
  const intentLimit =
    options?.mode === "filterIntents" ? options.intentLimit : 50;
  const intentFilter =
    options?.mode === "filterIntents" ? options.intentFilter : "";
  const startIntent =
    options?.mode === "traverseFromIntent" ? options.startIntent : "";
  const depthFromStart =
    options?.mode === "traverseFromIntent" ? options.depthFromStart : 0;

  return useMemo(() => {
    const nodes: NodeMap = {};
    const edges: EdgeMap = {};

    let intents: AgentMapIntent[] = [];
    if (mode === "traverseFromIntent") {
      intents = traverseFromIntent(
        agentMap.intents[startIntent],
        depthFromStart
      );
    } else if (mode === "filterIntents") {
      intents = filterIntents(
        Object.values(agentMap.intents),
        intentLimit,
        intentFilter
      );
    }

    const colorFn = chroma
      .scale("Blues")
      .domain([1, countMaxInputContexts(intents)]);
    intents.forEach((intent) => addIntentNode(nodes, edges, intent, colorFn));

    Object.values(nodes)
      .filter((node): node is IntentNode => "intent" in node)
      .forEach((node) => {
        const { intent } = node;
        intent.inputContexts.forEach((context) => {
          context.outputOn
            .filter(
              ({ lifespan, intent }) =>
                lifespan > 0 && nodes[getIntentNodeId(intent)]
            )
            .forEach(({ intent: outputIntent }) =>
              addEdge(edges, context, outputIntent, intent)
            );
        });
        intent.outputContexts
          .filter(({ lifespan }) => lifespan > 0)
          .forEach(({ context }) => {
            context.inputOn
              .filter((intent) => nodes[getIntentNodeId(intent)])
              .forEach((inputIntent) =>
                addEdge(edges, context, intent, inputIntent)
              );
          });
      });

    return { nodes: Object.values(nodes), edges: Object.values(edges) };
  }, [
    agentMap.intents,
    depthFromStart,
    intentFilter,
    intentLimit,
    mode,
    startIntent,
  ]);
}

function filterIntents(
  intents: AgentMapIntent[],
  intentLimit: number,
  intentFilter: string
): AgentMapIntent[] {
  if (intentFilter.length > 0) {
    intents = intents.filter(
      (intent) =>
        !intent.name.toLowerCase().includes(intentFilter.toLowerCase())
    );
  }
  if (intentLimit > 0) {
    intents = intents.slice(0, intentLimit);
  }
  return intents;
}

function traverseFromIntent(
  startIntent: AgentMapIntent,
  depthFromStart: number
): AgentMapIntent[] {
  let intents: AgentMapIntent[] = [];
  const pushNextIntents = (intent: AgentMapIntent, depth: number | null) => {
    intents.push(intent);
    if (depth === 0) return;
    intent.outputContexts
      .filter(({ lifespan }) => lifespan > 0)
      .forEach(({ context }) =>
        context.inputOn.forEach((nextIntent) => {
          if (intents.includes(nextIntent)) return;
          pushNextIntents(nextIntent, depth === null ? depth : depth - 1);
        })
      );
  };
  pushNextIntents(startIntent, depthFromStart === 0 ? null : depthFromStart);
  return intents;
}

function countMaxInputContexts(intents: AgentMapIntent[]): number {
  return intents.reduce(
    (max, { inputContexts }) =>
      inputContexts.length > max ? inputContexts.length : max,
    1
  );
}

function getIntentNodeId(intent: AgentMapIntent): string {
  return `i#${intent.name}`;
}

function addIntentNode(
  nodes: NodeMap,
  edges: EdgeMap,
  intent: AgentMapIntent,
  colorFn: chroma.Scale<chroma.Color>
): IntentNode {
  const id = getIntentNodeId(intent);
  if (!nodes[id]) {
    nodes[id] = {
      id,
      intent,
      label: intent.name,
    };
    if (intent.inputContexts.length > 0)
      addInputContextsNode(nodes, edges, intent, colorFn);
  }
  return nodes[id] as IntentNode;
}

function getInputContextsNodeId(intent: AgentMapIntent): string {
  const names = intent.inputContexts
    .map((ctx) => ctx.name)
    .sort()
    .join("|");
  return `ic#${names}`;
}

function addInputContextsNode(
  nodes: NodeMap,
  edges: EdgeMap,
  intent: AgentMapIntent,
  colorFn: chroma.Scale<chroma.Color>
) {
  const contextNames = intent.inputContexts.map((ctx) => ctx.name).sort();

  const id = getInputContextsNodeId(intent);
  if (!nodes[id]) {
    nodes[id] = {
      id,
      shape: "diamond",
      label: contextNames.join(", "),
      color: colorFn(contextNames.length).hex(),
    };
  }
  edges[`${id}->${intent.name}`] = {
    color: "red",
    source: id,
    target: getIntentNodeId(intent),
  };
}

function addEdge(
  edges: EdgeMap,
  context: AgentMapContext,
  from: AgentMapIntent,
  to: AgentMapIntent
) {
  const fromId = getIntentNodeId(from);
  const toId = getInputContextsNodeId(to);
  const id = `${fromId}->${context.name}->${toId}`;
  if (edges[id]) return;
  edges[id] = {
    label: context.name,
    source: fromId,
    target: toId,
  };
}
