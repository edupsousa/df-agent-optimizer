import { useCallback } from "react";
import { initialState, useSetDraft, useTrackedState } from "../store";

export const useAgentFile = () => {
  const state = useTrackedState();
  const setDraft = useSetDraft();

  const isAgentFileLoaded = () => state.agentFileLoaded;
  const getAgentFile = () => sessionStorage.getItem("agentFile");

  const setAgentFileLoaded = useCallback(
    (loaded: boolean) => {
      setDraft((draft) => {
        draft.agentFileLoaded = loaded;
      });
    },
    [setDraft]
  );

  const loadAgentFile = useCallback(
    async (zipFile: File) => {
      const agentData = await importAgent(zipFile);
      sessionStorage.setItem("agentFile", agentData);
      setAgentFileLoaded(true);
    },
    [setAgentFileLoaded]
  );

  const deleteAgentFile = useCallback(() => {
    sessionStorage.removeItem("agentFile");
    setDraft(() => {
      return initialState;
    });
  }, [setDraft]);

  return { loadAgentFile, getAgentFile, deleteAgentFile, isAgentFileLoaded };
};

const importAgent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
  });
};
