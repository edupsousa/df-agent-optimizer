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

type Node = IntentNode | InputContextNode;

type Edge = {
  from: string;
  to: string;
  label?: string;
  color?: string;
};

type GraphData = {
  nodes: Node[];
  edges: Edge[];
};

export type AgentGraphMode = "filterIntents" | "traverseFromIntent";

type FilterIntentsOptions = {
  mode: "filterIntents";
  intentLimit: number;
  intentContains: string;
};

type TraverseFromIntentOptions = {
  mode: "traverseFromIntent";
  startIntent: string;
  depthFromStart: number;
};

export type AgentGraphOptions =
  | FilterIntentsOptions
  | TraverseFromIntentOptions;

type NodeMap = Record<string, Node>;
type EdgeMap = Record<string, Edge>;

export default function useAgentGraph(
  agentMap: AgentMap,
  options?: AgentGraphOptions
): GraphData {
  const mode = options ? options.mode : "filterIntents";
  const intentLimit =
    options?.mode === "filterIntents" ? options.intentLimit : 0;
  const intentContains =
    options?.mode === "filterIntents" ? options.intentContains : "";
  const startIntent =
    options?.mode === "traverseFromIntent" ? options.startIntent : "";
  const depthFromStart =
    options?.mode === "traverseFromIntent" ? options.depthFromStart : 0;

  return useMemo(() => {
    const nodes: NodeMap = {};
    const edges: EdgeMap = {};

    let intents: AgentMapIntent[] = [];
    if (mode === "traverseFromIntent") {
      const pushNextIntents = (
        intent: AgentMapIntent,
        depth: number | null
      ) => {
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
      pushNextIntents(
        agentMap.intents[startIntent],
        depthFromStart === 0 ? null : depthFromStart
      );
    } else if (mode === "filterIntents") {
      intents = [...Object.values(agentMap.intents)];
      if (intentContains.length > 0) {
        intents = intents.filter(
          (intent) =>
            !intent.name.toLowerCase().includes(intentContains.toLowerCase())
        );
      }
      if (intentLimit > 0) {
        intents = intents.slice(0, intentLimit);
      }
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
    intentContains,
    intentLimit,
    mode,
    startIntent,
  ]);
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
    from: id,
    to: getIntentNodeId(intent),
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
    from: fromId,
    to: toId,
  };
}
