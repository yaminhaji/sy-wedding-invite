"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { InviteContent } from "@/config/invite";
import { MERGE_TAGS } from "@/lib/tags";
import { logout, saveContent } from "./actions";
import { PhotoField, PhotoGrid } from "./PhotoUpload";

type Draft = InviteContent;

/* ---------- merge tag copy helpers ---------- */

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

function CopyIcon({ done }: { done: boolean }) {
  return done ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="1.5" />
      <path d="M5 15V5.5A1.5 1.5 0 0 1 6.5 4H15" />
    </svg>
  );
}

/** A tag chip such as {venue} with a copy icon. Click to copy it, then paste into any text. */
function CopyTag({ tag, title, compact = false }: { tag: string; title?: string; compact?: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      title={title ?? `Copy ${tag}`}
      aria-label={`Copy ${tag}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void copyText(tag).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        });
      }}
      className={`inline-flex items-center gap-1.5 border border-gold/60 bg-ivory font-mono text-gold-deep hover:bg-gold hover:text-ivory ${
        compact ? "px-1.5 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
      } ${done ? "!border-sage-deep !bg-sage-deep !text-ivory" : ""}`}
    >
      {!compact && <span>{done ? "Copied" : tag}</span>}
      <CopyIcon done={done} />
    </button>
  );
}

/** Row of all merge tags, shown wherever they can be used. */
function TagBar({ note }: { note?: string }) {
  return (
    <div className="border border-gold/40 bg-blush/50 px-4 py-3">
      <p className="font-serif text-lg text-ink">
        <strong>Merge tags</strong>: copy one and paste it into the text. It fills in automatically from The Day.
        {note ? ` ${note}` : ""}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {MERGE_TAGS.map((t) => (
          <CopyTag key={t.tag} tag={t.tag} title={`${t.label}, e.g. ${t.example}`} />
        ))}
      </div>
    </div>
  );
}

/* ---------- small field components ---------- */

function Text({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  dir,
  tag,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  dir?: "rtl";
  /** If set, shows a copy icon that copies this merge tag, e.g. "{venue}" */
  tag?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2">
        <span className="caps text-sm text-gold-deep">{label}</span>
        {tag && <CopyTag tag={tag} compact />}
      </span>
      <input
        className="mt-1 w-full border border-gold/50 bg-ivory px-3 py-2.5 font-serif text-lg text-ink outline-none focus:border-burgundy"
        type={type}
        value={value}
        placeholder={placeholder}
        dir={dir}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="mt-1 block font-serif text-base text-muted">{hint}</span>}
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 3,
  tag,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  tag?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2">
        <span className="caps text-sm text-gold-deep">{label}</span>
        {tag && <CopyTag tag={tag} compact />}
      </span>
      <textarea
        className="mt-1 w-full border border-gold/50 bg-ivory px-3 py-2.5 font-serif text-lg leading-relaxed text-ink outline-none focus:border-burgundy"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function StringList({
  label,
  items,
  onChange,
  multiline = false,
  addLabel = "Add",
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
  multiline?: boolean;
  addLabel?: string;
}) {
  return (
    <div>
      <span className="caps text-sm text-gold-deep">{label}</span>
      <div className="mt-1 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            {multiline ? (
              <textarea
                className="w-full border border-gold/50 bg-ivory px-3 py-2 font-serif text-lg leading-relaxed outline-none focus:border-burgundy"
                rows={3}
                value={item}
                onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
              />
            ) : (
              <input
                className="w-full border border-gold/50 bg-ivory px-3 py-2 font-serif text-lg outline-none focus:border-burgundy"
                value={item}
                onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
              />
            )}
            <RemoveBtn onClick={() => onChange(items.filter((_, j) => j !== i))} />
          </div>
        ))}
      </div>
      <AddBtn onClick={() => onChange([...items, ""])}>{addLabel}</AddBtn>
    </div>
  );
}

function AddBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="gold-btn mt-3 px-4 py-2">
      + {children}
    </button>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Remove"
      className="shrink-0 self-start border border-burgundy/40 px-3 py-2 font-serif text-lg text-burgundy hover:bg-burgundy hover:text-ivory"
    >
      ✕
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card px-5 py-8 sm:px-10">
      <h2 className="font-script text-5xl text-burgundy">{title}</h2>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

/* ---------- editor ---------- */

export function AdminEditor({ initial, storage }: { initial: InviteContent; storage: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(initial);
  const [saved, setSaved] = useState<Draft>(initial);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const update = (fn: (d: Draft) => void) =>
    setDraft((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });

  function save() {
    setStatus(null);
    startTransition(async () => {
      const res = await saveContent(draft);
      if (res.ok) {
        setSaved(draft);
        setStatus({ kind: "ok", text: "Saved. The live site is updated." });
        router.refresh();
      } else {
        setStatus({ kind: "error", text: res.error ?? "Something went wrong." });
      }
    });
  }

  return (
    <div className="pb-32">
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-gold/40 bg-ivory/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="font-script text-4xl leading-none text-burgundy">Admin</p>
            <p className="font-serif text-sm text-muted">Saving to {storage}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer" className="gold-btn px-4 py-2">
              View site
            </a>
            <button
              type="button"
              className="gold-btn px-4 py-2"
              onClick={() => startTransition(async () => { await logout(); router.refresh(); })}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-8 px-4 pt-8">
        {/* ---------- Couple ---------- */}
        <Section title="The Couple">
          {(["bride", "groom"] as const).map((who) => (
            <div key={who} className="grid gap-4 border-t border-gold/30 pt-5 first:border-t-0 first:pt-0 sm:grid-cols-2">
              <p className="eyebrow sm:col-span-2">{who === "bride" ? "Bride (always shown first)" : "Groom"}</p>
              <Text label="Full name" value={draft[who].name} onChange={(v) => update((d) => void (d[who].name = v))} />
              <Text
                label="Relation"
                value={draft[who].relation}
                onChange={(v) => update((d) => void (d[who].relation = v))}
                placeholder={who === "bride" ? "daughter of" : "son of"}
              />
              <Text
                label="Parents"
                value={draft[who].parents}
                onChange={(v) => update((d) => void (d[who].parents = v))}
                placeholder="Mr. & Mrs. …"
                hint="Father & Mother, separated by &. Each shows on its own line. Leave empty to hide."
              />
              <PhotoField
                label="Portrait photo (optional)"
                value={draft[who].photo}
                onChange={(v) => update((d) => void (d[who].photo = v))}
              />
              <Text
                label="Siblings heading"
                value={draft[who].siblingsLabel}
                onChange={(v) => update((d) => void (d[who].siblingsLabel = v))}
                placeholder="Brothers / Sister / Siblings"
              />
              <StringList
                label="Siblings"
                items={draft[who].siblings}
                onChange={(v) => update((d) => void (d[who].siblings = v))}
                addLabel="Add sibling"
              />
            </div>
          ))}
        </Section>

        {/* ---------- The Day ---------- */}
        <Section title="The Day">
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="City" value={draft.city} onChange={(v) => update((d) => void (d.city = v))} />
            <Text
              label="Time zone"
              value={draft.timeZone}
              onChange={(v) => update((d) => void (d.timeZone = v))}
              hint="e.g. Asia/Kolkata. Date and time below are in this zone."
            />
          </div>
          {draft.events.map((ev, i) => (
            <div key={i} className="space-y-4 border-t border-gold/30 pt-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <Text label="Date" tag="{date}" type="date" value={ev.date} onChange={(v) => update((d) => void (d.events[i].date = v))} />
                <Text label="Start time" tag="{time}" type="time" value={ev.time} onChange={(v) => update((d) => void (d.events[i].time = v))} />
                <Text
                  label="Length (hours)"
                  type="number"
                  value={ev.durationHours}
                  onChange={(v) => update((d) => void (d.events[i].durationHours = Number(v)))}
                  hint="So 6:00 PM + 2 hours shows as 6:00 – 8:00 PM. Also used for calendar invites."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Text label="Title" value={ev.title} onChange={(v) => update((d) => void (d.events[i].title = v))} />
                <Text label="Hosted by" value={ev.hostedBy} onChange={(v) => update((d) => void (d.events[i].hostedBy = v))} />
                <Text label="Venue" tag="{venue}" value={ev.venue} onChange={(v) => update((d) => void (d.events[i].venue = v))} />
                <Text
                  label="Map link (optional)"
                  value={ev.mapUrl}
                  onChange={(v) => update((d) => void (d.events[i].mapUrl = v))}
                  hint="Leave empty to search Google Maps for the address."
                />
              </div>
              <Area label="Address" tag="{address}" rows={2} value={ev.address} onChange={(v) => update((d) => void (d.events[i].address = v))} />
              <Area label="Description" value={ev.description} onChange={(v) => update((d) => void (d.events[i].description = v))} />
              <TagBar note="Works in the description, the notes below, and FAQ answers." />
              <StringList
                label="Notes (bullet points)"
                items={ev.notes}
                onChange={(v) => update((d) => void (d.events[i].notes = v))}
                addLabel="Add note"
              />
            </div>
          ))}
        </Section>

        {/* ---------- Wording ---------- */}
        <Section title="Wording">
          <p className="eyebrow">Main invite (Nikaah &amp; Walima)</p>
          <Text
            label="Intimate gathering title"
            value={draft.messages.intimateTitle}
            onChange={(v) => update((d) => void (d.messages.intimateTitle = v))}
          />
          <StringList
            label="Intimate gathering paragraphs"
            items={draft.messages.intimate}
            multiline
            onChange={(v) => update((d) => void (d.messages.intimate = v))}
            addLabel="Add paragraph"
          />
          <Text
            label="Reception heading"
            value={draft.messages.receptionTitle}
            onChange={(v) => update((d) => void (d.messages.receptionTitle = v))}
          />
          <Area label="Reception text" value={draft.messages.reception} onChange={(v) => update((d) => void (d.messages.reception = v))} />
          <Text label="Closing line" value={draft.bringNote} onChange={(v) => update((d) => void (d.bringNote = v))} />

        </Section>

        {/* ---------- Save the date (invite 2) ---------- */}
        <Section title="Save the Date">
          <p className="font-serif text-lg text-muted">
            The second invite, at <strong>/save-the-date</strong>, for everyone not invited (extended family, friends,
            colleagues, abroad). One link works before and after the Nikaah. It shows the Nikaah date from &ldquo;The
            Day&rdquo; above, never the venue or time.
          </p>
          <label className="block">
            <span className="caps text-sm text-gold-deep">Which wording to show</span>
            <select
              className="mt-1 w-full border border-gold/50 bg-ivory px-3 py-2.5 font-serif text-lg text-ink outline-none focus:border-burgundy"
              value={draft.saveTheDate.mode}
              onChange={(e) =>
                update((d) => void (d.saveTheDate.mode = e.target.value as "auto" | "before" | "after"))
              }
            >
              <option value="auto">Automatic: &ldquo;getting married&rdquo; until the Nikaah, then &ldquo;now married&rdquo;</option>
              <option value="before">Always &ldquo;getting married&rdquo; (before)</option>
              <option value="after">Always &ldquo;now married&rdquo; (after)</option>
            </select>
          </label>

          <p className="eyebrow border-t border-gold/30 pt-5">Before the Nikaah</p>
          <Text
            label="Line under the names"
            value={draft.saveTheDate.preLead}
            onChange={(v) => update((d) => void (d.saveTheDate.preLead = v))}
          />
          <StringList
            label="Paragraphs (the first appears above the reasons)"
            items={draft.saveTheDate.preParagraphs}
            multiline
            onChange={(v) => update((d) => void (d.saveTheDate.preParagraphs = v))}
            addLabel="Add paragraph"
          />
          <Text
            label="Closing line"
            value={draft.saveTheDate.preClosing}
            onChange={(v) => update((d) => void (d.saveTheDate.preClosing = v))}
          />

          <p className="eyebrow border-t border-gold/30 pt-5">Reasons (shown in both versions)</p>
          <Text
            label="Heading"
            value={draft.saveTheDate.reasonsTitle}
            onChange={(v) => update((d) => void (d.saveTheDate.reasonsTitle = v))}
          />
          <StringList
            label="Reasons"
            items={draft.saveTheDate.reasons}
            onChange={(v) => update((d) => void (d.saveTheDate.reasons = v))}
            addLabel="Add reason"
          />

          <p className="eyebrow border-t border-gold/30 pt-5">After the Nikaah</p>
          <Text
            label="Line under the names"
            value={draft.messages.announceLead}
            onChange={(v) => update((d) => void (d.messages.announceLead = v))}
          />
          <StringList
            label="Paragraphs (the first appears above the reasons)"
            items={draft.messages.announce}
            multiline
            onChange={(v) => update((d) => void (d.messages.announce = v))}
            addLabel="Add paragraph"
          />
          <Text label="Closing line" value={draft.saveTheDate.closing} onChange={(v) => update((d) => void (d.saveTheDate.closing = v))} />

          <p className="eyebrow border-t border-gold/30 pt-5">Save the Date box (both versions)</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Text label="Heading" value={draft.saveTheDate.title} onChange={(v) => update((d) => void (d.saveTheDate.title = v))} />
            <Text label="Event" value={draft.saveTheDate.eventName} onChange={(v) => update((d) => void (d.saveTheDate.eventName = v))} />
            <Text
              label="When"
              value={draft.saveTheDate.when}
              onChange={(v) => update((d) => void (d.saveTheDate.when = v))}
              hint='e.g. "2028" or "Spring 2028"'
            />
          </div>
          <Area label="Details" value={draft.saveTheDate.detail} onChange={(v) => update((d) => void (d.saveTheDate.detail = v))} />
        </Section>

        {/* ---------- Travel ---------- */}
        <Section title="Travel & Stay">
          <Area label="Intro" value={draft.travel.intro} onChange={(v) => update((d) => void (d.travel.intro = v))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="Hotel name" value={draft.travel.stay.name} onChange={(v) => update((d) => void (d.travel.stay.name = v))} />
            <Text label="Hotel phone" value={draft.travel.stay.phone} onChange={(v) => update((d) => void (d.travel.stay.phone = v))} />
            <Text label="Hotel website" value={draft.travel.stay.website} onChange={(v) => update((d) => void (d.travel.stay.website = v))} />
            <Text label="Booking link" value={draft.travel.stay.bookingUrl} onChange={(v) => update((d) => void (d.travel.stay.bookingUrl = v))} />
          </div>
          <Area label="Hotel address" rows={2} value={draft.travel.stay.address} onChange={(v) => update((d) => void (d.travel.stay.address = v))} />
          <Area label="Hotel note" rows={2} value={draft.travel.stay.note} onChange={(v) => update((d) => void (d.travel.stay.note = v))} />
          <div>
            <span className="caps text-sm text-gold-deep">Getting there</span>
            <div className="mt-1 space-y-2">
              {draft.travel.arrive.map((a, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="w-32 shrink-0 border border-gold/50 bg-ivory px-3 py-2 font-serif text-lg outline-none focus:border-burgundy"
                    value={a.label}
                    placeholder="By air"
                    onChange={(e) => update((d) => void (d.travel.arrive[i].label = e.target.value))}
                  />
                  <input
                    className="w-full border border-gold/50 bg-ivory px-3 py-2 font-serif text-lg outline-none focus:border-burgundy"
                    value={a.text}
                    onChange={(e) => update((d) => void (d.travel.arrive[i].text = e.target.value))}
                  />
                  <RemoveBtn onClick={() => update((d) => void d.travel.arrive.splice(i, 1))} />
                </div>
              ))}
            </div>
            <AddBtn onClick={() => update((d) => void d.travel.arrive.push({ label: "", text: "" }))}>Add</AddBtn>
          </div>
        </Section>

        {/* ---------- FAQ ---------- */}
        <Section title="FAQ">
          <TagBar />
          {draft.faqs.map((f, i) => (
            <div key={i} className="flex gap-2 border-t border-gold/30 pt-4 first:border-t-0 first:pt-0">
              <div className="w-full space-y-2">
                <Text label="Question" value={f.q} onChange={(v) => update((d) => void (d.faqs[i].q = v))} />
                <Area label="Answer" rows={2} value={f.a} onChange={(v) => update((d) => void (d.faqs[i].a = v))} />
              </div>
              <RemoveBtn onClick={() => update((d) => void d.faqs.splice(i, 1))} />
            </div>
          ))}
          <AddBtn onClick={() => update((d) => void d.faqs.push({ q: "", a: "" }))}>Add question</AddBtn>
        </Section>

        {/* ---------- Contacts & gallery ---------- */}
        <Section title="Contacts">
          {draft.contacts.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="w-full border border-gold/50 bg-ivory px-3 py-2 font-serif text-lg outline-none focus:border-burgundy"
                value={c.name}
                placeholder="Name"
                onChange={(e) => update((d) => void (d.contacts[i].name = e.target.value))}
              />
              <input
                className="w-full border border-gold/50 bg-ivory px-3 py-2 font-serif text-lg outline-none focus:border-burgundy"
                value={c.phone}
                placeholder="Phone"
                onChange={(e) => update((d) => void (d.contacts[i].phone = e.target.value))}
              />
              <RemoveBtn onClick={() => update((d) => void d.contacts.splice(i, 1))} />
            </div>
          ))}
          <AddBtn onClick={() => update((d) => void d.contacts.push({ name: "", phone: "" }))}>Add contact</AddBtn>
        </Section>

        <Section title="Chat Assistant">
          <p className="font-serif text-lg text-muted">
            A chat button on the main site where guests can ask about the date, venue, dress, travel and more. It
            answers only from the information on this site and in this admin page. It needs an{" "}
            <strong>ANTHROPIC_API_KEY</strong> set on the server; without one the button stays hidden.
          </p>
          <label className="flex cursor-pointer items-center gap-3 font-serif text-xl text-ink">
            <input
              type="checkbox"
              className="size-5 accent-burgundy"
              checked={draft.chat.enabled}
              onChange={(e) => update((d) => void (d.chat.enabled = e.target.checked))}
            />
            Show the chat assistant
          </label>
          <Text label="Title" value={draft.chat.title} onChange={(v) => update((d) => void (d.chat.title = v))} />
          <Area label="Greeting" rows={3} value={draft.chat.greeting} onChange={(v) => update((d) => void (d.chat.greeting = v))} />
          <StringList
            label="Example questions (tap to ask)"
            items={draft.chat.suggestions}
            onChange={(v) => update((d) => void (d.chat.suggestions = v))}
            addLabel="Add question"
          />
          <Area
            label="Extra facts for the assistant (optional)"
            rows={5}
            value={draft.chat.extraInfo}
            onChange={(v) => update((d) => void (d.chat.extraInfo = v))}
          />
          <p className="font-serif text-base text-muted">
            Anything you write here is known only to the assistant and is not shown on the site, for example parking
            details or a dress hint. Everything else it knows comes from the other sections of this page.
          </p>
        </Section>

        <Section title="Gallery">
          <p className="font-serif text-lg text-muted">
            Upload photos here. They are stored in your private Blob storage (gallery folder) and shown on the Gallery
            page in this order. Photos are shrunk automatically before uploading.
          </p>
          <PhotoGrid items={draft.gallery} onChange={(v) => update((d) => void (d.gallery = v))} />
        </Section>
      </div>

      {/* save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gold/50 bg-ivory/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p
            className={`font-serif text-lg ${
              status?.kind === "error" ? "text-burgundy" : status ? "text-sage-deep" : "text-muted"
            }`}
            role="status"
          >
            {status?.text ?? (dirty ? "You have unsaved changes." : "All changes saved.")}
          </p>
          <div className="flex gap-2">
            {dirty && (
              <button type="button" className="gold-btn px-4 py-2" onClick={() => { setDraft(saved); setStatus(null); }}>
                Discard
              </button>
            )}
            <button
              type="button"
              onClick={save}
              disabled={pending || !dirty}
              className="gold-btn gold-btn-solid px-8 py-2.5 disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
