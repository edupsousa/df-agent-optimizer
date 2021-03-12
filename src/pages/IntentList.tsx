import React, { useMemo } from "react";
import useAgentStore from "hooks/useAgentStore";

export default function IntentList() {
  const { intentList } = useAgentStore();
  const intents = useMemo(
    () =>
      intentList === null
        ? []
        : intentList
            .slice()
            .map((i) => i.intent)
            .sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0)),
    [intentList]
  );

  return (
    <div>
      <h1>Intents</h1>
      <ul>
        {intents && intents.map((i) => <li key={i.id}>{i.name}</li>)}
        {!intents && <li>No intents to show</li>}
      </ul>
    </div>
  );
}
