import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { getInvite } from "@/lib/invite";
import { makeFill } from "@/lib/tags";

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqPage() {
  const { invite, sortedEvents } = await getInvite();
  const fill = makeFill(sortedEvents[0], invite.timeZone);
  return (
    <>
      <PageHeader eyebrow="Good to know" title="Questions" subtitle="Everything you might want to know before the big day." />
      <div className="pattern-strip" />

      <section className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
        <div className="space-y-5">
          {invite.faqs.map((f) => (
            <article key={f.q} className="card border-l-4 border-l-gold px-6 py-6 sm:px-8 sm:py-7">
              <h2 className="font-serif text-2xl font-bold leading-snug text-burgundy sm:text-[1.7rem]">{fill(f.q)}</h2>
              <p className="mt-3 font-serif text-xl font-medium leading-relaxed text-ink sm:text-2xl">{fill(f.a)}</p>
            </article>
          ))}
        </div>

        {invite.contacts.length > 0 && (
          <div className="mt-14 text-center">
            <p className="eyebrow">Still have a question?</p>
            <ul className="mt-3 space-y-1 font-serif text-2xl text-ink">
              {invite.contacts.map((c) => (
                <li key={c.phone}>
                  {c.name} ·{" "}
                  <a
                    className="text-gold-deep underline decoration-gold/40 underline-offset-4"
                    href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}
                  >
                    {c.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
