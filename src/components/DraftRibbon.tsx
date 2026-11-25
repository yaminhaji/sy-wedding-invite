/** Slim ribbon across the top of every public page while the site is in Draft. Renders nothing when Live. */
export function DraftRibbon({ status }: { status: "draft" | "live" }) {
  if (status !== "draft") return null;
  return (
    <div
      role="status"
      className="relative z-50 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 border-b-2 border-gold bg-burgundy-deep px-4 py-2 text-center text-gold-light"
    >
      <span className="caps rounded-sm bg-gold-light px-2 py-0.5 text-xs font-bold tracking-[0.2em] text-burgundy-deep">
        Draft
      </span>
      <span className="font-serif text-base font-medium text-ivory">
        This invitation isn&apos;t final yet, so details may change.
      </span>
    </div>
  );
}
