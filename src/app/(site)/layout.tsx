import { ChatWidget } from "@/components/ChatWidget";
import { DraftRibbon } from "@/components/DraftRibbon";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getInvite } from "@/lib/invite";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { monogram, invite } = await getInvite();
  // The assistant only appears once an Anthropic API key is configured, so guests never see a dead button.
  const chatOn = invite.chat.enabled && Boolean(process.env.ANTHROPIC_API_KEY);
  return (
    <>
      <DraftRibbon status={invite.status} />
      <SiteHeader monogram={monogram} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {chatOn && (
        <ChatWidget
          title={invite.chat.title}
          greeting={invite.chat.greeting}
          suggestions={invite.chat.suggestions}
        />
      )}
    </>
  );
}
