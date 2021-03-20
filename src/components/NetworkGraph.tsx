import useAgentGraph, {
  AgentGraphOptions,
  AgentGraphNode,
  AgentGraphEdge,
} from "hooks/useAgentGraph";
import useAgentMap from "hooks/useAgentMap";
import { IntentListItem } from "hooks/useAgentStore/types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ProgressBar } from "react-bootstrap";
import { Network, Options } from "vis-network";
import * as d3 from "d3";

export type NetworkGraphProps = {
  intentList: IntentListItem[];
  options?: AgentGraphOptions;
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
  const map = useAgentMap(intentList);
  const graph = useAgentGraph(map, options);
  const container = useRef<HTMLDivElement>(null);

  const renderNetwork = useCallback(() => {
    if (container.current) {
      const nodes: (d3.SimulationNodeDatum & AgentGraphNode)[] = graph.nodes;
      const links: AgentGraphEdge[] = graph.edges;
      const { width, height } = container.current.getBoundingClientRect();

      const color = () => {
        return "#9D79A0";
      };

      const getClass = (d: typeof nodes[0]) => {
        return "nodeClass";
      };

      const drag = (simulation: d3.Simulation<typeof nodes[0], undefined>) => {
        const dragstarted = (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        };

        const dragged = (event: any, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        };

        const dragended = (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        };

        return d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
      };

      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3.forceLink(links).id((d: any) => d.id)
        )
        .force("charge", d3.forceManyBody().strength(-150))
        .force("x", d3.forceX())
        .force("y", d3.forceY());

      const svg = d3
        .select(container.current)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", [-width / 2, -height / 2, width, height].join(" "));

      const g = svg.append("g");

      const zoomHandler = d3
        .zoom<SVGSVGElement, unknown>()
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        });

      zoomHandler(svg);

      const link = g
        .append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", 1);

      const node = g
        .append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 12)
        .attr("fill", color)
        .call(drag(simulation) as any);

      // const label = g
      //   .append("g")
      //   .attr("class", "labels")
      //   .selectAll("text")
      //   .data(nodes)
      //   .enter()
      //   .append("text")
      //   .attr("text-anchor", "middle")
      //   .attr("dominant-baseline", "central")
      //   .attr("class", (d) => `fa ${getClass(d)}`)
      //   .text((d) => {
      //     return d.label;
      //   })
      //   .call(drag(simulation) as any);

      // label
      //   .on("mouseover", (event, d) => {
      //     console.log("mouseover", d);
      //   })
      //   .on("mouseout", (event, d) => {
      //     console.log("mouseout", d);
      //   });

      simulation.on("tick", () => {
        //update link positions
        link
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);

        // update node positions
        node
          .attr("cx", (d: any): number => d.x)
          .attr("cy", (d: any): number => d.y);

        // label
        //   .attr("x", (d) => {
        //     return d.x as number;
        //   })
        //   .attr("y", (d) => {
        //     return d.y as number;
        //   });
      });
      return () => {
        simulation.stop();
        svg.remove();
      };
    }
  }, [graph.edges, graph.nodes]);

  useEffect(renderNetwork, [renderNetwork]);

  return (
    <div>
      <div
        ref={container}
        style={{
          width: "100%",
          height: "600px",
          border: "1px solid lightgray",
          overflow: "hidden",
        }}
      ></div>
      <ProgressBar
        now={progress}
        label={`${progress}% - ${graph.nodes.length} nodes and ${graph.edges.length} edges`}
      />
    </div>
  );
}
