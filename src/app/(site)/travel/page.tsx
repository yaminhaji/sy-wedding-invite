import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { getInvite } from "@/lib/invite";
import { mapLink } from "@/lib/dates";

export const metadata: Metadata = { title: "Travel & Stay" };

export default async function TravelPage() {
  const { invite, sortedEvents } = await getInvite();
  const { travel } = invite;
  const { stay } = travel;
  return (
    <>
      <PageHeader eyebrow="For our guests" title="Travel & Stay" subtitle={travel.intro} />
      <div className="pattern-strip" />

      <div className="mx-auto max-w-4xl space-y-14 px-4 py-16 sm:py-24">
        <section className="card px-6 py-10 text-center sm:px-12">
          <p className="eyebrow">The venue &amp; where to stay</p>
          <h2 className="mt-2 font-script text-5xl leading-tight text-ink sm:text-6xl">{stay.name}</h2>
          <p className="mx-auto mt-4 max-w-xl font-serif text-xl leading-relaxed text-ink">{stay.address}</p>
          <p className="mt-3 font-serif text-xl text-ink">
            <a
              className="text-gold-deep underline decoration-gold/50 underline-offset-4"
              href={`tel:${stay.phone.replace(/[^\d+]/g, "")}`}
            >
              {stay.phone}
            </a>
          </p>
          <p className="mx-auto mt-4 max-w-xl font-serif text-lg text-muted">{stay.note}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <a
              className="gold-btn gold-btn-solid"
              href={mapLink(sortedEvents[0])}
              target="_blank"
              rel="noopener noreferrer"
            >
              Directions
            </a>
            <a className="gold-btn" href={stay.bookingUrl} target="_blank" rel="noopener noreferrer">
              Book a room
            </a>
            <a className="gold-btn" href={stay.website} target="_blank" rel="noopener noreferrer">
              Hotel website
            </a>
          </div>
        </section>

        <section className="grid gap-6 text-center sm:grid-cols-2">
          {travel.arrive.map((a) => (
            <div key={a.label} className="border-t border-gold/50 pt-6">
              <p className="eyebrow">{a.label}</p>
              <p className="mt-2 font-serif text-xl text-ink">{a.text}</p>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
