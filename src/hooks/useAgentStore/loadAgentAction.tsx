import JSZip, { JSZipObject } from "jszip";
import { openZipFile } from "./openZipFile";
import { ActionCreator, AgentConfig, Intent, IntentListItem } from "./types";

export const loadAgentAction: ActionCreator<"loadAgent"> = (set) => async (
  data: File | ArrayBuffer
) => {
  const zipFile = await openZipFile(data);
  const agentConfig = await getAgentConfigFromZipFile(zipFile);
  const intentList = await getIntentsFromZipFile(zipFile);
  const rawData = await zipFile.generateAsync({ type: "arraybuffer" });
  set({ agentConfig, intentList, isLoaded: true, rawData });
};

const INTENT_FILENAME_REGEX = /^intents\/(((?!_usersays_).)*)\.json$/;

async function getIntentsFromZipFile(
  agentFile: JSZip
): Promise<IntentListItem[]> {
  return Promise.all(
    agentFile.file(INTENT_FILENAME_REGEX).map(parseIntentFile)
  );
}

async function parseIntentFile(file: JSZipObject): Promise<IntentListItem> {
  const contents = await file.async("string");
  try {
    const filename = getIntentFilename(file.name);
    const intent = JSON.parse(contents) as Intent;
    return { filename, intent };
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

function getIntentFilename(path: string): string {
  const matches = INTENT_FILENAME_REGEX.exec(path);
  if (matches === null)
    throw new Error(`Error extracting intent name from intent file ${path}`);
  const [, filename] = matches;
  return filename;
}
