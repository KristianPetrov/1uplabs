import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/auth";
import SignOutButton from "@/app/admin/SignOutButton";
import AdminProductOverrides from "@/app/admin/AdminProductOverrides";
import CircuitOverlay from "@/app/components/CircuitOverlay";
import { db } from "@/app/db";
import { productOverrides } from "@/app/db/schema";
import { products } from "@/app/lib/products";

export const metadata: Metadata = {
  title: "Admin",
  alternates: { canonical: "/admin" },
};

export default async function AdminPage ()
{
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "admin") redirect("/login");

  const overrides = await db
    .select({
      slug: productOverrides.slug,
      priceCents: productOverrides.priceCents,
      inventory: productOverrides.inventory,
    })
    .from(productOverrides);

  return (
    <div className="min-h-screen text-zinc-50">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide text-white">1UpLabs</div>
            <div className="text-xs text-white/60">
              Admin · {(session.user as any).email}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/store"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-500/30 hover:bg-white/8"
            >
              Store
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <CircuitOverlay variant="panel" className="opacity-35" />
        <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <AdminProductOverrides products={products} overrides={overrides} />

          <aside className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6">
            <CircuitOverlay variant="panel" className="opacity-45" />
            <div className="relative z-10">
              <div className="text-sm font-semibold text-white">Quick actions</div>
              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href="/store"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-semibold text-zinc-950 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/30 transition hover:bg-emerald-400"
                >
                  Preview store
                </Link>
                <div className="text-xs leading-5 text-white/55">
                  This page is protected by middleware (admin-only).
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}


