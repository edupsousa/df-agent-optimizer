import { IntentListItem } from "../hooks/useAgentStore/types";

export type AgentMapContext = {
  name: string;
  inputOn: AgentMapIntent[];
  outputOn: { lifespan: number; intent: AgentMapIntent }[];
};

export type AgentMapIntent = {
  name: string;
  outputContexts: { lifespan: number; context: AgentMapContext }[];
  inputContexts: AgentMapContext[];
};

export type AgentMap = {
  intents: Record<string, AgentMapIntent>;
  contexts: Record<string, AgentMapContext>;
};

export default function createAgentMap(intentList: IntentListItem[]): AgentMap {
  const ctxMap: AgentMap = {
    intents: {},
    contexts: {},
  };
  const addIntentToMap = (intentName: string) => {
    ctxMap.intents[intentName] = {
      name: intentName,
      inputContexts: [],
      outputContexts: [],
    };
  };
  const addContextToMap = (contextName: string) => {
    if (!ctxMap.contexts[contextName]) {
      ctxMap.contexts[contextName] = {
        name: contextName,
        inputOn: [],
        outputOn: [],
      };
    }
  };
  const addInputContext = (intentName: string, contextName: string) => {
    ctxMap.contexts[contextName].inputOn.push(ctxMap.intents[intentName]);
    ctxMap.intents[intentName].inputContexts.push(ctxMap.contexts[contextName]);
  };
  const addOutputContext = (
    intentName: string,
    contextName: string,
    lifespan: number
  ) => {
    ctxMap.contexts[contextName].outputOn.push({
      lifespan: lifespan,
      intent: ctxMap.intents[intentName],
    });
    ctxMap.intents[intentName].outputContexts.push({
      lifespan: lifespan,
      context: ctxMap.contexts[contextName],
    });
  };
  intentList.forEach(({ intent }) => {
    addIntentToMap(intent.name);
    intent.contexts.forEach((inputContexName) => {
      const contextName = inputContexName.toLowerCase();
      addContextToMap(contextName);
      addInputContext(intent.name, contextName);
    });
    intent.responses.forEach((response) =>
      response.affectedContexts.forEach((outputContext) => {
        const contextName = outputContext.name.toLowerCase();
        addContextToMap(contextName);
        addOutputContext(intent.name, contextName, outputContext.lifespan);
      })
    );
  });
  return ctxMap;
}
