import useAgentGraph, { GraphOptions } from "hooks/useAgentGraph";
import useAgentMap from "hooks/useAgentMap";
import { IntentListItem } from "hooks/useAgentStore/types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ProgressBar } from "react-bootstrap";
import { Network, Options } from "vis-network";

export type NetworkGraphProps = {
  intentList: IntentListItem[];
  options: Required<GraphOptions>;
};

const defaultGraphOptions: Options = {
  edges: { arrows: "to" },
  layout: { improvedLayout: false },
  physics: {
    solver: "repulsion",
    repulsion: {
      nodeDistance: 250,
    },
    minVelocity: 10,
  },
};

export default function NetworkGraph({
  intentList,
  options,
}: NetworkGraphProps) {
  const [progress, setProgress] = useState(0);
  const network = useRef<Network | null>(null);
  const map = useAgentMap(intentList);
  const graph = useAgentGraph(map, options);
  const container = useRef<HTMLDivElement>(null);

  const renderNetwork = useCallback(() => {
    if (container.current) {
      network.current = new Network(
        container.current,
        graph,
        defaultGraphOptions
      );
      network.current.on("stabilizationProgress", ({ iterations, total }) =>
        setProgress((iterations / total) * 100)
      );
      network.current.on("stabilized", ({ iterations }) => setProgress(100));
    }
    return () => {
      if (!network.current) return;
      network.current.destroy();
      network.current = null;
    };
  }, [graph]);

  useEffect(renderNetwork, [renderNetwork]);

  return (
    <div>
      <div
        ref={container}
        style={{
          width: "100%",
          height: "600px",
          border: "1px solid lightgray",
        }}
      ></div>
      <ProgressBar
        now={progress}
        label={`${progress}% - ${graph.nodes.length} nodes and ${graph.edges.length} edges`}
      />
    </div>
  );
}
