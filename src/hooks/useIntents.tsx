import { useCallback } from "react";
import JSZip, { JSZipObject } from "jszip";
import { useTrackedState, useSetDraft } from "../store";
import { Intent } from "../types/Intent";
import { useAgentFile } from "./useAgentFile";

export const useIntents = () => {
  const { getAgentFile } = useAgentFile();
  const state = useTrackedState();
  const setDraft = useSetDraft();
  const setIntentList = useCallback(
    async (intents: Intent[]) => {
      setDraft((draft) => {
        draft.intentList = intents;
      });
    },
    [setDraft]
  );
  const loadIntentList = async (): Promise<void> => {
    const agentFile = getAgentFile();
    if (agentFile === null) return;
    const zipFile = await openZipFile(agentFile);
    const intents = await getIntentsFromZipFile(zipFile);
    setIntentList(intents);
  };
  const isIntentListLoaded = () => state.intentList !== null;
  const getIntentList = (): Intent[] =>
    state.intentList !== null ? state.intentList : [];
  return { loadIntentList, getIntentList, setIntentList, isIntentListLoaded };
};

const INTENT_FILENAME_REGEX = /^intents\/(((?!_usersays_).)*)\.json$/;

async function getIntentsFromZipFile(agentFile: JSZip): Promise<Intent[]> {
  return Promise.all(
    agentFile.file(INTENT_FILENAME_REGEX).map(parseIntentFile)
  );
}

async function parseIntentFile(file: JSZipObject): Promise<Intent> {
  const contents = await file.async("string");
  try {
    return JSON.parse(contents) as Intent;
  } catch (e) {
    throw new Error(`Error parsing intent file ${file.name}: ${e.message}`);
  }
}

async function openZipFile(file: string): Promise<JSZip> {
  const zip = JSZip();
  const agentFile = await zip.loadAsync(file);
  return agentFile;
}
