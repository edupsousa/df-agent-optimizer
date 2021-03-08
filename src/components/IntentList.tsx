import React, { useEffect, useMemo } from "react";
import { useIntents } from "../hooks/useIntents";

export default function IntentList() {
  const { isIntentListLoaded, getIntentList, loadIntentList } = useIntents();
  const intents = useMemo(
    () =>
      getIntentList()
        .slice()
        .sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0)),
    [getIntentList]
  );

  useEffect(() => {
    if (!isIntentListLoaded()) loadIntentList();
  }, [isIntentListLoaded, loadIntentList]);

  return (
    <div>
      <h1>Intents</h1>
      <ul>
        {isIntentListLoaded() &&
          intents.map((i) => <li key={i.id}>{i.name}</li>)}
        {!isIntentListLoaded() && <li>No intents to show</li>}
      </ul>
    </div>
  );
}
