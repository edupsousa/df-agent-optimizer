import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";
import { Graph } from "graphlib";
import { useMemo } from "react";
import { Intent, IntentListItem } from "./useAgentStore/types";

export type NodeDatumType = "intent" | "inputContext";

export type NodeDatum = SimulationNodeDatum & {
  id: string;
  label: string;
  type: NodeDatumType;
};

export type LinkDatum = SimulationLinkDatum<NodeDatum>;

type OutputContext = { name: string; lifespan: number };

type IntentNodeLabel = {
  type: "intent";
  displayName: string;
  inputContexts: string[];
  outputContexts: OutputContext[];
};

type InputContextNodeLabel = {
  type: "inputContext";
  displayName: string;
  contexts: string[];
};

type NodeLabel = InputContextNodeLabel | IntentNodeLabel;

type EdgeLabel = {
  type: "input" | "output";
};

export type AgentGraph = Graph<any, NodeLabel, EdgeLabel>;

type AgentGraphState = {
  graph: AgentGraph;
  nodes: NodeDatum[];
  links: LinkDatum[];
};

type AgentGraphActions = {
  addIntent: (intentFile: IntentListItem) => void;
  removeIntent: (intentFile: IntentListItem) => void;
  updateIntent: (intentFile: IntentListItem) => void;
};

type AgentGraphHookReturn = AgentGraphState & AgentGraphActions;

export default function useAgentGraph(): AgentGraphHookReturn {
  return useMemo(() => {
    const graph = new Graph<any, NodeLabel, EdgeLabel>({ directed: true });
    const nodes: NodeDatum[] = [];
    const links: LinkDatum[] = [];
    const state = { graph, nodes, links };

    const addIntent = (intentFile: IntentListItem) => {
      const displayName = intentFile.intent.name;
      const inputContexts = getInputContextNames(intentFile.intent);
      const outputContexts = getOutputContexts(intentFile.intent);
      const aliveOutputCtx = outputContexts
        .filter(({ lifespan }) => lifespan > 0)
        .map(({ name }) => name);
      const intentNode = createIntentNode(
        state,
        displayName,
        inputContexts,
        outputContexts
      );
      let inputCtxNode: string;
      if (inputContexts.length > 0) {
        inputCtxNode = createInputContextNode(state, inputContexts);
        createEdge(state, inputCtxNode, intentNode, "input");
      }
      graph.nodes().forEach((otherNodeName) => {
        const otherNode = graph.node(otherNodeName);
        if (
          otherNode.type === "intent" &&
          inputCtxNode &&
          otherNode.outputContexts.filter(
            ({ lifespan, name }) => lifespan > 0 && inputContexts.includes(name)
          ).length > 0
        ) {
          createEdge(state, otherNodeName, inputCtxNode, "output");
        } else if (
          otherNode.type === "inputContext" &&
          aliveOutputCtx.length > 0 &&
          otherNode.contexts.filter((ctxName) =>
            aliveOutputCtx.includes(ctxName)
          ).length > 0
        ) {
          createEdge(state, intentNode, otherNodeName, "output");
        }
      });
    };

    const removeIntent = (intentFile: IntentListItem) => {};
    const updateIntent = (intentFile: IntentListItem) => {};

    return { graph, nodes, links, addIntent, removeIntent, updateIntent };
  }, []);
}

function getNodeName(type: NodeLabel["type"], label: string) {
  return `${type}|${label}`;
}

function createEdge(
  { graph, links }: AgentGraphState,
  source: string,
  target: string,
  type: "input" | "output"
) {
  if (!graph.hasEdge(source, target)) {
    graph.setEdge(source, target, { type });
    addLinkDatum(links, source, target);
  }
}

function addLinkDatum(links: LinkDatum[], source: string, target: string) {
  links.push({ source, target });
}

function createIntentNode(
  { graph, nodes }: AgentGraphState,
  displayName: string,
  inputContexts: string[],
  outputContexts: OutputContext[]
): string {
  const label: NodeLabel = {
    type: "intent",
    displayName,
    inputContexts,
    outputContexts,
  };
  const name = getNodeName(label.type, label.displayName);
  if (!graph.hasNode(name)) {
    graph.setNode(name, label);
    addNodeDatum(nodes, name, label);
  }
  return name;
}

function addNodeDatum(nodes: NodeDatum[], id: string, node: NodeLabel) {
  nodes.push({
    type: node.type,
    label: node.displayName,
    id: id,
  });
}

function getInputContextNames(intent: Intent): string[] {
  return intent.contexts.map((ctx) => ctx.toLowerCase());
}

function getOutputContexts(intent: Intent): OutputContext[] {
  return intent.responses.flatMap((r) =>
    r.affectedContexts.map(({ name, lifespan }) => ({
      name: name.toLowerCase(),
      lifespan,
    }))
  );
}

function createInputContextNode(
  { graph, nodes }: AgentGraphState,
  contexts: string[]
): string {
  const label: NodeLabel = {
    type: "inputContext",
    displayName: contexts.join(";"),
    contexts,
  };
  const name = getNodeName(label.type, label.displayName);
  if (!graph.hasNode(name)) {
    graph.setNode(name, label);
    addNodeDatum(nodes, name, label);
  }
  return name;
}
