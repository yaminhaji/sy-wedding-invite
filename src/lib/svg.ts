import type { Theme } from "@/config/invite";

/* Small colour helpers for the generated pattern images (CSS variables can't reach into <img>/background SVGs). */

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** `pct` of a, the rest b. */
export function mix(a: string, b: string, pct: number): string {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  const f = (x: number, y: number) => Math.round(x * pct + y * (1 - pct)).toString(16).padStart(2, "0");
  return `#${f(r1, r2)}${f(g1, g2)}${f(b1, b2)}`;
}

/** The colours used by the generated images, derived from the five theme colours. */
export function patternColors(t: Theme) {
  return {
    ivory: mix(t.background, "#ffffff", 0.45),
    ground: mix(t.background, "#ffffff", 0.62),
    star: mix(t.blush, "#ffffff", 0.78),
    centre: mix(t.highlight, "#ffffff", 0.65),
    centreStroke: t.highlight,
    cross: mix(t.gold, t.background, 0.35),
    line: t.gold,
  };
}

function star(cx: number, cy: number, R: number, r: number, rot = 0) {
  const pts: string[] = [];
  for (let k = 0; k < 16; k++) {
    const a = ((rot + k * 22.5 - 90) * Math.PI) / 180;
    const rad = k % 2 === 0 ? R : r;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join(" L")}Z`;
}

/** The khatam (8-point star-and-cross) tile used for bands and borders. */
export function geoTileSvg(t: Theme): string {
  const c = patternColors(t);
  const R = 50;
  const r = (R * Math.cos((45 * Math.PI) / 180)) / Math.cos((22.5 * Math.PI) / 180);
  const corners: [number, number][] = [
    [0, 0],
    [100, 0],
    [0, 100],
    [100, 100],
  ];
  const k = 0.34 * (Math.cos((45 * Math.PI) / 180) / Math.cos((22.5 * Math.PI) / 180));
  const big = corners.map(([x, y]) => star(x, y, R, r)).join(" ");
  const mid = corners.map(([x, y]) => star(x, y, R * 0.62, r * 0.62, 22.5)).join(" ");
  const small = corners.map(([x, y]) => star(x, y, R * 0.34, R * k)).join(" ");
  const cross = star(50, 50, 14, 14 * 0.83, 0);
  const dots = [...corners, [50, 50]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${c.line}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${c.ground}"/>
  <path d="${big}" fill="${c.star}" stroke="${c.line}" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="${mid}" fill="none" stroke="${c.line}" stroke-width="0.96" stroke-linejoin="round"/>
  <path d="${small}" fill="${c.centre}" stroke="${c.centreStroke}" stroke-width="0.8" stroke-linejoin="round"/>
  <path d="${cross}" fill="${c.cross}" stroke="${c.line}" stroke-width="0.96" stroke-linejoin="round"/>
  ${dots}
</svg>
`;
}

/** Cusped arch edge, horizontal (top/bottom) or vertical (left/right). */
export function archSvg(t: Theme, dir: "h" | "v"): string {
  const c = patternColors(t);
  if (dir === "h") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="16" viewBox="0 0 40 16">
  <path d="M0 16 C1 7 13 8 20 2 C27 8 39 7 40 16Z" fill="${c.ivory}"/>
  <path d="M0 16 C1 7 13 8 20 2 C27 8 39 7 40 16" fill="none" stroke="${c.line}" stroke-width="1.6"/>
  <circle cx="20" cy="2.2" r="1.6" fill="${c.line}"/>
</svg>
`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="40" viewBox="0 0 16 40">
  <path d="M16 0 C7 1 8 13 2 20 C8 27 7 39 16 40Z" fill="${c.ivory}"/>
  <path d="M16 0 C7 1 8 13 2 20 C8 27 7 39 16 40" fill="none" stroke="${c.line}" stroke-width="1.6"/>
  <circle cx="2.2" cy="20" r="1.6" fill="${c.line}"/>
</svg>
`;
}
