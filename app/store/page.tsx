import type { Metadata } from "next";
import Link from "next/link";

import LazyMoleculeViewer from "@/app/components/LazyMoleculeViewer";
import { getMoleculesForProduct } from "@/app/lib/molecules";
import { products } from "@/app/lib/products";

export const metadata: Metadata = {
  title: "Store",
  description:
    "Browse the 1UpLabs research-only catalog with molecular structure previews.",
  alternates: { canonical: "/store" },
};

export default function StorePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide text-white">
              1UpLabs
            </div>
            <div className="text-xs text-white/60">Research peptides</div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200 sm:inline">
              Laboratory research only
            </span>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-500/30 hover:bg-white/8"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <main id="catalog" className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Store
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
              Full catalog with molecular structure previews.
            </p>
          </div>
          <div className="text-xs text-white/55">
            Not for human consumption. No medical claims are made.
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const molecules = getMoleculesForProduct(p.moleculeKey);
            return (
              <div
                key={p.slug}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-emerald-500/25 hover:bg-white/6"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-sky-500/0 blur-2xl transition group-hover:bg-sky-500/20" />
                <div className="mb-4 h-40">
                  <LazyMoleculeViewer
                    productName={p.moleculeKey}
                    molecules={molecules}
                    variant="hero"
                    className="h-full"
                  />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-white">
                      {p.name}
                    </div>
                    <div className="mt-1 text-sm text-white/65">
                      Vial strength:{" "}
                      <span className="font-medium text-white">{p.amount}</span>
                    </div>
                  </div>
                  <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                    Research
                  </div>
                </div>

                <div className="mt-4 text-xs text-white/55">
                  Sold for laboratory research purposes only.
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="text-xs leading-5 text-white/60">
            Disclaimer: Products are intended for laboratory research only and
            are not for human consumption. No medical claims are made.
          </div>
        </div>
      </footer>
    </div>
  );
}


