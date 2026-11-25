import type { InviteEvent } from "@/config/invite";
import { formatDate, formatDay, formatHijri, formatTimeRange, mapLink } from "./dates";
import type { Invite } from "./invite";
import { makeFill } from "./tags";

/**
 * Plain-text description of everything on the website (and in /admin), used to ground the chat
 * assistant. It is built from the live content, so edits in /admin flow straight into the assistant.
 */
export function buildKnowledge(invite: Invite, sortedEvents: InviteEvent[]): string {
  const tz = invite.timeZone;
  const ev = sortedEvents[0];
  const fill = makeFill(ev, tz);
  const L: string[] = [];

  const person = (label: string, p: Invite["bride"]) => {
    L.push(`${label}: ${p.name}`);
    if (p.parents) {
      L.push(`  ${p.relation}: ${p.parents.split("&").map((s) => s.trim()).join(" and ")}`);
    }
    if (p.siblings.length) L.push(`  ${p.siblingsLabel}: ${p.siblings.join(", ")}`);
  };
  L.push("THE COUPLE");
  person("Bride", invite.bride);
  person("Groom", invite.groom);

  if (ev) {
    L.push("", "THE NIKAAH & WALIMA (one event, one venue)");
    L.push(`Event: ${ev.title}. ${ev.hostedBy}.`);
    L.push(`Date: ${formatDay(ev.start, tz)}, ${formatDate(ev.start, tz)}`);
    const hijri = formatHijri(ev.start, tz);
    if (hijri) L.push(`Islamic date: ${hijri}`);
    L.push(`Time: ${formatTimeRange(ev, tz)} (${tz} time)`);
    L.push(`City: ${invite.city}`);
    L.push(`Venue: ${ev.venue}`);
    L.push(`Address: ${ev.address}`);
    L.push(`Directions link: ${mapLink(ev)}`);
    if (ev.description) L.push(`About: ${fill(ev.description)}`);
    if (ev.notes.length) L.push("Good to know:", ...ev.notes.map((n) => `  - ${fill(n)}`));
  }

  L.push("", "WHO IS INVITED");
  L.push(...invite.messages.intimate.map((t) => fill(t)));
  L.push(`${invite.messages.receptionTitle}: ${invite.messages.reception}`);
  L.push(invite.bringNote);
  if (invite.saveTheDate.reasons.length) {
    L.push(`Why the Nikaah is small: ${invite.saveTheDate.reasons.join(" ")}`);
  }
  L.push(`Future reception: ${invite.saveTheDate.eventName} in ${invite.saveTheDate.when}. ${invite.saveTheDate.detail}`);

  L.push("", "TRAVEL & STAY");
  L.push(invite.travel.intro);
  for (const a of invite.travel.arrive) L.push(`${a.label}: ${a.text}`);
  const s = invite.travel.stay;
  L.push(`Hotel: ${s.name}, ${s.address}`);
  if (s.phone) L.push(`Hotel phone: ${s.phone}`);
  if (s.website) L.push(`Hotel website: ${s.website}`);
  if (s.bookingUrl) L.push(`Book a room: ${s.bookingUrl}`);
  if (s.note) L.push(`Note: ${s.note}`);

  if (invite.faqs.length) {
    L.push("", "FREQUENTLY ASKED QUESTIONS");
    for (const f of invite.faqs) L.push(`Q: ${fill(f.q)}`, `A: ${fill(f.a)}`);
  }

  const contacts = invite.contacts.filter((c) => c.phone.trim());
  if (contacts.length) {
    L.push("", "FAMILY CONTACTS (guests can call or WhatsApp)");
    for (const c of contacts) L.push(`${c.name}: ${c.phone}`);
  }

  if (invite.chat.extraInfo.trim()) L.push("", "EXTRA NOTES FROM THE FAMILY", invite.chat.extraInfo.trim());

  return L.join("\n");
}
