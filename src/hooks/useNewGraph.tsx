import { Graph } from "graphlib";
import { useMemo } from "react";
import { AgentMap, AgentMapIntent } from "./useAgentMap";

type NodeLabel = {
  type: "intent" | "inputContext";
  displayName: string;
  contexts?: string[];
};

type EdgeLabel = {
  type: "input" | "output";
};

export default function useNewGraph(
  agentMap: AgentMap
): Graph<any, NodeLabel, EdgeLabel> {
  return useMemo(() => {
    const g = new Graph<any, NodeLabel, EdgeLabel>({ directed: true });

    const getNodeName = (type: NodeLabel["type"], label: string) =>
      `${type}|${label}`;

    const createIntentNode = (intent: AgentMapIntent): string => {
      const label: NodeLabel = { type: "intent", displayName: intent.name };
      const name = getNodeName(label.type, label.displayName);
      if (!g.hasNode(name)) {
        g.setNode(name, label);
      }
      return name;
    };

    const getInputContextNames = (intent: AgentMapIntent): string[] => {
      return intent.inputContexts.map((ctx) => ctx.name);
    };

    const createInputContextNode = (intent: AgentMapIntent): string => {
      const contextNames = getInputContextNames(intent);
      const label: NodeLabel = {
        type: "inputContext",
        displayName: contextNames.join(";"),
        contexts: contextNames,
      };
      const name = getNodeName(label.type, label.displayName);
      if (!g.hasNode(name)) g.setNode(name, label);
      return name;
    };

    const createEdge = (
      sourceNode: string,
      targetNode: string,
      type: EdgeLabel["type"]
    ) => {
      const label: EdgeLabel = { type };
      g.setEdge(sourceNode, targetNode, label);
    };

    const positiveLifespan = ({ lifespan }: { lifespan: number }): boolean =>
      lifespan > 0;

    Object.values(agentMap.intents).forEach((intent) => {
      const intentNode = createIntentNode(intent);
      if (intent.inputContexts.length === 0) return;
      const inputCtxNode = createInputContextNode(intent);
      createEdge(inputCtxNode, intentNode, "input");

      intent.inputContexts.forEach((context) => {
        context.outputOn
          .filter(positiveLifespan)
          .forEach(({ intent: sourceIntent }) => {
            const sourceNode = createIntentNode(sourceIntent);
            createEdge(sourceNode, inputCtxNode, "output");
          });
      });
    });

    return g;
  }, [agentMap.intents]);
}
