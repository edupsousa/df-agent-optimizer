import { GetState, SetState, StoreApi } from "zustand";
import { AgentConfig } from "./AgentConfig";
import { Intent } from "./Intent";

export type StateProperties = {
  isLoaded: boolean;
  agentConfig: AgentConfig | null;
  intentList: Intent[] | null;
  rawData: string | null;
};

export type StateActions = {
  loadAgent: (data: string) => Promise<void>;
  unloadAgent: () => void;
};

export type State = StateProperties & StateActions;

export type ActionCreator<K extends keyof StateActions> = (
  set: SetState<State>,
  get: GetState<State>,
  api: StoreApi<State>
) => StateActions[K];

export type ActionsCreator = (
  set: SetState<State>,
  get: GetState<State>,
  api: StoreApi<State>
) => StateActions;
