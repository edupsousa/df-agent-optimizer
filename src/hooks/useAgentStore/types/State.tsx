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
  intentList: IntentListItem[];
  rawData: ArrayBuffer | null;
};

export type IntentToRename = IntentListItem & { newName: string };

type IntentChange = {
  change: "added" | "updated" | "removed";
  intentFile: IntentListItem;
};
export type IntentChangeList = IntentChange[];

export type StateActions = {
  loadAgent: (data: File | ArrayBuffer) => Promise<void>;
  unloadAgent: () => void;
  renameIntents: (intents: IntentToRename[]) => Promise<void>;
  removeInputContext: (
    intentName: string,
    contextName: string
  ) => Promise<void>;
  subscribeToIntentChanges: (
    changeHandler: (changes: IntentChangeList) => void
  ) => void;
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
