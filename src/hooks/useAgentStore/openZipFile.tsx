import JSZip from "jszip";

export async function openZipFile(file: File | ArrayBuffer): Promise<JSZip> {
  const zip = JSZip();
  const agentFile = await zip.loadAsync(file);
  return agentFile;
}
