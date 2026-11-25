import { Flourish } from "./Ornaments";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="sage-field px-6 pb-14 pt-16 text-center sm:pb-20 sm:pt-24">
      {eyebrow && <p className="rise eyebrow text-burgundy-deep">{eyebrow}</p>}
      <h1
        className="rise mt-2 font-script text-6xl leading-tight text-ink sm:text-8xl"
        style={{ animationDelay: "100ms" }}
      >
        {title}
      </h1>
      <Flourish className="rise mx-auto mt-4 w-48 sm:w-60" />
      {subtitle && (
        <p
          className="rise mx-auto mt-6 max-w-xl text-balance font-serif text-xl text-ink sm:text-2xl"
          style={{ animationDelay: "200ms" }}
        >
          {subtitle}
        </p>
      )}
    </section>
  );
}
