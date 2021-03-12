import { openZipFile } from "./openZipFile";
import { ActionCreator } from "./types";

export const renameIntentsAction: ActionCreator<"renameIntents"> = (
  set,
  get,
  api
) => async (intents) => {
  const rawZipFile = get().rawData;
  if (rawZipFile === null)
    throw new Error("Can't rename intents, zip file isn't loaded.");
  const zipFile = await openZipFile(rawZipFile);
  intents.forEach(({ filename, intent, newName }) => {
    if (intent.name === newName) return;
    zipFile.remove(`intents/${filename}.json`);
    zipFile.file(
      `intents/${newName}.json`,
      JSON.stringify({ ...intent, name: newName }, null, 2)
    );
    //TODO: Must rename _usersays_ files too.
  });
  const rawNewFile = await zipFile.generateAsync({
    type: "binarystring",
    compression: "DEFLATE",
  });
  return get().loadAgent(rawNewFile);
};
