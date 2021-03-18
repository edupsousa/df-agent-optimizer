import { createTrackedSelector } from "react-tracked";
import create from "zustand";
import { devtools, persist } from "zustand/middleware";
import { loadAgentAction } from "./loadAgentAction";
import { renameIntentsAction } from "./renameIntentsAction";
import { ActionsCreator, State, StateProperties } from "./types";

export type { AgentConfig, Intent, IntentToRename } from "./types";

const initialState: StateProperties = {
  isLoaded: false,
  agentConfig: null,
  intentList: [],
  rawData: null,
};

const stateActions: ActionsCreator = (set, get, api) => ({
  loadAgent: loadAgentAction(set, get, api),
  unloadAgent: () => set(initialState),
  renameIntents: renameIntentsAction(set, get, api),
});

const useStore = create<State>(
  persist(
    devtools((set, get, api) => ({
      ...initialState,
      ...stateActions(set, get, api),
    })),
    {
      name: "agent-storage",
      getStorage: () => sessionStorage,
    }
  )
);

const useAgentStore = createTrackedSelector(useStore);

export default useAgentStore;
