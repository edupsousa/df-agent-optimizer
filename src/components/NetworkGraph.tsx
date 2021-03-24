import * as d3 from "d3";
import useAgentGraph, {
  AgentGraph,
  LinkDatum,
  NodeDatum,
  NodeDatumType,
} from "hooks/useAgentGraph";
import useAgentStore from "hooks/useAgentStore";
import useD3 from "hooks/useD3";
import React, { useCallback, useEffect, useRef } from "react";
import styles from "styles/NetworkGraph.module.css";

type NetworkGraphProps = {
  onSelectionChange: (nodeType: NodeDatumType, name: string) => void;
};

type NodeType = d3.Selection<
  d3.BaseType | SVGCircleElement,
  NodeDatum,
  SVGGElement,
  unknown
>;
type LinkType = d3.Selection<
  d3.BaseType | SVGPathElement,
  LinkDatum,
  SVGGElement,
  unknown
>;
type LabelType = d3.Selection<SVGTextElement, NodeDatum, SVGGElement, unknown>;

export default function NetworkGraph({ onSelectionChange }: NetworkGraphProps) {
  const { subscribeToIntentChanges } = useAgentStore();
  const selectedNode = useRef<NodeDatum | null>(null);
  const mouseOnNode = useRef<NodeDatum | null>(null);
  const { graph, nodes, links, addIntent } = useAgentGraph();

  useEffect(() => {
    return subscribeToIntentChanges((changes) => {
      changes.forEach((change) => {
        if (change.change === "added") {
          addIntent(change.intentFile);
        } else if (change.change === "removed") {
          console.log(`removed ${change.intentFile.filename}`);
        } else if (change.change === "updated") {
          console.log(`updated ${change.intentFile.filename}`);
        }
      });
    });
  }, [addIntent, nodes, subscribeToIntentChanges]);

  const renderNetwork = useCallback(
    (
      root: d3.Selection<HTMLDivElement, unknown, null, undefined>
    ): (() => void) => {
      console.log("renderNetwork");
      const simulation = createSimulation(nodes, links);
      const svg = createSVG(root);
      createMarkers(svg);
      const plotArea = createPlotArea(svg);
      applyZoomHandler(plotArea, svg);
      const link: LinkType = createLinkElements(plotArea, links);
      const node: NodeType = createNodeElements(plotArea, nodes, simulation);
      const label: LabelType = createLabelElements(plotArea, nodes, simulation);

      const highlightNodes = () =>
        updateHighlights(
          [selectedNode.current, mouseOnNode.current],
          graph,
          node,
          link,
          label
        );

      node
        .on("click", (ev, d) => {
          selectedNode.current = d;
          highlightNodes();
          onSelectionChange(d.type, d.label);
        })
        .on("mouseenter", (ev, d) => {
          mouseOnNode.current = d;
          highlightNodes();
        })
        .on("mouseleave", (ev, d) => {
          mouseOnNode.current = null;
          highlightNodes();
        });

      simulation.on("tick", simulationTickHandler(node, link, label));

      return cleanup(simulation, svg);
    },
    [graph, links, nodes, onSelectionChange]
  );

  const container = useD3<HTMLDivElement>(renderNetwork);

  return (
    <div
      ref={container}
      style={{
        width: "100%",
        height: "700px",
        border: "1px solid lightgray",
        overflow: "hidden",
      }}
    ></div>
  );
}

function cleanup(
  simulation: d3.Simulation<NodeDatum, LinkDatum>,
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
): () => void {
  return () => {
    simulation.stop();
    svg.remove();
  };
}

function updateHighlights(
  selectedNodes: (NodeDatum | null)[],
  agentGraph: AgentGraph,
  node: NodeType,
  link: LinkType,
  label: LabelType
) {
  const highlightedNodes: Record<string, boolean> = {};
  const highlightLinksOf: Record<string, boolean> = {};

  const addNodeAndNeighbors = (id: string) => {
    highlightLinksOf[id] = true;
    highlightedNodes[id] = true;
    const neighbors = agentGraph.neighbors(id);
    if (neighbors) {
      neighbors.forEach((id) => (highlightedNodes[id] = true));
    }
  };

  selectedNodes
    .filter((n): n is NodeDatum => n !== null)
    .forEach(({ id }) => addNodeAndNeighbors(id));

  node.classed(styles.hightlighted, (n) => highlightedNodes[n.id]);
  label.classed(styles.highlighted, (n) => highlightedNodes[n.id]);
  link.classed(
    styles.highlighted,
    (l: any) => highlightLinksOf[l.source.id] || highlightLinksOf[l.target.id]
  );
  node.classed(styles.faded, (n) => !highlightedNodes[n.id]);
  label.classed(styles.faded, (n) => !highlightedNodes[n.id]);
  link.classed(
    styles.faded,
    (l: any) =>
      !(highlightLinksOf[l.source.id] || highlightLinksOf[l.target.id])
  );
}

