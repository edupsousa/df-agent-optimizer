import { useState, useCallback } from "react";
import { createContainer } from "react-tracked";
import produce, { Draft } from "immer";
import { Intent } from "./types/Intent";
import { AgentConfig } from "./types/AgentConfig";

export type State = {
  agentFileLoaded: boolean;
  agentConfig: AgentConfig | null;
  intentList: Intent[] | null;
};

export const initialState: State = {
  agentFileLoaded: sessionStorage.getItem("agentFile") !== null,
  agentConfig: null,
  intentList: null,
};

const useValue = () => useState(initialState);

const { Provider, useTrackedState, useUpdate: useSetState } = createContainer(
  useValue
);

const useSetDraft = () => {
  const setState = useSetState();
  return useCallback(
    (draftUpdater: (draft: Draft<State>) => void | State) => {
      setState(produce(draftUpdater));
    },
    [setState]
  );
};

export { Provider, useTrackedState, useSetDraft };
