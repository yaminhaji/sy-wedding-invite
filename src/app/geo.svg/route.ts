import { getInvite } from "@/lib/invite";
import { geoTileSvg } from "@/lib/svg";

/** Generated from the site colours set in /admin, so the pattern always matches the theme. */
export async function GET() {
  const { invite } = await getInvite();
  return new Response(geoTileSvg(invite.theme), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // Always re-check, so a colour change shows up immediately.
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
