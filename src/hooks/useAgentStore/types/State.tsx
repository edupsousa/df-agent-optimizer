import { GetState, SetState, StoreApi } from "zustand";
import { AgentConfig } from "./AgentConfig";
import { Intent } from "./Intent";

export type IntentListItem = {
  filename: string;
  intent: Intent;
};

export type StateProperties = {
  isLoaded: boolean;
  agentConfig: AgentConfig | null;
  intentList: IntentListItem[] | null;
  rawData: ArrayBuffer | null;
};

export type IntentToRename = IntentListItem & { newName: string };

export type StateActions = {
  loadAgent: (data: File | ArrayBuffer) => Promise<void>;
  unloadAgent: () => void;
  renameIntents: (intents: IntentToRename[]) => Promise<void>;
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
