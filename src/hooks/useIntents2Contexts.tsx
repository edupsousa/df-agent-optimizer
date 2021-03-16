import { useMemo } from "react";
import { IntentListItem } from "./useAgentStore/types";

export type ContextLinks = {
  inputOn: string[];
  outputOn: Record<string, number>;
};

export type ContextMap = Record<string, ContextLinks>;

const addContext = (
  contexts: ContextMap,
  name: string,
  intentName: string,
  lifespan?: number
) => {
  if (!contexts[name]) {
    contexts[name] = {
      inputOn: [],
      outputOn: {},
    };
  }
  if (lifespan === undefined) contexts[name].inputOn.push(intentName);
  else contexts[name].outputOn[intentName] = lifespan;
};

export function useIntents2Contexts(
  intentList: IntentListItem[] | null
): ContextMap {
  return useMemo(() => {
    if (!intentList || intentList.length === 0) return {};
    const contexts: ContextMap = {};

    intentList.forEach(({ intent }) => {
      intent.contexts.forEach((ctx) => {
        addContext(contexts, ctx, intent.name);
      });
      intent.responses.forEach((r) =>
        r.affectedContexts.forEach((ctx) => {
          addContext(contexts, ctx.name, intent.name, ctx.lifespan);
        })
      );
    });

    return contexts;
  }, [intentList]);
}
