import NetworkGraph from "components/NetworkGraph";
import useAgentStore from "hooks/useAgentStore";
import React, { useCallback, useState } from "react";
import { ProgressBar } from "react-bootstrap";

export type ContextLinks = {
  inputOn: string[];
  outputOn: Record<string, number>;
};

export type OldContextMap = Record<string, ContextLinks>;

export default function DiagramPage() {
  const [graphProgress, setGraphProgress] = useState(0);
  const progressHandler = useCallback((progress: number) => {
    setGraphProgress(progress);
  }, []);
  const state = useAgentStore();

  return (
    <div>
      <h1>Diagram</h1>
      <NetworkGraph
        intentList={state.intentList}
        onProgress={progressHandler}
      />
      <ProgressBar now={graphProgress} />
    </div>
  );
}
