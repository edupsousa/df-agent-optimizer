import useAgentMap, {
  AgentMap,
  AgentMapContext,
  AgentMapIntent,
} from "hooks/useAgentMap";
import useAgentStore from "hooks/useAgentStore";
import { IntentListItem } from "hooks/useAgentStore/types";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ProgressBar } from "react-bootstrap";
import { Network } from "vis-network";

export type ContextLinks = {
  inputOn: string[];
  outputOn: Record<string, number>;
};

export type OldContextMap = Record<string, ContextLinks>;

type IntentNode = {
  id: string;
  label: string;
  intent: AgentMapIntent;
};

type InputContextNode = {
  id: string;
  label: string;
  shape: "diamond";
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

  const addIntentNode = (intent: AgentMapIntent): IntentNode => {
    const id = getIntentNodeId(intent);
    if (!nodes[id]) {
      nodes[id] = {
        id,
        intent,
        label: intent.name,
      };
      if (intent.inputContexts.length > 0) addInputContextsNode(intent);
    }
    return nodes[id] as IntentNode;
  };

  const getInputContextsNodeId = (intent: AgentMapIntent): string => {
    const names = intent.inputContexts
      .map((ctx) => ctx.name)
      .sort()
      .join("|");
    return `ic#${names}`;
  };

  const addInputContextsNode = (intent: AgentMapIntent) => {
    const contextNames = intent.inputContexts.map((ctx) => ctx.name).sort();

    const id = getInputContextsNodeId(intent);
    if (!nodes[id]) {
      nodes[id] = {
        id,
        shape: "diamond",
        label: contextNames.join(", "),
      };
    }
    edges[`${id}->${intent.name}`] = {
      color: "red",
      from: id,
      to: getIntentNodeId(intent),
    };
  };

  const addEdge = (
    context: AgentMapContext,
    from: AgentMapIntent,
    to: AgentMapIntent
  ) => {
    const fromId = getIntentNodeId(from);
    const toId = getInputContextsNodeId(to);
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
    .forEach((intent) => addIntentNode(intent));

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

function NetworkGraph({
  intentList,
  onProgress,
}: {
  intentList: IntentListItem[];
  onProgress: (progress: number) => void;
}) {
  const network = useRef<Network | null>(null);
  const map = useAgentMap(intentList);
  const graph = useMemo(() => {
    return createNodesAndEdges(map, {
      intentLimit: 200,
    });
  }, [map]);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current && network.current === null) {
      console.log(`Nodes: ${graph.nodes.length} Edges: ${graph.edges.length}`);
      network.current = new Network(container.current, graph, {
        edges: { arrows: "to" },
        layout: { improvedLayout: false },
        physics: {
          solver: "repulsion",
          repulsion: {
            nodeDistance: 250,
          },
          minVelocity: 10,
        },
      });
      let t0: number, t1: number;
      network.current.on("startStabilizing", () => (t0 = performance.now()));
      network.current.on("stabilizationProgress", ({ iterations, total }) =>
        onProgress((iterations / total) * 100)
      );
      network.current.on("stabilized", ({ iterations }) => {
        onProgress(100);
        t1 = performance.now();
        console.log(
          `Stabilized in ${iterations} iterations, took ${
            (t1 - t0) / 1000
          } seconds`
        );
      });
    }
  }, [graph, onProgress]);

  return (
    <div
      ref={container}
      style={{ width: "100%", height: "600px", border: "1px solid lightgray" }}
    ></div>
  );
}

export default function DiagramPage() {
  const [graphProgress, setGraphProgress] = useState(0);
  const progressHandler = useCallback((progress: number) => {
    console.log(progress);
    setGraphProgress(progress);
  }, []);
  const state = useAgentStore();

  return (
    <div>
      <h1>Diagram</h1>
      <ProgressBar now={graphProgress} />
      <NetworkGraph
        intentList={state.intentList}
        onProgress={progressHandler}
      />
    </div>
  );
}
