import type { Metadata } from "next";
import { Allah, Flourish, Medallion, Mihrab } from "@/components/Ornaments";
import { firstName } from "@/config/invite";
import { formatDate, formatDay } from "@/lib/dates";
import { getInvite, hasHappened } from "@/lib/invite";

export const metadata: Metadata = { title: "Save the Date" };

/**
 * Invite 2 — for everyone not invited (extended family, friends, colleagues, abroad).
 * Before the Nikaah: "getting married", asks for duas. After: "now married".
 * Both explain why it was small and save the date for the reception. No venue, no RSVP.
 */
export default async function SaveTheDatePage() {
  const { invite, sortedEvents, coupleTitle } = await getInvite();
  const { bride, groom, messages, saveTheDate, timeZone, city } = invite;
  const nikaah = sortedEvents[0];

  // Before the Nikaah: "are getting married… please keep us in your duas".
  // After: "are now married…". Switches automatically unless forced in /admin.
  const after =
    saveTheDate.mode === "after" ||
    (saveTheDate.mode === "auto" && !!nikaah && (await hasHappened(nikaah.start)));
  const lead = after ? messages.announceLead : saveTheDate.preLead;
  const paragraphs = after ? messages.announce : saveTheDate.preParagraphs;
  const closing = after ? saveTheDate.closing : saveTheDate.preClosing;

  return (
    <section className="sage-field min-h-screen px-4 py-10 sm:py-14">
      <Mihrab className="rise mx-auto max-w-3xl">
        <div className="pb-14 pt-2 text-center sm:pb-20">
          <p
            className="font-arabic text-[1.1rem] leading-[2] text-gold-deep min-[480px]:text-[1.5rem] sm:text-[2.5rem]"
            lang="ar"
            dir="rtl"
          >
            ﷽
          </p>

          <p className="eyebrow mt-4 text-balance">
            With the blessings of Allah <Allah /> and our families
          </p>

          <h1 className="mt-5">
            <span className="block font-script text-6xl leading-[1.25] text-ink sm:text-8xl">
              {firstName(bride.name)}
            </span>
            <span className="block font-script text-4xl leading-none text-burgundy sm:text-5xl">and</span>
            <span className="block font-script text-6xl leading-[1.25] text-ink sm:text-8xl">
              {firstName(groom.name)}
            </span>
          </h1>

          <p className="mt-5 text-balance font-serif text-2xl text-ink sm:text-3xl">{lead}</p>
          <Flourish className="mx-auto mt-5 w-56 sm:w-72" />

          {/* when the Nikaah happened */}
          {nikaah && (
            <div className="mx-auto mt-8 max-w-md border-y-2 border-gold py-5">
              <p className="eyebrow">{nikaah.title}</p>
              <p className="caps mt-2 text-xl font-semibold text-ink sm:text-2xl">
                {formatDay(nikaah.start, timeZone)}, {formatDate(nikaah.start, timeZone)}
              </p>
              <p className="mt-1 font-serif text-xl text-ink/85">{city}</p>
            </div>
          )}

          {/* intro, then the reasons, then the rest */}
          <div className="mx-auto mt-8 max-w-xl space-y-5 px-1 text-balance font-serif text-xl leading-relaxed text-ink sm:text-2xl">
            {paragraphs.slice(0, 1).map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>

          {saveTheDate.reasons.length > 0 && (
            <div className="mx-auto mt-8 max-w-xl border border-gold/60 bg-blush/50 px-5 py-6 text-left sm:px-8">
              <p className="eyebrow text-center">{saveTheDate.reasonsTitle}</p>
              <ul className="mt-4 space-y-3 font-serif text-xl leading-snug text-ink sm:text-2xl">
                {saveTheDate.reasons.map((r) => (
                  <li key={r} className="flex items-baseline gap-3">
                    <span aria-hidden="true" className="shrink-0 text-[0.65em] leading-none text-burgundy">◆</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mx-auto mt-8 max-w-xl space-y-5 px-1 text-balance font-serif text-xl leading-relaxed text-ink sm:text-2xl">
            {paragraphs.slice(1).map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>

          {/* save the date */}
          <div className="burgundy-band mx-auto mt-12 max-w-xl px-6 py-12 sm:px-10">
            <Flourish light className="mx-auto w-48 sm:w-60" />
            <h2 className="gold-foil-light mt-3 font-script text-6xl leading-tight sm:text-7xl">
              {saveTheDate.title}
            </h2>
            <p className="caps mt-4 text-xl font-semibold text-ivory sm:text-2xl">{saveTheDate.eventName}</p>
            <p className="mt-1 font-serif text-[5.5rem] font-semibold leading-none text-gold-light sm:text-[7rem]">
              {saveTheDate.when}
            </p>
            <p className="mx-auto mt-6 max-w-md text-balance font-serif text-xl leading-relaxed text-ivory sm:text-2xl">
              {saveTheDate.detail}
            </p>
          </div>

          <p className="mx-auto mt-10 max-w-xl text-balance font-serif text-xl text-ink sm:text-2xl">
            {closing}
          </p>

          <Medallion className="mx-auto mt-8" size={48} />
          <p className="mt-5 font-serif text-xl text-muted sm:text-2xl">With love,</p>
          <p className="font-script text-5xl text-burgundy sm:text-6xl">{coupleTitle}</p>
        </div>
      </Mihrab>
    </section>
  );
}
