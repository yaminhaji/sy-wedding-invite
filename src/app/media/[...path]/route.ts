import { isAllowedMediaPath, loadMedia } from "@/lib/store";

/** Public address for uploaded photos: /media/gallery/<file>. The Blob store itself stays private. */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathname = path.map(decodeURIComponent).join("/");
  if (!isAllowedMediaPath(pathname)) return new Response("Not found", { status: 404 });

  const media = await loadMedia(pathname);
  if (!media) return new Response("Not found", { status: 404 });

  return new Response(media.body as BodyInit, {
    headers: {
      "Content-Type": media.contentType,
      // File names are unique per upload, so they can be cached for a year.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
