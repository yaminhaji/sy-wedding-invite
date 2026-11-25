import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getInvite } from "@/lib/invite";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { monogram } = await getInvite();
  return (
    <>
      <SiteHeader monogram={monogram} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