function simulationTickHandler(
  node: NodeType,
  link: LinkType,
  label: LabelType
): (this: d3.Simulation<NodeDatum, LinkDatum>) => void {
  return () => {
    node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);

    link.attr("d", linkArc);
    label
      .attr("x", (d) => {
        return d.x! + 10;
      })
      .attr("y", (d) => {
        return d.y!;
      });
  };
}

function linkArc(d: LinkDatum) {
  const source = d.source as Required<NodeDatum>;
  const target = d.target as Required<NodeDatum>;
  const margin = 6;
  const R = 8 + margin;
  const vX = target.x - source.x;
  const vY = target.y - source.y;
  const magV = Math.sqrt(vX ** 2 + vY ** 2);
  const sX = source.x + (vX / magV) * R;
  const sY = source.y + (vY / magV) * R;
  const tX = target.x + (-vX / magV) * R;
  const tY = target.y + (-vY / magV) * R;
  const r = Math.hypot(tX - sX, tY - sY) * 2;
  return `
  M${sX},${sY}
  A${r},${r} 0 0,1 ${tX},${tY}
`;
}

function createLabelElements(
  plotArea: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: NodeDatum[],
  simulation: d3.Simulation<NodeDatum, LinkDatum>
): LabelType {
  return plotArea
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
}

function createNodeElements(
  plotArea: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: NodeDatum[],
  simulation: d3.Simulation<NodeDatum, LinkDatum>
): NodeType {
  return plotArea
    .append("g")
    .attr("stroke-width", 1)
    .attr("stroke", "#fff")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", 8)
    .attr("fill", (d) => (d.type === "intent" ? "#7fc97f" : "#beaed4"))
    .style("opacity", 0.5)
    .call(drag(simulation) as any);
}

function createLinkElements(
  plotArea: d3.Selection<SVGGElement, unknown, null, undefined>,
  links: LinkDatum[]
): LinkType {
  return plotArea
    .append("g")
    .attr("fill", "none")
    .attr("stroke-width", 1)
    .selectAll("path")
    .data(links)
    .join("path")
    .attr("stroke", (d) =>
      (d.target as NodeDatum).type === "intent" ? "#7fc97f" : "#beaed4"
    )
    .style("opacity", 0.5)
    .attr("marker-end", "url(#end)");
}

function createMarkers(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
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
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#969696");
}

function applyZoomHandler(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  const zoomHandler = d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
    g.attr("transform", event.transform);
  });
  zoomHandler(svg);
}

function createPlotArea(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  return svg.append("g");
}

function createSVG(
  root: d3.Selection<HTMLDivElement, unknown, null, undefined>
): d3.Selection<SVGSVGElement, unknown, null, undefined> {
  const { width, height } = root.node()!.getBoundingClientRect();
  return root
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", [-width / 2, -height / 2, width, height].join(" "));
}

function createSimulation(
  nodes: NodeDatum[],
  links: LinkDatum[]
): d3.Simulation<NodeDatum, LinkDatum> {
  return d3
    .forceSimulation<NodeDatum, LinkDatum>(nodes)
    .force(
      "link",
      d3
        .forceLink<NodeDatum, LinkDatum>(links)
        .id((d) => d.id)
        .distance(100)
    )
    .force("charge", d3.forceManyBody().strength(-150))
    .force("x", d3.forceX())
    .force("y", d3.forceY());
}

function drag(simulation: d3.Simulation<NodeDatum, LinkDatum>) {
  return d3
    .drag<d3.DraggedElementBaseType, NodeDatum>()
    .on("start", (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on("drag", (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on("end", (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });
}
