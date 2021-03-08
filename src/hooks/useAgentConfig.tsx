import JSZip from "jszip";
import { useCallback } from "react";
import { useSetDraft, useTrackedState } from "../store";
import { AgentConfig } from "../types/AgentConfig";
import { useAgentFile } from "./useAgentFile";

export const useAgentConfig = () => {
  const { getAgentFile } = useAgentFile();
  const state = useTrackedState();
  const setDraft = useSetDraft();

  const setAgentConfig = useCallback(
    async (config: AgentConfig) => {
      setDraft((draft) => {
        draft.agentConfig = config;
      });
    },
    [setDraft]
  );

  const loadAgentConfig = async (): Promise<void> => {
    const agentFile = getAgentFile();
    if (agentFile === null) return;
    const zipFile = await openZipFile(agentFile);
    const config = await getAgentConfigFromZipFile(zipFile);
    setAgentConfig(config);
  };
  const isAgentConfigLoaded = () => state.agentConfig !== null;

  const getAgentConfig = () => state.agentConfig;

  return {
    loadAgentConfig,
    getAgentConfig,
    setAgentConfig,
    isAgentConfigLoaded,
  };
};

async function getAgentConfigFromZipFile(
  agentFile: JSZip
): Promise<AgentConfig> {
  const configFile = agentFile.file("agent.json");
  if (!configFile) throw new Error("Agent config not found (agent.json).");

  return JSON.parse(await configFile.async("string")) as AgentConfig;
}

async function openZipFile(file: string): Promise<JSZip> {
  const zip = JSZip();
  const agentFile = await zip.loadAsync(file);
  return agentFile;
}
