import type { InviteEvent } from "@/config/invite";
import { formatDate, formatTime } from "./dates";

/** Merge tags that can be typed into descriptions, notes and FAQ answers. They fill in from "The Day". */
export const MERGE_TAGS = [
  { tag: "{date}", label: "Date", example: "8 December 2026" },
  { tag: "{time}", label: "Time", example: "6:00 PM" },
  { tag: "{arriveTime}", label: "Arrive by (30 min before)", example: "5:30 PM" },
  { tag: "{venue}", label: "Venue", example: "Sayaji Hotel Vadodara" },
  { tag: "{address}", label: "Address", example: "Near Bhimnath Bridge…" },
] as const;

/** Returns a function that replaces merge tags in a string using the given event. */
export function makeFill(ev: InviteEvent | undefined, timeZone: string) {
  const tokens: Record<string, string> = ev
    ? {
        date: formatDate(ev.start, timeZone),
        time: formatTime(ev.start, timeZone),
        arriveTime: formatTime(new Date(new Date(ev.start).getTime() - 30 * 60_000).toISOString(), timeZone),
        venue: ev.venue,
        address: ev.address,
      }
    : {};
  return (text: string) => text.replace(/\{(\w+)\}/g, (m, k: string) => tokens[k] ?? m);
}
