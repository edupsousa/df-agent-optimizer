import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";
import { Edge, Graph } from "graphlib";
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
      const {
        displayName,
        inputContexts,
        outputContexts,
        aliveOutputCtx,
      } = parseIntentFile(intentFile);
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
        if (shouldLinkFrom(otherNode, inputCtxNode, inputContexts)) {
          createEdge(state, otherNodeName, inputCtxNode, "output");
        } else if (shouldLinkTo(otherNode, aliveOutputCtx)) {
          createEdge(state, intentNode, otherNodeName, "output");
        }
      });
    };

    const removeIntent = (intentFile: IntentListItem) => {};
    const updateIntent = (intentFile: IntentListItem) => {
      const {
        displayName,
        inputContexts,
        outputContexts,
        aliveOutputCtx,
      } = parseIntentFile(intentFile);
      const nodeName = getIntentNodeName(displayName);
      const node = graph.node(nodeName) as IntentNodeLabel;
      if (!inputContextsAreEqual(node, inputContexts)) {
        removeInputContextNode(state, node);
      }
      if (!outputContextsAreEqual(node, outputContexts)) {
      }
    };

    return { graph, nodes, links, addIntent, removeIntent, updateIntent };
  }, []);
}

function removeNodeAndEdges(state: AgentGraphState, nodeName: string) {
  const { graph } = state;
  const inputCtxEdges = graph.nodeEdges(nodeName) || [];
  inputCtxEdges.forEach((edge) => {
    removeEdge(state, edge);
  });
  if ((graph.nodeEdges(nodeName) || []).length === 0) {
    removeNode(state, nodeName);
  }
}

function removeInputContextNode(state: AgentGraphState, node: IntentNodeLabel) {
  const inputCtxNodeName = getInputContextNodeName(node.inputContexts);
  removeNodeAndEdges(state, inputCtxNodeName);
}

function removeEdge(state: AgentGraphState, edge: Edge) {
  const { graph, links } = state;
  graph.removeEdge(edge);
  const linkIndex = links.findIndex(
    ({ source, target }) => source === edge.v && target === edge.w
  );
  links.splice(linkIndex, 1);
}

function removeNode(state: AgentGraphState, nodeName: string) {
  const { graph, nodes } = state;
  graph.removeNode(nodeName);
  const nodeIndex = nodes.findIndex(({ id }) => id === nodeName);
  nodes.splice(nodeIndex, 1);
}

function inputContextsAreEqual(node: IntentNodeLabel, inputContexts: string[]) {
  return (
    node.inputContexts.length === inputContexts.length &&
    node.inputContexts.every((v, i) => v === inputContexts[i])
  );
}

function outputContextsAreEqual(
  node: IntentNodeLabel,
  outputContexts: OutputContext[]
) {
  return (
    node.outputContexts.length === outputContexts.length &&
    node.outputContexts.every(
      (v, i) =>
        v.name === outputContexts[i].name &&
        v.lifespan === outputContexts[i].lifespan
    )
  );
}

function parseIntentFile(intentFile: IntentListItem) {
  const displayName = intentFile.intent.name;
  const inputContexts = getInputContextNames(intentFile.intent);
  const outputContexts = getOutputContexts(intentFile.intent);
  const aliveOutputCtx = outputContexts
    .filter(({ lifespan }) => lifespan > 0)
    .map(({ name }) => name);
  return { displayName, inputContexts, outputContexts, aliveOutputCtx };
}

function shouldLinkTo(otherNode: NodeLabel, aliveOutputCtx: string[]) {
  return (
    otherNode.type === "inputContext" &&
    aliveOutputCtx.length > 0 &&
    hasInputCtxIntersection(otherNode, aliveOutputCtx)
  );
}

function shouldLinkFrom(
  otherNode: NodeLabel,
  inputCtxNode: string,
  inputContexts: string[]
) {
  return (
    otherNode.type === "intent" &&
    inputCtxNode &&
    hasOutputCtxIntersection(otherNode, inputContexts)
  );
}

function hasInputCtxIntersection(
  otherNode: InputContextNodeLabel,
  aliveOutputCtx: string[]
) {
  return (
    otherNode.contexts.filter((ctxName) => aliveOutputCtx.includes(ctxName))
      .length > 0
  );
}

function hasOutputCtxIntersection(
  otherNode: IntentNodeLabel,
  inputContexts: string[]
) {
  return (
    otherNode.outputContexts.filter(
      ({ lifespan, name }) => lifespan > 0 && inputContexts.includes(name)
    ).length > 0
  );
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
  const name = getIntentNodeName(displayName);
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
  return intent.contexts.map((ctx) => ctx.toLowerCase()).sort();
}

function getOutputContexts(intent: Intent): OutputContext[] {
  return intent.responses
    .flatMap((r) =>
      r.affectedContexts.map(({ name, lifespan }) => ({
        name: name.toLowerCase(),
        lifespan,
      }))
    )
    .sort(({ name: a }, { name: b }) => (a > b ? 1 : a < b ? -1 : 0));
}

function getInputContextNodeName(contexts: string[]): string {
  return getNodeName("inputContext", contexts.join(";"));
}

function getIntentNodeName(intentName: string): string {
  return getNodeName("intent", intentName);
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
  const name = getInputContextNodeName(contexts);
  if (!graph.hasNode(name)) {
    graph.setNode(name, label);
    addNodeDatum(nodes, name, label);
  }
  return name;
}
