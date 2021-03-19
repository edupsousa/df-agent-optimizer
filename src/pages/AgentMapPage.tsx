import AgentMapOptionsForm from "components/AgentMapOptionsForm";
import NetworkGraph from "components/NetworkGraph";
import useAgentStore from "hooks/useAgentStore";
import React, { useState } from "react";
import { NetworkGraphProps } from "components/NetworkGraph";

export type ContextLinks = {
  inputOn: string[];
  outputOn: Record<string, number>;
};

export type OldContextMap = Record<string, ContextLinks>;

const defaultOptions: NetworkGraphProps["options"] = {
  intentLimit: 25,
  intentContains: "",
  depthFromStart: 0,
  startIntent: "",
};

export default function AgentMapPage() {
  const [options, setOptions] = useState<NetworkGraphProps["options"]>(
    defaultOptions
  );
  const state = useAgentStore();

  return (
    <div>
      <h1>Diagram</h1>
      <AgentMapOptionsForm
        defaultOptions={defaultOptions}
        onOptionsChange={(options) => setOptions(options)}
      />
      <NetworkGraph intentList={state.intentList} options={options} />
    </div>
  );
}
