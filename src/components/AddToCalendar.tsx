"use client";

import type { InviteEvent } from "@/config/invite";
import { googleCalendarLink, icsContent } from "@/lib/dates";

export function AddToCalendar({ event, title }: { event: InviteEvent; title: string }) {
  function downloadIcs() {
    const blob = new Blob([icsContent(event, title)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.key}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <a
        className="gold-btn"
        href={googleCalendarLink(event, title)}
        target="_blank"
        rel="noopener noreferrer"
      >
        Google Calendar
      </a>
      <button type="button" className="gold-btn" onClick={downloadIcs}>
        Apple / Outlook
      </button>
    </>
  );
}
