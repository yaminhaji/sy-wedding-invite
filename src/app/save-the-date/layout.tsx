import { DraftRibbon } from "@/components/DraftRibbon";
import { getInvite } from "@/lib/invite";

export default async function SaveTheDateLayout({ children }: { children: React.ReactNode }) {
  const { invite } = await getInvite();
  return (
    <>
      <DraftRibbon status={invite.status} />
      <main className="flex-1">{children}</main>
    </>
  );
}
