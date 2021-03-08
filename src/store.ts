import { useState, useCallback } from "react";
import { createContainer } from "react-tracked";
import produce, { Draft } from "immer";
import { Intent } from "./types/Intent";

export type State = {
  agentFile: string | null;
  intentList: Intent[] | null;
};

const initialState: State = {
  agentFile: sessionStorage.getItem("agentFile"),
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
