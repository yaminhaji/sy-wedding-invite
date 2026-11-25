/** Decorative SVG ornaments inspired by the certificate artwork. */

const GOLD = "#C39A45";
const GOLD_DEEP = "#8A6A22";
const BURGUNDY = "#6E1A33";
const PETAL = "#A3375A";
const ROSE = "#E3AFBF";
const SAGE = "#7E9A78";

function Bloom({ r = 1 }: { r?: number }) {
  return (
    <g transform={`scale(${r})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path
          key={a}
          d="M0 -1.4 C3.2 -3 3.4 -7.6 0 -9.6 C-3.4 -7.6 -3.2 -3 0 -1.4Z"
          fill={PETAL}
          stroke={BURGUNDY}
          strokeWidth=".5"
          transform={`rotate(${a})`}
        />
      ))}
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cy="-5.4" r="1.2" fill={ROSE} transform={`rotate(${a})`} />
      ))}
      <circle r="2" fill={GOLD} />
    </g>
  );
}

export function Medallion({ className = "", size = 56 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className={className} aria-hidden="true">
      <circle cx="30" cy="30" r="28.5" fill="#FDFBF7" stroke={GOLD} strokeWidth="1.5" />
      <circle cx="30" cy="30" r="25" fill="none" stroke={GOLD} strokeWidth=".6" />
      <g transform="translate(30 30)" fill={GOLD}>
        <rect x="-13.5" y="-13.5" width="27" height="27" />
        <rect x="-13.5" y="-13.5" width="27" height="27" transform="rotate(45)" />
      </g>
      <g transform="translate(30 30)" fill="#FDFBF7">
        <rect x="-11" y="-11" width="22" height="22" />
        <rect x="-11" y="-11" width="22" height="22" transform="rotate(45)" />
      </g>
      <g transform="translate(30 30)">
        <Bloom r={1} />
      </g>
    </svg>
  );
}

export function Rosette({ className = "", size = 44 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      <g transform="translate(20 20)">
        {Array.from({ length: 8 }, (_, i) => i * 45).map((r) => (
          <path key={r} d="M0 -3 C5 -6 5 -14 0 -18 C-5 -14 -5 -6 0 -3Z" fill={GOLD} transform={`rotate(${r})`} />
        ))}
        {Array.from({ length: 8 }, (_, i) => i * 45 + 22.5).map((r) => (
          <circle key={r} cy="-13" r="1.5" fill={BURGUNDY} transform={`rotate(${r})`} />
        ))}
        <circle r="5" fill="#FDFBF7" stroke={GOLD} strokeWidth="1.2" />
        <circle r="2.2" fill={BURGUNDY} />
      </g>
    </svg>
  );
}

/** Horizontal scroll flourish with a centre bloom. */
export function Flourish({ className = "", light = false }: { className?: string; light?: boolean }) {
  const c = light ? "#F0DC9C" : "#7A5A16";
  const side = (
    <g fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <path d="M10 12 H58" />
      <path d="M58 12 C66 12 68 4 76 5 C82 6 82 12 77 13 C73 14 72 9 75 8" />
      <path d="M58 12 C66 12 68 20 76 19 C82 18 82 12 77 11" />
      <path d="M32 12 C36 6 42 6 44 10" />
      <path d="M32 12 C36 18 42 18 44 14" />
      <circle cx="5" cy="12" r="2.2" fill={c} stroke="none" />
      <circle cx="22" cy="12" r="1.7" fill={c} stroke="none" />
      <path d="M36 9 C38 6 41 6 42 8 C40 9 38 9 36 9Z" fill={SAGE} stroke="none" />
      <path d="M36 15 C38 18 41 18 42 16 C40 15 38 15 36 15Z" fill={SAGE} stroke="none" />
    </g>
  );
  return (
    <svg viewBox="0 0 200 24" className={className} aria-hidden="true">
      {side}
      <g transform="translate(200 0) scale(-1 1)">{side}</g>
      <g transform="translate(100 12)">
        <Bloom r={0.95} />
      </g>
    </svg>
  );
}

/**
 * Mihrab arch frame, like the green certificate: a pointed ogee arch with a
 * floral pattern band and gold rules, opening into an ivory panel.
 */
export function Mihrab({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const outer = "M0 270 L0 185 C0 125 250 128 350 30 C450 128 700 125 700 185 L700 270 Z";
  const inner = "M28 270 L28 190 C28 148 262 148 350 70 C438 148 672 148 672 190 L672 270 Z";
  const outerLine = "M0 270 L0 185 C0 125 250 128 350 30 C450 128 700 125 700 185 L700 270";
  const innerLine = "M28 270 L28 190 C28 148 262 148 350 70 C438 148 672 148 672 190 L672 270";
  const rule = "M37 270 L37 192 C37 155 266 154 350 82 C434 154 663 155 663 192 L663 270";
  return (
    <div className={`@container relative ${className}`}>
      <svg viewBox="0 0 700 270" className="-mb-px block w-full" aria-hidden="true">
        <defs>
          <pattern id="mihrab-geo" x="14" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <image href="/geo.svg" width="28" height="28" />
          </pattern>
        </defs>
        <path d={outer} fill="url(#mihrab-geo)" />
        <path d={outerLine} fill="none" stroke={GOLD} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <path d={inner} fill="#FDFBF7" />
        <path d={innerLine} fill="none" stroke={GOLD} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <path d={rule} fill="none" stroke={GOLD} strokeOpacity=".7" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {/* finial */}
        <g transform="translate(350 22)">
          <path d="M0 -20 C4 -14 4 -10 0 -6 C-4 -10 -4 -14 0 -20Z" fill={GOLD} />
          <circle r="13" fill="#FDFBF7" stroke={GOLD} strokeWidth="1.5" />
          <Bloom r={0.95} />
        </g>
      </svg>
      <div className="mihrab-body">
        <div className="mihrab-inner">
          <div className="relative px-[4%]">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Rounded-arch portrait frame; shows a photo or an initial on the floral pattern. */
export function ArchPortrait({ photo, initial, alt }: { photo?: string; initial: string; alt: string }) {
  return (
    <div className="arch-portrait mx-auto w-full max-w-[16rem]">
      <div className="inner aspect-[3/4]">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={alt} className="size-full object-cover" />
        ) : (
          <div className="sage-field flex size-full items-center justify-center">
            <span className="flex size-28 items-center justify-center rounded-full border border-gold bg-ivory font-script text-6xl text-burgundy">
              {initial}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function Allah() {
  // ﷻ — Jalla Jalaluhu
  return <span className="font-arabic normal-case">ﷻ</span>;
}

export { GOLD, GOLD_DEEP };
