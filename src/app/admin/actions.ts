"use server";

import { cookies } from "next/headers";
import { updateTag } from "next/cache";
import type { InviteContent } from "@/config/invite";
import { isAdmin, safeEqual, SESSION_COOKIE, sessionToken } from "@/lib/auth";
import { INVITE_TAG, mergeContent } from "@/lib/invite";
import { writeStoredContent } from "@/lib/store";

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  const expectedPw = process.env.ADMIN_PASSWORD;
  if (!expectedPw) return "ADMIN_PASSWORD is not set on the server.";
  const pw = String(formData.get("password") ?? "");
  if (!safeEqual(pw, expectedPw)) return "Incorrect password.";
  (await cookies()).set(SESSION_COOKIE, sessionToken()!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return null;
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export async function saveContent(content: InviteContent): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdmin())) return { ok: false, error: "Your session has expired. Please log in again." };

  const clean = mergeContent(content);
  if (!clean.bride.name.trim() || !clean.groom.name.trim()) {
    return { ok: false, error: "Bride and groom names are required." };
  }
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: clean.timeZone });
  } catch {
    return { ok: false, error: `"${clean.timeZone}" is not a valid time zone (e.g. Asia/Kolkata).` };
  }
  for (const e of clean.events) {
    if (!DATE_RE.test(e.date)) return { ok: false, error: `"${e.title}" needs a valid date.` };
    if (!TIME_RE.test(e.time)) return { ok: false, error: `"${e.title}" needs a valid time.` };
    e.durationHours = Number(e.durationHours) > 0 ? Number(e.durationHours) : 3;
    e.notes = e.notes.map((n) => n.trim()).filter(Boolean);
  }
  for (const p of [clean.bride, clean.groom]) p.siblings = p.siblings.map((t) => t.trim()).filter(Boolean);
  clean.messages.intimate = clean.messages.intimate.filter((t) => t.trim());
  clean.messages.announce = clean.messages.announce.filter((t) => t.trim());
  clean.saveTheDate.preParagraphs = clean.saveTheDate.preParagraphs.filter((t) => t.trim());
  clean.saveTheDate.reasons = clean.saveTheDate.reasons.map((t) => t.trim()).filter(Boolean);
  if (!["auto", "before", "after"].includes(clean.saveTheDate.mode)) clean.saveTheDate.mode = "auto";
  clean.faqs = clean.faqs.filter((f) => f.q.trim());
  clean.contacts = clean.contacts.filter((c) => c.name.trim() || c.phone.trim());
  clean.gallery = clean.gallery.map((g) => g.trim()).filter(Boolean);
  clean.travel.arrive = clean.travel.arrive.filter((a) => a.label.trim() || a.text.trim());

  try {
    await writeStoredContent(clean);
  } catch (err) {
    return { ok: false, error: `Could not save: ${err instanceof Error ? err.message : String(err)}` };
  }
  updateTag(INVITE_TAG);
  return { ok: true };
}
