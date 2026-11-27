"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { login } from "./actions";

export function LoginForm() {
  const router = useRouter();
  const [error, action, pending] = useActionState(
    async (prev: string | null, fd: FormData) => {
      const err = await login(prev, fd);
      if (!err) router.refresh();
      return err;
    },
    null,
  );

  useEffect(() => {
    document.getElementById("admin-pw")?.focus();
  }, []);

  return (
    <div className="mx-auto max-w-md px-6 py-24">
      <div className="card px-8 py-12 text-center">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-2 font-script text-6xl text-ink">Sign in</h1>
        <form action={action} className="mt-8 space-y-6 text-left">
          <label className="block">
            <span className="caps text-sm text-gold-deep">Password</span>
            <input id="admin-pw" name="password" type="password" required className="field" autoComplete="current-password" />
          </label>
          {error && <p className="font-serif text-lg text-rosegold">{error}</p>}
          <button type="submit" disabled={pending} className="gold-btn gold-btn-solid w-full disabled:opacity-60">
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
