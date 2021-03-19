import useAgentGraph from "hooks/useAgentGraph";
import useAgentMap from "hooks/useAgentMap";
import { IntentListItem } from "hooks/useAgentStore/types";
import React, { useEffect, useRef } from "react";
import { Network } from "vis-network";

export default function NetworkGraph({
  intentList,
  onProgress,
}: {
  intentList: IntentListItem[];
  onProgress: (progress: number) => void;
}) {
  const network = useRef<Network | null>(null);
  const map = useAgentMap(intentList);
  const graph = useAgentGraph(map, { intentLimit: 100 });
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
