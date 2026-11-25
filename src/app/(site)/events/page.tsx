import type { Metadata } from "next";
import { EventFeature } from "@/components/EventFeature";
import { PageHeader } from "@/components/PageHeader";
import { getInvite } from "@/lib/invite";

export const metadata: Metadata = { title: "The Day" };

export default async function EventsPage() {
  const { invite, sortedEvents, coupleTitle } = await getInvite();
  return (
    <>
      <PageHeader
        eyebrow="Nikaah & Walima"
        title="The Day"
        subtitle={`Everything you need to know for our celebration in ${invite.city}.`}
      />
      <div className="pattern-strip" />

      <div className="mx-auto max-w-5xl space-y-16 px-4 py-16 sm:py-24">
        {sortedEvents.map((e) => (
          <EventFeature key={e.key} event={e} timeZone={invite.timeZone} coupleTitle={coupleTitle} />
        ))}
      </div>
    </>
  );
}
