import { createTrackedSelector } from "react-tracked";
import create from "zustand";
import { devtools, persist } from "zustand/middleware";
import { loadAgentAction } from "./loadAgentAction";
import { renameIntentsAction } from "./renameIntentsAction";
import {
  ActionsCreator,
  IntentChangeList,
  IntentListItem,
  State,
  StateProperties,
} from "./types";

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

  removeInputContext: async (intentName: string, contextName: string) => {
    const { intentList } = get();
    const intentFile = intentList.find((i) => i.intent.name === intentName);
    if (!intentFile) return;
    intentFile.intent.contexts = intentFile.intent.contexts.filter(
      (ctxName) => ctxName.toLowerCase() !== contextName.toLowerCase()
    );
    set({ intentList: intentList.slice() });
  },
  subscribeToIntentChanges: (changeHandler) => {
    const initialChanges: IntentChangeList = get().intentList.map(
      (intentFile) => ({ change: "added", intentFile })
    );
    changeHandler(initialChanges);
  },
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
