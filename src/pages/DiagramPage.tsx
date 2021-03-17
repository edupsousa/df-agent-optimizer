import useAgentStore from "hooks/useAgentStore";
import { useIntents2Contexts } from "hooks/useIntents2Contexts";
import React from "react";
import Graph, { Options } from "react-graph-vis";

const options: Options = {
  height: "500px",
  edges: {
    smooth: {
      type: "continuous",
    },
  },
  physics: {
    enabled: false,
  },
  layout: {
    hierarchical: {
      enabled: true,
      direction: "LR",
    },
  },
};

export default function DiagramPage() {
  const { intentList } = useAgentStore();
  const contexts = useIntents2Contexts(intentList);
  const contextNames = Object.keys(contexts).sort();
  if (!intentList) return null;
  const nodes = intentList.map((i) => ({
    id: i.intent.name,
    label: i.intent.name,
  }));
  const edges = contextNames
    .map((ctxName) =>
      contexts[ctxName].inputOn
        .map((to) =>
          Object.keys(contexts[ctxName].outputOn).map((from) => ({ from, to }))
        )
        .flat()
    )
    .flat();

  return (
    <div>
      <h1>Diagram</h1>
      <Graph graph={{ nodes, edges }} options={options} />
    </div>
  );
}
