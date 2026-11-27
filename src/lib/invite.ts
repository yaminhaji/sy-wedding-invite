import { cacheLife, cacheTag } from "next/cache";
import { defaultContent, defaultTheme, firstName, type InviteContent, type InviteEvent, type Theme } from "@/config/invite";
import { readStoredContent } from "./store";

export const INVITE_TAG = "invite";

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Only #rrggbb values are accepted: these end up inside CSS and SVG, so anything else is dropped. */
export function sanitizeTheme(t: Partial<Theme> | undefined): Theme {
  const out = { ...defaultTheme };
  for (const k of Object.keys(defaultTheme) as (keyof Theme)[]) {
    const v = t?.[k];
    if (typeof v === "string" && HEX.test(v.trim())) out[k] = v.trim().toLowerCase();
  }
  return out;
}

/** Saved content layered over the defaults, so newly added fields always have a value. */
export function mergeContent(stored: Partial<InviteContent> | null): InviteContent {
  const d = defaultContent;
  if (!stored) return d;
  return {
    ...d,
    ...stored,
    bride: { ...d.bride, ...stored.bride },
    groom: { ...d.groom, ...stored.groom },
    travel: { ...d.travel, ...stored.travel, stay: { ...d.travel.stay, ...stored.travel?.stay } },
    messages: { ...d.messages, ...stored.messages },
    saveTheDate: { ...d.saveTheDate, ...stored.saveTheDate },
    chat: { ...d.chat, ...stored.chat },
    theme: sanitizeTheme(stored.theme),
    events: (stored.events?.length ? stored.events : d.events).map((e, i) => ({
      ...(d.events[i] ?? d.events[0]),
      ...e,
    })),
  };
}

/** Raw editable content (cached; invalidated when the admin saves). */
export async function getContent(): Promise<InviteContent> {
  "use cache";
  cacheTag(INVITE_TAG);
  return mergeContent(await readStoredContent());
}

/** Offset (ms) of `timeZone` from UTC at the given instant. */
function tzOffset(utcMs: number, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(utcMs))
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return asUtc - utcMs;
}

/** Local date ("YYYY-MM-DD") + time ("HH:MM") in `timeZone` → ISO instant. */
export function zonedToIso(date: string, time: string, timeZone: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = (time || "00:00").split(":").map(Number);
  const guess = Date.UTC(y, (m || 1) - 1, d || 1, hh || 0, mm || 0);
  let utc = guess - tzOffset(guess, timeZone);
  utc = guess - tzOffset(utc, timeZone); // second pass handles DST edges
  const out = new Date(utc);
  return Number.isNaN(out.getTime()) ? new Date(guess).toISOString() : out.toISOString();
}

export interface Invite extends Omit<InviteContent, "events"> {
  events: InviteEvent[];
}

/** Everything a page needs, derived from the current content. */
export async function getInvite() {
  const content = await getContent();
  const events: InviteEvent[] = content.events.map((e) => ({
    ...e,
    start: zonedToIso(e.date, e.time, content.timeZone),
  }));
  const invite: Invite = { ...content, events };
  const sortedEvents = [...events].sort((a, b) => a.start.localeCompare(b.start));
  return {
    invite,
    sortedEvents,
    coupleTitle: `${firstName(content.bride.name)} & ${firstName(content.groom.name)}`,
    monogram: `${content.bride.name.trim()[0] ?? ""} ◆ ${content.groom.name.trim()[0] ?? ""}`,
  };
}

/** Whether an instant has passed. Re-evaluated about once a minute (cached with the "minutes" profile). */
export async function hasHappened(startIso: string): Promise<boolean> {
  "use cache";
  cacheLife("minutes");
  return Date.now() >= new Date(startIso).getTime();
}
