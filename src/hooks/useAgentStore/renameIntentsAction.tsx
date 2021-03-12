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
  await Promise.all(
    intents.map(async ({ filename, intent, newName }) => {
      if (intent.name === newName) return;
      zipFile.remove(`intents/${filename}.json`);
      zipFile.file(
        `intents/${newName}.json`,
        JSON.stringify({ ...intent, name: newName }, null, 2)
      );

      await Promise.all(
        zipFile
          .filter((path) => path.startsWith(`intents/${filename}_usersays_`))
          .map(async (file) => {
            const { lang } = parseUserSaysFilename(file.name);
            const contents = await file.async("string");
            zipFile.remove(file.name);
            zipFile.file(`intents/${newName}_usersays_${lang}.json`, contents);
          })
      );
    })
  );
  const rawNewFile = await zipFile.generateAsync({
    type: "arraybuffer",
    compression: "DEFLATE",
  });
  return get().loadAgent(rawNewFile);
};

const USERSAYS_FILENAME_REGEX = /^intents\/(.+)_usersays_(.+)\.json$/;

function parseUserSaysFilename(
  userSaysFilename: string
): { intentName: string; lang: string } {
  const matches = USERSAYS_FILENAME_REGEX.exec(userSaysFilename);
  if (matches === null)
    throw new Error(
      `Error extracting intent name and language from user says file ${userSaysFilename}`
    );
  const [, intentName, lang] = matches;
  return { intentName, lang };
}
