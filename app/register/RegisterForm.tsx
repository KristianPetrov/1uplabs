"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useMemo, useState, useTransition } from "react";

import { registerCustomer } from "@/app/register/actions";
import CircuitOverlay from "@/app/components/CircuitOverlay";

export default function RegisterForm (): React.ReactNode
{
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = useMemo(() => search.get("callbackUrl") ?? "/account", [search]);

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("US");

  return (
    <div className="min-h-screen text-zinc-50">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-zinc-950/70 backdrop-blur neon-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide text-white">1UpLabs</div>
            <div className="text-xs text-white/60">Create account</div>
          </div>
          <Link
            href="/store"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-500/30 hover:bg-white/8 neon-edge"
          >
            Store
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 neon-edge"
          >
            <CircuitOverlay variant="panel" className="opacity-42" animated />
            <div className="relative z-10">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                Customer account
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                Save your info and track orders
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Create an account to save your address and view your order history.
              </p>

              <form
                className="mt-6 grid grid-cols-1 gap-4"
                onSubmit={(e) =>
                {
                  e.preventDefault();
                  setError(null);
                  startTransition(async () =>
                  {
                    try
                    {
                      await registerCustomer({
                        email,
                        password,
                        name,
                        phone,
                        address1,
                        address2,
                        city,
                        state,
                        zip,
                        country,
                      });

                      const res = await signIn("credentials", {
                        email,
                        password,
                        redirect: false,
                        callbackUrl,
                      });

                      if (!res || res.error)
                      {
                        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
                        router.refresh();
                        return;
                      }

                      router.push(callbackUrl);
                      router.refresh();
                    }
                    catch (err)
                    {
                      setError(err instanceof Error ? err.message : "Failed to create account.");
                    }
                  });
                }}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-white/60">Full name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-white/60">Phone (optional)</span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      autoComplete="new-password"
                      className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                      required
                    />
                  </label>
                </div>

                <div className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                  Default address (optional)
                </div>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">Address line 1</span>
                  <input
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    autoComplete="address-line1"
                    className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">Address line 2</span>
                  <input
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    autoComplete="address-line2"
                    className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                  />
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <label className="flex flex-col gap-1 sm:col-span-1">
                    <span className="text-xs font-semibold text-white/60">City</span>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      autoComplete="address-level2"
                      className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                    />
                  </label>
                  <label className="flex flex-col gap-1 sm:col-span-1">
                    <span className="text-xs font-semibold text-white/60">State</span>
                    <input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      autoComplete="address-level1"
                      className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                    />
                  </label>
                  <label className="flex flex-col gap-1 sm:col-span-1">
                    <span className="text-xs font-semibold text-white/60">ZIP</span>
                    <input
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      autoComplete="postal-code"
                      className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">Country</span>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                  >
                    <option value="US">US</option>
                    <option value="CA">CA</option>
                  </select>
                </label>

                {error ? (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 neon-edge">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={pending}
                  className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-semibold text-zinc-950 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/30 transition hover:bg-emerald-400 disabled:opacity-60 neon-edge"
                >
                  {pending ? "Creating…" : "Create account"}
                </button>

                <div className="text-xs leading-5 text-white/60">
                  Already have an account?{" "}
                  <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-semibold text-white underline decoration-white/25 underline-offset-4">
                    Log in
                  </Link>
                  .
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}






