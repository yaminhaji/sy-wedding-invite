import Link from "next/link";
import { navLinks } from "@/config/invite";
import { formatDate } from "@/lib/dates";
import { getInvite } from "@/lib/invite";
import { ContactList } from "./ContactList";
import { Medallion } from "./Ornaments";

export async function SiteFooter() {
  const { invite, sortedEvents, coupleTitle } = await getInvite();
  return (
    <footer className="mt-auto">
      <div className="pattern-strip" />
      <div className="bg-ivory px-6 pb-24 pt-14 text-center sm:pb-14">
        <Medallion className="mx-auto" size={48} />
        <p
          className="mx-auto mt-6 max-w-2xl text-balance font-ruqaa text-3xl font-semibold leading-[2] text-gold-deep sm:text-5xl"
          lang="ar"
          dir="rtl"
        >
          بَارَكَ ٱللَّٰهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
        </p>
        <p className="mx-auto mt-3 max-w-md font-serif text-lg text-muted">
          May Allah bless you both, shower His blessings upon you, and unite you in goodness.
        </p>

        <p className="mt-10 font-script text-5xl text-ink">{coupleTitle}</p>
        <p className="caps mt-2 text-base text-muted">
          {sortedEvents.map((e) => formatDate(e.start, invite.timeZone)).join("  ·  ")}
        </p>

        {invite.contacts.length > 0 && (
          <div className="mt-12 border-t border-gold/40 pt-10">
            <p className="eyebrow text-lg sm:text-xl">Contact</p>
            <p className="mx-auto mb-5 mt-1 max-w-md font-serif text-lg text-muted">
              Tap the phone icon to call, or the green icon to message on WhatsApp.
            </p>
            <ContactList contacts={invite.contacts} />
          </div>
        )}

        <nav aria-label="Footer" className="mt-10">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="caps text-sm text-ink hover:text-gold-deep sm:text-base">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
