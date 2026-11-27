import type { Metadata, Viewport } from "next";
import { Amiri, Amiri_Quran, Cinzel, Cormorant_Garamond, Pinyon_Script, Scheherazade_New } from "next/font/google";
import { getInvite } from "@/lib/invite";
import "./globals.css";

const pinyon = Pinyon_Script({
  variable: "--font-script-face",
  subsets: ["latin"],
  weight: "400",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const amiriQuran = Amiri_Quran({
  variable: "--font-amiri-quran",
  subsets: ["arabic"],
  weight: "400",
});

const scheherazade = Scheherazade_New({
  variable: "--font-calligraphic",
  subsets: ["arabic"],
  weight: ["500", "600"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { invite, coupleTitle } = await getInvite();
  return {
    // A draft site asks search engines to stay away until it is switched to Live.
    robots: invite.status === "draft" ? { index: false, follow: false } : undefined,
    title: {
      default: `${coupleTitle} · Nikaah & Walima`,
      template: `%s · ${coupleTitle}`,
    },
    description: `You are warmly invited to celebrate the Nikaah and Walima of ${invite.bride.name} and ${invite.groom.name}.`,
  };
}

export async function generateViewport(): Promise<Viewport> {
  const { invite } = await getInvite();
  return { themeColor: invite.theme.background };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { invite } = await getInvite();
  const t = invite.theme; // already validated as #rrggbb, so safe to put in a style attribute
  const themeVars = {
    "--theme-bg": t.background,
    "--theme-blush": t.blush,
    "--theme-gold": t.gold,
    "--theme-text": t.text,
    "--theme-highlight": t.highlight,
  } as React.CSSProperties;

  return (
    <html
      lang="en"
      style={themeVars}
      className={`${pinyon.variable} ${amiriQuran.variable} ${cormorant.variable} ${cinzel.variable} ${amiri.variable} ${scheherazade.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
