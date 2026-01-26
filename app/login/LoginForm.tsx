"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useMemo, useState, useTransition } from "react";
import CircuitOverlay from "@/app/components/CircuitOverlay";

type Props = {
  defaultCallbackUrl?: string;
  mode?: "admin" | "customer";
};

export default function LoginForm ({ defaultCallbackUrl = "/account", mode = "customer" }: Props)
{
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = useMemo(() => search.get("callbackUrl") ?? defaultCallbackUrl, [defaultCallbackUrl, search]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="min-h-screen text-zinc-50">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-zinc-950/70 backdrop-blur neon-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide text-white">1UpLabs</div>
            <div className="text-xs text-white/60">{mode === "admin" ? "Admin access" : "Customer login"}</div>
          </div>
          <Link
            href={mode === "admin" ? "/" : "/store"}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-500/30 hover:bg-white/8"
          >
            {mode === "admin" ? "Home" : "Store"}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 neon-edge"
          >
            <CircuitOverlay variant="panel" className="opacity-42" animated={false} />
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-sky-500/0 blur-3xl transition duration-700 group-hover:bg-sky-500/15" />

            <div className="relative z-10">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                Secure login
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                {mode === "admin" ? "Admin dashboard" : "Your account"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/65">
                {mode === "admin"
                  ? "Sign in to update pricing, inventory, and orders."
                  : "Sign in to save your info, address, and track your orders."}
              </p>

              <form
                className="mt-6 flex flex-col gap-3"
                onSubmit={(e) =>
                {
                  e.preventDefault();
                  setError(null);
                  startTransition(async () =>
                  {
                    const res = await signIn("credentials", {
                      email,
                      password,
                      redirect: false,
                      callbackUrl,
                    });

                    if (!res || res.error)
                    {
                      setError("Invalid email or password.");
                      return;
                    }

                    const s = await getSession();
                    if ((s?.user as any)?.role === "admin")
                    {
                      router.push("/admin");
                      router.refresh();
                      return;
                    }

                    router.push(callbackUrl);
                    router.refresh();
                  });
                }}
              >
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                    required
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                    required
                  />
                </label>

                {error ? (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={pending}
                  className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-semibold text-zinc-950 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/30 transition hover:bg-emerald-400 disabled:opacity-60 neon-edge"
                >
                  {pending ? "Signing in…" : "Sign in"}
                </button>

                {mode === "admin" ? (
                  <div className="mt-1 text-xs leading-5 text-white/55">
                    Admin access only. If you need an account, create one via{" "}
                    <code className="rounded bg-white/10 px-1 py-0.5">pnpm admin:create</code>.
                  </div>
                ) : (
                  <div className="mt-1 text-xs leading-5 text-white/55">
                    New here?{" "}
                    <Link
                      href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                      className="font-semibold text-white underline decoration-white/25 underline-offset-4"
                    >
                      Create an account
                    </Link>
                    .
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}


