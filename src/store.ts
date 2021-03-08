import { useState, useCallback } from "react";
import { createContainer } from "react-tracked";
import produce, { Draft } from "immer";
import { Intent } from "./types/Intent";

export type State = {
  agentFileLoaded: boolean;
  intentList: Intent[] | null;
};

const initialState: State = {
  agentFileLoaded: sessionStorage.getItem("agentFile") !== null,
  intentList: null,
};

const useValue = () => useState(initialState);

const { Provider, useTrackedState, useUpdate: useSetState } = createContainer(
  useValue
);

const useSetDraft = () => {
  const setState = useSetState();
  return useCallback(
    (draftUpdater: (draft: Draft<State>) => void) => {
      setState(produce(draftUpdater));
    },
    [setState]
  );
};

export { Provider, useTrackedState, useSetDraft };
