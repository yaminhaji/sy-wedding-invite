import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { EventFeature } from "@/components/EventFeature";
import { Allah, ArchPortrait, Flourish, Mihrab, Rosette } from "@/components/Ornaments";
import { firstName } from "@/config/invite";
import { getInvite } from "@/lib/invite";
import { formatDate, formatTimeRange } from "@/lib/dates";

export default async function Home() {
  const { invite, sortedEvents, coupleTitle } = await getInvite();
  const { bride, groom, timeZone, city } = invite;
  const main = sortedEvents[0];

  return (
    <>
      {/* ---------- Hero: mihrab on petal ---------- */}
      <section className="petal-field px-4 pt-10 sm:pt-14">
        <Mihrab className="rise mx-auto max-w-3xl">
          <div className="pb-14 pt-2 text-center sm:pb-20">
            <p className="font-arabic text-[1.1rem] leading-[2] text-gold-deep min-[480px]:text-[1.5rem] sm:text-[2.5rem]" lang="ar" dir="rtl">
              ﷽
            </p>

            <p className="eyebrow mt-4 text-balance">
              With the blessings of Allah <Allah /> and our families
            </p>
            <p className="mt-3 font-serif text-lg text-muted sm:text-xl">
              we invite you to celebrate the {main.title} of
            </p>

            <h1 className="mt-5">
              <span className="block font-script text-6xl leading-[1.25] text-ink sm:text-8xl">
                {firstName(bride.name)}
              </span>
              <span className="block font-script text-4xl leading-none text-rosegold sm:text-5xl">and</span>
              <span className="block font-script text-6xl leading-[1.25] text-ink sm:text-8xl">
                {firstName(groom.name)}
              </span>
            </h1>

            <Flourish className="mx-auto mt-6 w-56 sm:w-72" />

            <p className="caps mt-6 text-base text-ink sm:text-lg">{formatDate(main.start, timeZone)}</p>
            <p className="mt-1 font-serif text-xl text-muted">
              {formatTimeRange(main, timeZone)} · {city}
            </p>

            <div className="mt-8">
              <Countdown to={main.start} />
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link href="/events" className="gold-btn gold-btn-solid px-9">
                Details &amp; Directions
              </Link>
            </div>
          </div>
        </Mihrab>
        <div className="h-10 sm:h-14" />
      </section>

      <div className="pattern-strip" />

      {/* ---------- Verse ---------- */}
      <section className="bg-blush/60 px-6 py-20 text-center sm:py-28">
        <Rosette className="mx-auto" size={40} />
        <p
          className="mx-auto mt-8 max-w-3xl text-balance font-quran text-3xl leading-[2.1] text-rosegold sm:text-4xl"
          lang="ar"
          dir="rtl"
        >
          وَمِنْ ءَايَٰتِهِۦٓ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَٰجًا لِّتَسْكُنُوٓا۟ إِلَيْهَا وَجَعَلَ
          بَيْنَكُم مَّوَدَّةً وَرَحْمَةً
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-balance font-serif text-2xl italic leading-relaxed text-ink sm:text-[1.7rem]">
          &ldquo;And of His signs is that He created for you from yourselves mates that you may find
          tranquillity in them, and He placed between you affection and mercy.&rdquo;
        </p>
        <p className="caps mt-5 text-base text-gold-deep sm:text-lg">Surah Ar-Rum · 30:21</p>
      </section>

      {/* ---------- Short-notice message (important: big, dark, plain) ---------- */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl border-2 border-gold bg-blush/60 px-6 py-10 text-center sm:px-14 sm:py-14">
          <p className="eyebrow text-lg sm:text-2xl">Please note</p>
          <h2 className="mt-3 text-balance font-serif text-4xl font-bold leading-tight text-rosegold-deep sm:text-5xl">
            {invite.messages.intimateTitle}
          </h2>
          <div className="mx-auto my-6 h-0.5 w-24 bg-gold" />
          <div className="space-y-6 text-pretty font-serif text-2xl font-medium leading-relaxed text-ink sm:text-[1.9rem] sm:leading-relaxed">
            {invite.messages.intimate.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Bride & Groom: lighter cream band with gold rules so it stands apart ---------- */}
      <section className="border-y border-gold/50 bg-ivory px-6 py-20 sm:py-28">
        <div className="text-center">
          <p className="eyebrow text-lg sm:text-2xl">The Couple</p>
          <h2 className="mt-2 font-script text-[4.5rem] leading-tight text-rosegold-deep min-[480px]:text-8xl sm:text-9xl">Bride &amp; Groom</h2>
          <Flourish className="mx-auto mt-3 w-48 sm:w-60" />
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl items-start gap-14 md:grid-cols-[1fr_auto_1fr] md:gap-8">
          {[
            { p: bride, label: "The Bride" },
            null,
            { p: groom, label: "The Groom" },
          ].map((x, i) =>
            x ? (
              <div key={i} className="text-center">
                <ArchPortrait photo={x.p.photo || undefined} initial={x.p.name[0]} alt={x.p.name} />
                <p className="eyebrow mt-6 text-lg sm:text-2xl">{x.label}</p>
                <p className="mt-2 whitespace-nowrap font-script text-[2.5rem] leading-[1.3] text-ink min-[480px]:text-6xl md:text-5xl lg:text-6xl xl:text-7xl">{x.p.name}</p>
                {x.p.parents && (
                  <div className="mt-3">
                    <p className="caps text-base font-semibold text-gold-deep sm:text-lg">{x.p.relation}</p>
                    {/* father & mother, one per line */}
                    {x.p.parents.split("&").map((name) => (
                      <p key={name} className="font-serif text-xl font-semibold leading-snug text-ink sm:text-2xl">
                        {name.trim()}
                      </p>
                    ))}
                  </div>
                )}
                {x.p.siblings.length > 0 && (
                  <div className="mt-4">
                    <p className="caps text-base font-semibold text-gold-deep sm:text-lg">{x.p.siblingsLabel}</p>
                    {x.p.siblings.map((name) => (
                      <p key={name} className="font-serif text-xl font-semibold leading-snug text-ink sm:text-2xl">
                        {name}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div key={i} className="hidden md:block md:pt-[9.6rem]">
                <Rosette size={52} />
              </div>
            ),
          )}
        </div>
      </section>

      {/* ---------- The day ---------- */}
      <div className="pattern-strip" />
      <section className="petal-field px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="eyebrow text-rosegold-deep">Save the date</p>
            <h2 className="mt-2 font-script text-6xl leading-tight text-ink sm:text-7xl">The Day</h2>
            <Flourish className="mx-auto mt-3 w-48 sm:w-60" />
          </div>
          <div className="mt-12 shadow-[0_30px_60px_-30px_rgba(59,42,34,0.35)]">
            <EventFeature event={main} timeZone={timeZone} coupleTitle={coupleTitle} compact />
          </div>
        </div>
      </section>

      <div className="pattern-strip" />

      {/* ---------- Reception to follow ---------- */}
      <section className="bg-blush/60 px-6 py-16 text-center sm:py-20">
        <p className="eyebrow">{invite.messages.receptionTitle}</p>
        <p className="mx-auto mt-4 max-w-2xl text-balance font-serif text-xl leading-relaxed text-ink sm:text-2xl">
          {invite.messages.reception}
        </p>
      </section>

      {/* ---------- Note ---------- */}
      <section className="px-6 py-16 text-center sm:py-20">
        <Rosette className="mx-auto" size={40} />
        <p className="mx-auto mt-6 max-w-2xl text-balance font-script text-5xl leading-snug text-rosegold sm:text-6xl">
          {invite.bringNote}
        </p>
      </section>

      {/* ---------- Closing band ---------- */}
      <div className="pattern-strip" />
      <section className="rosegold-band px-6 py-20 text-center sm:py-28">
        <Flourish light className="mx-auto w-48 sm:w-60" />
        <h2 className="gold-foil-light mt-4 font-script text-6xl leading-tight sm:text-7xl">We look forward to you</h2>
        <p className="mx-auto mt-4 max-w-lg text-balance font-serif text-xl text-ivory/90 sm:text-2xl">
          Your presence and duas would mean the world to us as we begin this new chapter.
        </p>
        <Link href="/events" className="gold-btn gold-btn-light mt-10 px-10">
          Date, Time &amp; Venue
        </Link>
      </section>
    </>
  );
}
