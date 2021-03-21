import * as d3 from "d3";
import { SimulationLinkDatum } from "d3";
import { AgentGraphOptions } from "hooks/useAgentGraph";
import useAgentMap from "hooks/useAgentMap";
import { IntentListItem } from "hooks/useAgentStore/types";
import useNewGraph from "hooks/useNewGraph";
import React, { useCallback, useEffect, useRef } from "react";
import styles from "styles/NetworkGraph.module.css";

export type NetworkGraphProps = {
  intentList: IntentListItem[];
  options?: AgentGraphOptions;
};

type NodeDatum = d3.SimulationNodeDatum & { id: string; label: string };

export default function NetworkGraph({
  intentList,
  options,
}: NetworkGraphProps) {
  const map = useAgentMap(intentList);
  const graph = useNewGraph(map);
  const container = useRef<HTMLDivElement>(null);

  const renderNetwork = useCallback(() => {
    if (container.current) {
      const nodes: NodeDatum[] = graph
        .nodes()
        .map((id) => ({ id, label: graph.node(id).displayName }));
      const links: SimulationLinkDatum<NodeDatum>[] = graph
        .edges()
        .filter(
          (edge) =>
            nodes.find((node) => node.id === edge.v) &&
            nodes.find((node) => node.id === edge.w)
        )
        .map((edge) => ({ source: edge.v, target: edge.w }));
      const { width, height } = container.current.getBoundingClientRect();

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
          d3
            .forceLink(links)
            .id((d: any) => d.id)
            .distance(100)
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

      svg
        .append("defs")
        .selectAll("marker")
        .data(["end"])
        .join("marker")
        .attr("id", "end")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 0)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5");

      const linkArc = (d: any) => {
        const margin = 6;
        const R = 8 + margin;
        const vX = d.target.x - d.source.x;
        const vY = d.target.y - d.source.y;
        const magV = Math.sqrt(vX * vX + vY * vY);
        const sX = d.source.x + (vX / magV) * R;
        const sY = d.source.y + (vY / magV) * R;
        const tX = d.target.x + (-vX / magV) * R;
        const tY = d.target.y + (-vY / magV) * R;

        const r = Math.hypot(tX - sX, tY - sY) * 2;
        return `
            M${sX},${sY}
            A${r},${r} 0 0,1 ${tX},${tY}
          `;
      };
      const link = g
        .append("g")
        .attr("fill", "none")
        .attr("stroke-width", 1)
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("stroke", "#000")
        .style("opacity", 0.5)
        .attr("marker-end", "url(#end)");

      const node = g
        .append("g")
        .attr("stroke-width", 1)
        .attr("stroke", "#fff")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 8)
        .attr("fill", (d: any) => {
          if (d.color) return d.color;
          return "#9D79A0";
        })
        .style("opacity", 0.5)
        .call(drag(simulation) as any)
        .on("mouseover", (event, d) => {
          console.log(d.id);
          node.classed(styles.selected, (n) => n === d);
          link.classed(
            styles.selected,
            (l: any) => l.source.id === d.id || l.target.id === d.id
          );
          label.classed(styles.selected, (l) => l.id === d.id);
        })
        .on("mouseout", () => {
          node.classed(styles.selected, false);
          link.classed(styles.selected, false);
          label.classed(styles.selected, false);
        });

      const label = g
        .append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("text-anchor", "right")
        .attr("dominant-baseline", "central")
        .style("font-size", "0.5em")
        .style("opacity", 0.5)
        .text((d) => {
          return d.label;
        })
        .call(drag(simulation) as any);

      simulation.on("tick", () => {
        node
          .attr("cx", (d: any): number => d.x)
          .attr("cy", (d: any): number => d.y);

        link.attr("d", linkArc);
        label
          .attr("x", (d) => {
            return (d.x as number) + 10;
          })
          .attr("y", (d) => {
            return d.y as number;
          });
      });
      return () => {
        simulation.stop();
        svg.remove();
      };
    }
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
          overflow: "hidden",
        }}
      ></div>
    </div>
  );
}
