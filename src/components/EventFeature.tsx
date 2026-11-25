import Link from "next/link";
import type { InviteEvent } from "@/config/invite";
import { formatDate, formatHijri, formatTimeRange, mapLink } from "@/lib/dates";
import { makeFill } from "@/lib/tags";
import { AddToCalendar } from "./AddToCalendar";

/** Burgundy date panel + high-contrast details. Used on Home (compact) and The Day page. */
export function EventFeature({
  event,
  timeZone,
  coupleTitle,
  compact = false,
}: {
  event: InviteEvent;
  timeZone: string;
  coupleTitle: string;
  compact?: boolean;
}) {
  const d = new Date(event.start);
  const part = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { ...o, timeZone }).format(d);
  const hijri = formatHijri(event.start, timeZone);
  // Description and notes can use merge tags like {time}, {date}, {venue}.
  const fill = makeFill(event, timeZone);

  return (
    <article id={event.key} className="grid scroll-mt-28 md:grid-cols-[4fr_7fr]">
      {/* date panel: solid, high contrast */}
      <div className="burgundy-band flex items-center justify-center px-6 py-12 text-center">
        <div>
          <p className="caps text-sm font-semibold text-gold-light sm:text-base">{part({ weekday: "long" })}</p>
          <p className="mt-1 font-serif text-[8rem] font-semibold leading-none text-ivory">{part({ day: "numeric" })}</p>
          <p className="caps mt-1 text-xl font-semibold text-ivory sm:text-2xl">
            {part({ month: "long", year: "numeric" })}
          </p>
          {hijri && <p className="mt-2 font-serif text-xl text-ivory/90">{hijri}</p>}
          <div className="mx-auto my-5 h-px w-16 bg-gold-light" />
          <p className="caps text-2xl font-semibold text-gold-light">{formatTimeRange(event, timeZone)}</p>
        </div>
      </div>

      <div className="card flex flex-col justify-center px-6 py-10 sm:px-12">
        <p className="eyebrow">{event.hostedBy}</p>
        <h3 className="mt-2 font-script text-6xl leading-tight text-ink sm:text-7xl">{event.title}</h3>
        <p className="mt-4 font-serif text-xl leading-relaxed text-ink sm:text-2xl">{fill(event.description)}</p>

        {/* key facts */}
        <dl className="mt-8 divide-y divide-gold/40 border-y-2 border-gold">
          <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-6">
            <dt className="caps pt-1 text-base font-semibold text-burgundy sm:text-lg">Date</dt>
            <dd className="font-serif text-2xl font-semibold text-ink sm:text-[1.7rem]">
              {part({ weekday: "long" })}, {formatDate(event.start, timeZone)}
            </dd>
          </div>
          <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-6">
            <dt className="caps pt-1 text-base font-semibold text-burgundy sm:text-lg">Time</dt>
            <dd className="font-serif text-2xl font-semibold text-ink sm:text-[1.7rem]">
              {formatTimeRange(event, timeZone)}
            </dd>
          </div>
          <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-6">
            <dt className="caps pt-1 text-base font-semibold text-burgundy sm:text-lg">Venue</dt>
            <dd className="font-serif text-2xl font-semibold text-ink sm:text-[1.7rem]">
              {event.venue}
              <span className="mt-1 block text-xl font-medium leading-snug text-ink/85">{event.address}</span>
            </dd>
          </div>
        </dl>

        {!compact && event.notes && event.notes.length > 0 && (
          <ul className="mt-6 space-y-2 font-serif text-xl text-ink sm:text-2xl">
            {event.notes.map((n) => (
              <li key={n} className="flex items-baseline gap-3">
                <span aria-hidden="true" className="shrink-0 text-[0.65em] leading-none text-burgundy">◆</span>
                {fill(n)}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex flex-wrap gap-2">
          {compact ? (
            <>
              <Link href="/events" className="gold-btn gold-btn-solid">
                Full Details
              </Link>
              <a className="gold-btn" href={mapLink(event)} target="_blank" rel="noopener noreferrer">
                Directions
              </a>
            </>
          ) : (
            <>
              <a className="gold-btn gold-btn-solid" href={mapLink(event)} target="_blank" rel="noopener noreferrer">
                Directions
              </a>
              <AddToCalendar event={event} title={`${event.title} · ${coupleTitle}`} />
            </>
          )}
        </div>
      </div>
    </article>
  );
}
