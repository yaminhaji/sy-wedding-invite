/**
 * Server-side storage for the editable invite content.
 *
 * - On Vercel (a Blob store is connected, so BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID is set):
 *   a single private JSON blob.
 * - Locally (no Blob env vars): .data/invite.json in the project folder.
 */
import { get, put } from "@vercel/blob";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { InviteContent } from "@/config/invite";

const BLOB_PATH = "invite/content.json";
const LOCAL_FILE = path.join(process.cwd(), ".data", "invite.json");

export const usingBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

export async function readStoredContent(): Promise<Partial<InviteContent> | null> {
  try {
    if (usingBlob()) {
      const res = await get(BLOB_PATH, { access: "private", useCache: false });
      if (!res || res.statusCode !== 200) return null;
      return JSON.parse(await new Response(res.stream).text());
    }
    return JSON.parse(await readFile(LOCAL_FILE, "utf8"));
  } catch {
    // Missing file/blob or unreadable JSON: fall back to defaults.
    return null;
  }
}

export async function writeStoredContent(content: InviteContent): Promise<void> {
  const json = JSON.stringify(content, null, 2);
  if (usingBlob()) {
    await put(BLOB_PATH, json, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }
  await mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await writeFile(LOCAL_FILE, json, "utf8");
}
