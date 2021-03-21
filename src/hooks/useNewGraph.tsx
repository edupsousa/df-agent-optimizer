import { Graph } from "graphlib";
import { useMemo } from "react";
import { AgentMap, AgentMapContext, AgentMapIntent } from "./useAgentMap";

type NodeLabel = {
  type: "intent" | "context";
  displayName: string;
};

type EdgeLabel = {
  type: "context";
  displayName: string;
};

export default function useNewGraph(agentMap: AgentMap): Graph {
  return useMemo(() => {
    const g = new Graph({ directed: true });

    const getNodeName = (type: NodeLabel["type"], label: string) =>
      `${type}|${label}`;

    const createNode = (intent: AgentMapIntent): string => {
      const label: NodeLabel = { type: "intent", displayName: intent.name };
      const name = getNodeName(label.type, label.displayName);
      if (!g.hasNode(name)) g.setNode(name, label);
      return name;
    };

    const createEdge = (
      sourceNode: string,
      targetNode: string,
      context: AgentMapContext
    ) => {
      const label: EdgeLabel = { type: "context", displayName: context.name };
      g.setEdge(sourceNode, targetNode, label);
    };

    const positiveLifespan = ({ lifespan }: { lifespan: number }): boolean =>
      lifespan > 0;

    Object.values(agentMap.intents).forEach((intent) => {
      const currentNode = createNode(intent);
      intent.inputContexts.forEach((context) => {
        context.outputOn
          .filter(positiveLifespan)
          .forEach(({ intent: sourceIntent }) => {
            const sourceNode = createNode(sourceIntent);
            createEdge(sourceNode, currentNode, context);
          });
      });
      intent.outputContexts.filter(positiveLifespan).forEach(({ context }) => {
        context.inputOn.forEach((targetIntent) => {
          const targetNode = createNode(targetIntent);
          createEdge(currentNode, targetNode, context);
        });
      });
    });

    return g;
  }, [agentMap.intents]);
}
