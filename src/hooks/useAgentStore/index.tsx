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

let handlerId = 0;
const intentChangesHandlerList: Record<
  number,
  (changes: IntentChangeList) => void
> = {};

function notifiyIntentChanges(changeList: IntentChangeList) {
  Object.values(intentChangesHandlerList).forEach((handler) => {
    handler(changeList);
  });
}

const stateActions: ActionsCreator = (set, get, api) => ({
  loadAgent: loadAgentAction(set, get, api),
  unloadAgent: () => set(initialState),
  renameIntents: renameIntentsAction(set, get, api),
  updateIntent: (updatedIntent: IntentListItem) => {
    const { intentList } = get();
    notifiyIntentChanges([{ change: "updated", intentFile: updatedIntent }]);
    return intentList.map((i) =>
      i.filename === updatedIntent.filename ? updatedIntent : i
    );
  },
  removeInputContext: async (intentName: string, contextName: string) => {
    const { intentList, updateIntent } = get();
    const intentFile = intentList.find((i) => i.intent.name === intentName);
    if (!intentFile) return;
    intentFile.intent.contexts = intentFile.intent.contexts.filter(
      (ctxName) => ctxName.toLowerCase() !== contextName.toLowerCase()
    );
    updateIntent(intentFile);
  },
  subscribeToIntentChanges: (changeHandler) => {
    const initialChanges: IntentChangeList = get().intentList.map(
      (intentFile) => ({ change: "added", intentFile })
    );
    changeHandler(initialChanges);
    intentChangesHandlerList[handlerId++] = changeHandler;
    return () => {
      delete intentChangesHandlerList[handlerId - 1];
    };
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
