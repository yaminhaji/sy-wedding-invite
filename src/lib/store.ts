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

/* ---------- Photos (gallery & portraits) ---------- */

const MEDIA_DIR = path.join(process.cwd(), ".data", "media");
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const TYPE_BY_EXT: Record<string, string> = Object.fromEntries(Object.entries(EXT_BY_TYPE).map(([t, e]) => [e, t]));

/** Only these top-level folders may be uploaded to / served. */
export const MEDIA_FOLDERS = ["gallery", "couple"] as const;

export function isAllowedMediaPath(p: string) {
  return (
    !p.includes("..") &&
    !p.startsWith("/") &&
    /^[a-z0-9][a-z0-9._/-]*$/i.test(p) &&
    MEDIA_FOLDERS.some((f) => p.startsWith(`${f}/`))
  );
}

/**
 * Saves an uploaded image. On Vercel it goes into the private Blob store under
 * `<folder>/…` (random suffix added, so names never collide); locally into .data/media.
 * Returns the pathname to store, e.g. "gallery/photo-x7Kq2.jpg".
 */
export async function saveMedia(folder: (typeof MEDIA_FOLDERS)[number], file: File): Promise<string> {
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) throw new Error("Please upload a JPG, PNG, WebP or GIF image.");
  const base =
    file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "photo";

  if (usingBlob()) {
    const r = await put(`${folder}/${base}.${ext}`, file, {
      access: "private",
      addRandomSuffix: true,
      contentType: file.type,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return r.pathname;
  }
  const rel = `${folder}/${base}-${Date.now().toString(36)}.${ext}`;
  const full = path.join(MEDIA_DIR, rel);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, Buffer.from(await file.arrayBuffer()));
  return rel;
}

/** Reads a stored image for serving. Returns null if it doesn't exist. */
export async function loadMedia(
  pathname: string,
): Promise<{ body: ReadableStream<Uint8Array> | Uint8Array; contentType: string } | null> {
  try {
    if (usingBlob()) {
      const res = await get(pathname, { access: "private" });
      if (!res || res.statusCode !== 200) return null;
      return { body: res.stream, contentType: res.blob.contentType };
    }
    const buf = await readFile(path.join(MEDIA_DIR, pathname));
    const ext = pathname.split(".").pop()?.toLowerCase() ?? "";
    return { body: new Uint8Array(buf), contentType: TYPE_BY_EXT[ext] ?? "application/octet-stream" };
  } catch {
    return null;
  }
}
