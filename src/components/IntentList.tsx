import React, { useEffect } from "react";
import { useIntents } from "../hooks/useIntents";

export default function IntentList() {
  const { isIntentListLoaded, getIntentList, loadIntentList } = useIntents();

  useEffect(() => {
    if (!isIntentListLoaded()) loadIntentList();
  }, [isIntentListLoaded, loadIntentList]);

  return (
    <ul>
      {isIntentListLoaded() &&
        getIntentList().map((i) => <li key={i.id}>{i.name}</li>)}
      {!isIntentListLoaded() && <li>No intents to show</li>}
    </ul>
  );
}
