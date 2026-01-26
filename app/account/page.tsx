import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { and, desc, eq } from "drizzle-orm";

import { authOptions } from "@/app/auth";
import SiteHeader from "@/app/components/SiteHeader";
import CircuitOverlay from "@/app/components/CircuitOverlay";
import { db } from "@/app/db";
import { customerAddresses, orders, users } from "@/app/db/schema";
import { formatUsdFromCents } from "@/app/lib/money";
import { saveDefaultAddress, updateProfile } from "@/app/account/actions";

export const metadata: Metadata = {
  title: "Account",
  alternates: { canonical: "/account" },
};

function fmtDate (d: Date): string
{
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(d);
}

export default async function AccountPage ()
{
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/account");
  if ((session.user as any).role === "admin") redirect("/admin");

  const userId = session.user.id;

  const userRow = await db
    .select({
      email: users.email,
      name: users.name,
      phone: users.phone,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const u = userRow[0];
  if (!u) redirect("/login?callbackUrl=/account");

  const addressRow = await db
    .select({
      name: customerAddresses.name,
      phone: customerAddresses.phone,
      address1: customerAddresses.address1,
      address2: customerAddresses.address2,
      city: customerAddresses.city,
      state: customerAddresses.state,
      zip: customerAddresses.zip,
      country: customerAddresses.country,
    })
    .from(customerAddresses)
    .where(and(
      eq(customerAddresses.userId, userId),
      eq(customerAddresses.isDefault, true),
    ))
    .limit(1);

  const a = addressRow[0] ?? null;

  const myOrders = await db
    .select({
      id: orders.id,
      status: orders.status,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.customerId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(50);

  return (
    <div className="min-h-screen text-zinc-50">
      <SiteHeader
        subtitle="Your account"
        actions={(
          <Link
            href="/store"
            className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:border-sky-500/30 hover:bg-white/8 neon-edge"
          >
            Store
          </Link>
        )}
      />

      <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 neon-edge lg:col-span-2">
          <CircuitOverlay variant="panel" className="opacity-45" animated={false} />
          <div className="relative z-10">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              Profile
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
              Customer dashboard
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Email: <span className="font-semibold text-white">{u.email}</span>
            </p>

            <form action={updateProfile} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-white/60">Full name</span>
                <input
                  name="name"
                  defaultValue={u.name ?? ""}
                  autoComplete="name"
                  className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                  required
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-white/60">Phone (optional)</span>
                <input
                  name="phone"
                  defaultValue={u.phone ?? ""}
                  autoComplete="tel"
                  className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                />
              </label>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-semibold text-zinc-950 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/30 transition hover:bg-emerald-400 neon-edge"
                >
                  Save profile
                </button>
              </div>
            </form>
          </div>
        </section>

        <aside className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 neon-edge">
          <CircuitOverlay variant="panel" className="opacity-42" animated={false} />
          <div className="relative z-10">
            <div className="text-sm font-semibold text-white">Orders</div>
            <div className="mt-4 flex flex-col gap-3">
              {myOrders.length ? myOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/orders/${o.id}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-emerald-500/25 hover:bg-white/6 neon-edge"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white">
                        Order <span className="text-white/60">{o.id.slice(0, 8)}</span>
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        {fmtDate(o.createdAt)} · <span className="uppercase">{o.status}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-semibold text-white">
                      {formatUsdFromCents(o.totalCents)}
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 neon-edge">
                  No orders yet.{" "}
                  <Link href="/store" className="font-semibold text-white underline decoration-white/25 underline-offset-4">
                    Browse the store
                  </Link>
                  .
                </div>
              )}
            </div>
          </div>
        </aside>
        </div>

        <section className="relative mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 neon-edge">
          <CircuitOverlay variant="panel" className="opacity-40" animated={false} />
          <div className="relative z-10">
            <div className="text-sm font-semibold text-white">Saved address</div>
            <p className="mt-2 text-sm leading-6 text-white/65">
              This will be used to pre-fill checkout next time.
            </p>

            <form action={saveDefaultAddress} className="mt-6 grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">Full name</span>
                  <input
                    name="name"
                    defaultValue={a?.name ?? u.name ?? ""}
                    autoComplete="name"
                    className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">Phone (optional)</span>
                  <input
                    name="phone"
                    defaultValue={a?.phone ?? u.phone ?? ""}
                    autoComplete="tel"
                    className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-white/60">Address line 1</span>
                <input
                  name="address1"
                  defaultValue={a?.address1 ?? ""}
                  autoComplete="address-line1"
                  className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                  required
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-white/60">Address line 2</span>
                <input
                  name="address2"
                  defaultValue={a?.address2 ?? ""}
                  autoComplete="address-line2"
                  className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <label className="flex flex-col gap-1 sm:col-span-2">
                  <span className="text-xs font-semibold text-white/60">City</span>
                  <input
                    name="city"
                    defaultValue={a?.city ?? ""}
                    autoComplete="address-level2"
                    className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">State</span>
                  <input
                    name="state"
                    defaultValue={a?.state ?? ""}
                    autoComplete="address-level1"
                    className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">ZIP</span>
                  <input
                    name="zip"
                    defaultValue={a?.zip ?? ""}
                    autoComplete="postal-code"
                    className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                    required
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1 sm:max-w-xs">
                <span className="text-xs font-semibold text-white/60">Country</span>
                <select
                  name="country"
                  defaultValue={(a?.country ?? "US").toUpperCase()}
                  className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 neon-edge"
                >
                  <option value="US">US</option>
                  <option value="CA">CA</option>
                </select>
              </label>

              <button
                type="submit"
                className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-semibold text-zinc-950 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/30 transition hover:bg-emerald-400 neon-edge"
              >
                Save address
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}


