import { isAdmin } from "@/lib/auth";
import { MEDIA_FOLDERS, saveMedia } from "@/lib/store";

// Vercel rejects request bodies over ~4.5 MB; the admin page shrinks photos before sending.
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Please log in again." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const folder = String(form?.get("folder") ?? "gallery") as (typeof MEDIA_FOLDERS)[number];
  if (!(file instanceof File)) return Response.json({ error: "No file received." }, { status: 400 });
  if (!MEDIA_FOLDERS.includes(folder)) return Response.json({ error: "Invalid folder." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "That photo is too large (max 4 MB)." }, { status: 413 });

  try {
    const pathname = await saveMedia(folder, file);
    return Response.json({ url: `/media/${pathname}` });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Upload failed." }, { status: 400 });
  }
}
