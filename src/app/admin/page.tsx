import { Suspense } from "react";
import { isAdmin } from "@/lib/auth";
import { getContent } from "@/lib/invite";
import { usingBlob } from "@/lib/store";
import { AdminEditor } from "./AdminEditor";
import { LoginForm } from "./LoginForm";

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center font-serif text-xl">Loading…</p>}>
      <AdminGate />
    </Suspense>
  );
}

async function AdminGate() {
  if (!process.env.ADMIN_PASSWORD) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center font-serif text-xl text-ink">
        <h1 className="font-script text-6xl text-burgundy">Admin</h1>
        <p className="mt-6">
          Set an <code className="bg-ivory px-1">ADMIN_PASSWORD</code> environment variable to enable this page.
        </p>
      </div>
    );
  }
  if (!(await isAdmin())) return <LoginForm />;
  const content = await getContent();
  return <AdminEditor initial={content} storage={usingBlob() ? "Vercel Blob" : "local file (.data/invite.json)"} />;
}
