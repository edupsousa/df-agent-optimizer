import JSZip, { JSZipObject } from "jszip";
import { createTrackedSelector } from "react-tracked";
import create from "zustand";
import { AgentConfig } from "../types/AgentConfig";
import { Intent } from "../types/Intent";

export type State = {
  agentConfig: AgentConfig | null;
  intentList: Intent[] | null;
  loadAgent: (data: string) => Promise<void>;
  unloadAgent: () => void;
};

const useStore = create<State>((set) => ({
  agentConfig: null,
  intentList: null,
  loadAgent: async (data: string) => {
    const zipFile = await openZipFile(data);
    const agentConfig = await getAgentConfigFromZipFile(zipFile);
    const intentList = await getIntentsFromZipFile(zipFile);
    set({ agentConfig, intentList });
  },
  unloadAgent: () => {
    set({ agentConfig: null, intentList: null });
  },
}));

const useAgentStore = createTrackedSelector(useStore);

export default useAgentStore;

async function openZipFile(file: string): Promise<JSZip> {
  const zip = JSZip();
  const agentFile = await zip.loadAsync(file);
  return agentFile;
}

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

async function getAgentConfigFromZipFile(
  agentFile: JSZip
): Promise<AgentConfig> {
  const configFile = agentFile.file("agent.json");
  if (!configFile) throw new Error("Agent config not found (agent.json).");

  return JSON.parse(await configFile.async("string")) as AgentConfig;
}
