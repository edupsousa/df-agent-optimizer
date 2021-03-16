import useAgentStore from "hooks/useAgentStore";
import { useIntents2Contexts } from "hooks/useIntents2Contexts";
import React from "react";

export default function DiagramPage() {
  const { intentList } = useAgentStore();
  const contexts = useIntents2Contexts(intentList);
  const contextNames = Object.keys(contexts).sort();

  return (
    <div>
      <h1>Diagram</h1>
      <ul>
        {contextNames.map((ctx, idx) => (
          <li key={idx}>{ctx}</li>
        ))}
      </ul>
    </div>
  );
}
