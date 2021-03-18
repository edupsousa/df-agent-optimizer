import useAgentMap, {
  AgentMap,
  AgentMapContext,
  AgentMapIntent,
} from "hooks/useAgentMap";
import useAgentStore from "hooks/useAgentStore";
import React, { useEffect, useMemo, useRef } from "react";
import { Network } from "vis-network";

export type ContextLinks = {
  inputOn: string[];
  outputOn: Record<string, number>;
};

export type OldContextMap = Record<string, ContextLinks>;

type Node = {
  id: string;
  label: string;
  intent: AgentMapIntent;
};

type Edge = {
  from: string;
  to: string;
  label: string;
};

type GraphData = {
  nodes: Node[];
  edges: Edge[];
};

type GraphOptions = {
  intentLimit?: number;
};

function createNodesAndEdges(
  contextMap: AgentMap,
  options?: GraphOptions
): GraphData {
  const nodes: Record<string, Node> = {};
  const edges: Record<string, Edge> = {};

  const getIntentNodeId = (intent: AgentMapIntent): string => {
    return `i#${intent.name}`;
  };

  const addNode = (intent: AgentMapIntent): Node => {
    const id = getIntentNodeId(intent);
    if (!nodes[id]) {
      nodes[id] = {
        id,
        intent,
        label: intent.name,
      };
    }
    return nodes[id];
  };

  const addEdge = (
    context: AgentMapContext,
    from: AgentMapIntent,
    to: AgentMapIntent
  ) => {
    const fromId = getIntentNodeId(from);
    const toId = getIntentNodeId(to);
    const id = `${fromId}->${context.name}->${toId}`;
    if (edges[id]) return;
    edges[id] = {
      label: context.name,
      from: fromId,
      to: toId,
    };
  };

  Object.values(contextMap.intents)
    .slice(0, options?.intentLimit)
    .forEach((intent) => addNode(intent));

  Object.values(nodes).forEach((node) => {
    const { intent } = node;
    intent.inputContexts.forEach((context) => {
      context.outputOn
        .filter(
          ({ lifespan, intent }) =>
            lifespan > 0 && nodes[getIntentNodeId(intent)]
        )
        .forEach(({ intent: outputIntent }) =>
          addEdge(context, outputIntent, intent)
        );
    });
    intent.outputContexts
      .filter(({ lifespan }) => lifespan > 0)
      .forEach(({ context }) => {
        context.inputOn
          .filter((intent) => nodes[getIntentNodeId(intent)])
          .forEach((inputIntent) => addEdge(context, intent, inputIntent));
      });
  });

  return { nodes: Object.values(nodes), edges: Object.values(edges) };
}

function NetworkGraph(props: { graph: GraphData }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current) {
      console.log(
        `Nodes: ${props.graph.nodes.length} Edges: ${props.graph.edges.length}`
      );
      new Network(container.current, props.graph, {
        edges: { arrows: "to" },
        layout: { improvedLayout: false },
      });
    }
  }, [props.graph]);

  return (
    <div
      ref={container}
      style={{ width: "100%", height: "600px", border: "1px solid lightgray" }}
    ></div>
  );
}

export default function DiagramPage() {
  const { intentList } = useAgentStore();
  const map = useAgentMap(intentList);
  const graph = useMemo(() => {
    return createNodesAndEdges(map, {
      intentLimit: 100,
    });
  }, [map]);

  return (
    <div>
      <h1>Diagram</h1>
      <NetworkGraph graph={graph} />
    </div>
  );
}
