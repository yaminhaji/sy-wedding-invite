import type { InviteEvent } from "@/config/invite";

export function formatDay(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    timeZone,
  }).format(new Date(iso));
}

export function formatDate(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(new Date(iso));
}

export function formatTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(new Date(iso));
}

/** "6:00 – 8:00 PM" (or "11:00 AM – 1:00 PM" when it crosses noon). */
export function formatTimeRange(event: { start: string; durationHours: number }, timeZone: string) {
  const start = formatTime(event.start, timeZone);
  const endIso = new Date(new Date(event.start).getTime() + event.durationHours * 3_600_000).toISOString();
  const end = formatTime(endIso, timeZone);
  const mer = (t: string) => t.slice(-2);
  const left = mer(start) === mer(end) ? start.slice(0, -3) : start;
  return `${left} – ${end}`;
}

export function formatHijri(iso: string, timeZone: string) {
  try {
    return new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone,
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

function toCalStamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function eventRange(event: InviteEvent) {
  const start = new Date(event.start);
  const end = new Date(start.getTime() + event.durationHours * 3_600_000);
  return { start, end };
}

export function mapLink(event: InviteEvent) {
  return (
    event.mapUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${event.venue}, ${event.address}`,
    )}`
  );
}

export function googleCalendarLink(event: InviteEvent, title: string) {
  const { start, end } = eventRange(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toCalStamp(start)}/${toCalStamp(end)}`,
    location: `${event.venue}, ${event.address}`,
    details: event.hostedBy,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function icsContent(event: InviteEvent, title: string) {
  const { start, end } = eventRange(event);
  const esc = (s: string) => s.replace(/[\\,;]/g, (m) => `\\${m}`);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nikaah Invite//EN",
    "BEGIN:VEVENT",
    `UID:${event.key}-${toCalStamp(start)}@nikaah-invite`,
    `DTSTAMP:${toCalStamp(new Date())}`,
    `DTSTART:${toCalStamp(start)}`,
    `DTEND:${toCalStamp(end)}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(`${event.venue}, ${event.address}`)}`,
    `DESCRIPTION:${esc(event.hostedBy)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
