import AgentMapOptionsForm from "components/AgentMapOptionsForm";
import NetworkGraph from "components/NetworkGraph";
import { AgentGraphOptions } from "hooks/useAgentGraph";
import useAgentStore from "hooks/useAgentStore";
import React, { useState } from "react";

export type ContextLinks = {
  inputOn: string[];
  outputOn: Record<string, number>;
};

export type OldContextMap = Record<string, ContextLinks>;

export default function AgentMapPage() {
  const [options, setOptions] = useState<AgentGraphOptions>();
  const state = useAgentStore();

  return (
    <div>
      <h1>Diagram</h1>
      <AgentMapOptionsForm onOptionsChange={(options) => setOptions(options)} />
      <NetworkGraph intentList={state.intentList} options={options} />
    </div>
  );
}
