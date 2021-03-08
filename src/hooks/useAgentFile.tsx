import { useCallback } from "react";
import { useSetDraft, useTrackedState } from "../store";

export const useAgentFile = () => {
  const state = useTrackedState();
  const getAgentFile = () => state.agentFile;
  const setDraft = useSetDraft();

  const setAgentFile = useCallback(
    (agentFile: string) => {
      sessionStorage.setItem("agentFile", agentFile);
      setDraft((draft) => {
        draft.agentFile = agentFile;
      });
    },
    [setDraft]
  );

  const loadAgentFile = useCallback(
    async (zipFile: File) => {
      const agentData = await importAgent(zipFile);
      setAgentFile(agentData);
    },
    [setAgentFile]
  );

  const deleteAgentFile = useCallback(() => {
    sessionStorage.removeItem("agentFile");
    setDraft((draft) => {
      draft.agentFile = null;
    });
  }, [setDraft]);

  return { loadAgentFile, getAgentFile, setAgentFile, deleteAgentFile };
};

const importAgent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
  });
};
